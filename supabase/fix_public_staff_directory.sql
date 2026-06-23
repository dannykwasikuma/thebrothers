-- ============================================================
-- FEATURE: public "Our Staff" page support
-- ============================================================
-- Run this once in Supabase Dashboard -> SQL Editor -> New Query.
--
-- WHY A FUNCTION INSTEAD OF JUST RELAXING profiles' RLS:
-- profiles holds email, phone, and staff_id alongside bio/avatar.
-- The public website needs to show staff bios to logged-out
-- visitors, but must never expose contact details or staff_id to
-- the public internet. Returning only the public-safe columns from
-- a security definer function keeps that boundary enforced at the
-- database level — not just by being careful in the frontend query
-- (which a browser dev tools user could otherwise bypass).
--
-- NOTE: a plain SQL VIEW would NOT work here on its own — views run
-- with the querying user's own RLS by default, and an anonymous
-- visitor satisfies neither existing profiles SELECT policy, so a
-- view would just return zero rows for the public. A security
-- definer function (like is_staff_or_admin() from the earlier
-- recursion fix) is what actually lets this bypass RLS safely,
-- since it runs with the function owner's privileges internally.
-- ============================================================

create or replace function public.get_staff_directory()
returns table (
  id uuid,
  full_name text,
  staff_title text,
  bio text,
  avatar_url text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select id, full_name, staff_title, bio, avatar_url, created_at
  from public.profiles
  where role in ('staff', 'admin') and status = 'active' and bio is not null and bio != ''
  order by created_at asc;
$$;

-- Anyone (including logged-out visitors) can call this function.
grant execute on function public.get_staff_directory() to anon, authenticated;
