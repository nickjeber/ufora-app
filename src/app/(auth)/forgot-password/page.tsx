import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { requestPasswordReset } from "../actions";

export const metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <div className="card">
      <h1 className="heading text-2xl">Reset password</h1>
      <p className="mt-1 mb-6 text-sm text-muted">We&apos;ll email you a link to choose a new one.</p>
      <ActionForm action={requestPasswordReset} submitLabel="Send reset link" pendingLabel="Sending…" buttonClassName="btn-primary w-full">
        <div>
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" className="input" required autoComplete="email" />
        </div>
      </ActionForm>
      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
