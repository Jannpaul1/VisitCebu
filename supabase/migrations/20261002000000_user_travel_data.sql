create table if not exists public.user_travel_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  favorites jsonb not null default '[]'::jsonb check (jsonb_typeof(favorites) = 'array'),
  itineraries jsonb not null default '[]'::jsonb check (jsonb_typeof(itineraries) = 'array'),
  updated_at timestamptz not null default now()
);

alter table public.user_travel_data enable row level security;

create policy "Users can read their own travel data"
  on public.user_travel_data for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own travel data"
  on public.user_travel_data for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own travel data"
  on public.user_travel_data for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.user_travel_data to authenticated;