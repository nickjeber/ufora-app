"use server";

import { z } from "zod";
import { NOT_SIGNED_IN, firstError, optionalText, ownsPath, refresh, removeFiles } from "@/lib/action-helpers";
import { getActionUser } from "@/lib/auth";
import type { ActionState } from "@/lib/types";

const profileSchema = z.object({
  artist_name: z.string().trim().min(1, "Enter your artist or band name.").max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Your page URL needs at least 2 characters.")
    .max(60)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Page URL can only use letters, numbers and single dashes."),
  location: optionalText(120),
  bio: optionalText(5000),
});

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await getActionUser();
  if (!user) return NOT_SIGNED_IN;

  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user.id);
  if (error) {
    if (error.code === "23505") return { error: "That page URL is already taken — try another." };
    return { error: error.message };
  }
  refresh("/dashboard");
  return { ok: true, message: "Saved." };
}

type ImageKind = "avatar" | "background";
const COLUMN = { avatar: "avatar_path", background: "background_path" } as const;
const BUCKET = { avatar: "avatars", background: "backgrounds" } as const;

export async function setProfileImage(kind: ImageKind, path: string | null): Promise<ActionState> {
  const { supabase, user } = await getActionUser();
  if (!user) return NOT_SIGNED_IN;
  if (!(kind in COLUMN)) return { error: "Unknown image type." };
  if (path !== null && !ownsPath(user.id, path)) return { error: "Invalid file." };

  const column = COLUMN[kind];
  const { data: current } = await supabase.from("profiles").select(column).eq("id", user.id).single();
  const { error } = await supabase
    .from("profiles")
    .update({ [column]: path })
    .eq("id", user.id);
  if (error) return { error: error.message };

  const old = (current as Record<string, string | null> | null)?.[column];
  if (old && old !== path) await removeFiles(supabase, BUCKET[kind], [old]);

  refresh("/dashboard");
  return { ok: true };
}
