-- Tables
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  state text,
  idleThresholdMinutes integer default 30,
  contactPhone text,
  slug text unique not null
);

create table if not exists pool_tables (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade not null,
  name text not null,
  state text check (state in ('VACANT','PARTIAL','NO_VACANCY')) default 'VACANT',
  note text,
  updated_at timestamptz
);

-- Profiles table to link Supabase auth users to a business
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  role text check (role in ('owner','manager','staff')) default 'staff',
  business_id uuid references businesses(id) on delete set null
);

-- Enable RLS
alter table businesses enable row level security;
alter table pool_tables enable row level security;
alter table profiles enable row level security;

-- RLS policies
-- Public can read businesses and pool tables
create policy if not exists public_read_businesses
on businesses for select
to anon, authenticated
using (true);

create policy if not exists public_read_tables
on pool_tables for select
to anon, authenticated
using (true);

-- Only users from a business can update that business's tables
create policy if not exists biz_update_tables
on pool_tables for update
to authenticated
using (exists (
  select 1 from profiles p
  where p.id = auth.uid() and p.business_id = pool_tables.business_id
));

-- Profiles: user can read their own profile
create policy if not exists read_own_profile
on profiles for select
to authenticated
using (id = auth.uid());

-- Profiles: user can update their own profile (optional)
create policy if not exists update_own_profile
on profiles for update
to authenticated
using (id = auth.uid());

-- Helper function to keep profiles in sync
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id,email) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
