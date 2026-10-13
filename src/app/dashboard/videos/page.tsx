/* eslint-disable @next/next/no-img-element -- thumbnails come straight from YouTube */
import { ActionForm } from "@/components/action-form";
import { DeleteButton } from "@/components/delete-button";
import { requireArtist } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import type { Video, VideoKind } from "@/lib/types";
import { thumbnailUrl } from "@/lib/video";
import { addVideo, deleteVideo, updateVideo } from "./actions";

export const metadata = { title: "Videos" };

const SECTIONS: { kind: VideoKind; title: string; empty: string }[] = [
  { kind: "music", title: "Music videos", empty: "No music videos yet." },
  { kind: "live", title: "Live performances", empty: "No live performances yet." },
];

export default async function VideosPage() {
  const { supabase, user } = await requireArtist();
  const { data } = await supabase
    .from("videos")
    .select("*")
    .eq("artist_id", user.id)
    .order("video_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  const videos = (data ?? []) as Video[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading text-3xl">Videos</h1>
        <p className="mt-1 text-sm text-muted">Paste links from YouTube or Vimeo — we&apos;ll embed them on your page.</p>
      </div>

      <section className="card">
        <h2 className="heading mb-5 text-xl">Add a video</h2>
        <ActionForm action={addVideo} submitLabel="Add video" pendingLabel="Adding…" resetOnSuccess>
          <VideoFields />
        </ActionForm>
      </section>

      {SECTIONS.map(({ kind, title, empty }) => {
        const list = videos.filter((v) => v.kind === kind);
        return (
          <section key={kind}>
            <h2 className="heading mb-3 text-xl">{title}</h2>
            {list.length === 0 ? (
              <p className="text-sm text-muted">{empty}</p>
            ) : (
              <ul className="space-y-3">
                {list.map((video) => (
                  <VideoRow key={video.id} video={video} />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

function VideoRow({ video }: { video: Video }) {
  const thumb = thumbnailUrl(video.provider, video.provider_id);
  return (
    <li className="rounded-xl border border-line bg-surface p-3">
      <div className="flex items-center gap-4">
        <a href={video.url} target="_blank" rel="noreferrer" className="block aspect-video w-32 shrink-0 overflow-hidden rounded-md bg-plum">
          {thumb ? (
            <img src={thumb} alt="" className="size-full object-cover" />
          ) : (
            <span className="heading flex size-full items-center justify-center text-xs text-yellow/80">Vimeo</span>
          )}
        </a>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{video.title}</p>
          <p className="truncate text-sm text-muted">
            {[video.venue, formatDate(video.video_date)].filter(Boolean).join(" · ") || video.url}
          </p>
        </div>
        <DeleteButton action={deleteVideo.bind(null, video.id)} confirmText={`Delete "${video.title}"?`} />
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer text-xs text-muted">Edit</summary>
        <div className="pt-4">
          <ActionForm action={updateVideo.bind(null, video.id)} submitLabel="Save">
            <VideoFields video={video} />
          </ActionForm>
        </div>
      </details>
    </li>
  );
}

function VideoFields({ video }: { video?: Video }) {
  const id = video?.id ?? "new";
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
        <div>
          <label className="field-label" htmlFor={`kind-${id}`}>
            Type
          </label>
          <select id={`kind-${id}`} name="kind" className="input" defaultValue={video?.kind ?? "music"}>
            <option value="music">Music video</option>
            <option value="live">Live performance</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor={`url-${id}`}>
            YouTube or Vimeo link
          </label>
          <input
            id={`url-${id}`}
            name="url"
            type="url"
            className="input"
            defaultValue={video?.url}
            required
            placeholder="https://www.youtube.com/watch?v=…"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <label className="field-label" htmlFor={`title-${id}`}>
            Title
          </label>
          <input id={`title-${id}`} name="title" className="input" defaultValue={video?.title} required maxLength={200} />
        </div>
        <div>
          <label className="field-label" htmlFor={`date-${id}`}>
            Date
          </label>
          <input id={`date-${id}`} name="video_date" type="date" className="input" defaultValue={video?.video_date ?? ""} />
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor={`venue-${id}`}>
          Venue <span className="tracking-normal normal-case">(live performances)</span>
        </label>
        <input id={`venue-${id}`} name="venue" className="input" defaultValue={video?.venue ?? ""} maxLength={200} placeholder="Empty Bottle, Chicago" />
      </div>
    </>
  );
}
