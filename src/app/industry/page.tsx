import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site/site-header";
import { Field, SiteForm, siteInput } from "@/components/site/site-form";
import { requestIndustryAccess } from "../submit/actions";

export const metadata: Metadata = {
  title: "For industry",
  description: "License and book original, uncompromised artists directly. Request Ufora industry access.",
};

const ROLES = [
  ["music_supervisor", "Music supervisor"],
  ["sound_designer", "Sound designer"],
  ["venue", "Venue"],
  ["promoter", "Promoter"],
  ["booking_agent", "Booking agent"],
  ["radio", "Radio host or programmer"],
  ["podcast", "Podcast host"],
  ["press", "Press"],
  ["other", "Something else"],
] as const;

export default function IndustryPage() {
  return (
    <div className="flex flex-1 flex-col bg-white text-plum">
      <SiteHeader />
      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-14 px-4 pt-10 pb-24 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:gap-20 lg:pt-16">
        <div>
          <h1 className="font-display text-[clamp(3rem,7vw,5.5rem)] leading-[0.9] font-semibold">
            License and book, without the middlemen
          </h1>
          <p className="mt-6 max-w-[30rem] text-lg leading-relaxed">
            Every Ufora artist owns their work outright, so you clear and book directly with clear terms and no
            bureaucracy.
          </p>
          <p className="mt-4 max-w-[30rem] text-lg leading-relaxed">
            Industry accounts are on the way. Request access and you’ll be among the first in, with alerts when we sign
            someone new or an artist you follow releases something, plus a quick way to inquire and book.
          </p>
          <Link href="/artists" className="site-btn-outline mt-8">
            Browse the roster now
          </Link>
        </div>

        <div className="lg:pt-4">
          <SiteForm
            action={requestIndustryAccess}
            submitLabel="Request access"
            pendingLabel="Sending…"
            success={
              <>
                <p className="font-display text-4xl leading-none font-semibold">You’re on the list.</p>
                <p className="mt-4 text-lg leading-relaxed">
                  We’ll email you when industry accounts open. In the meantime, the roster is open to browse.
                </p>
                <Link href="/artists" className="site-btn mt-6">
                  Browse the roster
                </Link>
              </>
            }
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Your name" htmlFor="name">
                <input id="name" name="name" required maxLength={120} autoComplete="name" className={siteInput} />
              </Field>
              <Field label="Work email" htmlFor="email">
                <input id="email" name="email" type="email" required autoComplete="email" className={siteInput} />
              </Field>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Company or show" htmlFor="organization">
                <input id="organization" name="organization" maxLength={200} autoComplete="organization" className={siteInput} />
              </Field>
              <Field label="What you do" htmlFor="role">
                <select id="role" name="role" required defaultValue="" className={siteInput}>
                  <option value="" disabled>
                    Choose one
                  </option>
                  {ROLES.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field
              label="What are you looking for? (optional)"
              htmlFor="looking_for"
              hint="A sound for a project, an opener for a tour, guests for a show…"
            >
              <textarea id="looking_for" name="looking_for" rows={4} maxLength={2000} className={siteInput} />
            </Field>
            <label className="flex items-start gap-3">
              <input type="checkbox" name="notify" defaultChecked className="mt-1 size-5 accent-plum" />
              <span>Email me when Ufora signs a new artist</span>
            </label>
          </SiteForm>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
