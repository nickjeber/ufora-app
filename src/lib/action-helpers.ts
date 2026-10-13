import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Bucket } from "./types";

export const NOT_SIGNED_IN = { error: "Your session expired — please sign in again." };

export function firstError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the form.";
}

/** Empty strings from forms become null. */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep it under ${max} characters.`)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional()
    .transform((v) => v ?? null);

export const optionalUrl = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional()
  .transform((v) => v ?? null)
  .refine((v) => v === null || /^https?:\/\/\S+\.\S+/i.test(v), "Links must start with http:// or https://");

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date.");
export const optionalDate = z
  .string()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional()
  .transform((v) => v ?? null)
  .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "Pick a valid date.");

/** A storage path is only acceptable if it sits in the user's own folder. */
export function ownsPath(userId: string, path: string) {
  return path.startsWith(`${userId}/`) && !path.includes("..") && path.length < 300;
}

export async function removeFiles(supabase: SupabaseClient, bucket: Bucket, paths: (string | null | undefined)[]) {
  const list = paths.filter((p): p is string => Boolean(p));
  if (list.length) await supabase.storage.from(bucket).remove(list);
}

/** Refresh the dashboard and the artist's public page. */
export function refresh(dashboardPath: string) {
  revalidatePath(dashboardPath);
  revalidatePath("/artists/[slug]", "page");
}
