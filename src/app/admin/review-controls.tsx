"use client";

import { useState, useTransition } from "react";
import { mailtoHref, type Draft } from "@/lib/emails";
import { decideSubmission } from "./actions";

const btn =
  "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-[15px] font-medium transition-colors disabled:opacity-50";

export function DecisionButtons({ id, status, name }: { id: string; status: string; name: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();

  function decide(next: string, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setError(undefined);
    start(async () => {
      const res = await decideSubmission(id, next);
      if (res.error) setError(res.error);
    });
  }

  if (status === "signed" || status === "passed") {
    return (
      <button type="button" disabled={pending} onClick={() => decide("listening")} className="text-sm text-muted underline underline-offset-4">
        {pending ? "Saving…" : "Undo decision"}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => decide("signed", `Sign ${name}? This creates their invite link.`)}
        className={`${btn} bg-plum text-yellow hover:bg-black`}
      >
        Sign
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => decide("passed", `Pass on this release from ${name}?`)}
        className={`${btn} ring-2 ring-plum hover:bg-plum hover:text-yellow`}
      >
        Pass
      </button>
      {status === "new" && (
        <button type="button" disabled={pending} onClick={() => decide("listening")} className={`${btn} text-muted hover:text-plum`}>
          Mark as listening
        </button>
      )}
      {pending && <span className="text-sm text-muted">Saving…</span>}
      {error && <span className="text-sm text-danger">{error}</span>}
    </div>
  );
}

export function EmailDraft({ draft, label }: { draft: Draft; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-4 rounded-xl bg-yellow p-4 sm:p-5">
      <p className="font-medium">{label}</p>
      <p className="mt-1 text-sm">
        To {draft.to} · “{draft.subject}”
      </p>
      <details className="mt-2">
        <summary className="cursor-pointer text-sm underline underline-offset-4">Read the email</summary>
        <pre className="mt-3 font-sans text-sm leading-relaxed whitespace-pre-wrap">{draft.body}</pre>
      </details>
      <div className="mt-4 flex flex-wrap gap-2">
        <a href={mailtoHref(draft)} className={`${btn} bg-plum text-yellow hover:bg-black`}>
          Open in email
        </a>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(`${draft.subject}\n\n${draft.body}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className={`${btn} ring-2 ring-plum hover:bg-plum hover:text-yellow`}
        >
          {copied ? "Copied" : "Copy text"}
        </button>
      </div>
    </div>
  );
}
