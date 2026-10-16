import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site/site-header";
import { Field, SiteForm, siteInput } from "@/components/site/site-form";
import { submitMusic } from "./actions";

export const metadata: Metadata = {
  title: "Submit your music",
  description: "Send Ufora your music for consideration. Free to join, you keep everything, and we take 5% only on what we bring you.",
};

export default function SubmitPage() {
  return (
    <div className="flex flex-1 flex-col bg-white text-plum">
      <SiteHeader />
      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-14 px-4 pt-10 pb-24 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:gap-20 lg:pt-16">
        <div>
          <h1 className="font-display text-[clamp(3rem,7vw,5.5rem)] leading-[0.9] font-semibold">Send us your music</h1>
          <p className="mt-6 max-w-[30rem] text-lg leading-relaxed">
            We’re looking for artists making work that sounds like no one else. Send links to whatever you’ve made.
            Every submission gets a listen from a person.
          </p>
          <dl className="mt-10 max-w-[30rem] space-y-5 border-t-2 border-plum pt-8">
            <div>
              <dt className="font-display text-xl font-semibold">What it costs</dt>
              <dd className="mt-1 leading-relaxed">Nothing. Ufora takes 5% only on income that comes through us.</dd>
            </div>
            <div>
              <dt className="font-display text-xl font-semibold">What you keep</dt>
              <dd className="mt-1 leading-relaxed">Your masters, name, image, likeness and creative control.</dd>
            </div>
            <div>
              <dt className="font-display text-xl font-semibold">What happens next</dt>
              <dd className="mt-1 leading-relaxed">
                If it’s a fit, we’ll email you about signing. We can’t reply to everyone, but we listen to everything.
              </dd>
            </div>
          </dl>
        </div>

        <div className="lg:pt-4">
          <SiteForm
            action={submitMusic}
            submitLabel="Submit music"
            pendingLabel="Sending…"
            success={
              <>
                <p className="font-display text-4xl leading-none font-semibold">Got it. Thank you.</p>
                <p className="mt-4 text-lg leading-relaxed">
                  Your music is in the queue for a listen. If it’s a fit, we’ll be in touch by email.
                </p>
                <Link href="/artists" className="site-btn mt-6">
                  Browse the roster
                </Link>
              </>
            }
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Artist or band name" htmlFor="artist_name">
                <input id="artist_name" name="artist_name" required maxLength={120} className={siteInput} />
              </Field>
              <Field label="Email" htmlFor="email">
                <input id="email" name="email" type="email" required autoComplete="email" className={siteInput} />
              </Field>
            </div>
            <Field label="Where you’re based" htmlFor="location">
              <input id="location" name="location" maxLength={120} placeholder="City, country" className={siteInput} />
            </Field>
            <Field
              label="Links to your music"
              htmlFor="links"
              hint="Bandcamp, SoundCloud, Spotify, YouTube, a private folder — one per line."
            >
              <textarea id="links" name="links" required rows={4} maxLength={2000} className={siteInput} placeholder="https://" />
            </Field>
            <Field label="Tell us about your work (optional)" htmlFor="about">
              <textarea id="about" name="about" rows={5} maxLength={2000} className={siteInput} />
            </Field>
          </SiteForm>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
