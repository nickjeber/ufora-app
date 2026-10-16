"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { firstError } from "@/lib/action-helpers";
import { siteOrigin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

const ROLES = [
  "music_supervisor",
  "sound_designer",
  "venue",
  "promoter",
  "booking_agent",
  "radio",
  "podcast",
  "press",
  "other",
] as const;

const schema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(120),
  title: z.string().trim().max(160),
  organization: z.string().trim().max(200),
  role: z.enum(ROLES, { message: "Choose what best describes your work." }),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(72),
});

export async function signupIndustry(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (formData.get("website")) return { ok: true };

  const parsed = schema.safeParse({
    name: formData.get("name") ?? "",
    title: formData.get("title") ?? "",
    organization: formData.get("organization") ?? "",
    role: formData.get("role") ?? "",
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { email, password, ...meta } = parsed.data;
  const supabase = await createClient();
  const origin = await siteOrigin();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=/industry/dashboard`,
      data: { account_type: "industry", ...meta },
    },
  });
  if (error) return { error: error.message };

  redirect(`/check-email?email=${encodeURIComponent(email)}`);
}
