"use client";

import { startTransition, useActionState, useEffect, useRef, type ReactNode } from "react";
import type { ActionState } from "@/lib/types";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  /** Clear the form after a successful save (for "add new" forms). */
  resetOnSuccess?: boolean;
  className?: string;
  buttonClassName?: string;
  /** Extra controls rendered next to the submit button. */
  actions?: ReactNode;
};

/**
 * A form wired to a server action, with pending state and inline messages.
 * Submits via startTransition so React doesn't auto-reset fields on error.
 */
export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel = "Saving…",
  resetOnSuccess = false,
  className = "space-y-4",
  buttonClassName = "btn-primary",
  actions,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {} as ActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && resetOnSuccess) formRef.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form
      ref={formRef}
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
    >
      {children}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button type="submit" className={buttonClassName} disabled={pending}>
          {pending ? pendingLabel : submitLabel}
        </button>
        {actions}
        <FormMessage state={state} pending={pending} />
      </div>
    </form>
  );
}

export function FormMessage({ state, pending }: { state: ActionState; pending?: boolean }) {
  if (pending) return null;
  if (state.error)
    return (
      <p role="alert" className="text-sm text-danger">
        {state.error}
      </p>
    );
  if (state.message)
    return (
      <p role="status" className="text-sm text-muted">
        {state.message}
      </p>
    );
  return null;
}
