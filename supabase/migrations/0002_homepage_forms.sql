-- Ufora: artist submissions, industry access requests, and the roster flag.

-- Only artists Ufora has signed appear on the public roster.
alter table public.profiles add column if not exists is_signed boolean not null default false;
create index if not exists profiles_signed_idx on public.profiles (is_signed) where is_signed;

-- Artists can edit their own profile, but never their own signed status.
revoke update on public.profiles from anon, authenticated;
grant update (slug, artist_name, bio, location, avatar_path, background_path) on public.profiles to authenticated;

-- Music submitted for consideration.
create table public.submissions (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  artist_name text not null check (char_length(artist_name) between 1 and 120),
  email       text not null check (char_length(email) between 3 and 320),
  location    text check (char_length(location) <= 120),
  links       text not null check (char_length(links) between 1 and 2000),
  about       text check (char_length(about) <= 2000),
  status      text not null default 'new' check (status in ('new', 'listening', 'signed', 'passed'))
);

-- Music supervisors, venues, bookers, radio and podcast hosts asking for access.
create table public.industry_contacts (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  name         text not null check (char_length(name) between 1 and 120),
  email        text not null check (char_length(email) between 3 and 320),
  organization text check (char_length(organization) <= 200),
  role         text not null check (role in ('music_supervisor', 'sound_designer', 'venue', 'promoter', 'booking_agent', 'radio', 'podcast', 'press', 'other')),
  looking_for  text check (char_length(looking_for) <= 2000),
  notify       boolean not null default true
);

-- Anyone can submit; nobody can read these through the public API.
-- Review them in the Supabase table editor.
alter table public.submissions enable row level security;
alter table public.industry_contacts enable row level security;

revoke all on public.submissions, public.industry_contacts from anon, authenticated;
grant insert on public.submissions, public.industry_contacts to anon, authenticated;

create policy "Anyone can submit music" on public.submissions
  for insert to anon, authenticated with check (status = 'new');
create policy "Anyone can request industry access" on public.industry_contacts
  for insert to anon, authenticated with check (true);
