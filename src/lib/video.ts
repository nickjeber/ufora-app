export type ParsedVideo = { provider: "youtube" | "vimeo"; id: string };

/**
 * Accepts the common YouTube and Vimeo URL shapes:
 *   youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID,
 *   youtube.com/embed/ID, youtube.com/live/ID, music.youtube.com/watch?v=ID
 *   vimeo.com/ID, vimeo.com/channels/x/ID, player.vimeo.com/video/ID
 */
export function parseVideoUrl(raw: string): ParsedVideo | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www\.|m\.|music\.)/, "");
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be" && parts[0]) {
    return validYoutube(parts[0]);
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const v = url.searchParams.get("v");
    if (v) return validYoutube(v);
    if (["shorts", "embed", "live", "v"].includes(parts[0]) && parts[1]) {
      return validYoutube(parts[1]);
    }
    return null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = [...parts].reverse().find((p) => /^\d+$/.test(p));
    return id ? { provider: "vimeo", id } : null;
  }
  return null;
}

function validYoutube(id: string): ParsedVideo | null {
  return /^[A-Za-z0-9_-]{11}$/.test(id) ? { provider: "youtube", id } : null;
}

export function embedUrl(provider: "youtube" | "vimeo", id: string) {
  return provider === "youtube"
    ? `https://www.youtube-nocookie.com/embed/${id}`
    : `https://player.vimeo.com/video/${id}`;
}

export function thumbnailUrl(provider: "youtube" | "vimeo", id: string) {
  return provider === "youtube" ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}
