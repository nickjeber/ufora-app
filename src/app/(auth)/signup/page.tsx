import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { signup } from "../actions";

export const metadata = { title: "Create your artist account" };

export default function SignupPage() {
  return (
    <div className="card">
      <h1 className="heading text-2xl">Join Ufora</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Create your artist account. We&apos;ll email you a link to verify it.</p>
      <ActionForm action={signup} submitLabel="Create account" pendingLabel="Creating…" buttonClassName="btn-primary w-full">
        <div>
          <label className="field-label" htmlFor="artist_name">
            Artist / band name
          </label>
          <input id="artist_name" name="artist_name" className="input" required maxLength={120} autoComplete="organization" />
        </div>
        <div>
          <label className="field-label" htmlFor="email">
            Email
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
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-plum underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
