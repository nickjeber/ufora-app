"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { NOT_SIGNED_IN, firstError, optionalDate, optionalText, ownsPath, removeFiles } from "@/lib/action-helpers";
import { getActionUser } from "@/lib/auth";
import type { ActionState } from "@/lib/types";

const uuid = z.string().uuid();

// ── Profile ─────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(120),
  title: optionalText(160),
  organization: optionalText(200),
});

export async function updateIndustryProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await getActionUser();
  if (!user) return NOT_SIGNED_IN;
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { error } = await supabase.from("industry_profiles").update(parsed.data).eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/industry/dashboard", "layout");
  return { ok: true, message: "Saved." };
}

export async function setIndustryPhoto(path: string | null): Promise<ActionState> {
  const { supabase, user } = await getActionUser();
  if (!user) return NOT_SIGNED_IN;
  if (path !== null && !ownsPath(user.id, path)) return { error: "Invalid file." };

  const { data: current } = await supabase.from("industry_profiles").select("avatar_path").eq("id", user.id).single();
  const { error } = await supabase.from("industry_profiles").update({ avatar_path: path }).eq("id", user.id);
  if (error) return { error: error.message };
  if (current?.avatar_path && current.avatar_path !== path) await removeFiles(supabase, "avatars", [current.avatar_path]);

  revalidatePath("/industry/dashboard", "layout");
  return { ok: true };
}

// ── License a track ─────────────────────────────────────────────

const licenseSchema = z.object({
  usage: z.enum(["film", "tv", "advertising", "trailer", "video_game", "web_social", "podcast", "live_event", "other"], {
    message: "Choose how the music will be used.",
  }),
  project_title: z.string().trim().min(1, "Give your project a name.").max(200),
  description: optionalText(2000),
  territory: z.enum(["worldwide", "north_america", "us", "europe", "uk", "other"]),
  term: z.enum(["one_time", "1_year", "3_years", "5_years", "perpetual"]),
  budget: optionalText(120),
  needed_by: optionalDate,
});

export async function requestLicense(trackId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await getActionUser();
  if (!user) return NOT_SIGNED_IN;
  if (!uuid.safeParse(trackId).success) return { error: "Track not found." };

  const parsed = licenseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { data: track } = await supabase.from("tracks").select("id, title, artist_id").eq("id", trackId).maybeSingle();
  if (!track) return { error: "This track is no longer available." };

  const { error } = await supabase.from("license_requests").insert({
    ...parsed.data,
    requester_id: user.id,
    artist_id: track.artist_id,
    track_id: track.id,
    track_title: track.title,
  });
  if (error) return { error: "Your license request didn’t go through. Try again in a moment." };

  revalidatePath("/industry/dashboard/requests");
  redirect("/industry/dashboard/requests?sent=license");
}

// ── Book an artist ──────────────────────────────────────────────

const iso = /^\d{4}-\d{2}-\d{2}$/;

const bookingSchema = z
  .object({
    kind: z.enum(
      ["tour_support", "headline_show", "festival", "private_event", "radio_session", "podcast", "livestream", "other"],
      { message: "Choose what you’re booking." },
    ),
    start_date: z.string().regex(iso, "Pick a date on the calendar."),
    end_date: z.string().regex(iso, "Pick a date on the calendar."),
    venue: optionalText(200),
    city: optionalText(120),
    budget: optionalText(120),
    details: optionalText(2000),
  })
  .refine((d) => d.end_date >= d.start_date, { message: "The end date must be after the start date." })
  .refine((d) => d.start_date >= new Date().toISOString().slice(0, 10), { message: "Pick a date in the future." });

export async function requestBooking(artistId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await getActionUser();
  if (!user) return NOT_SIGNED_IN;
  if (!uuid.safeParse(artistId).success) return { error: "Artist not found." };

  const raw = Object.fromEntries(formData);
  const parsed = bookingSchema.safeParse({ ...raw, end_date: raw.end_date || raw.start_date });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { error } = await supabase
    .from("booking_requests")
    .insert({ ...parsed.data, requester_id: user.id, artist_id: artistId });
  if (error) return { error: "Your booking request didn’t go through. Try again in a moment." };

  revalidatePath("/industry/dashboard/requests");
  redirect("/industry/dashboard/requests?sent=booking");
}
