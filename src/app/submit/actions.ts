"use server";

import { z } from "zod";
import { firstError } from "@/lib/action-helpers";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || null);

const submissionSchema = z.object({
  artist_name: z.string().trim().min(1, "Enter your artist or band name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  location: optional(120),
  links: z
    .string()
    .trim()
    .min(1, "Add at least one link to your music.")
    .max(2000)
    .refine((v) => /https?:\/\/\S+\.\S+/i.test(v), "Add at least one full link, starting with https://"),
  about: optional(2000),
});

export async function submitMusic(_prev: ActionState, formData: FormData): Promise<ActionState> {
  // Bots tend to fill every field, including this hidden one.
  if (formData.get("website")) return { ok: true };

  const parsed = submissionSchema.safeParse({
    artist_name: formData.get("artist_name") ?? "",
    email: formData.get("email") ?? "",
    location: formData.get("location") ?? "",
    links: formData.get("links") ?? "",
    about: formData.get("about") ?? "",
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("submissions").insert(parsed.data);
  if (error) return { error: "Your submission didn’t go through. Try again in a moment." };
  return { ok: true };
}

const industrySchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  organization: optional(200),
  role: z.enum(
    ["music_supervisor", "sound_designer", "venue", "promoter", "booking_agent", "radio", "podcast", "press", "other"],
    { message: "Choose what best describes your work." },
  ),
  looking_for: optional(2000),
  notify: z.boolean(),
});

export async function requestIndustryAccess(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (formData.get("website")) return { ok: true };

  const parsed = industrySchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    organization: formData.get("organization") ?? "",
    role: formData.get("role") ?? "",
    looking_for: formData.get("looking_for") ?? "",
    notify: formData.get("notify") === "on",
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("industry_contacts").insert(parsed.data);
  if (error) return { error: "Your request didn’t go through. Try again in a moment." };
  return { ok: true };
}
