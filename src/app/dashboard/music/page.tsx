/* eslint-disable @next/next/no-img-element -- user uploads are served straight from Supabase Storage */
import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { requireArtist } from "@/lib/auth";
import { RELEASE_TYPE_LABEL, fileUrl, formatDate } from "@/lib/format";
import type { Album } from "@/lib/types";
import { createAlbum } from "./actions";
import { AlbumFields } from "./album-fields";

export const metadata = { title: "Music" };

export default async function MusicPage() {
  const { supabase, user } = await requireArtist();
  const { data } = await supabase
    .from("albums")
    .select("*, tracks(count)")
    .eq("artist_id", user.id)
    .order("release_date", { ascending: false, nullsFirst: true })
    .order("created_at", { ascending: false });
  const albums = (data ?? []) as (Album & { tracks: { count: number }[] })[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading text-3xl">Music</h1>
        <p className="mt-1 text-sm text-muted">Organise your tracks into albums, EPs and singles.</p>
      </div>

      {albums.length > 0 ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => {
            const art = fileUrl("album-art", album.art_path);
            const count = album.tracks[0]?.count ?? 0;
            return (
              <li key={album.id}>
                <Link
                  href={`/dashboard/music/${album.id}`}
                  className="group block overflow-hidden rounded-xl border border-line bg-surface transition hover:border-plum"
                >
                  <div className="aspect-square bg-plum">
                    {art ? (
                      <img src={art} alt="" className="size-full object-cover" />
                    ) : (
                      <span className="heading flex size-full items-center justify-center text-sm text-yellow/70">
                        No artwork
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="heading truncate text-lg group-hover:underline">{album.title}</p>
                    <p className="text-sm text-muted">
                      {RELEASE_TYPE_LABEL[album.release_type]}
                      {album.release_date && ` · ${formatDate(album.release_date, { month: undefined, day: undefined })}`}
                      {` · ${count} ${count === 1 ? "track" : "tracks"}`}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-line px-6 py-10 text-center text-muted">
          No releases yet. Create your first one below.
        </p>
      )}

      <section className="card">
        <h2 className="heading mb-5 text-xl">New release</h2>
        <ActionForm action={createAlbum} submitLabel="Create release" pendingLabel="Creating…">
          <AlbumFields />
        </ActionForm>
      </section>
    </div>
  );
}
