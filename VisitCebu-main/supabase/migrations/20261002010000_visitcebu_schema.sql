create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  short_description text not null default '',
  location text not null default '',
  category text not null default '',
  image_url text not null default '',
  latitude numeric,
  longitude numeric,
  rating numeric not null default 0,
  opening_hours text not null default '',
  entrance_fee text not null default '',
  best_time_to_visit text not null default '',
  how_to_get_there text not null default '',
  travel_tips text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  cuisine text not null default '',
  location text not null default '',
  image_url text not null default '',
  price_range text not null default '',
  rating numeric not null default 0,
  latitude numeric,
  longitude numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  image_url text not null default '',
  location text not null default '',
  category text not null default '',
  start_date timestamptz not null,
  end_date timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  destination_id uuid references public.destinations (id) on delete cascade,
  restaurant_id uuid references public.restaurants (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favorites_single_place check (num_nonnulls(destination_id, restaurant_id) = 1),
  constraint favorites_user_destination_unique unique (user_id, destination_id),
  constraint favorites_user_restaurant_unique unique (user_id, restaurant_id)
);

create table if not exists public.itineraries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint itineraries_valid_dates check (end_date is null or start_date is null or end_date >= start_date)
);

create table if not exists public.itinerary_days (
  id uuid primary key default gen_random_uuid(),
  itinerary_id uuid not null references public.itineraries (id) on delete cascade,
  day_number integer not null check (day_number > 0),
  date date,
  constraint itinerary_days_number_unique unique (itinerary_id, day_number)
);

create table if not exists public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  itinerary_day_id uuid not null references public.itinerary_days (id) on delete cascade,
  destination_id uuid not null references public.destinations (id) on delete cascade,
  position integer not null default 0 check (position >= 0),
  notes text not null default '',
  start_time time,
  constraint itinerary_items_position_unique unique (itinerary_day_id, position) deferrable initially deferred
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  destination_id uuid not null references public.destinations (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_user_destination_unique unique (user_id, destination_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        avatar_url = excluded.avatar_url;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_visitcebu on auth.users;
create trigger on_auth_user_created_visitcebu
  after insert on auth.users
  for each row execute function public.create_profile_for_new_user();

drop trigger if exists itineraries_set_updated_at on public.itineraries;
create trigger itineraries_set_updated_at
  before update on public.itineraries
  for each row execute function public.set_updated_at();

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.destinations enable row level security;
alter table public.restaurants enable row level security;
alter table public.events enable row level security;
alter table public.favorites enable row level security;
alter table public.itineraries enable row level security;
alter table public.itinerary_days enable row level security;
alter table public.itinerary_items enable row level security;
alter table public.reviews enable row level security;

create policy "Public can read profiles"
  on public.profiles for select to anon, authenticated using (true);
create policy "Users can insert their profile"
  on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "Users can update their profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Public can read destinations"
  on public.destinations for select to anon, authenticated using (true);
create policy "Public can read restaurants"
  on public.restaurants for select to anon, authenticated using (true);
create policy "Public can read events"
  on public.events for select to anon, authenticated using (true);

create policy "Users can read their favorites"
  on public.favorites for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can add their favorites"
  on public.favorites for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can remove their favorites"
  on public.favorites for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can manage their itineraries"
  on public.itineraries for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Users can manage days in their itineraries"
  on public.itinerary_days for all to authenticated
  using (exists (
    select 1 from public.itineraries i
    where i.id = itinerary_days.itinerary_id and i.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.itineraries i
    where i.id = itinerary_days.itinerary_id and i.user_id = (select auth.uid())
  ));

create policy "Users can manage items in their itineraries"
  on public.itinerary_items for all to authenticated
  using (exists (
    select 1
    from public.itinerary_days d
    join public.itineraries i on i.id = d.itinerary_id
    where d.id = itinerary_items.itinerary_day_id and i.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1
    from public.itinerary_days d
    join public.itineraries i on i.id = d.itinerary_id
    where d.id = itinerary_items.itinerary_day_id and i.user_id = (select auth.uid())
  ));

create policy "Public can read reviews"
  on public.reviews for select to anon, authenticated using (true);
create policy "Users can add their reviews"
  on public.reviews for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their reviews"
  on public.reviews for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete their reviews"
  on public.reviews for delete to authenticated using ((select auth.uid()) = user_id);

grant select on public.destinations, public.restaurants, public.events, public.reviews, public.profiles to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, delete on public.favorites to authenticated;
grant select, insert, update, delete on public.itineraries, public.itinerary_days, public.itinerary_items to authenticated;
grant insert, update, delete on public.reviews to authenticated;