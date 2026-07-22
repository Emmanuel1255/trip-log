-- TripLog initial schema
-- Run this in the Supabase Studio SQL editor (or `supabase db push` if the CLI is linked).

create extension if not exists pgcrypto;

create type fuel_type as enum ('petrol', 'diesel');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table public.drivers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  license_number text,
  license_photo_url text,
  license_expiry date,
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plate_number text not null,
  make text not null,
  fuel_type fuel_type not null,
  active boolean not null default true,
  default_driver_id uuid references public.drivers(id) on delete set null,
  starting_odometer numeric,
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_number text not null,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  driver_id uuid not null references public.drivers(id),
  trip_date date not null,
  departure_location text not null,
  time_out time not null,
  arrival_location text not null,
  time_in time not null,
  passengers text,
  opening_odometer numeric not null,
  closing_odometer numeric not null,
  distance_km numeric generated always as (closing_odometer - opening_odometer) stored,
  notes text,
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint closing_gte_opening check (closing_odometer >= opening_odometer)
);

create table public.fuel_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete set null,
  litres numeric not null,
  cost numeric,
  fuel_date date not null,
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_trips_user_vehicle on public.trips (user_id, vehicle_id);
create index idx_trips_user_driver on public.trips (user_id, driver_id);
create index idx_trips_user_date on public.trips (user_id, trip_date);
create index idx_trips_user_updated on public.trips (user_id, updated_at);
create index idx_fuel_user_vehicle on public.fuel_entries (user_id, vehicle_id);
create index idx_fuel_trip on public.fuel_entries (trip_id);
create index idx_fuel_user_updated on public.fuel_entries (user_id, updated_at);
create index idx_vehicles_user_updated on public.vehicles (user_id, updated_at);
create index idx_drivers_user_updated on public.drivers (user_id, updated_at);

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.drivers enable row level security;
alter table public.trips enable row level security;
alter table public.fuel_entries enable row level security;

create policy "own profile" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "own vehicles" on public.vehicles for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own drivers" on public.drivers for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own trips" on public.trips for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own fuel_entries" on public.fuel_entries for all using (user_id = auth.uid()) with check (user_id = auth.uid());
