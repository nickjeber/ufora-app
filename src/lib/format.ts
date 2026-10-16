import { SUPABASE_URL } from "./supabase/env";
import type { Bucket } from "./types";

/** Public URL for a file in one of our public storage buckets. */
export function fileUrl(bucket: Bucket, path: string | null | undefined) {
  if (!path) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

/** Dates are stored as plain YYYY-MM-DD; format them without timezone drift. */
export function formatDate(value: string | null | undefined, opts?: Intl.DateTimeFormatOptions) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
    ...opts,
  }).format(new Date(`${value}T00:00:00Z`));
}

export function formatDuration(seconds: number | null | undefined) {
  if (seconds == null) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Today as YYYY-MM-DD (UTC) — good enough for upcoming vs. past splits. */
export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export const RELEASE_TYPE_LABEL = { album: "Album", ep: "EP", single: "Single" } as const;

export const PRESS_KIND_LABEL = {
  interview: "Interview",
  review: "Review",
  feature: "Feature",
  radio: "Radio",
  podcast: "Podcast",
  tv: "TV",
  other: "Other",
} as const;

export const INDUSTRY_ROLE_LABEL = {
  music_supervisor: "Music supervisor",
  sound_designer: "Sound designer",
  venue: "Venue",
  promoter: "Promoter",
  booking_agent: "Booking agent",
  radio: "Radio host or programmer",
  podcast: "Podcast host",
  press: "Press",
  other: "Something else",
} as const;

export const LICENSE_USAGE_LABEL = {
  film: "Film",
  tv: "TV",
  advertising: "Advertising",
  trailer: "Trailer or promo",
  video_game: "Video game",
  web_social: "Web or social",
  podcast: "Podcast",
  live_event: "Live event",
  other: "Something else",
} as const;

export const TERRITORY_LABEL = {
  worldwide: "Worldwide",
  north_america: "North America",
  us: "United States",
  europe: "Europe",
  uk: "United Kingdom",
  other: "Other (describe below)",
} as const;

export const TERM_LABEL = {
  one_time: "One-time use",
  "1_year": "1 year",
  "3_years": "3 years",
  "5_years": "5 years",
  perpetual: "In perpetuity",
} as const;

export const BOOKING_KIND_LABEL = {
  tour_support: "Tour support",
  headline_show: "Headline show",
  festival: "Festival",
  private_event: "Private event",
  radio_session: "Radio session",
  podcast: "Podcast appearance",
  livestream: "Livestream",
  other: "Something else",
} as const;

export const REQUEST_STATUS_LABEL = {
  requested: "Sent",
  quoted: "Quote ready",
  licensed: "Licensed",
  confirmed: "Confirmed",
  declined: "Declined",
  withdrawn: "Withdrawn",
} as const;

/** The date `days` ago as YYYY-MM-DD (UTC). */
export function daysAgoIso(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
}
