/* eslint-disable @next/next/no-img-element -- user uploads are served straight from Supabase Storage */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { DeleteButton } from "@/components/delete-button";
import { ImageUpload } from "@/components/file-upload";
import { requireArtist } from "@/lib/auth";
import { fileUrl, formatDuration } from "@/lib/format";
import type { AlbumWithTracks } from "@/lib/types";
import { deleteAlbum, deleteTrack, moveTrack, renameTrack, setAlbumArt, updateAlbum } from "../actions";
import { AlbumFields } from "../album-fields";
import { TrackMoveButtons } from "./track-move";
import { TrackUploader } from "./track-uploader";

export default async function AlbumPage({ params }: PageProps<"/dashboard/music/[albumId]">) {
  const { albumId } = await params;
  const { supabase, user } = await requireArtist();

  if (!/^[0-9a-f-]{36}$/i.test(albumId)) notFound();
  const { data } = await supabase
    .from("albums")
    .select("*, tracks(*)")
    .eq("id", albumId)
    .eq("artist_id", user.id)
    .order("track_number", { referencedTable: "tracks" })
    .maybeSingle();
  if (!data) notFound();
  const album = data as AlbumWithTracks;
  const art = fileUrl("album-art", album.art_path);

  return (
    <div className="space-y-8">
      <Link href="/dashboard/music" className="text-sm text-muted underline-offset-4 hover:underline">
        ← All releases
      </Link>

      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        {/* Artwork */}
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-xl bg-plum">
            {art ? (
              <img src={art} alt={`${album.title} artwork`} className="size-full object-cover" />
            ) : (
              <span className="heading flex size-full items-center justify-center text-sm text-yellow/70">No artwork</span>
            )}
          </div>
          <ImageUpload
            bucket="album-art"
            userId={user.id}
            label="artwork"
            hasImage={Boolean(art)}
            onSaved={setAlbumArt.bind(null, album.id)}
            onRemove={setAlbumArt.bind(null, album.id, null)}
          />
          <p className="text-xs text-muted">Square JPG or PNG, at least 1400×1400 looks best.</p>
        </div>

        {/* Details */}
        <section className="card">
          <h1 className="heading mb-5 text-2xl">Release details</h1>
          <ActionForm
            action={updateAlbum.bind(null, album.id)}
            submitLabel="Save"
            actions={
              <DeleteButton
                action={deleteAlbum.bind(null, album.id)}
                label="Delete release"
                confirmText={`Delete "${album.title}" and all its tracks? This can't be undone.`}
              />
            }
          >
            <AlbumFields album={album} />
          </ActionForm>
        </section>
      </div>

      {/* Tracks */}
      <section className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="heading text-xl">Tracks</h2>
          <TrackUploader albumId={album.id} userId={user.id} />
        </div>

        {album.tracks.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
            Upload audio files (MP3, WAV, FLAC, M4A — up to 50 MB each). You can pick several at once.
          </p>
        ) : (
          <ol className="divide-y divide-line">
            {album.tracks.map((track, i) => (
              <li key={track.id} className="flex items-center gap-3 py-2.5">
                <span className="w-6 text-right font-display text-sm text-muted tabular-nums">{track.track_number}</span>
                <details className="group min-w-0 flex-1">
                  <summary className="flex cursor-pointer list-none items-center gap-3">
                    <span className="truncate font-medium">{track.title}</span>
                    <span className="text-xs text-muted tabular-nums">{formatDuration(track.duration_seconds)}</span>
                    <span className="text-xs text-muted underline-offset-4 group-open:hidden hover:underline">Rename</span>
                  </summary>
                  <div className="pt-3 pb-1">
                    <ActionForm
                      action={renameTrack.bind(null, track.id)}
                      submitLabel="Save"
                      className="flex flex-wrap items-center gap-3"
                      buttonClassName="btn-primary px-4 py-1.5 text-xs"
                    >
                      <input name="title" className="input max-w-sm" defaultValue={track.title} required maxLength={200} aria-label="Track title" />
                    </ActionForm>
                  </div>
                </details>
                <TrackMoveButtons
                  up={i > 0 ? moveTrack.bind(null, track.id, "up") : undefined}
                  down={i < album.tracks.length - 1 ? moveTrack.bind(null, track.id, "down") : undefined}
                />
                <DeleteButton action={deleteTrack.bind(null, track.id)} label="Remove" confirmText={`Remove "${track.title}"?`} />
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
