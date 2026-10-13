# Ufora — Artist App

The artist-facing web app for **Ufora** (separate from the ufora.co marketing site). Artists sign up, verify their email, and manage their own public page:

- Avatar and background image
- Artist / band name, location, bio, and page URL (`/artists/your-name`)
- Releases (albums, EPs, singles) with album art and uploaded tracks — reorder, rename, delete
- Music videos and live performance videos (YouTube / Vimeo links, embedded)
- Tour dates (upcoming shown publicly, past archived automatically)
- Press dates (interviews, reviews, features, radio, podcasts, TV)

**Stack:** Next.js 16 (App Router, server actions) · Supabase (Auth, Postgres with RLS, Storage) · Tailwind CSS 4

## Setup

### 1. Create a Supabase project
At [supabase.com](https://supabase.com), create a project, then:

1. **Database** → SQL Editor → paste and run `supabase/migrations/0001_artist_profiles.sql`. This creates all tables, security policies, and the four storage buckets (`avatars`, `backgrounds`, `album-art`, `audio`).
2. **Authentication → Sign In / Providers → Email**: make sure *Confirm email* is **on**.
3. **Authentication → URL Configuration**: set *Site URL* to your app URL (e.g. `http://localhost:3000` for now) and add `http://localhost:3000/**` (and later your production URL + `/**`) to *Redirect URLs*.
4. **Authentication → Emails → Templates** (recommended, so verification links work even when opened in a different browser):
   - *Confirm signup* — set the link to
     `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard`
   - *Reset password* — set the link to
     `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`
5. **For real launches**: Supabase's built-in email sender is rate-limited and meant for testing. Add your own SMTP (e.g. Resend, Postmark) under *Authentication → Emails → SMTP Settings*, sending from an `@ufora.co` address.

### 2. Run locally
```bash
cp .env.example .env.local   # fill in your Supabase URL + publishable (or anon) key
npm install
npm run dev
```
Open http://localhost:3000.

### 3. Deploy
Import the repo into [Vercel](https://vercel.com), add the three env vars from `.env.example` (with `NEXT_PUBLIC_SITE_URL` set to the production URL, e.g. `https://app.ufora.co`), and add that URL to Supabase's redirect URLs.

## How it's organised

```
src/
  app/
    (auth)/            signup, login, check-email, forgot/reset password + actions
    auth/confirm/      handles links from verification & reset emails
    dashboard/         the artist's editor: profile, music, videos, tour, press
    artists/[slug]/    public artist page (with album player and video embeds)
  components/          ActionForm, file uploads, delete button, logo
  lib/                 Supabase clients, auth helpers, formatting, video-link parsing
  proxy.ts             refreshes sessions; keeps signed-out users out of /dashboard
supabase/migrations/   database schema, RLS policies, storage buckets
```

**Security model:** everything on artist pages is publicly readable; only the owning artist can create, edit, or delete their own rows (enforced by Postgres row-level security, not just the app). Uploaded files go straight from the browser to Supabase Storage under a folder named after the artist's user ID, and storage policies block writing anywhere else.

**Limits:** images 5–10 MB, audio 50 MB per file (Supabase free-tier maximum). Adjust in the migration's bucket settings if you upgrade.
