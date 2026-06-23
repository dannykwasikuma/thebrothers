-- ============================================================
-- FEATURE: sequential Staff ID format (3021400001, 3021400002, ...)
-- ============================================================
-- Run this once in Supabase Dashboard -> SQL Editor -> New Query.
--
-- WHAT THIS CHANGES:
-- Previously, redeem_staff_invite() generated staff_id as a random
-- 4-character hex code like "STF-A1B2". This replaces that with a
-- predictable, sequential ID: a fixed "30214" prefix followed by a
-- 5-digit zero-padded counter that goes up by 1 every time someone
-- redeems an invite code — e.g. 3021400001, 3021400002, 3021400003.
--
-- A real Postgres SEQUENCE is used (not "select max(...) + 1") so two
-- people redeeming an invite at the exact same moment can never end up
-- with the same staff_id — Postgres guarantees each call to nextval()
-- returns a distinct number, even under concurrent access.
-- ============================================================

create sequence if not exists public.staff_id_seq start with 0 minvalue 0;

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

  new_staff_id := '30214' || lpad(nextval('public.staff_id_seq')::text, 5, '0');

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
