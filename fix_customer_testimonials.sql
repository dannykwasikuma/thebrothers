-- ============================================================
-- FEATURE: customers can submit their own testimonials/reviews
-- ============================================================
-- Run this once in Supabase Dashboard -> SQL Editor -> New Query.
--
-- WHAT THIS CHANGES:
-- Previously, only an admin could insert into testimonials directly
-- (e.g. by hand in the Table Editor) -- there was no way for an
-- actual customer to submit their own review from the website.
--
-- This adds:
--   - author_id: links a testimonial back to the customer who wrote
--     it (nullable, so the original 6 seeded testimonials, which
--     have no associated account, still work fine).
--   - approved: every customer-submitted testimonial starts as
--     approved=false and is invisible to the public until a staff
--     or admin account approves it from the dashboard. This is
--     moderation, not censorship of the feature -- it protects you
--     from spam/abuse appearing on your live site instantly.
--   - The 6 existing seeded testimonials are marked approved=true
--     immediately below, so nothing currently on your homepage
--     disappears when you run this.
-- ============================================================

alter table public.testimonials
  add column if not exists author_id uuid references auth.users(id) on delete set null,
  add column if not exists approved boolean not null default false;

-- Don't hide what's already live: mark every existing row approved.
update public.testimonials set approved = true where approved = false;

drop policy if exists "Anyone can view testimonials" on public.testimonials;
drop policy if exists "Admin manages testimonials" on public.testimonials;

create policy "Anyone can view approved testimonials"
  on public.testimonials for select
  using (approved = true);

create policy "Signed-in users can submit their own testimonial"
  on public.testimonials for insert
  with check (auth.uid() = author_id);

create policy "Staff and admin manage all testimonials"
  on public.testimonials for all
  using (public.is_staff_or_admin(auth.uid()))
  with check (public.is_staff_or_admin(auth.uid()));

create or replace function public.force_testimonial_unapproved()
returns trigger as $$
begin
  if not public.is_staff_or_admin(auth.uid()) then
    new.approved := false;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_force_testimonial_unapproved on public.testimonials;
create trigger trg_force_testimonial_unapproved
  before insert on public.testimonials
  for each row execute function public.force_testimonial_unapproved();
