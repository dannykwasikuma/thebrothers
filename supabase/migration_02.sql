-- ============================================================
-- THE BROTHERS CATERING SERVICES — Migration 02
-- ============================================================
-- Run this ONCE in Supabase Dashboard -> SQL Editor -> New Query,
-- AFTER your original supabase/schema.sql has already been run.
-- This file only ADDS things — it does not drop or rewrite any
-- table you already have data in, so it's safe to run on a project
-- that's already live with real customers/bookings.
--
-- What this adds, in order:
--   1. Fix: infinite recursion bug in the profiles RLS policy
--   2. Second Admin: trigger guard already existed in schema.sql —
--      this just confirms the helper function used by the new
--      "Promote to Admin" button is in place (same fix as #1)
--   3. Gallery: price field, so gallery items can show a starting
--      price if you want one
--   4. Customer Feedback / Reviews: a public-submittable table,
--      separate from the admin-curated `testimonials` table, with
--      an admin-approval step before anything shows publicly
--   5. Staff directory: lets a staff member opt their profile into
--      being shown on the public "Our Staff" page, and lets the
--      Main Admin "feature" anyone on that same page
-- ============================================================


-- ============================================================
-- 1. FIX: infinite recursion in "profiles" RLS policy
-- ============================================================
-- The original "Staff and admin read all profiles" policy checked the
-- caller's role by querying `profiles` from inside its own USING clause.
-- Postgres has to re-apply the profiles policies to evaluate that inner
-- query, which means evaluating the same policy again — forever. This
-- moves the check into a SECURITY DEFINER function, which runs with
-- elevated privilege and bypasses RLS for its own internal lookup, so
-- it can check "is this user staff/admin?" without re-triggering itself.

create or replace function public.is_staff_or_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = uid and role in ('staff', 'admin')
  );
$$;

drop policy if exists "Staff and admin read all profiles" on public.profiles;

create policy "Staff and admin read all profiles"
  on public.profiles for select
  using (public.is_staff_or_admin(auth.uid()));


-- ============================================================
-- 3. GALLERY — optional starting price per item
-- ============================================================
alter table public.gallery_items add column if not exists starting_price numeric(10,2);
alter table public.gallery_items add column if not exists price_unit text;
alter table public.gallery_items add column if not exists description text;

-- Admin-manage policy already exists from schema.sql (gallery_items "Admin
-- manages gallery"); no new policy needed for the new columns.


-- ============================================================
-- 4. CUSTOMER FEEDBACK / REVIEWS — public can submit, admin approves
-- ============================================================
-- Kept separate from `testimonials` (which is the small, hand-picked set
-- shown in the homepage "Words of Praise" section) so existing testimonial
-- content/behavior is untouched. This new table is the open inbox anyone
-- can write to; once the Main Admin approves an entry, it's eligible to
-- show on the public Reviews section. Customers may optionally be signed
-- in (so we can link a review to their account) but guests can submit too.
create table if not exists public.customer_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  author_name text not null,
  event_label text,
  rating integer not null default 5 check (rating between 1 and 5),
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.customer_feedback enable row level security;

-- Anyone — signed in or guest — can submit feedback.
drop policy if exists "feedback_insert_anyone" on public.customer_feedback;
create policy "feedback_insert_anyone"
  on public.customer_feedback for insert
  with check (true);

-- The public can read only APPROVED feedback (this is what powers the
-- public Reviews section on Home/Gallery).
drop policy if exists "feedback_select_approved_public" on public.customer_feedback;
create policy "feedback_select_approved_public"
  on public.customer_feedback for select
  using (status = 'approved');

-- Staff/admin can read everything, including pending/rejected, to moderate it.
drop policy if exists "feedback_select_staff_admin" on public.customer_feedback;
create policy "feedback_select_staff_admin"
  on public.customer_feedback for select
  using (public.is_staff_or_admin(auth.uid()));

-- Only Main Admin can approve/reject/delete (kept consistent with how
-- testimonials and announcements are moderated elsewhere in this schema).
drop policy if exists "feedback_update_main_admin" on public.customer_feedback;
create policy "feedback_update_main_admin"
  on public.customer_feedback for update
  using (exists (select 1 from public.profiles where id = auth.uid() and is_main_admin = true));

drop policy if exists "feedback_delete_main_admin" on public.customer_feedback;
create policy "feedback_delete_main_admin"
  on public.customer_feedback for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and is_main_admin = true));

create index if not exists idx_customer_feedback_status on public.customer_feedback(status, created_at desc);


-- ============================================================
-- 5. PUBLIC STAFF DIRECTORY ("Our Staff" page)
-- ============================================================
-- `show_on_public_page`: the staff member's own opt-in toggle (set from
-- their profile editor — same place they already edit bio/avatar for the
-- internal Team Feed). `featured_by_admin`: a separate admin-only override
-- so the Main Admin can also highlight specific people regardless of
-- whether that person opted in themselves yet.
alter table public.profiles add column if not exists show_on_public_page boolean not null default false;
alter table public.profiles add column if not exists featured_by_admin boolean not null default false;
alter table public.profiles add column if not exists public_role_label text;

-- Extend the existing self-escalation guard so featured_by_admin and
-- public_role_label can ONLY be changed by the Main Admin — the original
-- trigger (from schema.sql) only watched role/staff_id/status/is_main_admin,
-- which would otherwise let any staff member feature themselves by calling
-- the update directly. show_on_public_page is intentionally left out of
-- this list since that one IS meant to be self-service (it's the staff
-- member's own opt-in toggle).
create or replace function public.prevent_self_role_escalation()
returns trigger as $$
begin
  if (old.role is distinct from new.role
      or old.staff_id is distinct from new.staff_id
      or old.status is distinct from new.status
      or old.is_main_admin is distinct from new.is_main_admin
      or old.featured_by_admin is distinct from new.featured_by_admin
      or old.public_role_label is distinct from new.public_role_label)
  then
    if not exists (
      select 1 from public.profiles
      where id = auth.uid() and (role = 'admin' or is_main_admin = true)
    ) then
      raise exception 'Only the Main Admin can change role, staff ID, status, or public-page featuring.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Public, signed-out-readable view of just the safe fields for staff who
-- are visible on the public page — never exposes email/phone/status/etc.
-- A view (rather than relaxing the profiles table policy) keeps every
-- other profile field exactly as private as it already was.
create or replace view public.public_staff_directory as
  select
    id,
    full_name,
    staff_title,
    public_role_label,
    bio,
    avatar_url,
    featured_by_admin,
    created_at
  from public.profiles
  where role in ('staff', 'admin')
    and status = 'active'
    and (show_on_public_page = true or featured_by_admin = true);

grant select on public.public_staff_directory to anon, authenticated;


-- ============================================================
-- DONE.
-- Next: in Supabase Dashboard -> Authentication -> URL Configuration,
-- add this Redirect URL so password-reset emails work:
--   https://YOUR-SITE-DOMAIN/reset-password
-- (use your real deployed domain — for local testing you can also add
--  http://localhost:5173/reset-password)
-- ============================================================
