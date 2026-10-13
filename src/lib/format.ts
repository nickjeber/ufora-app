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
