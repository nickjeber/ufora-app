-- Ufora: industry accounts (music supervisors, bookers, hosts…) and their
-- license and booking requests.

create table public.industry_profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  name         text not null check (char_length(name) between 1 and 120),
  title        text check (char_length(title) <= 160),
  organization text check (char_length(organization) <= 200),
  role         text not null default 'other'
               check (role in ('music_supervisor', 'sound_designer', 'venue', 'promoter', 'booking_agent', 'radio', 'podcast', 'press', 'other')),
  avatar_path  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger industry_profiles_updated_at before update on public.industry_profiles
  for each row execute function public.set_updated_at();

-- Signup now creates either an artist profile or an industry profile,
-- depending on which form the person used.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta      jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  name      text;
  base_slug text;
  candidate text;
  n         int := 1;
begin
  if meta ->> 'account_type' = 'industry' then
    insert into public.industry_profiles (id, name, title, organization, role)
    values (
      new.id,
      left(coalesce(nullif(trim(meta ->> 'name'), ''), split_part(new.email, '@', 1)), 120),
      left(nullif(trim(meta ->> 'title'), ''), 160),
      left(nullif(trim(meta ->> 'organization'), ''), 200),
      case when meta ->> 'role' in ('music_supervisor', 'sound_designer', 'venue', 'promoter', 'booking_agent', 'radio', 'podcast', 'press')
           then meta ->> 'role' else 'other' end
    );
    return new;
  end if;

  name := coalesce(nullif(trim(meta ->> 'artist_name'), ''), split_part(new.email, '@', 1));
  base_slug := public.slugify(name);
  if char_length(base_slug) < 2 then
    base_slug := 'artist';
  end if;
  base_slug := left(base_slug, 52);
  candidate := base_slug;
  while exists (select 1 from public.profiles where slug = candidate) loop
    n := n + 1;
    candidate := base_slug || '-' || n;
  end loop;

  insert into public.profiles (id, artist_name, slug)
  values (new.id, left(name, 120), candidate);
  return new;
end $$;

create table public.license_requests (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  requester_id  uuid not null references public.industry_profiles (id) on delete cascade,
  artist_id     uuid not null references public.profiles (id) on delete cascade,
  track_id      uuid references public.tracks (id) on delete set null,
  track_title   text not null check (char_length(track_title) between 1 and 200),
  usage         text not null check (usage in ('film', 'tv', 'advertising', 'trailer', 'video_game', 'web_social', 'podcast', 'live_event', 'other')),
  project_title text not null check (char_length(project_title) between 1 and 200),
  description   text check (char_length(description) <= 2000),
  territory     text not null default 'worldwide' check (territory in ('worldwide', 'north_america', 'us', 'europe', 'uk', 'other')),
  term          text not null default '1_year' check (term in ('one_time', '1_year', '3_years', '5_years', 'perpetual')),
  budget        text check (char_length(budget) <= 120),
  needed_by     date,
  status        text not null default 'requested' check (status in ('requested', 'quoted', 'licensed', 'declined', 'withdrawn'))
);
create index license_requests_requester_idx on public.license_requests (requester_id, created_at desc);
create index license_requests_artist_idx on public.license_requests (artist_id, created_at desc);

create table public.booking_requests (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  requester_id uuid not null references public.industry_profiles (id) on delete cascade,
  artist_id    uuid not null references public.profiles (id) on delete cascade,
  kind         text not null check (kind in ('tour_support', 'headline_show', 'festival', 'private_event', 'radio_session', 'podcast', 'livestream', 'other')),
  start_date   date not null,
  end_date     date not null,
  venue        text check (char_length(venue) <= 200),
  city         text check (char_length(city) <= 120),
  details      text check (char_length(details) <= 2000),
  budget       text check (char_length(budget) <= 120),
  status       text not null default 'requested' check (status in ('requested', 'confirmed', 'declined', 'withdrawn')),
  check (end_date >= start_date)
);
create index booking_requests_requester_idx on public.booking_requests (requester_id, created_at desc);
create index booking_requests_artist_idx on public.booking_requests (artist_id, start_date);

-- ── Row Level Security ────────────────────────────────────────

alter table public.industry_profiles enable row level security;
alter table public.license_requests  enable row level security;
alter table public.booking_requests  enable row level security;

create policy "Industry members read own profile" on public.industry_profiles for select
  using ((select auth.uid()) = id);
create policy "Industry members update own profile" on public.industry_profiles for update
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
-- Artists can see who is asking to license or book them.
create policy "Artists see their requesters" on public.industry_profiles for select using (
  exists (select 1 from public.license_requests r where r.requester_id = industry_profiles.id and r.artist_id = (select auth.uid()))
  or exists (select 1 from public.booking_requests r where r.requester_id = industry_profiles.id and r.artist_id = (select auth.uid()))
);

-- Requests: industry members can only ask about signed artists, only as themselves,
-- and can read their own; artists can read requests made to them.
create policy "Industry members send license requests" on public.license_requests for insert with check (
  (select auth.uid()) = requester_id
  and status = 'requested'
  and exists (select 1 from public.profiles p where p.id = artist_id and p.is_signed)
);
create policy "Read own license requests" on public.license_requests for select
  using ((select auth.uid()) in (requester_id, artist_id));

create policy "Industry members send booking requests" on public.booking_requests for insert with check (
  (select auth.uid()) = requester_id
  and status = 'requested'
  and exists (select 1 from public.profiles p where p.id = artist_id and p.is_signed)
);
create policy "Read own booking requests" on public.booking_requests for select
  using ((select auth.uid()) in (requester_id, artist_id));

revoke all on public.industry_profiles, public.license_requests, public.booking_requests from anon, authenticated;
grant select on public.industry_profiles, public.license_requests, public.booking_requests to authenticated;
grant update (name, title, organization, avatar_path) on public.industry_profiles to authenticated;
grant insert on public.license_requests, public.booking_requests to authenticated;
