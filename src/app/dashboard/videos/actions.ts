"use server";

import { z } from "zod";
import { NOT_SIGNED_IN, firstError, optionalDate, optionalText, refresh } from "@/lib/action-helpers";
import { getActionUser } from "@/lib/auth";
import type { ActionState } from "@/lib/types";
import { parseVideoUrl } from "@/lib/video";

const videoSchema = z.object({
  kind: z.enum(["music", "live"]),
  title: z.string().trim().min(1, "Give the video a title.").max(200),
  url: z.string().trim().min(1, "Paste a YouTube or Vimeo link."),
  video_date: optionalDate,
  venue: optionalText(200),
});

function parse(formData: FormData) {
  const parsed = videoSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) } as const;
  const video = parseVideoUrl(parsed.data.url);
  if (!video) return { error: "That doesn't look like a YouTube or Vimeo link." } as const;
  return {
    row: {
      ...parsed.data,
      venue: parsed.data.kind === "live" ? parsed.data.venue : null,
      provider: video.provider,
      provider_id: video.id,
    },
  } as const;
}

export async function addVideo(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await getActionUser();
  if (!user) return NOT_SIGNED_IN;
  const result = parse(formData);
  if ("error" in result) return { error: result.error };

  const { error } = await supabase.from("videos").insert({ ...result.row, artist_id: user.id });
  if (error) return { error: error.message };
  refresh("/dashboard/videos");
  return { ok: true, message: "Video added." };
}

export async function updateVideo(videoId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await getActionUser();
  if (!user) return NOT_SIGNED_IN;
  const result = parse(formData);
  if ("error" in result) return { error: result.error };

  const { error } = await supabase.from("videos").update(result.row).eq("id", videoId).eq("artist_id", user.id);
  if (error) return { error: error.message };
  refresh("/dashboard/videos");
  return { ok: true, message: "Saved." };
}

export async function deleteVideo(videoId: string): Promise<ActionState> {
  const { supabase, user } = await getActionUser();
  if (!user) return NOT_SIGNED_IN;
  const { error } = await supabase.from("videos").delete().eq("id", videoId).eq("artist_id", user.id);
  if (error) return { error: error.message };
  refresh("/dashboard/videos");
  return { ok: true };
}
