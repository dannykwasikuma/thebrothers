-- ============================================================
-- THE BROTHERS CATERING SERVICES — Complete Database Schema
-- ============================================================
-- Run this ONE file, ONE time in your Supabase project.
-- Dashboard → SQL Editor → New Query → paste everything → Run
--
-- This file contains EVERYTHING:
--   schema.sql  +  migration_02.sql  +  all fix_*.sql files
-- merged in the correct dependency order.
--
-- Safe to run on a brand-new project. If you already ran the
-- old schema.sql, this is also safe — every statement uses
-- CREATE IF NOT EXISTS / OR REPLACE / ADD COLUMN IF NOT EXISTS
-- so nothing will fail or overwrite existing data.
-- ============================================================


-- ── Extensions ─────────────────────────────────────────────
create extension if not exists "pgcrypto";
create extension if not exists pg_net;


-- ============================================================
-- 1. PROFILES
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  phone       text,
  full_name   text,
  role        text not null default 'customer' check (role in ('customer', 'staff', 'admin')),
  staff_id    text unique,
  staff_title text,
  status      text not null default 'active' check (status in ('active', 'disabled')),
  is_main_admin boolean not null default false,
  bio         text,
  avatar_url  text,
  -- Our Staff page fields (migration_02 §5)
  show_on_public_page boolean not null default false,
  featured_by_admin   boolean not null default false,
  public_role_label   text,
  created_at  timestamptz not null default now()
);

create unique index if not exists one_main_admin_only
  on public.profiles (is_main_admin) where (is_main_admin = true);

alter table public.profiles enable row level security;

drop policy if exists "Users read own profile"            on public.profiles;
drop policy if exists "Staff and admin read all profiles" on public.profiles;
drop policy if exists "Users update own basic info"       on public.profiles;
drop policy if exists "New users can insert their own profile" on public.profiles;

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- NOTE: "Staff and admin read all profiles" is created AFTER the
-- is_staff_or_admin() function further below, to avoid forward-reference.

create policy "Users update own basic info"
  on public.profiles for update
  using (auth.uid() = id);

create policy "New users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);


-- ── Helper function: safe role check (fixes infinite recursion) ──────────
-- Must exist before any policy or trigger that calls it.
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

-- Now safe to create the "read all" policy:
drop policy if exists "Staff and admin read all profiles" on public.profiles;
create policy "Staff and admin read all profiles"
  on public.profiles for select
  using (public.is_staff_or_admin(auth.uid()));


-- ── Trigger: prevent non-admins from elevating their own privileges ───────
-- Covers role, staff_id, status, is_main_admin, featured_by_admin,
-- and public_role_label (last two added in migration_02 §5).
create or replace function public.prevent_self_role_escalation()
returns trigger as $$
begin
  if (
    old.role               is distinct from new.role
    or old.staff_id        is distinct from new.staff_id
    or old.status          is distinct from new.status
    or old.is_main_admin   is distinct from new.is_main_admin
    or old.featured_by_admin   is distinct from new.featured_by_admin
    or old.public_role_label   is distinct from new.public_role_label
  ) then
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

drop trigger if exists trg_prevent_self_role_escalation on public.profiles;
create trigger trg_prevent_self_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_self_role_escalation();


-- ── Trigger: auto-create profile on sign-up ──────────────────────────────
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

drop trigger if exists trg_handle_new_user on auth.users;
create trigger trg_handle_new_user
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ── Public staff directory (safe, RLS-bypassing function) ─────────────────
-- Returns only public-safe columns for staff who opted in or were featured.
-- Used by the /our-staff page for logged-out visitors.
create or replace function public.get_staff_directory()
returns table (
  id uuid, full_name text, staff_title text, public_role_label text,
  bio text, avatar_url text, featured_by_admin boolean, created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select id, full_name, staff_title, public_role_label, bio, avatar_url,
         featured_by_admin, created_at
  from public.profiles
  where role in ('staff', 'admin')
    and status = 'active'
    and (show_on_public_page = true or featured_by_admin = true)
  order by featured_by_admin desc, created_at asc;
$$;

grant execute on function public.get_staff_directory() to anon, authenticated;


-- ============================================================
-- 2. STAFF INVITE CODES
-- ============================================================
create table if not exists public.staff_invite_codes (
  code        text primary key,
  title       text not null default 'Staff Member',
  max_uses    integer not null default 1,
  used_count  integer not null default 0,
  active      boolean not null default true,
  expires_at  timestamptz,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);

alter table public.staff_invite_codes enable row level security;

drop policy if exists "Admin manages invite codes" on public.staff_invite_codes;
drop policy if exists "Signed-in users can look up a code to redeem it" on public.staff_invite_codes;

create policy "Admin manages invite codes"
  on public.staff_invite_codes for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Signed-in users can look up a code to redeem it"
  on public.staff_invite_codes for select
  using (auth.uid() is not null);


-- ── Staff ID sequence (sequential format 3021400001, 3021400002, …) ───────
create sequence if not exists public.staff_id_seq start with 1 minvalue 1;


-- ── RPC: redeem invite code → assign staff role + sequential staff ID ─────
create or replace function public.redeem_staff_invite(invite_code text)
returns json as $$
declare
  invite       record;
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

  -- Sequential ID: 30214 prefix + 5-digit zero-padded counter
  new_staff_id := '30214' || lpad(nextval('public.staff_id_seq')::text, 5, '0');

  update public.staff_invite_codes
    set used_count = used_count + 1,
        active     = (used_count + 1 < max_uses)
    where code = invite.code;

  update public.profiles
    set role = 'staff', staff_id = new_staff_id, staff_title = invite.title
    where id = auth.uid();

  return json_build_object('ok', true, 'staff_id', new_staff_id);
end;
$$ language plpgsql security definer;


-- ============================================================
-- 3. SERVICES
-- ============================================================
create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null check (category in ('catering', 'ushering')),
  subcategory text,
  description text,
  price       numeric(10,2) not null default 0,
  price_unit  text,
  image_url   text,
  featured    boolean not null default false,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.services enable row level security;

drop policy if exists "Anyone can view active services" on public.services;
drop policy if exists "Admin manages services"          on public.services;

create policy "Anyone can view active services"
  on public.services for select using (active = true);

create policy "Admin manages services"
  on public.services for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));


-- ============================================================
-- 4. PRODUCTS
-- ============================================================
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  price       numeric(10,2) not null default 0,
  image_url   text,
  category    text,
  rating      numeric(2,1),
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "Anyone can view active products" on public.products;
drop policy if exists "Admin manages products"          on public.products;

create policy "Anyone can view active products"
  on public.products for select using (active = true);

create policy "Admin manages products"
  on public.products for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));


-- ============================================================
-- 5. BOOKINGS
-- ============================================================
create table if not exists public.bookings (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references public.profiles(id),
  service_id     uuid references public.services(id),
  service_type   text,
  service_name   text,
  user_name      text,
  user_email     text,
  user_phone     text,
  event_date     date not null,
  event_location text,
  guest_count    text,
  notes          text,
  status         text not null default 'pending'
                 check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at     timestamptz not null default now()
);

alter table public.bookings enable row level security;

drop policy if exists "Customers view own bookings"        on public.bookings;
drop policy if exists "Customers create own bookings"      on public.bookings;
drop policy if exists "Staff and admin view all bookings"  on public.bookings;
drop policy if exists "Staff and admin update bookings"    on public.bookings;
drop policy if exists "Customers cancel own pending or confirmed bookings" on public.bookings;

create policy "Customers view own bookings"
  on public.bookings for select using (auth.uid() = user_id);

create policy "Customers create own bookings"
  on public.bookings for insert with check (auth.uid() = user_id);

create policy "Staff and admin view all bookings"
  on public.bookings for select
  using (public.is_staff_or_admin(auth.uid()));

create policy "Staff and admin update bookings"
  on public.bookings for update
  using (public.is_staff_or_admin(auth.uid()));

-- Customers can cancel their own pending/confirmed bookings
create policy "Customers cancel own pending or confirmed bookings"
  on public.bookings for update
  using (auth.uid() = user_id and status in ('pending', 'confirmed'))
  with check (auth.uid() = user_id);


-- ── Trigger: prevent customers from changing anything except status→cancelled
create or replace function public.customer_can_only_cancel()
returns trigger as $$
begin
  if public.is_staff_or_admin(auth.uid()) then return new; end if;

  if old.status not in ('pending', 'confirmed') then
    raise exception 'This booking can no longer be cancelled.';
  end if;
  if new.status is distinct from 'cancelled' then
    raise exception 'You can only cancel a booking, not change its other details.';
  end if;
  -- Force all other fields unchanged
  new.user_id        := old.user_id;
  new.service_id     := old.service_id;
  new.service_type   := old.service_type;
  new.service_name   := old.service_name;
  new.user_name      := old.user_name;
  new.user_email     := old.user_email;
  new.user_phone     := old.user_phone;
  new.event_date     := old.event_date;
  new.event_location := old.event_location;
  new.guest_count    := old.guest_count;
  new.notes          := old.notes;
  new.created_at     := old.created_at;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_customer_can_only_cancel on public.bookings;
create trigger trg_customer_can_only_cancel
  before update on public.bookings
  for each row execute function public.customer_can_only_cancel();


-- ============================================================
-- 6. CART
-- ============================================================
create table if not exists public.cart_items (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) not null,
  product_id   uuid references public.products(id) not null,
  product_name text not null,
  price        numeric(10,2) not null,
  quantity     integer not null default 1 check (quantity > 0),
  created_at   timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.cart_items enable row level security;

drop policy if exists "Users manage own cart" on public.cart_items;
create policy "Users manage own cart"
  on public.cart_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ============================================================
-- 7. ORDERS + ORDER ITEMS
-- ============================================================
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles(id),
  shipping_name   text not null,
  shipping_email  text,
  shipping_phone  text,
  shipping_address text,
  notes           text,
  payment_method  text,
  momo_number     text,
  momo_network    text,
  total           numeric(10,2) not null default 0,
  status          text not null default 'pending'
                  check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at      timestamptz not null default now()
);

create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid references public.orders(id) on delete cascade not null,
  product_name text not null,
  price        numeric(10,2) not null,
  quantity     integer not null default 1
);

alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Customers view own orders"         on public.orders;
drop policy if exists "Customers create own orders"       on public.orders;
drop policy if exists "Staff and admin view all orders"   on public.orders;
drop policy if exists "Staff and admin update orders"     on public.orders;
drop policy if exists "View order items if you can view the parent order" on public.order_items;
drop policy if exists "Insert order items for your own order"             on public.order_items;

create policy "Customers view own orders"
  on public.orders for select using (auth.uid() = user_id);
create policy "Customers create own orders"
  on public.orders for insert with check (auth.uid() = user_id);
create policy "Staff and admin view all orders"
  on public.orders for select using (public.is_staff_or_admin(auth.uid()));
create policy "Staff and admin update orders"
  on public.orders for update using (public.is_staff_or_admin(auth.uid()));

create policy "View order items if you can view the parent order"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or public.is_staff_or_admin(auth.uid()))
    )
  );

create policy "Insert order items for your own order"
  on public.order_items for insert
  with check (
    exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid())
  );


-- ============================================================
-- 8. GALLERY  (price/description fields added in migration_02 §3)
-- ============================================================
create table if not exists public.gallery_items (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  category      text,
  image_url     text not null,
  starting_price numeric(10,2),
  price_unit    text,
  description   text,
  created_at    timestamptz not null default now()
);

alter table public.gallery_items enable row level security;

drop policy if exists "Anyone can view gallery" on public.gallery_items;
drop policy if exists "Admin manages gallery"   on public.gallery_items;

create policy "Anyone can view gallery"
  on public.gallery_items for select using (true);

create policy "Admin manages gallery"
  on public.gallery_items for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));


-- ============================================================
-- 9. TESTIMONIALS  (customer-submittable, admin-approved)
-- ============================================================
create table if not exists public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  author_name text not null,
  event_label text,
  quote       text not null,
  rating      integer not null default 5 check (rating between 1 and 5),
  author_id   uuid references auth.users(id) on delete set null,
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.testimonials enable row level security;

drop policy if exists "Anyone can view testimonials"           on public.testimonials;
drop policy if exists "Admin manages testimonials"             on public.testimonials;
drop policy if exists "Anyone can view approved testimonials"  on public.testimonials;
drop policy if exists "Signed-in users can submit their own testimonial" on public.testimonials;
drop policy if exists "Staff and admin manage all testimonials" on public.testimonials;

create policy "Anyone can view approved testimonials"
  on public.testimonials for select using (approved = true);

create policy "Signed-in users can submit their own testimonial"
  on public.testimonials for insert
  with check (auth.uid() = author_id);

create policy "Staff and admin manage all testimonials"
  on public.testimonials for all
  using (public.is_staff_or_admin(auth.uid()))
  with check (public.is_staff_or_admin(auth.uid()));

-- Force customer submissions to start unapproved (belt-and-suspenders)
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


-- ============================================================
-- 10. CUSTOMER FEEDBACK / REVIEWS  (public submit, admin-approved)
-- ============================================================
-- Separate from testimonials (the curated homepage set). This is the
-- open inbox anyone can write to — shows publicly only after approval.
create table if not exists public.customer_feedback (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete set null,
  author_name text not null,
  event_label text,
  rating      integer not null default 5 check (rating between 1 and 5),
  message     text not null,
  status      text not null default 'pending'
              check (status in ('pending', 'approved', 'rejected')),
  created_at  timestamptz not null default now()
);

alter table public.customer_feedback enable row level security;

drop policy if exists "feedback_insert_anyone"          on public.customer_feedback;
drop policy if exists "feedback_select_approved_public" on public.customer_feedback;
drop policy if exists "feedback_select_staff_admin"     on public.customer_feedback;
drop policy if exists "feedback_update_main_admin"      on public.customer_feedback;
drop policy if exists "feedback_delete_main_admin"      on public.customer_feedback;

create policy "feedback_insert_anyone"
  on public.customer_feedback for insert with check (true);

create policy "feedback_select_approved_public"
  on public.customer_feedback for select using (status = 'approved');

create policy "feedback_select_staff_admin"
  on public.customer_feedback for select using (public.is_staff_or_admin(auth.uid()));

create policy "feedback_update_main_admin"
  on public.customer_feedback for update
  using (exists (select 1 from public.profiles where id = auth.uid() and is_main_admin = true));

create policy "feedback_delete_main_admin"
  on public.customer_feedback for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and is_main_admin = true));

create index if not exists idx_customer_feedback_status
  on public.customer_feedback(status, created_at desc);


-- ============================================================
-- 11. QUOTE REQUESTS
-- ============================================================
create table if not exists public.quote_requests (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references public.profiles(id),
  full_name        text not null,
  email            text not null,
  phone            text,
  event_type       text,
  event_date       date,
  estimated_guests text,
  budget_range     text,
  details          text not null,
  status           text not null default 'new'
                   check (status in ('new', 'reviewing', 'quoted', 'closed')),
  admin_notes      text,
  created_at       timestamptz not null default now()
);

alter table public.quote_requests enable row level security;

drop policy if exists "Customers create own quote requests"    on public.quote_requests;
drop policy if exists "Customers view own quote requests"      on public.quote_requests;
drop policy if exists "Staff and admin view all quote requests" on public.quote_requests;
drop policy if exists "Staff and admin update quote requests"  on public.quote_requests;

create policy "Customers create own quote requests"
  on public.quote_requests for insert with check (auth.uid() = user_id);

create policy "Customers view own quote requests"
  on public.quote_requests for select using (auth.uid() = user_id);

create policy "Staff and admin view all quote requests"
  on public.quote_requests for select using (public.is_staff_or_admin(auth.uid()));

create policy "Staff and admin update quote requests"
  on public.quote_requests for update using (public.is_staff_or_admin(auth.uid()));


-- ============================================================
-- 12. CONTACT MESSAGES
-- ============================================================
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text,
  subject    text,
  message    text not null,
  status     text not null default 'new' check (status in ('new', 'read', 'replied')),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "contact_messages_insert_anyone"      on public.contact_messages;
drop policy if exists "contact_messages_select_staff_admin" on public.contact_messages;
drop policy if exists "contact_messages_update_staff_admin" on public.contact_messages;

create policy "contact_messages_insert_anyone"
  on public.contact_messages for insert with check (true);

create policy "contact_messages_select_staff_admin"
  on public.contact_messages for select
  using (public.is_staff_or_admin(auth.uid()));

create policy "contact_messages_update_staff_admin"
  on public.contact_messages for update
  using (public.is_staff_or_admin(auth.uid()));

create index if not exists idx_contact_messages_status
  on public.contact_messages(status);


-- ============================================================
-- 13. USER NOTIFICATIONS (in-app bell)
-- ============================================================
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete cascade,
  title      text not null,
  body       text,
  link       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

drop policy if exists "Users view own notifications"       on public.notifications;
drop policy if exists "Users mark own notifications read"  on public.notifications;
drop policy if exists "notif_insert_staff"                 on public.notifications;
drop policy if exists "notif_delete_staff"                 on public.notifications;

create policy "Users view own notifications"
  on public.notifications for select using (auth.uid() = user_id);

create policy "Users mark own notifications read"
  on public.notifications for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "notif_insert_staff"
  on public.notifications for insert
  with check (public.is_staff_or_admin(auth.uid()));

create policy "notif_delete_staff"
  on public.notifications for delete
  using (public.is_staff_or_admin(auth.uid()));

create index if not exists idx_notifications_user
  on public.notifications(user_id, read, created_at desc);

-- Helper: insert a notification for a user (used by triggers below)
create or replace function public.notify_user(
  target_user_id uuid, p_title text, p_body text, p_link text default null
)
returns void as $$
begin
  if target_user_id is null then return; end if;
  insert into public.notifications (user_id, title, body, link)
  values (target_user_id, p_title, p_body, p_link);
end;
$$ language plpgsql security definer set search_path = public;

-- Trigger: notify customer when their booking status changes
create or replace function public.notify_on_booking_status_change()
returns trigger as $$
begin
  if new.status is distinct from old.status then
    if new.status = 'confirmed' then
      perform public.notify_user(
        new.user_id,
        'Booking Confirmed',
        'Your booking for ' || coalesce(new.service_name, new.service_type)
          || ' on ' || to_char(new.event_date, 'Mon DD, YYYY') || ' has been confirmed.',
        '/account'
      );
    elsif new.status = 'cancelled' then
      perform public.notify_user(
        new.user_id,
        'Booking Cancelled',
        'Your booking for ' || coalesce(new.service_name, new.service_type) || ' has been cancelled.',
        '/account'
      );
    elsif new.status = 'completed' then
      perform public.notify_user(
        new.user_id,
        'Booking Completed',
        'Thanks for choosing us! We''d love to hear how it went.',
        '/account'
      );
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_notify_on_booking_status_change on public.bookings;
create trigger trg_notify_on_booking_status_change
  after update on public.bookings
  for each row execute function public.notify_on_booking_status_change();

-- Trigger: notify customer when their quote is ready
create or replace function public.notify_on_quote_status_change()
returns trigger as $$
begin
  if new.status is distinct from old.status and new.status = 'quoted' then
    perform public.notify_user(
      new.user_id,
      'Your Quote Is Ready',
      'We''ve reviewed your event details and have a quote ready for you.',
      '/account'
    );
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_notify_on_quote_status_change on public.quote_requests;
create trigger trg_notify_on_quote_status_change
  after update on public.quote_requests
  for each row execute function public.notify_on_quote_status_change();


-- ============================================================
-- 14. STAFF HUB — internal feed
-- ============================================================
create table if not exists public.staff_posts (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null references public.profiles(id) on delete cascade,
  content    text not null,
  image_url  text,
  created_at timestamptz not null default now()
);

alter table public.staff_posts enable row level security;

drop policy if exists "staff_posts_select_staff_admin"   on public.staff_posts;
drop policy if exists "staff_posts_insert_staff_admin"   on public.staff_posts;
drop policy if exists "staff_posts_delete_own_or_admin"  on public.staff_posts;

create policy "staff_posts_select_staff_admin"
  on public.staff_posts for select
  using (public.is_staff_or_admin(auth.uid()));

create policy "staff_posts_insert_staff_admin"
  on public.staff_posts for insert
  with check (auth.uid() = author_id and public.is_staff_or_admin(auth.uid()));

create policy "staff_posts_delete_own_or_admin"
  on public.staff_posts for delete
  using (auth.uid() = author_id
    or exists (select 1 from public.profiles where id = auth.uid() and is_main_admin = true));

create table if not exists public.staff_post_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.staff_posts(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);

alter table public.staff_post_comments enable row level security;

drop policy if exists "staff_comments_select_staff_admin"   on public.staff_post_comments;
drop policy if exists "staff_comments_insert_staff_admin"   on public.staff_post_comments;
drop policy if exists "staff_comments_delete_own_or_admin"  on public.staff_post_comments;

create policy "staff_comments_select_staff_admin"
  on public.staff_post_comments for select
  using (public.is_staff_or_admin(auth.uid()));

create policy "staff_comments_insert_staff_admin"
  on public.staff_post_comments for insert
  with check (auth.uid() = author_id and public.is_staff_or_admin(auth.uid()));

create policy "staff_comments_delete_own_or_admin"
  on public.staff_post_comments for delete
  using (auth.uid() = author_id
    or exists (select 1 from public.profiles where id = auth.uid() and is_main_admin = true));

create index if not exists idx_staff_posts_created   on public.staff_posts(created_at desc);
create index if not exists idx_staff_comments_post   on public.staff_post_comments(post_id);


-- ============================================================
-- 15. ANNOUNCEMENTS
-- ============================================================
create table if not exists public.announcements (
  id          uuid primary key default gen_random_uuid(),
  message     text not null,
  link_url    text,
  link_label  text,
  active      boolean not null default true,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);

alter table public.announcements enable row level security;

drop policy if exists "announcements_select_public" on public.announcements;
drop policy if exists "announcements_admin_write"   on public.announcements;

create policy "announcements_select_public"
  on public.announcements for select using (true);

create policy "announcements_admin_write"
  on public.announcements for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_main_admin = true));

create index if not exists idx_announcements_active
  on public.announcements(active, created_at desc);


-- ============================================================
-- 16. ADMIN SETTINGS + WHATSAPP NOTIFICATIONS
-- ============================================================
create table if not exists public.admin_settings (
  id                 integer primary key default 1 check (id = 1),
  staff_signup_mode  text not null default 'admin_only'
                     check (staff_signup_mode in ('admin_only', 'invite_code')),
  admin_phone        text,
  twilio_sid         text,
  twilio_token       text,
  twilio_from        text,
  notify_on_booking  boolean not null default true,
  notify_on_order    boolean not null default true,
  updated_at         timestamptz not null default now()
);

insert into public.admin_settings (id) values (1) on conflict (id) do nothing;

alter table public.admin_settings enable row level security;

drop policy if exists "Main admin reads settings"   on public.admin_settings;
drop policy if exists "Main admin updates settings" on public.admin_settings;

create policy "Main admin reads settings"
  on public.admin_settings for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_main_admin = true));

create policy "Main admin updates settings"
  on public.admin_settings for update
  using (exists (select 1 from public.profiles where id = auth.uid() and is_main_admin = true));

create or replace function public.get_staff_signup_mode()
returns text as $$
  select staff_signup_mode from public.admin_settings where id = 1;
$$ language sql security definer;

-- ── WhatsApp alert function ──────────────────────────────────────────────
create or replace function public.send_admin_whatsapp(message text)
returns void as $$
declare
  settings record;
  from_num text;
  to_num   text;
begin
  select * into settings from public.admin_settings where id = 1;

  if settings is null
    or coalesce(settings.admin_phone, '') = ''
    or coalesce(settings.twilio_sid, '')  = ''
    or coalesce(settings.twilio_token,'') = ''
    or coalesce(settings.twilio_from, '') = ''
  then return; end if;

  from_num := case when settings.twilio_from  like 'whatsapp:%' then settings.twilio_from  else 'whatsapp:' || settings.twilio_from  end;
  to_num   := case when settings.admin_phone  like 'whatsapp:%' then settings.admin_phone  else 'whatsapp:' || settings.admin_phone  end;

  perform net.http_post(
    url     := 'https://api.twilio.com/2010-04-01/Accounts/' || settings.twilio_sid || '/Messages.json',
    headers := jsonb_build_object(
      'Authorization', 'Basic ' || encode((settings.twilio_sid || ':' || settings.twilio_token)::bytea, 'base64'),
      'Content-Type',  'application/x-www-form-urlencoded'
    ),
    body := concat(
      'From=', net.url_encode(from_num),
      '&To=',  net.url_encode(to_num),
      '&Body=', net.url_encode(message)
    )::text
  );
exception when others then
  raise warning 'WhatsApp notification failed: %', sqlerrm;
end;
$$ language plpgsql security definer;

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

-- Trigger: new booking → WhatsApp alert
create or replace function public.notify_on_new_booking()
returns trigger as $$
declare should_notify boolean; msg text;
begin
  select notify_on_booking into should_notify from public.admin_settings where id = 1;
  if not coalesce(should_notify, true) then return new; end if;

  msg := concat(
    E'🎉 *NEW BOOKING* — The Brothers\n',
    E'━━━━━━━━━━━━━━━━━━━\n',
    '📋 Service: ', coalesce(new.service_name, new.service_type), E'\n',
    '👤 Client: ',  coalesce(new.user_name, 'Client'), E'\n',
    case when new.user_phone is not null then '📞 ' || new.user_phone || E'\n' else '' end,
    case when new.user_email is not null then '📧 ' || new.user_email || E'\n' else '' end,
    '📅 ', new.event_date::text,
    case when new.event_location is not null then ' @ ' || new.event_location else '' end, E'\n',
    case when new.guest_count is not null then '👥 ' || new.guest_count || E' Guests\n' else '' end,
    '🆔 ', new.id::text
  );
  perform public.send_admin_whatsapp(msg);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_notify_new_booking on public.bookings;
create trigger trg_notify_new_booking
  after insert on public.bookings
  for each row execute function public.notify_on_new_booking();

-- Trigger: new order → WhatsApp alert
create or replace function public.notify_after_order_items()
returns trigger as $$
begin
  perform public.notify_on_new_order_by_id(new.order_id);
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.notify_on_new_order_by_id(target_order_id uuid)
returns void as $$
declare should_notify boolean; item_lines text; msg text; ord record;
begin
  select notify_on_order into should_notify from public.admin_settings where id = 1;
  if not coalesce(should_notify, true) then return; end if;

  select * into ord from public.orders where id = target_order_id;
  if ord is null then return; end if;

  select string_agg('  • ' || product_name || ' ×' || quantity || ' = GHS ' || (price * quantity)::text, E'\n')
    into item_lines from public.order_items where order_id = target_order_id;

  msg := concat(
    E'🛍️ *NEW ORDER* — The Brothers\n',
    E'━━━━━━━━━━━━━━━━━━━\n',
    '👤 ', ord.shipping_name, E'\n',
    case when ord.shipping_phone is not null then '📞 ' || ord.shipping_phone || E'\n' else '' end,
    E'📦 Items:\n', coalesce(item_lines, '  (none)'), E'\n',
    '💰 GHS ', ord.total::text, E'\n',
    '🆔 #', ord.id::text
  );
  perform public.send_admin_whatsapp(msg);
end;
$$ language plpgsql security definer;

drop trigger if exists trg_notify_after_order_items on public.order_items;
create trigger trg_notify_after_order_items
  after insert on public.order_items
  for each row execute function public.notify_after_order_items();


-- ============================================================
-- 17. ADMIN STATS VIEW
-- ============================================================
create or replace function public.get_admin_stats()
returns json as $$
declare
  caller_role           text;
  total_rev             numeric;
  total_bookings_count  integer;
  total_orders_count    integer;
  total_users_count     integer;
  pending_bookings_count integer;
  pending_orders_count  integer;
begin
  select role into caller_role from public.profiles where id = auth.uid();
  if caller_role not in ('staff', 'admin') then
    raise exception 'Not authorized.';
  end if;

  select coalesce(sum(total), 0) into total_rev          from public.orders   where status != 'cancelled';
  select count(*)                into total_bookings_count from public.bookings;
  select count(*)                into total_orders_count   from public.orders;
  select count(*)                into total_users_count    from public.profiles where role = 'customer';
  select count(*)                into pending_bookings_count from public.bookings where status = 'pending';
  select count(*)                into pending_orders_count   from public.orders   where status = 'pending';

  return json_build_object(
    'totalRevenue',    case when caller_role = 'admin' then total_rev else 0 end,
    'totalBookings',   total_bookings_count,
    'totalOrders',     total_orders_count,
    'totalUsers',      total_users_count,
    'pendingBookings', pending_bookings_count,
    'pendingOrders',   pending_orders_count
  );
end;
$$ language plpgsql security definer;


-- ============================================================
-- 18. SEED DATA
-- ============================================================
insert into public.services (name, category, subcategory, description, price, price_unit, featured)
select * from (values
  ('Royal Wedding Package',      'catering', 'Wedding',   'Full-service multi-course reception catering. Includes cocktail hour, 4-course dinner, dessert station, and late-night bites. Minimum 100 guests.', 4500, 'per 50 guests', true),
  ('Executive Corporate Catering','catering', 'Corporate', 'Tailored menus for conferences, product launches, board dinners, and AGMs.',                                                                     2800, 'per 50 guests', false),
  ('Private Dining Experience',  'catering', 'Private',   'Exclusive private chef experience for intimate gatherings of 2–20 guests.',                                                                       1200, 'session',       false),
  ('Wedding Ushering Team',      'ushering', 'Weddings',  'Minimum team of 8 elegantly uniformed ushers for church/venue arrival, seating, and reception coordination.',                                     2200, 'event',         true),
  ('Corporate Protocol Team',    'ushering', 'Corporate', 'Trained in VIP handling, registration management, and corporate protocol.',                                                                       1600, 'event',         false),
  ('Social Event Ushers',        'ushering', 'Social',    'Flexible team for birthday parties, naming ceremonies, funerals, and reunions.',                                                                   900, 'event',         false)
) as v(name, category, subcategory, description, price, price_unit, featured)
where not exists (select 1 from public.services limit 1);

insert into public.testimonials (author_name, event_label, quote, rating, approved)
select * from (values
  ('Abena & Kwame Asante', 'Wedding Reception, East Legon',   'The Brothers turned our wedding into something from a movie. Every guest was raving about the food.', 5, true),
  ('Ama Owusu-Mensah',     'Corporate Gala, Kempinski Hotel', 'Our annual gala has never looked so polished. The catering team went above and beyond.',              5, true),
  ('Dr. Kofi Boateng',     'Private Dining, Airport Residential', 'Their professionalism, timing, and food quality are unmatched in Accra.',                        5, true)
) as v(author_name, event_label, quote, rating, approved)
where not exists (select 1 from public.testimonials limit 1);


-- ============================================================
-- DONE.
-- ============================================================
-- After running this file, do three more things in the Supabase
-- dashboard (takes about 5 minutes total):
--
-- 1. Authentication → URL Configuration → Redirect URLs → Add:
--      https://YOUR-DOMAIN.com/reset-password
--    (this is what makes password-reset emails work)
--
-- 2. Storage → New bucket → name it "gallery" → toggle Public ON
--    (needed for gallery photo uploads from Admin → Catalog)
--
-- 3. Settings → API → copy your Project URL and anon key into
--    your .env file if you haven't already:
--      VITE_SUPABASE_URL=...
--      VITE_SUPABASE_ANON_KEY=...
-- ============================================================
