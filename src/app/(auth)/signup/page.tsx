import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { INDUSTRY_ROLE_LABEL } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { signupIndustry } from "../../industry/actions";
import { signup } from "../actions";

export const metadata = { title: "Create your account" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { type, invite } = await searchParams;
  const industry = type === "industry";

  // Artist accounts are invitation-only: look up the invite from the link we emailed.
  let invited: { artist_name: string; email: string } | null = null;
  const token = typeof invite === "string" && /^[0-9a-f-]{36}$/i.test(invite) ? invite : null;
  if (!industry && token) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("invite_details", { invite_token: token });
    invited = (Array.isArray(data) ? data[0] : data) ?? null;
  }

  return (
    <div className="card">
      <h1 className="heading text-2xl">Join Ufora</h1>

      <div role="tablist" aria-label="Account type" className="mt-5 grid grid-cols-2 rounded-full bg-background p-1 ring-1 ring-line">
        {[
          { key: "artist", label: "I’m an artist", href: token ? `/signup?invite=${token}` : "/signup" },
          { key: "industry", label: "I’m in the industry", href: "/signup?type=industry" },
        ].map((tab) => {
          const active = (tab.key === "industry") === industry;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              role="tab"
              aria-selected={active}
              replace
              scroll={false}
              className={`rounded-full px-3 py-2 text-center text-sm font-medium transition-colors ${
                active ? "bg-plum text-yellow" : "text-muted hover:text-plum"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <p className="mt-5 mb-6 text-sm text-muted">
        {industry
          ? "For music supervisors, venues, bookers, hosts and press. Hear new releases, license tracks and book artists. We’ll email you a link to verify your account."
          : invited
            ? `Congratulations, ${invited.artist_name}. Set a password to create your artist account.`
            : token
              ? "That invite link has already been used or isn’t valid. If you’ve already made your account, sign in."
              : "Artist accounts are by invitation. Send us your music, and if we sign you, we’ll email you a link to set up your page."}
      </p>

      {industry ? (
        <ActionForm
          key="industry"
          action={signupIndustry}
          submitLabel="Create account"
          pendingLabel="Creating…"
          buttonClassName="btn-primary w-full"
        >
          <div>
            <label className="field-label" htmlFor="name">
              Your name
            </label>
            <input id="name" name="name" className="input" required maxLength={120} autoComplete="name" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="title">
                Title
              </label>
              <input id="title" name="title" className="input" maxLength={160} placeholder="Music supervisor" />
            </div>
            <div>
              <label className="field-label" htmlFor="organization">
                Company or show
              </label>
              <input id="organization" name="organization" className="input" maxLength={200} autoComplete="organization" />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="role">
              What you do
            </label>
            <select id="role" name="role" className="input" required defaultValue="">
              <option value="" disabled>
                Choose one
              </option>
              {Object.entries(INDUSTRY_ROLE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="email">
              Work email
            </label>
            <input id="email" name="email" type="email" className="input" required autoComplete="email" />
          </div>
          <div>
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input id="password" name="password" type="password" className="input" required minLength={8} autoComplete="new-password" />
            <p className="mt-1 text-xs text-muted">At least 8 characters.</p>
          </div>
        </ActionForm>
      ) : invited && token ? (
        <ActionForm
          key="artist"
          action={signup}
          submitLabel="Create account"
          pendingLabel="Creating…"
          buttonClassName="btn-primary w-full"
        >
          <input type="hidden" name="invite_token" value={token} />
          <div>
            <label className="field-label" htmlFor="artist_name">
              Artist / band name
            </label>
            <input
              id="artist_name"
              name="artist_name"
              className="input"
              required
              maxLength={120}
              defaultValue={invited.artist_name}
              autoComplete="organization"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input bg-background"
              required
              readOnly
              value={invited.email}
            />
            <p className="mt-1 text-xs text-muted">Your invite is tied to this address.</p>
          </div>
          <div>
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input id="password" name="password" type="password" className="input" required minLength={8} autoComplete="new-password" />
            <p className="mt-1 text-xs text-muted">At least 8 characters.</p>
          </div>
        </ActionForm>
      ) : (
        <Link href="/submit" className="btn-primary w-full">
          Submit your music
        </Link>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-plum underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
