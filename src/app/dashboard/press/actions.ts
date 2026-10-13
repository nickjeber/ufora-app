"use server";

import { z } from "zod";
import { NOT_SIGNED_IN, firstError, isoDate, optionalText, optionalUrl, refresh } from "@/lib/action-helpers";
import { getActionUser } from "@/lib/auth";
import type { ActionState } from "@/lib/types";

const pressSchema = z.object({
  press_date: isoDate,
  kind: z.enum(["interview", "review", "feature", "radio", "podcast", "tv", "other"]),
  outlet: z.string().trim().min(1, "Enter the outlet or publication.").max(200),
  title: optionalText(300),
  url: optionalUrl,
  notes: optionalText(500),
});

export async function addPressDate(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await getActionUser();
  if (!user) return NOT_SIGNED_IN;
  const parsed = pressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { error } = await supabase.from("press_dates").insert({ ...parsed.data, artist_id: user.id });
  if (error) return { error: error.message };
  refresh("/dashboard/press");
  return { ok: true, message: "Press added." };
}

export async function updatePressDate(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await getActionUser();
  if (!user) return NOT_SIGNED_IN;
  const parsed = pressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { error } = await supabase.from("press_dates").update(parsed.data).eq("id", id).eq("artist_id", user.id);
  if (error) return { error: error.message };
  refresh("/dashboard/press");
  return { ok: true, message: "Saved." };
}

export async function deletePressDate(id: string): Promise<ActionState> {
  const { supabase, user } = await getActionUser();
  if (!user) return NOT_SIGNED_IN;
  const { error } = await supabase.from("press_dates").delete().eq("id", id).eq("artist_id", user.id);
  if (error) return { error: error.message };
  refresh("/dashboard/press");
  return { ok: true };
}
