"use client";

import { startTransition, useActionState, type ReactNode } from "react";
import type { ActionState } from "@/lib/types";

/** A public form that swaps itself for a confirmation once it's sent. */
export function SiteForm({
  action,
  submitLabel,
  pendingLabel,
  success,
  children,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  pendingLabel: string;
  success: ReactNode;
  children: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {} as ActionState);

  if (state.ok) {
    return (
      <div role="status" className="rounded-2xl bg-yellow p-8 sm:p-10">
        {success}
      </div>
    );
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
    >
      {/* Honeypot: hidden from people, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {children}
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button type="submit" disabled={pending} className="site-btn px-7 py-3 text-base disabled:opacity-60">
          {pending ? pendingLabel : submitLabel}
        </button>
        {state.error && (
          <p role="alert" className="text-[15px] text-danger">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}

export function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-sm text-muted">{hint}</p>}
    </div>
  );
}

export const siteInput =
  "w-full rounded-lg border-2 border-plum/25 bg-white px-3.5 py-2.5 text-base text-plum outline-none transition placeholder:text-muted/70 focus:border-plum focus:ring-4 focus:ring-yellow";
