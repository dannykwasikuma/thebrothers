-- ============================================================
-- FIX: infinite recursion in "profiles" RLS policy
-- ============================================================
-- Run this once in Supabase Dashboard -> SQL Editor -> New Query.
--
-- WHAT WAS WRONG:
-- The "Staff and admin read all profiles" policy checked the
-- caller's role by running `select ... from public.profiles`
-- inside its own USING clause. Because that inner select is on
-- the same table the policy protects, Postgres has to re-apply
-- the profiles policies to evaluate it -- which means evaluating
-- the same policy again, forever. Postgres detects this and
-- throws "infinite recursion detected in policy for relation
-- profiles" instead of looping forever.
--
-- THE FIX:
-- Move the role check into a `security definer` function. A
-- security definer function runs with the privileges of the
-- function's owner, which bypasses RLS for its internal query --
-- so it can check "is this user staff/admin?" without triggering
-- the recursive policy re-evaluation.
-- ============================================================

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

-- Replace the recursive policy with one that calls the safe function.
drop policy if exists "Staff and admin read all profiles" on public.profiles;

create policy "Staff and admin read all profiles"
  on public.profiles for select
  using (public.is_staff_or_admin(auth.uid()));
