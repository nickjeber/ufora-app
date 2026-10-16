/* eslint-disable @next/next/no-img-element -- user uploads are served straight from Supabase Storage */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Logo } from "@/components/logo";
import { SiteHeader } from "@/components/site/site-header";
import { PRESS_KIND_LABEL, RELEASE_TYPE_LABEL, fileUrl, formatDate, todayIso } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { AlbumWithTracks, PressDate, Profile, TourDate, Video } from "@/lib/types";
import { embedUrl } from "@/lib/video";
import { AlbumPlayer } from "./album-player";

const getArtist = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("slug", slug).maybeSingle<Profile>();
  if (!profile) return null;

  const [albums, videos, tour, press] = await Promise.all([
    supabase
      .from("albums")
      .select("*, tracks(*)")
      .eq("artist_id", profile.id)
      .order("release_date", { ascending: false, nullsFirst: false })
      .order("track_number", { referencedTable: "tracks" }),
    supabase.from("videos").select("*").eq("artist_id", profile.id).order("video_date", { ascending: false, nullsFirst: false }),
    supabase.from("tour_dates").select("*").eq("artist_id", profile.id).gte("event_date", todayIso()).order("event_date"),
    supabase.from("press_dates").select("*").eq("artist_id", profile.id).order("press_date", { ascending: false }),
  ]);

  return {
    profile,
    albums: ((albums.data ?? []) as AlbumWithTracks[]).filter((a) => a.tracks.length > 0),
    videos: (videos.data ?? []) as Video[],
    tour: (tour.data ?? []) as TourDate[],
    press: (press.data ?? []) as PressDate[],
  };
});

export async function generateMetadata({ params }: PageProps<"/artists/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtist(slug);
  if (!artist) return { title: "Artist not found" };
  const { profile } = artist;
  const image = fileUrl("backgrounds", profile.background_path) ?? fileUrl("avatars", profile.avatar_path);
  return {
    title: profile.artist_name,
    description: profile.bio?.slice(0, 160) ?? `${profile.artist_name} on Ufora`,
    openGraph: image ? { images: [image] } : undefined,
  };
}

export default async function ArtistPage({ params }: PageProps<"/artists/[slug]">) {
  const { slug } = await params;
  const artist = await getArtist(slug);
  if (!artist) notFound();
  const { profile, albums, videos, tour, press } = artist;

  const avatar = fileUrl("avatars", profile.avatar_path);
  const background = fileUrl("backgrounds", profile.background_path);
  const musicVideos = videos.filter((v) => v.kind === "music");
  const liveVideos = videos.filter((v) => v.kind === "live");

  const sections = [
    albums.length && { id: "music", label: "Music" },
    musicVideos.length && { id: "videos", label: "Videos" },
    liveVideos.length && { id: "live", label: "Live" },
    tour.length && { id: "tour", label: "Tour" },
    press.length && { id: "press", label: "Press" },
  ].filter(Boolean) as { id: string; label: string }[];

  return (
    <div className="flex-1 bg-background">
      <div className="bg-white">
        <SiteHeader />
      </div>
      {/* Hero */}
      <header className="relative">
        <div
          className="h-64 bg-plum bg-cover bg-center sm:h-96"
          style={background ? { backgroundImage: `url("${background}")` } : undefined}
        >
          <div className="h-full bg-gradient-to-t from-plum/80 via-plum/10 to-transparent" />
        </div>
        <div className="mx-auto -mt-20 flex max-w-5xl flex-col items-start gap-5 px-4 sm:-mt-16 sm:flex-row sm:items-end sm:px-6">
          <div className="relative size-36 shrink-0 overflow-hidden rounded-full border-4 border-background bg-yellow sm:size-44">
            {avatar ? (
              <img src={avatar} alt={profile.artist_name} className="size-full object-cover" />
            ) : (
              <span className="heading flex size-full items-center justify-center text-5xl">{profile.artist_name.slice(0, 1)}</span>
            )}
          </div>
          <div className="pb-2">
            <h1 className="heading text-4xl leading-none sm:text-6xl">{profile.artist_name}</h1>
            {profile.location && <p className="mt-2 text-muted">{profile.location}</p>}
          </div>
        </div>
        {sections.length > 1 && (
          <nav className="mx-auto mt-6 flex max-w-5xl gap-5 overflow-x-auto px-4 sm:px-6" aria-label="Sections">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="heading shrink-0 text-sm text-muted hover:text-plum">
                {s.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-5xl space-y-16 px-4 py-12 sm:px-6">
        {profile.bio && (
          <section className="max-w-2xl text-lg leading-relaxed whitespace-pre-line">{profile.bio}</section>
        )}

        {albums.length > 0 && (
          <Section id="music" title="Music">
            <div className="space-y-12">
              {albums.map((album) => (
                <article key={album.id} className="grid gap-6 md:grid-cols-[260px_1fr]">
                  <div className="aspect-square overflow-hidden rounded-xl bg-plum">
                    {album.art_path ? (
                      <img src={fileUrl("album-art", album.art_path)!} alt={`${album.title} artwork`} className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <Logo size={90} href={null} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="heading text-2xl">{album.title}</h3>
                    <p className="mb-4 text-sm text-muted">
                      {RELEASE_TYPE_LABEL[album.release_type]}
                      {album.release_date && ` · ${formatDate(album.release_date)}`}
                    </p>
                    <AlbumPlayer
                      tracks={album.tracks.map((t) => ({
                        id: t.id,
                        title: t.title,
                        number: t.track_number,
                        duration: t.duration_seconds,
                        src: fileUrl("audio", t.audio_path)!,
                      }))}
                    />
                    {album.description && <p className="mt-4 text-sm whitespace-pre-line text-muted">{album.description}</p>}
                  </div>
                </article>
              ))}
            </div>
          </Section>
        )}

        {musicVideos.length > 0 && (
          <Section id="videos" title="Music videos">
            <VideoGrid videos={musicVideos} />
          </Section>
        )}

        {liveVideos.length > 0 && (
          <Section id="live" title="Live performances">
            <VideoGrid videos={liveVideos} />
          </Section>
        )}

        {tour.length > 0 && (
          <Section id="tour" title="Tour dates">
            <ul className="divide-y divide-line border-y border-line">
              {tour.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center gap-x-6 gap-y-1 py-4">
                  <span className="heading w-28 text-lg">{formatDate(d.event_date, { year: undefined })}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{d.venue}</span>
                    <span className="block text-sm text-muted">
                      {[d.city, d.region, d.country].filter(Boolean).join(", ")}
                      {d.notes && ` · ${d.notes}`}
                    </span>
                  </span>
                  {d.ticket_url && (
                    <a href={d.ticket_url} target="_blank" rel="noreferrer" className="btn-primary px-4 py-1.5 text-xs">
                      Tickets
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {press.length > 0 && (
          <Section id="press" title="Press">
            <ul className="grid gap-4 sm:grid-cols-2">
              {press.map((p) => {
                const body = (
                  <>
                    <p className="font-display text-xs font-semibold tracking-[0.14em] text-muted uppercase">
                      {PRESS_KIND_LABEL[p.kind]} · {formatDate(p.press_date)}
                    </p>
                    <p className="heading mt-1 text-xl">{p.outlet}</p>
                    {p.title && <p className="mt-1 text-sm">{p.title}</p>}
                  </>
                );
                return (
                  <li key={p.id}>
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noreferrer" className="card block h-full p-5 transition hover:border-plum">
                        {body}
                      </a>
                    ) : (
                      <div className="card h-full p-5">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Section>
        )}

        {sections.length === 0 && !profile.bio && (
          <p className="py-10 text-center text-muted">{profile.artist_name} is just getting started. Check back soon.</p>
        )}
      </main>

      <footer className="border-t border-line py-8">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 text-sm text-muted sm:px-6">
          <Logo size={32} href={null} />
          <span>Part of the Ufora roster</span>
        </div>
      </footer>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6">
      <h2 className="heading mb-6 flex items-center gap-3 text-2xl">
        <span className="size-3 rounded-full bg-yellow ring-1 ring-plum/20" aria-hidden />
        {title}
      </h2>
      {children}
    </section>
  );
}

function VideoGrid({ videos }: { videos: Video[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {videos.map((v) => (
        <figure key={v.id}>
          <div className="aspect-video overflow-hidden rounded-xl bg-plum">
            <iframe
              src={embedUrl(v.provider, v.provider_id)}
              title={v.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="size-full"
            />
          </div>
          <figcaption className="mt-2">
            <span className="font-medium">{v.title}</span>
            {(v.venue || v.video_date) && (
              <span className="block text-sm text-muted">{[v.venue, formatDate(v.video_date)].filter(Boolean).join(" · ")}</span>
            )}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
