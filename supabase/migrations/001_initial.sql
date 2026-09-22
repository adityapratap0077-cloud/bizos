-- ═══════════════════════════════════════════════════════════════════════════
-- BizOS — initial database schema (V1)
-- ═══════════════════════════════════════════════════════════════════════════
-- HOW TO RUN:
--   1. Create a free Supabase project at https://supabase.com/dashboard
--   2. Open the Supabase SQL Editor (New query)
--   3. Paste this entire file and press "Run"
--
-- This script is safe to re-run: it uses IF NOT EXISTS / OR REPLACE /
-- DROP … IF EXISTS throughout.
--
-- SECURITY MODEL:
--   * Every business-owned table has a business_id column.
--   * Row Level Security is enabled on EVERY table.
--   * Policies only allow access when the row's business belongs to a
--     business whose owner_id = auth.uid().
--   * The anon/service keys never bypass this: the app never uses the
--     service-role key at all.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Extensions ─────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Tables ─────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.businesses (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  logo_url    text,
  email       text,
  phone       text,
  address     text,
  currency    text not null default 'INR',
  tax_name    text not null default 'GST',
  tax_rate    numeric not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint businesses_owner_unique unique (owner_id)
);

create table if not exists public.leads (
  id                 uuid primary key default gen_random_uuid(),
  business_id        uuid not null references public.businesses(id) on delete cascade,
  name               text not null,
  email              text,
  phone              text,
  company            text,
  source             text,
  service_interested text,
  estimated_value    numeric,
  status             text not null default 'New'
                     constraint leads_status_check
                     check (status in ('New','Contacted','Qualified','Proposal','Won','Lost')),
  notes              text,
  follow_up_date     date,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists public.customers (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses(id) on delete cascade,
  lead_id      uuid references public.leads(id) on delete set null,
  name         text not null,
  email        text,
  phone        text,
  company      text,
  address      text,
  notes        text,
  status       text not null default 'active',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses(id) on delete cascade,
  customer_id  uuid references public.customers(id) on delete set null,
  title        text not null,
  description  text,
  due_date     date,
  priority     text not null default 'Medium'
               constraint tasks_priority_check
               check (priority in ('Low','Medium','High')),
  status       text not null default 'Todo'
               constraint tasks_status_check
               check (status in ('Todo','In progress','Completed')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.bookings (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses(id) on delete cascade,
  customer_id  uuid not null references public.customers(id) on delete cascade,
  service      text not null,
  booking_date date not null,
  start_time   time not null,
  end_time     time not null,
  price        numeric,
  status       text not null default 'Scheduled'
               constraint bookings_status_check
               check (status in ('Scheduled','Completed','Cancelled')),
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint bookings_time_check check (end_time > start_time)
);

create table if not exists public.invoices (
  id               uuid primary key default gen_random_uuid(),
  business_id      uuid not null references public.businesses(id) on delete cascade,
  customer_id      uuid not null references public.customers(id) on delete cascade,
  invoice_number   text not null,
  business_name    text,
  business_address text,
  customer_address text,
  subtotal         numeric not null default 0,
  tax_rate         numeric not null default 0,
  tax_amount       numeric not null default 0,
  discount         numeric not null default 0,
  total            numeric not null default 0,
  issue_date       date not null,
  due_date         date,
  status           text not null default 'Draft'
                   constraint invoices_status_check
                   check (status in ('Draft','Pending','Paid')),
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint invoices_number_unique unique (business_id, invoice_number)
);

create table if not exists public.invoice_items (
  id          uuid primary key default gen_random_uuid(),
  invoice_id  uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity    numeric not null default 1,
  unit_price  numeric not null default 0,
  amount      numeric not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  actor       text not null default 'You',
  action      text not null,
  entity_type text not null,
  entity_id   text,
  details     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- Per-business invoice-number counter. Locked down: only the
-- next_invoice_number() security-definer function touches it.
create table if not exists public.business_sequences (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  last_number integer not null default 0
);

-- ── Indexes ────────────────────────────────────────────────────────────────
create index if not exists leads_business_idx      on public.leads (business_id);
create index if not exists leads_status_idx        on public.leads (business_id, status);
create index if not exists customers_business_idx  on public.customers (business_id);
create index if not exists tasks_business_idx      on public.tasks (business_id);
create index if not exists tasks_due_idx           on public.tasks (business_id, due_date);
create index if not exists bookings_business_idx   on public.bookings (business_id);
create index if not exists bookings_date_idx       on public.bookings (business_id, booking_date);
create index if not exists invoices_business_idx   on public.invoices (business_id);
create index if not exists invoices_customer_idx   on public.invoices (customer_id);
create index if not exists invoice_items_invoice_idx on public.invoice_items (invoice_id);
create index if not exists activity_logs_business_idx on public.activity_logs (business_id, created_at desc);

-- ── Helper: ownership check (security definer avoids RLS recursion) ────────
create or replace function public.is_business_owner(bid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.businesses b
    where b.id = bid and b.owner_id = auth.uid()
  );
$$;

-- ── updated_at trigger ─────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['profiles','businesses','leads','customers','tasks','bookings','invoices']
  loop
    execute format('drop trigger if exists set_updated_at_trigger on public.%I', t);
    execute format(
      'create trigger set_updated_at_trigger before update on public.%I
       for each row execute function public.set_updated_at()', t);
  end loop;
end;
$$;

-- ── Signup trigger: provision profile + default business ────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_display text;
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;

  v_display := coalesce(
    nullif(new.raw_user_meta_data ->> 'business_name', ''),
    split_part(new.email, '@', 1)
  );

  insert into public.businesses (owner_id, name, email)
  values (new.id, v_display || '''s Business', new.email)
  on conflict (owner_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Race-safe per-business invoice numbering ────────────────────────────────
create or replace function public.next_invoice_number(p_business_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_num integer;
begin
  insert into public.business_sequences (business_id, last_number)
  values (p_business_id, 1)
  on conflict (business_id)
  do update set last_number = public.business_sequences.last_number + 1
  returning last_number into v_num;

  return 'INV-' || lpad(v_num::text, 4, '0');
end;
$$;

-- ── Row Level Security ─────────────────────────────────────────────────────
alter table public.profiles           enable row level security;
alter table public.businesses         enable row level security;
alter table public.leads              enable row level security;
alter table public.customers          enable row level security;
alter table public.tasks              enable row level security;
alter table public.bookings           enable row level security;
alter table public.invoices           enable row level security;
alter table public.invoice_items      enable row level security;
alter table public.activity_logs      enable row level security;
alter table public.business_sequences enable row level security;

-- Profiles: a user can only ever touch their own row.
drop policy if exists "Users can view own profile"  on public.profiles;
create policy "Users can view own profile"  on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Businesses: owners only.
drop policy if exists "Owners can manage their business" on public.businesses;
create policy "Owners can manage their business" on public.businesses
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Business-owned tables: access requires owning the business.
drop policy if exists "Owners can manage their leads" on public.leads;
create policy "Owners can manage their leads" on public.leads
  for all
  using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

drop policy if exists "Owners can manage their customers" on public.customers;
create policy "Owners can manage their customers" on public.customers
  for all
  using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

drop policy if exists "Owners can manage their tasks" on public.tasks;
create policy "Owners can manage their tasks" on public.tasks
  for all
  using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

drop policy if exists "Owners can manage their bookings" on public.bookings;
create policy "Owners can manage their bookings" on public.bookings
  for all
  using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

drop policy if exists "Owners can manage their invoices" on public.invoices;
create policy "Owners can manage their invoices" on public.invoices
  for all
  using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

-- Invoice items: reachable only through an invoice the user owns.
drop policy if exists "Owners can manage their invoice items" on public.invoice_items;
create policy "Owners can manage their invoice items" on public.invoice_items
  for all
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_items.invoice_id
        and public.is_business_owner(i.business_id)
    )
  )
  with check (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_items.invoice_id
        and public.is_business_owner(i.business_id)
    )
  );

-- Activity logs: append-only for owners (select + insert, no update/delete).
drop policy if exists "Owners can view their activity" on public.activity_logs;
create policy "Owners can view their activity" on public.activity_logs
  for select using (public.is_business_owner(business_id));
drop policy if exists "Owners can log activity" on public.activity_logs;
create policy "Owners can log activity" on public.activity_logs
  for insert with check (public.is_business_owner(business_id));

-- business_sequences: no policies — only next_invoice_number() (security
-- definer) may read/write it.

-- ── Grants ─────────────────────────────────────────────────────────────────
-- Table privileges for the PostgREST roles (RLS policies still gate every row).
grant select, insert, update, delete on public.profiles           to authenticated;
grant select, insert, update, delete on public.businesses         to authenticated;
grant select, insert, update, delete on public.leads              to authenticated;
grant select, insert, update, delete on public.customers          to authenticated;
grant select, insert, update, delete on public.tasks              to authenticated;
grant select, insert, update, delete on public.bookings           to authenticated;
grant select, insert, update, delete on public.invoices           to authenticated;
grant select, insert, update, delete on public.invoice_items      to authenticated;
grant select, insert                on public.activity_logs      to authenticated;

-- Helper functions: callable by signed-in users only (never anon).
revoke all on function public.is_business_owner(uuid) from public, anon;
grant execute on function public.is_business_owner(uuid) to authenticated;
revoke all on function public.next_invoice_number(uuid) from public, anon;
grant execute on function public.next_invoice_number(uuid) to authenticated;
