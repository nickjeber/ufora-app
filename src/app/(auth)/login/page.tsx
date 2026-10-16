import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { login } from "../actions";

export const metadata = { title: "Sign in" };

const ERRORS: Record<string, string> = {
  link: "That link is invalid or has expired. Sign in, or request a new one.",
  profile: "We couldn't find your artist profile. Please contact support.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error, verified } = await searchParams;
  const errorText = typeof error === "string" ? ERRORS[error] : undefined;

  return (
    <div className="card">
      <h1 className="heading text-2xl">Sign in</h1>
      <p className="mt-1 mb-6 text-sm text-muted">For Ufora artists and industry members.</p>
      {errorText && <p className="mb-4 rounded-md bg-yellow/40 px-3 py-2 text-sm">{errorText}</p>}
      {verified && !errorText && (
        <p className="mb-4 rounded-md bg-yellow px-3 py-2 text-sm">Your email is verified. Sign in to set up your page.</p>
      )}
      <ActionForm action={login} submitLabel="Sign in" pendingLabel="Signing in…" buttonClassName="btn-primary w-full">
        <input type="hidden" name="next" value={typeof next === "string" ? next : ""} />
        <div>
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" className="input" required autoComplete="email" />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-muted underline underline-offset-4">
              Forgot?
            </Link>
          </div>
          <input id="password" name="password" type="password" className="input" required autoComplete="current-password" />
        </div>
      </ActionForm>
      <p className="mt-6 text-center text-sm text-muted">
        New to Ufora?{" "}
        <Link href="/signup" className="font-medium text-plum underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </div>
  );
}
