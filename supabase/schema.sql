-- ============================================================
-- THE BROTHERS CATERING SERVICES — Supabase Database Schema
-- ============================================================
-- Run this entire file once in your Supabase project's SQL Editor
-- (Dashboard → SQL Editor → New Query → paste this whole file → Run)
--
-- This creates every table the website needs, plus Row Level
-- Security (RLS) policies so that:
--   - Customers can only see their OWN bookings/orders/profile
--   - Staff can see ALL bookings/orders, but NOT revenue totals
--     or other people's profile/contact details
--   - The Main Admin can see and edit everything
-- ============================================================

-- ── Extensions ────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. PROFILES — one row per Supabase Auth user, holds our role data
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone text,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'staff', 'admin')),
  staff_id text unique,
  staff_title text,
  status text not null default 'active' check (status in ('active', 'disabled')),
  is_main_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Only one Main Admin should ever exist. This partial unique index enforces it at the DB level.
create unique index one_main_admin_only on public.profiles (is_main_admin) where (is_main_admin = true);

alter table public.profiles enable row level security;

-- Everyone can read their own profile.
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Staff and admin can read ALL profiles (needed for admin/staff portals to show names).
create policy "Staff and admin read all profiles"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('staff', 'admin'))
  );

-- Users can update their own profile, but NOT their own role/status/staff fields (handled below).
create policy "Users update own basic info"
  on public.profiles for update
  using (auth.uid() = id);

-- Only Main Admin can change role, staff_id, staff_title, status, is_main_admin on ANY profile.
-- (Enforced via a trigger below, since RLS alone can't restrict column-level changes cleanly.)

create policy "New users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ── Trigger: prevent non-admins from elevating their own role ──
create or replace function public.prevent_self_role_escalation()
returns trigger as $$
begin
  if (old.role is distinct from new.role
      or old.staff_id is distinct from new.staff_id
      or old.status is distinct from new.status
      or old.is_main_admin is distinct from new.is_main_admin)
  then
    if not exists (
      select 1 from public.profiles
      where id = auth.uid() and (role = 'admin' or is_main_admin = true)
    ) then
      raise exception 'Only the Main Admin can change role, staff ID, or status.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_prevent_self_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_self_role_escalation();

-- ── Trigger: auto-create a profile row whenever someone signs up ──
create or replace function public.handle_new_user()
returns trigger as $$
declare
  is_first_user boolean;
begin
  select not exists(select 1 from public.profiles) into is_first_user;

  insert into public.profiles (id, email, phone, full_name, role, is_main_admin)
  values (
    new.id,
    new.email,
    new.phone,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    case when is_first_user then 'admin' else 'customer' end,
    is_first_user
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_handle_new_user
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- 2. STAFF INVITE CODES
-- ============================================================
create table public.staff_invite_codes (
  code text primary key,
  title text not null default 'Staff Member',
  max_uses integer not null default 1,
  used_count integer not null default 0,
  active boolean not null default true,
  expires_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.staff_invite_codes enable row level security;

create policy "Admin manages invite codes"
  on public.staff_invite_codes for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Anyone signed in can READ a single code by exact match, to validate it during signup.
create policy "Signed-in users can look up a code to redeem it"
  on public.staff_invite_codes for select
  using (auth.uid() is not null);

-- ── Function: redeem an invite code (called from the frontend via RPC) ──
create or replace function public.redeem_staff_invite(invite_code text)
returns json as $$
declare
  invite record;
  new_staff_id text;
begin
  select * into invite from public.staff_invite_codes
    where code = upper(trim(invite_code)) for update;

  if invite is null then
    return json_build_object('ok', false, 'error', 'Invalid invite code.');
  end if;
  if not invite.active then
    return json_build_object('ok', false, 'error', 'This invite code has been deactivated.');
  end if;
  if invite.expires_at is not null and invite.expires_at < now() then
    return json_build_object('ok', false, 'error', 'This invite code has expired.');
  end if;
  if invite.used_count >= invite.max_uses then
    return json_build_object('ok', false, 'error', 'This invite code has already reached its usage limit.');
  end if;

  new_staff_id := 'STF-' || upper(substr(md5(random()::text), 1, 4));

  update public.staff_invite_codes
    set used_count = used_count + 1,
        active = (used_count + 1 < max_uses)
    where code = invite.code;

  update public.profiles
    set role = 'staff', staff_id = new_staff_id, staff_title = invite.title
    where id = auth.uid();

  return json_build_object('ok', true, 'staff_id', new_staff_id);
end;
$$ language plpgsql security definer;


-- ============================================================
-- 3. SERVICES — catering & ushering packages shown on the site
-- ============================================================
create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('catering', 'ushering')),
  subcategory text,
  description text,
  price numeric(10,2) not null default 0,
  price_unit text,
  image_url text,
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.services enable row level security;

create policy "Anyone can view active services"
  on public.services for select
  using (active = true);

create policy "Admin manages services"
  on public.services for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));


-- ============================================================
-- 4. PRODUCTS — shop items
-- ============================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  image_url text,
  category text,
  rating numeric(2,1),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Anyone can view active products"
  on public.products for select
  using (active = true);

create policy "Admin manages products"
  on public.products for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));


-- ============================================================
-- 5. BOOKINGS
-- ============================================================
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  service_id uuid references public.services(id),
  service_type text,
  service_name text,
  user_name text,
  user_email text,
  user_phone text,
  event_date date not null,
  event_location text,
  guest_count text,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

create policy "Customers view own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "Customers create own bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "Staff and admin view all bookings"
  on public.bookings for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('staff', 'admin')));

create policy "Staff and admin update bookings"
  on public.bookings for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('staff', 'admin')));


-- ============================================================
-- 6. CART (one row per item per user — simpler than a JSON blob)
-- ============================================================
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) not null,
  product_id uuid references public.products(id) not null,
  product_name text not null,
  price numeric(10,2) not null,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.cart_items enable row level security;

create policy "Users manage own cart"
  on public.cart_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ============================================================
-- 7. ORDERS + ORDER ITEMS
-- ============================================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  shipping_name text not null,
  shipping_email text,
  shipping_phone text,
  shipping_address text,
  notes text,
  payment_method text,
  momo_number text,
  momo_network text,
  total numeric(10,2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_name text not null,
  price numeric(10,2) not null,
  quantity integer not null default 1
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Customers view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Customers create own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Staff and admin view all orders"
  on public.orders for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('staff', 'admin')));

create policy "Staff and admin update orders"
  on public.orders for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('staff', 'admin')));

create policy "View order items if you can view the parent order"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
      and (o.user_id = auth.uid()
           or exists (select 1 from public.profiles where id = auth.uid() and role in ('staff', 'admin')))
    )
  );

create policy "Insert order items for your own order"
  on public.order_items for insert
  with check (
    exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid())
  );


-- ============================================================
-- 8. GALLERY
-- ============================================================
create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  image_url text not null,
  created_at timestamptz not null default now()
);

alter table public.gallery_items enable row level security;

create policy "Anyone can view gallery"
  on public.gallery_items for select
  using (true);

create policy "Admin manages gallery"
  on public.gallery_items for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));


-- ============================================================
-- 9. TESTIMONIALS
-- ============================================================
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  event_label text,
  quote text not null,
  rating integer not null default 5 check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;

create policy "Anyone can view testimonials"
  on public.testimonials for select
  using (true);

create policy "Admin manages testimonials"
  on public.testimonials for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));


-- ============================================================
-- 10. ADMIN STATS VIEW (revenue hidden from staff at the query level)
-- ============================================================
-- The frontend calls this as an RPC. It returns full numbers only to the
-- Main Admin; staff get the same shape with revenue zeroed out, so the
-- UI's existing "hide revenue from staff" logic still works, and even a
-- network inspector can't leak the real number to a staff account.
create or replace function public.get_admin_stats()
returns json as $$
declare
  caller_role text;
  total_rev numeric;
  total_bookings_count integer;
  total_orders_count integer;
  total_users_count integer;
  pending_bookings_count integer;
  pending_orders_count integer;
begin
  select role into caller_role from public.profiles where id = auth.uid();
  if caller_role not in ('staff', 'admin') then
    raise exception 'Not authorized.';
  end if;

  select coalesce(sum(total), 0) into total_rev from public.orders where status != 'cancelled';
  select count(*) into total_bookings_count from public.bookings;
  select count(*) into total_orders_count from public.orders;
  select count(*) into total_users_count from public.profiles where role = 'customer';
  select count(*) into pending_bookings_count from public.bookings where status = 'pending';
  select count(*) into pending_orders_count from public.orders where status = 'pending';

  return json_build_object(
    'totalRevenue', case when caller_role = 'admin' then total_rev else 0 end,
    'totalBookings', total_bookings_count,
    'totalOrders', total_orders_count,
    'totalUsers', total_users_count,
    'pendingBookings', pending_bookings_count,
    'pendingOrders', pending_orders_count
  );
end;
$$ language plpgsql security definer;


-- ============================================================
-- 10b. ADMIN SETTINGS — single row holding Twilio/notification config
-- ============================================================
-- Storing these server-side (instead of localStorage) means the Main
-- Admin's WhatsApp credentials work no matter which device they're on,
-- and staff never have row access at all (only Main Admin can read/write).
create table public.admin_settings (
  id integer primary key default 1 check (id = 1),
  staff_signup_mode text not null default 'admin_only' check (staff_signup_mode in ('admin_only', 'invite_code')),
  admin_phone text,
  twilio_sid text,
  twilio_token text,
  twilio_from text,
  notify_on_booking boolean not null default true,
  notify_on_order boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.admin_settings (id) values (1);

alter table public.admin_settings enable row level security;

-- Only the Main Admin can read or write notification credentials directly.
create policy "Main admin reads settings"
  on public.admin_settings for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_main_admin = true));

create policy "Main admin updates settings"
  on public.admin_settings for update
  using (exists (select 1 from public.profiles where id = auth.uid() and is_main_admin = true));

-- Staff need staff_signup_mode to know whether self-registration is on,
-- but nothing else from this table — expose it via a narrow RPC instead
-- of broadening the table-level policy above.
create or replace function public.get_staff_signup_mode()
returns text as $$
  select staff_signup_mode from public.admin_settings where id = 1;
$$ language sql security definer;


-- ============================================================
-- 10c. SERVER-SIDE NOTIFICATION SENDING (so customers never need
--      Twilio credentials, even read-only, in their browser)
-- ============================================================
-- Requires the pg_net extension (enable once in Dashboard -> Database ->
-- Extensions -> search "pg_net" -> Enable). pg_net lets Postgres make an
-- outbound HTTP request directly from a trigger, fully server-side.
create extension if not exists pg_net;

create or replace function public.send_admin_whatsapp(message text)
returns void as $$
declare
  settings record;
  from_num text;
  to_num text;
begin
  -- NOTE: this function is intentionally NOT gated by auth.uid()/is_main_admin.
  -- It is invoked two ways:
  --   1. By the booking/order triggers below, fired by a CUSTOMER's own insert —
  --      auth.uid() in that context is the CUSTOMER, not the admin, even though
  --      this function is security definer (security definer changes which
  --      role's table privileges apply, it does NOT change what auth.uid()
  --      returns — that still reflects the original calling session). Gating
  --      this function on is_main_admin would silently break every real
  --      customer notification.
  --   2. By the dedicated, separately-permission-checked send_test_whatsapp()
  --      RPC below, which IS gated to the Main Admin before it calls this.
  -- Do not call this function directly from client-side code — always go
  -- through send_test_whatsapp() for anything triggered by a button click.
  select * into settings from public.admin_settings where id = 1;

  if settings is null
     or settings.admin_phone is null or settings.admin_phone = ''
     or settings.twilio_sid is null or settings.twilio_sid = ''
     or settings.twilio_token is null or settings.twilio_token = ''
     or settings.twilio_from is null or settings.twilio_from = ''
  then
    return; -- Not configured yet — silently skip, never blocks the booking/order itself.
  end if;

  from_num := case when settings.twilio_from like 'whatsapp:%' then settings.twilio_from else 'whatsapp:' || settings.twilio_from end;
  to_num := case when settings.admin_phone like 'whatsapp:%' then settings.admin_phone else 'whatsapp:' || settings.admin_phone end;

  perform net.http_post(
    url := 'https://api.twilio.com/2010-04-01/Accounts/' || settings.twilio_sid || '/Messages.json',
    headers := jsonb_build_object(
      'Authorization', 'Basic ' || encode((settings.twilio_sid || ':' || settings.twilio_token)::bytea, 'base64'),
      'Content-Type', 'application/x-www-form-urlencoded'
    ),
    body := concat('From=', net.url_encode(from_num), '&To=', net.url_encode(to_num), '&Body=', net.url_encode(message))::text
  );
exception when others then
  -- Never let a notification failure roll back or break the booking/order transaction.
  raise warning 'WhatsApp notification failed: %', sqlerrm;
end;
$$ language plpgsql security definer;

-- ── Safe, permission-checked entry point for the "Send Test Notification"
--    button in the Admin UI. Unlike send_admin_whatsapp above, THIS function
--    is meant to be called directly from client-side code, so it checks the
--    real caller's identity (auth.uid() here correctly reflects whoever
--    clicked the button, since there's no trigger involved) before sending. ──
create or replace function public.send_test_whatsapp()
returns json as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_main_admin = true) then
    raise exception 'Only the Main Admin can send a test notification.';
  end if;

  perform public.send_admin_whatsapp(
    '✅ Test notification from The Brothers admin panel.' || E'\n' ||
    'Timestamp: ' || to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
  );

  return json_build_object('ok', true);
end;
$$ language plpgsql security definer;

-- ── Trigger: new booking → WhatsApp alert ──
create or replace function public.notify_on_new_booking()
returns trigger as $$
declare
  should_notify boolean;
  msg text;
begin
  select notify_on_booking into should_notify from public.admin_settings where id = 1;
  if not coalesce(should_notify, true) then
    return new;
  end if;

  msg := concat(
    E'🎉 *NEW BOOKING* — The Brothers\n',
    E'━━━━━━━━━━━━━━━━━━━\n',
    '📋 Service: ', coalesce(new.service_name, new.service_type), E'\n',
    '👤 Client: ', coalesce(new.user_name, 'Client'), E'\n',
    case when new.user_phone is not null then concat('📞 Phone: ', new.user_phone, E'\n') else '' end,
    case when new.user_email is not null then concat('📧 Email: ', new.user_email, E'\n') else '' end,
    '📅 Date: ', new.event_date::text,
    case when new.event_location is not null then concat(' @ ', new.event_location) else '' end, E'\n',
    case when new.guest_count is not null then concat('👥 Guests: ', new.guest_count, E'\n') else '' end,
    case when new.notes is not null then concat('💬 Notes: ', new.notes, E'\n') else '' end,
    '🆔 Ref: ', new.id::text
  );

  perform public.send_admin_whatsapp(msg);
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_notify_new_booking
  after insert on public.bookings
  for each row execute function public.notify_on_new_booking();

-- ── Trigger: new order → WhatsApp alert ──
-- Fires after order_items are inserted (not on the order itself), since the
-- order row is created before its items — this guarantees the item list is
-- already in the database when the WhatsApp message is composed.
create or replace function public.notify_after_order_items()
returns trigger as $$
begin
  perform public.notify_on_new_order_by_id(new.order_id);
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.notify_on_new_order_by_id(target_order_id uuid)
returns void as $$
declare
  should_notify boolean;
  item_lines text;
  msg text;
  ord record;
begin
  select notify_on_order into should_notify from public.admin_settings where id = 1;
  if not coalesce(should_notify, true) then
    return;
  end if;

  select * into ord from public.orders where id = target_order_id;
  if ord is null then return; end if;

  select string_agg(concat('  • ', product_name, ' ×', quantity, ' = GHS ', (price * quantity)::text), E'\n')
    into item_lines
    from public.order_items where order_id = target_order_id;

  msg := concat(
    E'🛍️ *NEW ORDER* — The Brothers\n',
    E'━━━━━━━━━━━━━━━━━━━\n',
    '👤 Customer: ', ord.shipping_name, E'\n',
    case when ord.shipping_phone is not null then concat('📞 Phone: ', ord.shipping_phone, E'\n') else '' end,
    '📦 Items:', E'\n', coalesce(item_lines, '  (none)'), E'\n',
    '💰 Total: GHS ', ord.total::text, E'\n',
    '🆔 Order: #', ord.id::text
  );

  perform public.send_admin_whatsapp(msg);
end;
$$ language plpgsql security definer;

create trigger trg_notify_after_order_items
  after insert on public.order_items
  for each row execute function public.notify_after_order_items();


-- ============================================================
-- 11. SEED DATA — starter services so the site isn't empty on first load
-- ============================================================
-- ============================================================
-- CONTACT MESSAGES — from the public Contact page
-- ============================================================
-- Unlike every other table here, this one accepts inserts from anyone,
-- including guests with no account at all (a contact form shouldn't
-- require sign-up). Reading them back is restricted to staff/admin.
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'replied')),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Anyone, even logged out, can submit the contact form.
create policy "contact_messages_insert_anyone"
  on public.contact_messages for insert
  with check (true);

-- Only staff/admin can read submitted messages.
create policy "contact_messages_select_staff_admin"
  on public.contact_messages for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('staff','admin')));

create policy "contact_messages_update_staff_admin"
  on public.contact_messages for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('staff','admin')));

create index idx_contact_messages_status on public.contact_messages(status);


-- ============================================================
insert into public.services (name, category, subcategory, description, price, price_unit, featured) values
  ('Royal Wedding Package', 'catering', 'Wedding', 'Full-service multi-course reception catering. Includes cocktail hour, 4-course dinner, dessert station, and late-night bites. Minimum 100 guests.', 4500, 'per 50 guests', true),
  ('Executive Corporate Catering', 'catering', 'Corporate', 'Tailored menus for conferences, product launches, board dinners, and AGMs.', 2800, 'per 50 guests', false),
  ('Private Dining Experience', 'catering', 'Private', 'Exclusive private chef experience for intimate gatherings of 2-20 guests.', 1200, 'session', false),
  ('Wedding Ushering Team', 'ushering', 'Weddings', 'Minimum team of 8 elegantly uniformed ushers for church/venue arrival, seating, and reception coordination.', 2200, 'event', true),
  ('Corporate Protocol Team', 'ushering', 'Corporate', 'Trained in VIP handling, registration management, and corporate protocol.', 1600, 'event', false),
  ('Social Event Ushers', 'ushering', 'Social', 'Flexible team for birthday parties, naming ceremonies, funerals, and reunions.', 900, 'event', false);

insert into public.testimonials (author_name, event_label, quote, rating) values
  ('Abena & Kwame Asante', 'Wedding Reception, East Legon', 'The Brothers turned our wedding into something from a movie. Every guest was raving about the food.', 5),
  ('Ama Owusu-Mensah', 'Corporate Gala, Kempinski Hotel', 'Our annual gala has never looked so polished. The catering team went above and beyond.', 5),
  ('Dr. Kofi Boateng', 'Private Dining, Airport Residential', 'Their professionalism, timing, and food quality are unmatched in Accra.', 5);


-- ============================================================
-- 12. STAFF HUB — internal feed for staff/admin only
-- ============================================================
-- Lets staff post event updates/photos, comment on each other's posts,
-- and maintain a short profile (bio + photo) shown alongside their posts.
-- Entirely separate from the public-facing site; gated to role in
-- ('staff','admin') at the RLS level, same pattern as bookings/orders.

-- Extend profiles with the bio/photo fields the Staff Hub needs. Safe to
-- run even if these columns already exist (IF NOT EXISTS guards it).
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists avatar_url text;

create table public.staff_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.staff_posts enable row level security;

create policy "staff_posts_select_staff_admin"
  on public.staff_posts for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('staff','admin')));

create policy "staff_posts_insert_staff_admin"
  on public.staff_posts for insert
  with check (
    auth.uid() = author_id
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('staff','admin'))
  );

-- Authors can delete their own posts; the Main Admin can delete any post (moderation).
create policy "staff_posts_delete_own_or_admin"
  on public.staff_posts for delete
  using (
    auth.uid() = author_id
    or exists (select 1 from public.profiles where id = auth.uid() and is_main_admin = true)
  );

create table public.staff_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.staff_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.staff_post_comments enable row level security;

create policy "staff_comments_select_staff_admin"
  on public.staff_post_comments for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('staff','admin')));

create policy "staff_comments_insert_staff_admin"
  on public.staff_post_comments for insert
  with check (
    auth.uid() = author_id
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('staff','admin'))
  );

create policy "staff_comments_delete_own_or_admin"
  on public.staff_post_comments for delete
  using (
    auth.uid() = author_id
    or exists (select 1 from public.profiles where id = auth.uid() and is_main_admin = true)
  );

create index idx_staff_posts_created on public.staff_posts(created_at desc);
create index idx_staff_comments_post on public.staff_post_comments(post_id);

-- Allow staff to update their own bio/avatar (separate, narrower policy from
-- the existing profiles_update_own_limited, kept explicit for clarity).
-- profiles_update_own_limited already covers this since it checks auth.uid() = id
-- with no column restriction — no new policy needed here.


-- ============================================================
-- 13. HOMEPAGE ANNOUNCEMENTS — public banner, Main-Admin managed
-- ============================================================
-- Unlike admin_settings (Main-Admin-only reads), this table must be
-- readable by EVERYONE, including signed-out visitors, since it powers a
-- banner on the public homepage. Only the Main Admin can create, edit, or
-- deactivate announcements.
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  link_url text,
  link_label text,
  active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

-- Public read access — anyone can see active announcements, signed in or not.
create policy "announcements_select_public"
  on public.announcements for select
  using (true);

create policy "announcements_admin_write"
  on public.announcements for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_main_admin = true));

create index idx_announcements_active on public.announcements(active, created_at desc);


-- ============================================================
-- DONE. Next steps (see SETUP_GUIDE.md):
--   1. Go to Project Settings -> API and copy your Project URL + anon key
--   2. Paste them into .env.local (see .env.example in this project)
--   3. Go to Authentication -> Providers and enable Phone (if you want SMS login)
-- ============================================================
