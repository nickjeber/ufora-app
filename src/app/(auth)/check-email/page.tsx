import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { resendVerification } from "../actions";

export const metadata = { title: "Verify your email" };

export default async function CheckEmailPage({ searchParams }: PageProps<"/check-email">) {
  const { email, unverified } = await searchParams;
  const address = typeof email === "string" ? email : "";

  return (
    <div className="card">
      <h1 className="heading text-2xl">{unverified ? "Verify your email first" : "Check your email"}</h1>
      <p className="mt-2 text-sm text-muted">
        We sent a verification link to {address ? <strong className="text-plum">{address}</strong> : "your inbox"}. Click
        it to activate your account and set up your artist page.
      </p>

      <div className="mt-6 border-t border-line pt-5">
        <p className="mb-3 text-sm text-muted">Didn&apos;t get it?</p>
        <ActionForm action={resendVerification} submitLabel="Resend email" pendingLabel="Sending…" buttonClassName="btn-ghost">
          <input
            name="email"
            type="email"
            className="input"
            defaultValue={address}
            required
            aria-label="Email"
            placeholder="you@example.com"
          />
        </ActionForm>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
