create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('admin', 'agent');
  end if;
end
$$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  name text,
  role public.user_role not null default 'agent',
  organization_id uuid not null references public.organizations (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  total_weight numeric(12, 2),
  total_cost numeric(12, 2),
  status text not null default 'draft',
  created_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tracking_items (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  tracking_id text not null,
  product_name text,
  courier text not null,
  weight numeric(12, 2),
  cost numeric(12, 2),
  status text not null default 'pending',
  comment text,
  is_confirmed_by_agent boolean not null default false,
  confirmed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, tracking_id)
);

alter table public.tracking_items
  add column if not exists product_name text;

alter table public.tracking_items
  add column if not exists comment text;

create index if not exists idx_users_organization_id on public.users (organization_id);
create index if not exists idx_shipments_organization_id on public.shipments (organization_id);
create index if not exists idx_shipments_created_by on public.shipments (created_by);
create index if not exists idx_tracking_items_shipment_id on public.tracking_items (shipment_id);
create index if not exists idx_tracking_items_organization_id on public.tracking_items (organization_id);

create or replace function public.current_user_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from public.users
  where id = auth.uid()
  limit 1;
$$;

grant execute on function public.current_user_organization_id() to authenticated;

alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.shipments enable row level security;
alter table public.tracking_items enable row level security;

drop policy if exists "organizations_select_own_org" on public.organizations;
create policy "organizations_select_own_org"
on public.organizations
for select
to authenticated
using (id = public.current_user_organization_id());

drop policy if exists "users_select_same_org" on public.users;
create policy "users_select_same_org"
on public.users
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users_insert_same_org" on public.users;
create policy "users_insert_same_org"
on public.users
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users_update_same_org" on public.users;
create policy "users_update_same_org"
on public.users
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users_delete_same_org" on public.users;
create policy "users_delete_same_org"
on public.users
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "shipments_select_same_org" on public.shipments;
create policy "shipments_select_same_org"
on public.shipments
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "shipments_insert_same_org" on public.shipments;
create policy "shipments_insert_same_org"
on public.shipments
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "shipments_update_same_org" on public.shipments;
create policy "shipments_update_same_org"
on public.shipments
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "shipments_delete_same_org" on public.shipments;
create policy "shipments_delete_same_org"
on public.shipments
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "tracking_items_select_same_org" on public.tracking_items;
create policy "tracking_items_select_same_org"
on public.tracking_items
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "tracking_items_insert_same_org" on public.tracking_items;
create policy "tracking_items_insert_same_org"
on public.tracking_items
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "tracking_items_update_same_org" on public.tracking_items;
create policy "tracking_items_update_same_org"
on public.tracking_items
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "tracking_items_delete_same_org" on public.tracking_items;
create policy "tracking_items_delete_same_org"
on public.tracking_items
for delete
to authenticated
using (organization_id = public.current_user_organization_id());
