"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { safeNext, siteOrigin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

const email = z.string().trim().toLowerCase().email("Enter a valid email address.");
const password = z.string().min(8, "Password must be at least 8 characters.").max(72);

function firstError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the form.";
}

export async function signup(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = z
    .object({
      artist_name: z.string().trim().min(1, "Enter your artist or band name.").max(120),
      email,
      password,
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const supabase = await createClient();
  const origin = await siteOrigin();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=/dashboard`,
      data: { artist_name: parsed.data.artist_name },
    },
  });
  if (error) return { error: error.message };

  redirect(`/check-email?email=${encodeURIComponent(parsed.data.email)}`);
}

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = z
    .object({ email, password: z.string().min(1, "Enter your password.") })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code === "email_not_confirmed") {
      redirect(`/check-email?email=${encodeURIComponent(parsed.data.email)}&unverified=1`);
    }
    return { error: "That email and password don't match." };
  }

  redirect(safeNext(formData.get("next")));
}

export async function resendVerification(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = email.safeParse(formData.get("email"));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const supabase = await createClient();
  const origin = await siteOrigin();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data,
    options: { emailRedirectTo: `${origin}/auth/confirm?next=/dashboard` },
  });
  if (error) return { error: error.message };
  return { ok: true, message: "Sent — check your inbox (and spam folder)." };
}

export async function requestPasswordReset(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = email.safeParse(formData.get("email"));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const supabase = await createClient();
  const origin = await siteOrigin();
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  });
  // Same response whether or not the account exists.
  return { ok: true, message: "If that email has an account, a reset link is on its way." };
}

export async function updatePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = z
    .object({ password, confirm: z.string() })
    .refine((d) => d.password === d.confirm, { message: "Passwords don't match." })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };
  redirect("/dashboard?password=updated");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
