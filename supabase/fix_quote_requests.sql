-- ============================================================
-- FEATURE: customer Quote Request flow
-- ============================================================
-- Run this once in Supabase Dashboard -> SQL Editor -> New Query.
--
-- Previously "Request a Quote" (on the Ushering page) just linked to
-- the general Contact form -- there was no structured way for a
-- customer to describe a large/custom event and have it tracked
-- separately from a normal booking or a generic message.
--
-- This adds a dedicated quote_requests table: a signed-in customer
-- submits event details (type, date, guest estimate, budget range,
-- free-text description), and it shows up in Admin -> Quotes for
-- staff/admin to review and respond to, with its own status
-- (new -> reviewing -> quoted -> closed).
-- ============================================================

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  full_name text not null,
  email text not null,
  phone text,
  event_type text,
  event_date date,
  estimated_guests text,
  budget_range text,
  details text not null,
  status text not null default 'new' check (status in ('new', 'reviewing', 'quoted', 'closed')),
  admin_notes text,
  created_at timestamptz not null default now()
);

alter table public.quote_requests enable row level security;

drop policy if exists "Customers create own quote requests" on public.quote_requests;
drop policy if exists "Customers view own quote requests" on public.quote_requests;
drop policy if exists "Staff and admin view all quote requests" on public.quote_requests;
drop policy if exists "Staff and admin update quote requests" on public.quote_requests;

create policy "Customers create own quote requests"
  on public.quote_requests for insert
  with check (auth.uid() = user_id);

create policy "Customers view own quote requests"
  on public.quote_requests for select
  using (auth.uid() = user_id);

create policy "Staff and admin view all quote requests"
  on public.quote_requests for select
  using (public.is_staff_or_admin(auth.uid()));

create policy "Staff and admin update quote requests"
  on public.quote_requests for update
  using (public.is_staff_or_admin(auth.uid()));
