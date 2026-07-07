-- Run this once in Supabase SQL Editor (Project > SQL Editor > New query)

create table if not exists store_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table store_state enable row level security;

create policy "public read" on store_state
  for select using (true);

create policy "public upsert" on store_state
  for insert with check (true);

create policy "public update" on store_state
  for update using (true);

-- enable realtime so other devices get live pushes
alter publication supabase_realtime add table store_state;

-- seed the single shared row (app will also create it on first save if missing)
insert into store_state (id, data)
values ('flowa', '{}'::jsonb)
on conflict (id) do nothing;

-- orders placed at checkout — one row per order, read by the admin Orders tab
create table if not exists orders (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

alter table orders enable row level security;

create policy "public insert" on orders
  for insert with check (true);

create policy "public read" on orders
  for select using (true);

-- enable realtime so the admin Orders tab gets live pushes on new orders
alter publication supabase_realtime add table orders;

-- ============================================================
-- Real admin auth (replaces the client-side-only passcode).
-- Run this block AFTER the tables above already exist.
-- ============================================================

-- one row per Supabase Auth user; is_admin defaults false, so signing up
-- alone grants no access — you must manually flag your own account below.
-- email is denormalized here (copied at signup) because auth.users isn't
-- readable via the client — this is how the admin Users tab shows who's who.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "users read own profile" on profiles
  for select using (auth.uid() = id);

-- admins can see every profile (needed for the Users tab's admin list)
create policy "admins read all profiles" on profiles
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- admins can grant/revoke admin access on other accounts from the Users tab.
-- Scoped by the CALLER's admin status, not the target row, so a non-admin's
-- update matches zero rows under RLS — no client-side path to self-promote.
-- (This alone doesn't stop an admin demoting themselves or every other admin
-- down to zero — see the prevent_last_admin_removal trigger below for that.)
create policy "admins update profiles" on profiles
  for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- hard guard: no update may ever take the admin count from 1 to 0. Without
-- this, UsersTab's `disabled={isSelf}` is purely cosmetic (bypassable via
-- devtools/raw REST) and the sole admin could demote themselves and
-- permanently lock everyone out of /admin (the Users tab itself requires an
-- existing admin to promote anyone, so there'd be no way back in without a
-- manual SQL editor fix).
create or replace function public.prevent_last_admin_removal()
returns trigger as $$
begin
  if old.is_admin = true and new.is_admin = false then
    if (select count(*) from profiles where is_admin = true) <= 1 then
      raise exception 'cannot remove the last remaining admin';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists prevent_last_admin_removal_trigger on profiles;
create trigger prevent_last_admin_removal_trigger
  before update on profiles
  for each row execute function public.prevent_last_admin_removal();

-- auto-create a profile row (with email) whenever someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- one-time backfill: if you already signed up before this migration added the
-- email column, this fills it in (safe to re-run, only touches nulls)
update profiles set email = (select email from auth.users where auth.users.id = profiles.id)
where email is null;

-- enable realtime so the admin Users tab gets live pushes on new signups/promotions
alter publication supabase_realtime add table profiles;

-- orders: only admins can read (was public read — that leaked customer PII
-- to anyone with the public anon key). Insert stays public since checkout
-- writes an order without being logged in.
drop policy if exists "public read" on orders;
create policy "admin read" on orders
  for select using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- store_state: reading site content stays public (every visitor needs it to
-- render the site), but only admins can write it — was public insert/update,
-- meaning anyone could deface site copy via the raw API.
drop policy if exists "public upsert" on store_state;
drop policy if exists "public update" on store_state;
create policy "admin insert" on store_state
  for insert with check (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
create policy "admin update" on store_state
  for update using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- LAST STEP (do this once, after signing up for the first time in the app's
-- new admin sign-up form — this is the only way to create your first admin;
-- every admin after that can be promoted from the Users tab instead):
-- update profiles set is_admin = true where id = (select id from auth.users where email = 'YOUR_EMAIL_HERE');

-- ============================================================
-- Fix RLS infinite recursion + add full_name (2026-07-06)
-- ============================================================

-- The four "admins can ..." policies above check admin status with an inline
-- `exists (select 1 from profiles where ...)` run FROM a policy ON profiles
-- (directly for the two profiles policies, transitively for orders/store_state
-- since reading profiles to check admin status re-triggers profiles' own RLS).
-- Postgres has to re-evaluate that same policy to answer the inner query,
-- which needs the same policy again — "infinite recursion detected in policy
-- for relation \"profiles\"". A SECURITY DEFINER function breaks the loop: it
-- runs as its owner, which bypasses RLS on the inner lookup instead of
-- re-entering policy evaluation.
create or replace function public.is_admin(uid uuid)
returns boolean as $$
  select exists (select 1 from public.profiles where id = uid and is_admin = true);
$$ language sql stable security definer set search_path = public;

drop policy if exists "admins read all profiles" on profiles;
create policy "admins read all profiles" on profiles
  for select using (public.is_admin(auth.uid()));

drop policy if exists "admins update profiles" on profiles;
create policy "admins update profiles" on profiles
  for update using (public.is_admin(auth.uid()));

drop policy if exists "admin read" on orders;
create policy "admin read" on orders
  for select using (public.is_admin(auth.uid()));

drop policy if exists "admin insert" on store_state;
create policy "admin insert" on store_state
  for insert with check (public.is_admin(auth.uid()));

drop policy if exists "admin update" on store_state;
create policy "admin update" on store_state
  for update using (public.is_admin(auth.uid()));

-- full_name: the sign-up form collects a name (stored in auth.users'
-- raw_user_meta_data at signup) but it never made it onto profiles, so the
-- Users tab could only ever show an email.
alter table profiles add column if not exists full_name text;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- backfill accounts created before this column existed, from the name they
-- signed up with where known (e.g. your own manually-created row won't have
-- one — safe to re-run, only touches nulls)
update profiles set full_name = (select raw_user_meta_data->>'full_name' from auth.users where auth.users.id = profiles.id)
where full_name is null;

-- ============================================================
-- Real account deletion from Users tab (2026-07-06)
-- ============================================================

-- The Users tab can now permanently delete an account (via the `delete-user`
-- edge function, which uses the service_role key to call auth.admin.deleteUser
-- — deleting straight from the client isn't possible without exposing that
-- key). Deleting a row from auth.users cascades to profiles (see `on delete
-- cascade` above), but a DELETE never fires the existing
-- prevent_last_admin_removal trigger (that's BEFORE UPDATE only) — so without
-- this, deleting the sole admin's own auth.users row would bypass that guard
-- entirely. The edge function already checks this before calling the admin
-- API, but this trigger is the same DB-level backstop as the update case:
-- holds even if a future code path deletes profiles directly.
create or replace function public.prevent_last_admin_deletion()
returns trigger as $$
begin
  if old.is_admin = true then
    if (select count(*) from profiles where is_admin = true) <= 1 then
      raise exception 'cannot delete the last remaining admin';
    end if;
  end if;
  return old;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists prevent_last_admin_deletion_trigger on profiles;
create trigger prevent_last_admin_deletion_trigger
  before delete on profiles
  for each row execute function public.prevent_last_admin_deletion();

-- ============================================================
-- Product photo uploads from device (2026-07-06)
-- ============================================================

-- Public-read bucket (product photos need to render for every visitor) but
-- writes are admin-only, reusing the same public.is_admin() helper defined
-- above so this doesn't hit the same policy-recursion issue those fixed.
insert into storage.buckets (id, name, public)
values ('product-photos', 'product-photos', true)
on conflict (id) do nothing;

create policy "public read product photos" on storage.objects
  for select using (bucket_id = 'product-photos');

create policy "admin upload product photos" on storage.objects
  for insert with check (bucket_id = 'product-photos' and public.is_admin(auth.uid()));

create policy "admin update product photos" on storage.objects
  for update using (bucket_id = 'product-photos' and public.is_admin(auth.uid()));

create policy "admin delete product photos" on storage.objects
  for delete using (bucket_id = 'product-photos' and public.is_admin(auth.uid()));

-- ============================================================
-- Admin can delete orders from the Orders tab (2026-07-06)
-- ============================================================
create policy "admin delete orders" on orders
  for delete using (public.is_admin(auth.uid()));

-- ============================================================
-- Protect the founder admin account from demotion/deletion (2026-07-06)
-- ============================================================
-- Hard-pins adithyadev2004.2@gmail.com as permanent admin at the DB level —
-- prevent_last_admin_removal/deletion above only fire when this is the LAST
-- admin; this blocks any other admin from demoting or deleting this specific
-- account even while other admins exist. Enforced in the trigger (not just
-- RLS) so it holds no matter which policy path the update/delete comes
-- through. To lift it later, edit the email below and rerun, or act from the
-- Supabase SQL editor directly (the trigger still fires there too — this is
-- meant as a last-resort-only override, not a routine escape hatch).
create or replace function public.prevent_protected_admin_change()
returns trigger as $$
begin
  if old.email = 'adithyadev2004.2@gmail.com' then
    if tg_op = 'DELETE' then
      raise exception 'this account is protected and cannot be deleted';
    end if;
    if new.is_admin = false then
      raise exception 'this account is protected and cannot be removed as admin';
    end if;
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists prevent_protected_admin_update_trigger on profiles;
create trigger prevent_protected_admin_update_trigger
  before update on profiles
  for each row execute function public.prevent_protected_admin_change();

drop trigger if exists prevent_protected_admin_delete_trigger on profiles;
create trigger prevent_protected_admin_delete_trigger
  before delete on profiles
  for each row execute function public.prevent_protected_admin_change();

-- ============================================================
-- Customer order history + status/tracking (2026-07-08)
-- ============================================================
-- Checkout now requires login (see Checkout.jsx), so every order can be
-- tied to its owner. Adds real columns instead of stuffing more into the
-- `data` JSONB blob so RLS and admin filtering/updates can target them
-- directly.
alter table orders add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table orders add column if not exists status text not null default 'pending';
alter table orders add column if not exists tracking_number text;
alter table orders add column if not exists tracking_url text;

alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check
  check (status in ('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'));

create index if not exists orders_user_id_idx on orders(user_id);

-- Insert was previously public/anonymous (checkout didn't require login).
-- Now that it does, tighten this so a caller can only insert a row tagged
-- with their own uid — prevents spoofing another user's user_id via the
-- raw REST API.
drop policy if exists "public insert" on orders;
create policy "user insert own orders" on orders
  for insert with check (auth.uid() = user_id);

-- Customers can read their own order history (admin read already exists
-- above via public.is_admin()).
create policy "users read own orders" on orders
  for select using (auth.uid() = user_id);

-- No update policy existed at all before this — admin Orders tab was
-- delete-only. Lets admin set status/tracking_number/tracking_url.
create policy "admin update orders" on orders
  for update using (public.is_admin(auth.uid()));
