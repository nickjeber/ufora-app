"use server";

import { z } from "zod";
import { NOT_SIGNED_IN, firstError, isoDate, optionalText, optionalUrl, refresh } from "@/lib/action-helpers";
import { getActionUser } from "@/lib/auth";
import type { ActionState } from "@/lib/types";

const tourSchema = z.object({
  event_date: isoDate,
  venue: z.string().trim().min(1, "Enter the venue.").max(200),
  city: z.string().trim().min(1, "Enter the city.").max(120),
  region: optionalText(120),
  country: optionalText(120),
  ticket_url: optionalUrl,
  notes: optionalText(500),
});

export async function addTourDate(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await getActionUser();
  if (!user) return NOT_SIGNED_IN;
  const parsed = tourSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { error } = await supabase.from("tour_dates").insert({ ...parsed.data, artist_id: user.id });
  if (error) return { error: error.message };
  refresh("/dashboard/tour");
  return { ok: true, message: "Date added." };
}

export async function updateTourDate(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await getActionUser();
  if (!user) return NOT_SIGNED_IN;
  const parsed = tourSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { error } = await supabase.from("tour_dates").update(parsed.data).eq("id", id).eq("artist_id", user.id);
  if (error) return { error: error.message };
  refresh("/dashboard/tour");
  return { ok: true, message: "Saved." };
}

export async function deleteTourDate(id: string): Promise<ActionState> {
  const { supabase, user } = await getActionUser();
  if (!user) return NOT_SIGNED_IN;
  const { error } = await supabase.from("tour_dates").delete().eq("id", id).eq("artist_id", user.id);
  if (error) return { error: error.message };
  refresh("/dashboard/tour");
  return { ok: true };
}
