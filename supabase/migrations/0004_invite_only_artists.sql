-- Ufora: artist accounts are invitation-only. Artists submit releases,
-- Ufora reviews them, and signing sends a one-time invite link.

-- ── Who can review ─────────────────────────────────────────────
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
create policy "Admins can see their own row" on public.admins for select using ((select auth.uid()) = user_id);
revoke all on public.admins from anon, authenticated;
grant select on public.admins to authenticated;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
grant execute on function public.is_admin() to authenticated;

-- ── Submissions: what was sent, and the decision ───────────────
alter table public.submissions
  add column if not exists release_type text check (release_type in ('album', 'ep', 'single', 'demo')),
  add column if not exists release_title text check (char_length(release_title) <= 200),
  add column if not exists decided_at timestamptz;
create index if not exists submissions_email_idx on public.submissions (lower(email), created_at desc);

create policy "Admins read submissions" on public.submissions for select using (public.is_admin());
create policy "Admins update submissions" on public.submissions for update using (public.is_admin()) with check (public.is_admin());
grant select, update (status, decided_at) on public.submissions to authenticated;

-- ── Invites ────────────────────────────────────────────────────
create table public.artist_invites (
  id            uuid primary key default gen_random_uuid(),
  token         uuid not null unique default gen_random_uuid(),
  submission_id uuid references public.submissions (id) on delete set null,
  email         text not null check (char_length(email) between 3 and 320),
  artist_name   text not null check (char_length(artist_name) between 1 and 120),
  created_at    timestamptz not null default now(),
  used_at       timestamptz,
  used_by       uuid references auth.users (id) on delete set null
);
alter table public.artist_invites enable row level security;
create policy "Admins manage invites" on public.artist_invites for all using (public.is_admin()) with check (public.is_admin());
revoke all on public.artist_invites from anon, authenticated;
grant select, insert, delete on public.artist_invites to authenticated;

-- The signup page can look up an unused invite by its token (and nothing else).
create or replace function public.invite_details(invite_token uuid)
returns table (artist_name text, email text)
language sql stable security definer set search_path = public as $$
  select artist_name, email from public.artist_invites where token = invite_token and used_at is null;
$$;
grant execute on function public.invite_details(uuid) to anon, authenticated;

-- ── Signup: industry accounts are open; artist accounts need a valid invite ──
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta      jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  invite    public.artist_invites%rowtype;
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

  select * into invite from public.artist_invites
  where token = nullif(meta ->> 'invite_token', '')::uuid
    and used_at is null
    and lower(email) = lower(new.email)
  for update;
  if not found then
    raise exception 'ufora_invite_required' using hint = 'Artist accounts are invitation-only. Submit your music at ufora-app.vercel.app/submit.';
  end if;

  name := coalesce(nullif(trim(meta ->> 'artist_name'), ''), invite.artist_name);
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

  insert into public.profiles (id, artist_name, slug, is_signed)
  values (new.id, left(name, 120), candidate, true);

  update public.artist_invites set used_at = now(), used_by = new.id where id = invite.id;
  return new;
end $$;

-- Ufora's founder reviews submissions.
insert into public.admins (user_id)
select id from auth.users where lower(email) = 'nickjeber@gmail.com'
on conflict do nothing;
