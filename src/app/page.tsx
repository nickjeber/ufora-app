import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site/site-header";
import { StruckNotes } from "@/components/site/struck-notes";

export const metadata: Metadata = {
  title: { absolute: "Ufora — A record label that replaced the executives with machines, not the artists." },
  description:
    "Ufora is a record label for uncompromised music. Artists keep their masters, name and sound; AI handles licensing, booking, contracts and payments for a flat 5%.",
};

const NOTES = [
  "Can the hook come in sooner?",
  "It needs a moment that works on TikTok.",
  "Have you thought about sounding more like…",
  "Let’s get a co-writer on this one.",
  "We love it. Can it be shorter?",
];

const YOURS = [
  "Your masters, name, image and likeness",
  "Your release plan. Put it out however you like; streaming income is all yours",
  "Your sound. We never give creative direction",
];

const OURS = [
  "Sync licensing for film, TV, ads and games",
  "Tour and venue booking, from regional to global",
  "Contracts and payments",
  "Tour logistics",
  "Press around your shows",
  "PR support for your brand and voice",
];

const STEPS = [
  { title: "Send us your music", body: "Links to whatever you’ve made. It doesn’t need to be polished for anyone else’s ears." },
  {
    title: "We listen",
    body: "Our scouting tools look for work that’s genuinely its own. Then a person listens. Every signing is a human decision.",
  },
  { title: "You sign", body: "A short agreement in plain language. Free to join, and either side can end it at any time." },
  {
    title: "We go to work",
    body: "You get a page for your music, videos, tour dates and press, and we start putting you in front of the people who book and license.",
  },
];

const AUDIENCES = [
  "Music supervisors",
  "Sound designers",
  "Venues",
  "Promoters",
  "Booking agents",
  "Radio hosts",
  "Podcast hosts",
  "Press",
];

export default function Home() {
  return (
    <div className="flex-1 overflow-x-clip bg-white text-plum">
      {/* Hero */}
      <section className="relative isolate">
        <div
          aria-hidden
          className="hero-circle absolute -top-[18vw] -right-[34vw] -z-10 aspect-square w-[95vw] rounded-full bg-yellow sm:-top-[4vw] sm:-right-[16vw] sm:w-[66vw] lg:-right-[10vw] lg:w-[58vw]"
        />
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-4 pt-[22vw] pb-24 sm:px-8 sm:pt-20 sm:pb-32 lg:pt-28">
          <h1 className="font-display text-[clamp(3rem,7.8vw,7rem)] leading-[0.92] font-semibold tracking-[-0.01em] text-balance">
            A record label that replaced the executives with machines, not the artists.
          </h1>
          <p className="mt-8 max-w-[36rem] text-lg leading-relaxed sm:text-xl">
            Ufora is a record label for uncompromised music. Artists keep their masters, their name and their sound. AI
            handles the contracts, bookings, licensing and payments.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/submit" className="site-btn px-6 py-3 text-base">
              Submit your music
            </Link>
            <Link href="/artists" className="site-btn-outline bg-white/70">
              Browse the roster
            </Link>
          </div>
        </div>
      </section>

      {/* Who's missing */}
      <section className="bg-[#ECE8EA]">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-8 lg:grid-cols-[1fr_1.4fr] lg:gap-20 lg:py-32">
          <div>
            <h2 className="font-display text-[clamp(2.2rem,5vw,3.5rem)] leading-[0.95] font-semibold">
              Notes you’ll never get from us
            </h2>
            <p className="mt-6 max-w-[30rem] text-lg leading-relaxed">
              There are no executives at Ufora, so nobody’s job depends on changing your music. AI does the paperwork:
              contracts, licensing, booking, payments and tour logistics. The art stays human.
            </p>
          </div>
          <StruckNotes notes={NOTES} />
        </div>
      </section>

      {/* For artists */}
      <section id="artists" className="scroll-mt-4">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-8 lg:py-32">
          <div className="grid items-end gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
            <p aria-hidden className="font-display text-[clamp(7rem,22vw,15rem)] leading-[0.8] font-semibold">
              5%
            </p>
            <div className="max-w-[34rem] pb-2">
              <h2 className="font-display text-[clamp(2.2rem,5vw,3.5rem)] leading-[0.95] font-semibold">
                You keep everything else.
              </h2>
              <p className="mt-5 text-lg leading-relaxed">
                Ufora takes a flat 5% of income that comes through us, and nothing on the work you land yourself. Joining
                is free. Representation is exclusive for licensing and booking, and either side can walk away at any
                time.
              </p>
            </div>
          </div>

          <div className="mt-20 grid gap-14 border-t-2 border-plum pt-12 md:grid-cols-2 md:gap-16">
            <div>
              <h3 className="font-display text-3xl font-semibold">What stays yours</h3>
              <ul className="mt-6 space-y-4 text-lg leading-snug">
                {YOURS.map((item) => (
                  <li key={item} className="flex gap-4">
                    <span aria-hidden className="mt-2 size-3 shrink-0 rounded-full bg-yellow ring-1 ring-plum/30" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display text-3xl font-semibold">What we handle</h3>
              <ul className="mt-6 space-y-4 text-lg leading-snug">
                {OURS.map((item) => (
                  <li key={item} className="flex gap-4">
                    <span aria-hidden className="mt-2 size-3 shrink-0 rounded-full bg-plum" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How signing works */}
      <section className="bg-yellow">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-8 lg:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-display text-[clamp(2.2rem,5vw,3.5rem)] leading-[0.95] font-semibold">
              Found by algorithm, chosen by ear
            </h2>
            <Link href="/submit" className="site-btn px-6 py-3 text-base">
              Submit your music
            </Link>
          </div>
          <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {STEPS.map((step, i) => (
              <li key={step.title} className="border-t-2 border-plum pt-5">
                <span className="font-display text-5xl leading-none font-semibold">{i + 1}</span>
                <h3 className="mt-4 font-display text-2xl font-semibold">{step.title}</h3>
                <p className="mt-2 leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* For industry */}
      <section id="industry" className="scroll-mt-4 bg-plum text-white">
        <div className="mx-auto grid max-w-6xl gap-14 px-4 py-24 sm:px-8 lg:grid-cols-[1.2fr_1fr] lg:gap-20 lg:py-32">
          <div>
            <h2 className="font-display text-[clamp(2.4rem,5.5vw,4rem)] leading-[0.95] font-semibold text-yellow">
              Original artists, ready to license and book
            </h2>
            <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-white/85">
              Search the roster, listen to full releases, and clear or book directly. The artist holds the rights, so
              there’s no major label in the middle and no bureaucracy slowing a deal down. Every deal pays the people
              who made the work.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/artists" className="site-btn-yellow">
                Browse the roster
              </Link>
              <Link
                href="/industry"
                className="inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-medium text-white ring-2 ring-white/70 transition-colors hover:bg-white hover:text-plum focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-yellow"
              >
                Create an industry account
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-display text-2xl font-semibold">Built for</h3>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {AUDIENCES.map((a) => (
                <li key={a} className="rounded-full px-4 py-2 text-[15px] ring-1 ring-white/35">
                  {a}
                </li>
              ))}
            </ul>
            <p className="mt-8 leading-relaxed text-white/75">
              A free industry account gives you a feed of new releases from the roster, with a quick way to license any
              track or pick dates and book the artist.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
