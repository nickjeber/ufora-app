/* eslint-disable @next/next/no-img-element -- artwork is served straight from Supabase Storage */
import Link from "next/link";
import { AlbumPlayer } from "@/app/artists/[slug]/album-player";
import { Logo } from "@/components/logo";
import { requireIndustry } from "@/lib/auth";
import { RELEASE_TYPE_LABEL, daysAgoIso, fileUrl, formatDate } from "@/lib/format";
import type { Album, Track } from "@/lib/types";

type FeedRelease = Album & {
  artist: { id: string; slug: string; artist_name: string; location: string | null };
  tracks: Track[];
};

const NEW_FOR_DAYS = 14;

export default async function IndustryFeed({ searchParams }: PageProps<"/industry/dashboard">) {
  const { supabase, profile } = await requireIndustry();
  const { welcome } = await searchParams;

  const { data } = await supabase
    .from("albums")
    .select(
      "id, artist_id, title, release_type, release_date, description, art_path, created_at, artist:profiles!inner(id, slug, artist_name, location, is_signed), tracks(id, album_id, artist_id, title, track_number, duration_seconds, audio_path)",
    )
    .eq("artist.is_signed", true)
    .order("created_at", { ascending: false })
    .order("track_number", { referencedTable: "tracks" })
    .limit(30);
  const releases = ((data ?? []) as unknown as FeedRelease[]).filter((r) => r.tracks.length > 0);
  const cutoff = daysAgoIso(NEW_FOR_DAYS);

  return (
    <div>
      {welcome && (
        <div className="mb-10 rounded-2xl bg-yellow px-6 py-5">
          <p className="font-display text-2xl font-semibold">Welcome to Ufora, {profile.name.split(" ")[0]}.</p>
          <p className="mt-1">New releases from the roster land here. Add a photo and title on your profile so artists know who’s asking.</p>
        </div>
      )}

      <h1 className="font-display text-[clamp(2.6rem,6vw,4.25rem)] leading-[0.9] font-semibold">New music</h1>
      <p className="mt-3 max-w-[38rem] text-lg leading-relaxed text-muted">
        The latest releases from Ufora artists. Play anything, license a track, or book the artist.
      </p>

      {releases.length === 0 ? (
        <div className="mt-12 rounded-2xl border-2 border-dashed border-plum/30 px-6 py-14 text-center">
          <p className="font-display text-3xl font-semibold">Nothing new yet</p>
          <p className="mt-2 text-muted">New releases from signed artists will show up here as soon as they’re uploaded.</p>
          <Link href="/artists" className="site-btn-outline mt-6">
            Browse the roster
          </Link>
        </div>
      ) : (
        <ul className="mt-12 space-y-14">
          {releases.map((r) => {
            const art = fileUrl("album-art", r.art_path);
            const isNew = r.created_at.slice(0, 10) >= cutoff;
            return (
              <li key={r.id} className="grid gap-6 border-t-2 border-plum pt-8 md:grid-cols-[220px_1fr] md:gap-10">
                <div className="aspect-square w-40 overflow-hidden rounded-xl bg-plum md:w-full">
                  {art ? (
                    <img src={art} alt={`${r.title} artwork`} className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <Logo size={80} href={null} />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      {isNew && (
                        <span className="mb-2 inline-block rounded-full bg-yellow px-2.5 py-0.5 text-sm font-medium">New</span>
                      )}
                      <h2 className="font-display text-3xl leading-tight font-semibold">{r.title}</h2>
                      <p className="mt-1 text-muted">
                        <Link href={`/artists/${r.artist.slug}`} className="font-medium text-plum underline-offset-4 hover:underline">
                          {r.artist.artist_name}
                        </Link>
                        {r.artist.location && `, ${r.artist.location}`}
                        {" — "}
                        {RELEASE_TYPE_LABEL[r.release_type]}
                        {r.release_date && `, ${formatDate(r.release_date)}`}
                      </p>
                    </div>
                    <Link href={`/industry/dashboard/book/${r.artist.slug}`} className="site-btn px-5 py-2.5">
                      Book {r.artist.artist_name}
                    </Link>
                  </div>
                  <div className="mt-5">
                    <AlbumPlayer
                      licenseBase="/industry/dashboard/license"
                      tracks={r.tracks.map((t) => ({
                        id: t.id,
                        title: t.title,
                        number: t.track_number,
                        duration: t.duration_seconds,
                        src: fileUrl("audio", t.audio_path)!,
                      }))}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
