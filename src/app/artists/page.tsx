/* eslint-disable @next/next/no-img-element -- artist images are served straight from Supabase Storage */
import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site/site-header";
import { fileUrl } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export const metadata: Metadata = {
  title: "Roster",
  description: "Browse, listen to, license and book Ufora’s roster of uncompromised, original artists.",
};

export default async function RosterPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, slug, artist_name, location, avatar_path, background_path")
    .eq("is_signed", true)
    .order("artist_name");
  const artists = (data ?? []) as Pick<Profile, "id" | "slug" | "artist_name" | "location" | "avatar_path" | "background_path">[];

  return (
    <div className="flex flex-1 flex-col bg-white text-plum">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-10 pb-24 sm:px-8 lg:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-[clamp(3rem,7vw,5.5rem)] leading-[0.9] font-semibold">The roster</h1>
            <p className="mt-5 max-w-[34rem] text-lg leading-relaxed">
              Every artist here owns their work outright. Open a page to hear full releases and watch live sets, then
              get in touch to license or book.
            </p>
          </div>
          <Link href="/industry" className="site-btn-outline">
            Request industry access
          </Link>
        </div>

        {artists.length === 0 ? (
          <div className="mt-16 flex flex-col items-start gap-6 rounded-2xl bg-yellow p-8 sm:p-12">
            <p className="font-display text-4xl leading-none font-semibold">First signings coming soon.</p>
            <p className="max-w-[34rem] text-lg leading-relaxed">
              Request industry access and we’ll email you when the first artists are on the roster.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/industry" className="site-btn px-6 py-3 text-base">
                Request industry access
              </Link>
              <Link href="/submit" className="site-btn-outline">
                Submit your music
              </Link>
            </div>
          </div>
        ) : (
          <ul className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {artists.map((a) => {
              const cover = fileUrl("backgrounds", a.background_path) ?? fileUrl("avatars", a.avatar_path);
              return (
                <li key={a.id}>
                  <Link href={`/artists/${a.slug}`} className="group block focus-visible:outline-none">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-plum ring-plum ring-offset-4 group-focus-visible:ring-2">
                      {cover ? (
                        <img
                          src={cover}
                          alt=""
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                        />
                      ) : (
                        <span className="absolute inset-0 m-auto size-1/2 rounded-full bg-yellow" aria-hidden />
                      )}
                    </div>
                    <p className="mt-4 font-display text-3xl leading-none font-semibold group-hover:underline">
                      {a.artist_name}
                    </p>
                    {a.location && <p className="mt-1.5 text-muted">{a.location}</p>}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
