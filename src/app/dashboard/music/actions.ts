"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  NOT_SIGNED_IN,
  firstError,
  optionalDate,
  optionalText,
  ownsPath,
  refresh,
  removeFiles,
} from "@/lib/action-helpers";
import { getActionUser } from "@/lib/auth";
import type { ActionState } from "@/lib/types";

const albumSchema = z.object({
  title: z.string().trim().min(1, "Give the release a title.").max(200),
  release_type: z.enum(["album", "ep", "single"]),
  release_date: optionalDate,
  description: optionalText(2000),
});

const uuid = z.string().uuid();

// ── Albums ─────────────────────────────────────────────────────

export async function createAlbum(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await getActionUser();
  if (!user) return NOT_SIGNED_IN;
  const parsed = albumSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { data, error } = await supabase
    .from("albums")
    .insert({ ...parsed.data, artist_id: user.id })
    .select("id")
    .single();
  if (error) return { error: error.message };

  refresh("/dashboard/music");
  redirect(`/dashboard/music/${data.id}`);
}

export async function updateAlbum(albumId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await getActionUser();
  if (!user) return NOT_SIGNED_IN;
  const parsed = albumSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { error } = await supabase.from("albums").update(parsed.data).eq("id", albumId).eq("artist_id", user.id);
  if (error) return { error: error.message };
  refresh(`/dashboard/music/${albumId}`);
  return { ok: true, message: "Saved." };
}

export async function setAlbumArt(albumId: string, path: string | null): Promise<ActionState> {
  const { supabase, user } = await getActionUser();
  if (!user) return NOT_SIGNED_IN;
  if (path !== null && !ownsPath(user.id, path)) return { error: "Invalid file." };

  const { data: album } = await supabase
    .from("albums")
    .select("art_path")
    .eq("id", albumId)
    .eq("artist_id", user.id)
    .single();
  if (!album) return { error: "Release not found." };

  const { error } = await supabase.from("albums").update({ art_path: path }).eq("id", albumId).eq("artist_id", user.id);
  if (error) return { error: error.message };
  if (album.art_path && album.art_path !== path) await removeFiles(supabase, "album-art", [album.art_path]);

  refresh(`/dashboard/music/${albumId}`);
  return { ok: true };
}

export async function deleteAlbum(albumId: string): Promise<ActionState> {
  const { supabase, user } = await getActionUser();
  if (!user) return NOT_SIGNED_IN;

  const { data: album } = await supabase
    .from("albums")
    .select("art_path, tracks(audio_path)")
    .eq("id", albumId)
    .eq("artist_id", user.id)
    .single<{ art_path: string | null; tracks: { audio_path: string }[] }>();
  if (!album) return { error: "Release not found." };

  const { error } = await supabase.from("albums").delete().eq("id", albumId).eq("artist_id", user.id);
  if (error) return { error: error.message };

  await removeFiles(supabase, "album-art", [album.art_path]);
  await removeFiles(
    supabase,
    "audio",
    album.tracks.map((t) => t.audio_path),
  );

  refresh("/dashboard/music");
  redirect("/dashboard/music");
}

// ── Tracks ─────────────────────────────────────────────────────

export async function addTrack(
  albumId: string,
  input: { title: string; path: string; duration: number | null },
): Promise<ActionState> {
  const { supabase, user } = await getActionUser();
  if (!user) return NOT_SIGNED_IN;
  const parsed = z
    .object({
      title: z.string().trim().min(1).max(200),
      path: z.string().min(1),
      duration: z.number().int().nonnegative().nullable(),
    })
    .safeParse(input);
  if (!parsed.success || !uuid.safeParse(albumId).success) return { error: "Invalid track." };
  if (!ownsPath(user.id, parsed.data.path)) return { error: "Invalid file." };

  const { data: last } = await supabase
    .from("tracks")
    .select("track_number")
    .eq("album_id", albumId)
    .order("track_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("tracks").insert({
    album_id: albumId,
    artist_id: user.id,
    title: parsed.data.title,
    audio_path: parsed.data.path,
    duration_seconds: parsed.data.duration,
    track_number: (last?.track_number ?? 0) + 1,
  });
  if (error) {
    await removeFiles(supabase, "audio", [parsed.data.path]);
    return { error: error.message };
  }
  refresh(`/dashboard/music/${albumId}`);
  return { ok: true };
}

export async function renameTrack(trackId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await getActionUser();
  if (!user) return NOT_SIGNED_IN;
  const title = z.string().trim().min(1, "Track title can't be empty.").max(200).safeParse(formData.get("title"));
  if (!title.success) return { error: firstError(title.error) };

  const { data, error } = await supabase
    .from("tracks")
    .update({ title: title.data })
    .eq("id", trackId)
    .eq("artist_id", user.id)
    .select("album_id")
    .single();
  if (error) return { error: error.message };
  refresh(`/dashboard/music/${data.album_id}`);
  return { ok: true, message: "Saved." };
}

export async function moveTrack(trackId: string, direction: "up" | "down"): Promise<ActionState> {
  const { supabase, user } = await getActionUser();
  if (!user) return NOT_SIGNED_IN;

  const { data: track } = await supabase
    .from("tracks")
    .select("id, album_id, track_number")
    .eq("id", trackId)
    .eq("artist_id", user.id)
    .single();
  if (!track) return { error: "Track not found." };

  const { data: tracks } = await supabase
    .from("tracks")
    .select("id")
    .eq("album_id", track.album_id)
    .order("track_number")
    .order("created_at");
  const ids = (tracks ?? []).map((t) => t.id);
  const i = ids.indexOf(trackId);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return { ok: true };
  [ids[i], ids[j]] = [ids[j], ids[i]];

  await renumber(supabase, ids);
  refresh(`/dashboard/music/${track.album_id}`);
  return { ok: true };
}

export async function deleteTrack(trackId: string): Promise<ActionState> {
  const { supabase, user } = await getActionUser();
  if (!user) return NOT_SIGNED_IN;

  const { data: track } = await supabase
    .from("tracks")
    .select("album_id, audio_path")
    .eq("id", trackId)
    .eq("artist_id", user.id)
    .single();
  if (!track) return { error: "Track not found." };

  const { error } = await supabase.from("tracks").delete().eq("id", trackId).eq("artist_id", user.id);
  if (error) return { error: error.message };
  await removeFiles(supabase, "audio", [track.audio_path]);

  const { data: rest } = await supabase
    .from("tracks")
    .select("id")
    .eq("album_id", track.album_id)
    .order("track_number");
  await renumber(
    supabase,
    (rest ?? []).map((t) => t.id),
  );

  refresh(`/dashboard/music/${track.album_id}`);
  return { ok: true };
}

async function renumber(supabase: Awaited<ReturnType<typeof getActionUser>>["supabase"], orderedIds: string[]) {
  await Promise.all(
    orderedIds.map((id, index) => supabase.from("tracks").update({ track_number: index + 1 }).eq("id", id)),
  );
}
