-- ============================================================
-- FEATURE: customers can cancel their own bookings
-- ============================================================
-- Run this once in Supabase Dashboard -> SQL Editor -> New Query.
--
-- Previously, only staff/admin could UPDATE a booking row at all --
-- a customer could view their own bookings but had no way to
-- change anything, including cancelling.
--
-- This adds a narrow policy that lets a customer cancel ONLY their
-- own booking, and ONLY if it's not already cancelled or completed
-- (so you can't "cancel" something that already happened, and can't
-- un-cancel something through this policy either). It does NOT let
-- customers change the event date, guest count, or any other field --
-- the trigger below enforces that the only thing changing is status,
-- and only in the allowed direction.
-- ============================================================

create or replace function public.customer_can_only_cancel()
returns trigger as $$
begin
  -- Staff/admin go through a different policy entirely (no trigger check
  -- needed for them), so this only ever fires for a customer's own update.
  if public.is_staff_or_admin(auth.uid()) then
    return new;
  end if;

  if old.status not in ('pending', 'confirmed') then
    raise exception 'This booking can no longer be cancelled.';
  end if;
  if new.status is distinct from 'cancelled' then
    raise exception 'You can only cancel a booking, not change its other details.';
  end if;

  -- Force every other field to stay exactly as it was, regardless of what
  -- the client sent -- belt-and-suspenders alongside the WITH CHECK policy.
  new.user_id := old.user_id;
  new.service_id := old.service_id;
  new.service_type := old.service_type;
  new.service_name := old.service_name;
  new.user_name := old.user_name;
  new.user_email := old.user_email;
  new.user_phone := old.user_phone;
  new.event_date := old.event_date;
  new.event_location := old.event_location;
  new.guest_count := old.guest_count;
  new.notes := old.notes;
  new.created_at := old.created_at;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_customer_can_only_cancel on public.bookings;
create trigger trg_customer_can_only_cancel
  before update on public.bookings
  for each row execute function public.customer_can_only_cancel();

create policy "Customers cancel own pending or confirmed bookings"
  on public.bookings for update
  using (auth.uid() = user_id and status in ('pending', 'confirmed'))
  with check (auth.uid() = user_id);
