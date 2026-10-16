import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site/site-header";
import { Field, SiteForm, siteInput } from "@/components/site/site-form";
import { INDUSTRY_ROLE_LABEL } from "@/lib/format";
import { signupIndustry } from "./actions";

export const metadata: Metadata = {
  title: "For industry",
  description: "License and book original, uncompromised artists directly. Create a free Ufora industry account.",
};

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
            Every Ufora artist owns their work outright, so you clear and book directly, with clear terms and no
            bureaucracy.
          </p>
          <ul className="mt-8 max-w-[30rem] space-y-4 border-t-2 border-plum pt-8 text-lg leading-snug">
            <li className="flex gap-4">
              <span aria-hidden className="mt-2 size-3 shrink-0 rounded-full bg-yellow ring-1 ring-plum/30" />
              New releases from the roster, ready to play, in one feed
            </li>
            <li className="flex gap-4">
              <span aria-hidden className="mt-2 size-3 shrink-0 rounded-full bg-yellow ring-1 ring-plum/30" />
              License any track in a couple of minutes
            </li>
            <li className="flex gap-4">
              <span aria-hidden className="mt-2 size-3 shrink-0 rounded-full bg-yellow ring-1 ring-plum/30" />
              Pick dates and book an artist for a tour, show, session or appearance
            </li>
          </ul>
        </div>

        <div className="lg:pt-4">
          <h2 className="mb-6 font-display text-3xl font-semibold">Create a free industry account</h2>
          <SiteForm action={signupIndustry} submitLabel="Create account" pendingLabel="Creating…" success={null}>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Your name" htmlFor="name">
                <input id="name" name="name" required maxLength={120} autoComplete="name" className={siteInput} />
              </Field>
              <Field label="Title" htmlFor="title">
                <input id="title" name="title" maxLength={160} placeholder="Music supervisor" className={siteInput} />
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
                  {Object.entries(INDUSTRY_ROLE_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Work email" htmlFor="email">
                <input id="email" name="email" type="email" required autoComplete="email" className={siteInput} />
              </Field>
              <Field label="Password" htmlFor="password" hint="At least 8 characters.">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={siteInput}
                />
              </Field>
            </div>
          </SiteForm>
          <p className="mt-6 text-[15px] text-muted">
            Already have an account?{" "}
            <Link href="/login?next=/industry/dashboard" className="font-medium text-plum underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
