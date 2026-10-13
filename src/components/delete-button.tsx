"use client";

import { useState, useTransition } from "react";
import type { ActionState } from "@/lib/types";

export function DeleteButton({
  action,
  label = "Delete",
  confirmText = "Delete this? This can't be undone.",
  className = "text-xs font-medium text-danger underline-offset-4 hover:underline disabled:opacity-50",
}: {
  action: () => Promise<ActionState | void>;
  label?: string;
  confirmText?: string;
  className?: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <>
      <button
        type="button"
        className={className}
        disabled={pending}
        onClick={() => {
          if (!window.confirm(confirmText)) return;
          setError(undefined);
          start(async () => {
            const res = await action();
            if (res && res.error) setError(res.error);
          });
        }}
      >
        {pending ? "Deleting…" : label}
      </button>
      {error && <span className="text-xs text-danger">{error}</span>}
    </>
  );
}
