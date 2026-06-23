-- ============================================================
-- FEATURE: in-app customer notifications (Account page bell)
-- ============================================================
-- Run this AFTER fix_quote_requests.sql (this migration's triggers
-- reference the quote_requests table, so that one needs to exist first).
-- Run in Supabase Dashboard -> SQL Editor -> New Query.
--
-- This is separate from the existing WhatsApp/SMS settings in Admin ->
-- Notifications, which alert the business owner. This is the opposite
-- direction: alerting a CUSTOMER, inside the website itself, when
-- something about their booking or quote request changes.
--
-- How it works: a notifications table holds one row per alert. Only
-- server-side triggers can insert into it (there's deliberately no
-- client-side INSERT policy), so a customer can never forge their own
-- notification. Two triggers populate it automatically:
--   - booking status changes to confirmed / cancelled / completed
--   - quote request status changes to "quoted"
-- ============================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) not null,
  title text not null,
  body text,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

drop policy if exists "Users view own notifications" on public.notifications;
drop policy if exists "Users mark own notifications read" on public.notifications;

create policy "Users view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users mark own notifications read"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.notify_user(target_user_id uuid, p_title text, p_body text, p_link text default null)
returns void as $$
begin
  if target_user_id is null then return; end if;
  insert into public.notifications (user_id, title, body, link) values (target_user_id, p_title, p_body, p_link);
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.notify_on_booking_status_change()
returns trigger as $$
begin
  if new.status is distinct from old.status then
    if new.status = 'confirmed' then
      perform public.notify_user(new.user_id, 'Booking Confirmed', 'Your booking for ' || coalesce(new.service_name, new.service_type) || ' on ' || to_char(new.event_date, 'Mon DD, YYYY') || ' has been confirmed.', '/account');
    elsif new.status = 'cancelled' then
      perform public.notify_user(new.user_id, 'Booking Cancelled', 'Your booking for ' || coalesce(new.service_name, new.service_type) || ' has been cancelled.', '/account');
    elsif new.status = 'completed' then
      perform public.notify_user(new.user_id, 'Booking Completed', 'Thanks for choosing us for ' || coalesce(new.service_name, new.service_type) || '! We''d love to hear how it went.', '/account');
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_notify_on_booking_status_change on public.bookings;
create trigger trg_notify_on_booking_status_change
  after update on public.bookings
  for each row execute function public.notify_on_booking_status_change();

create or replace function public.notify_on_quote_status_change()
returns trigger as $$
begin
  if new.status is distinct from old.status and new.status = 'quoted' then
    perform public.notify_user(new.user_id, 'Your Quote Is Ready', 'We''ve reviewed your event details and have a quote ready for you. Check your email or contact us for the details.', '/account');
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_notify_on_quote_status_change on public.quote_requests;
create trigger trg_notify_on_quote_status_change
  after update on public.quote_requests
  for each row execute function public.notify_on_quote_status_change();
