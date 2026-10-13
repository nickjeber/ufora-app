-- Ufora artist platform — initial schema
-- Run in the Supabase SQL editor (or `supabase db push`).


-- ─────────────────────────────────────────────────────────────
-- Helpers
-- ─────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Turn "Björk & The Sugarcubes!" into "bjork-the-sugarcubes"
create or replace function public.slugify(value text)
returns text language sql immutable as $$
  select trim(both '-' from regexp_replace(
    lower(translate(coalesce(value, ''),
      'áàâäãåçéèêëíìîïñóòôöõøúùûüýÿ',
      'aaaaaaceeeeiiiinoooooouuuuyy')),
    '[^a-z0-9]+', '-', 'g'));
$$;

-- ─────────────────────────────────────────────────────────────
-- Profiles (one per artist account)
-- ─────────────────────────────────────────────────────────────

create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  slug            text not null unique
                  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 2 and 60),
  artist_name     text not null check (char_length(artist_name) between 1 and 120),
  bio             text check (char_length(bio) <= 5000),
  location        text check (char_length(location) <= 120),
  avatar_path     text,
  background_path text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create a profile automatically when someone signs up.
-- The artist name comes from the signup form (user metadata).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  name      text := coalesce(nullif(trim(new.raw_user_meta_data ->> 'artist_name'), ''), split_part(new.email, '@', 1));
  base_slug text := public.slugify(name);
  candidate text;
  n         int := 1;
begin
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

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- Albums & tracks
-- ─────────────────────────────────────────────────────────────

create table public.albums (
  id           uuid primary key default gen_random_uuid(),
  artist_id    uuid not null references public.profiles (id) on delete cascade,
  title        text not null check (char_length(title) between 1 and 200),
  release_type text not null default 'album' check (release_type in ('album', 'ep', 'single')),
  release_date date,
  description  text check (char_length(description) <= 2000),
  art_path     text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index albums_artist_idx on public.albums (artist_id, release_date desc);
create trigger albums_updated_at before update on public.albums
  for each row execute function public.set_updated_at();

create table public.tracks (
  id               uuid primary key default gen_random_uuid(),
  album_id         uuid not null references public.albums (id) on delete cascade,
  artist_id        uuid not null references public.profiles (id) on delete cascade,
  title            text not null check (char_length(title) between 1 and 200),
  track_number     int not null default 1 check (track_number > 0),
  duration_seconds int check (duration_seconds >= 0),
  audio_path       text not null,
  created_at       timestamptz not null default now()
);
create index tracks_album_idx on public.tracks (album_id, track_number);

-- ─────────────────────────────────────────────────────────────
-- Videos (YouTube / Vimeo links)
-- ─────────────────────────────────────────────────────────────

create table public.videos (
  id          uuid primary key default gen_random_uuid(),
  artist_id   uuid not null references public.profiles (id) on delete cascade,
  kind        text not null check (kind in ('music', 'live')),
  title       text not null check (char_length(title) between 1 and 200),
  url         text not null,
  provider    text not null check (provider in ('youtube', 'vimeo')),
  provider_id text not null,
  video_date  date,
  venue       text check (char_length(venue) <= 200),
  created_at  timestamptz not null default now()
);
create index videos_artist_idx on public.videos (artist_id, kind, video_date desc);

-- ─────────────────────────────────────────────────────────────
-- Tour dates
-- ─────────────────────────────────────────────────────────────

create table public.tour_dates (
  id          uuid primary key default gen_random_uuid(),
  artist_id   uuid not null references public.profiles (id) on delete cascade,
  event_date  date not null,
  venue       text not null check (char_length(venue) between 1 and 200),
  city        text not null check (char_length(city) between 1 and 120),
  region      text check (char_length(region) <= 120),
  country     text check (char_length(country) <= 120),
  ticket_url  text,
  notes       text check (char_length(notes) <= 500),
  created_at  timestamptz not null default now()
);
create index tour_dates_artist_idx on public.tour_dates (artist_id, event_date);

-- ─────────────────────────────────────────────────────────────
-- Press dates (interviews, reviews, features, radio, etc.)
-- ─────────────────────────────────────────────────────────────

create table public.press_dates (
  id          uuid primary key default gen_random_uuid(),
  artist_id   uuid not null references public.profiles (id) on delete cascade,
  press_date  date not null,
  kind        text not null default 'feature'
              check (kind in ('interview', 'review', 'feature', 'radio', 'podcast', 'tv', 'other')),
  outlet      text not null check (char_length(outlet) between 1 and 200),
  title       text check (char_length(title) <= 300),
  url         text,
  notes       text check (char_length(notes) <= 500),
  created_at  timestamptz not null default now()
);
create index press_dates_artist_idx on public.press_dates (artist_id, press_date desc);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security: anyone can read artist pages,
-- only the artist can change their own content.
-- ─────────────────────────────────────────────────────────────

alter table public.profiles    enable row level security;
alter table public.albums      enable row level security;
alter table public.tracks      enable row level security;
alter table public.videos      enable row level security;
alter table public.tour_dates  enable row level security;
alter table public.press_dates enable row level security;

create policy "Profiles are public" on public.profiles for select using (true);
create policy "Artists update own profile" on public.profiles for update
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

do $$
declare t text;
begin
  foreach t in array array['albums', 'videos', 'tour_dates', 'press_dates'] loop
    execute format('create policy "%1$s are public" on public.%1$I for select using (true)', t);
    execute format('create policy "Artists insert own %1$s" on public.%1$I for insert with check ((select auth.uid()) = artist_id)', t);
    execute format('create policy "Artists update own %1$s" on public.%1$I for update using ((select auth.uid()) = artist_id) with check ((select auth.uid()) = artist_id)', t);
    execute format('create policy "Artists delete own %1$s" on public.%1$I for delete using ((select auth.uid()) = artist_id)', t);
  end loop;
end $$;

-- Tracks must belong to an album the artist owns.
create policy "Tracks are public" on public.tracks for select using (true);
create policy "Artists insert own tracks" on public.tracks for insert with check (
  (select auth.uid()) = artist_id
  and exists (select 1 from public.albums a where a.id = album_id and a.artist_id = (select auth.uid()))
);
create policy "Artists update own tracks" on public.tracks for update
  using ((select auth.uid()) = artist_id)
  with check (
    (select auth.uid()) = artist_id
    and exists (select 1 from public.albums a where a.id = album_id and a.artist_id = (select auth.uid()))
  );
create policy "Artists delete own tracks" on public.tracks for delete
  using ((select auth.uid()) = artist_id);

-- ─────────────────────────────────────────────────────────────
-- Storage buckets. Files live under "<user id>/..." so an
-- artist can only write inside their own folder.
-- ─────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('avatars',     'avatars',     true, 5242880,  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('backgrounds', 'backgrounds', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('album-art',   'album-art',   true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('audio',       'audio',       true, 52428800, array['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave', 'audio/flac', 'audio/x-flac', 'audio/aac', 'audio/mp4', 'audio/x-m4a', 'audio/ogg'])
on conflict (id) do nothing;

create policy "Artists read own files" on storage.objects for select to authenticated using (
  bucket_id in ('avatars', 'backgrounds', 'album-art', 'audio')
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy "Artists upload own files" on storage.objects for insert to authenticated with check (
  bucket_id in ('avatars', 'backgrounds', 'album-art', 'audio')
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy "Artists update own files" on storage.objects for update to authenticated using (
  bucket_id in ('avatars', 'backgrounds', 'album-art', 'audio')
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy "Artists delete own files" on storage.objects for delete to authenticated using (
  bucket_id in ('avatars', 'backgrounds', 'album-art', 'audio')
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
