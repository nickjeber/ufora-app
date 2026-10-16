import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { requireAdmin, siteOrigin } from "@/lib/auth";
import { passEmail, signedEmail } from "@/lib/emails";
import { formatDate } from "@/lib/format";
import { DecisionButtons, EmailDraft } from "./review-controls";

export const metadata: Metadata = { title: "Review submissions", robots: { index: false } };

type Submission = {
  id: string;
  created_at: string;
  artist_name: string;
  email: string;
  location: string | null;
  links: string;
  about: string | null;
  release_type: "album" | "ep" | "single" | "demo" | null;
  release_title: string | null;
  status: "new" | "listening" | "signed" | "passed";
  decided_at: string | null;
};

type Invite = { submission_id: string | null; email: string; token: string; used_at: string | null };

const TABS = [
  { key: "todo", label: "To review", statuses: ["new", "listening"] },
  { key: "signed", label: "Signed", statuses: ["signed"] },
  { key: "passed", label: "Passed", statuses: ["passed"] },
] as const;

const KIND_LABEL = { album: "Album", ep: "EP", single: "Single", demo: "Demo" } as const;

const STATUS_LABEL = { new: "New", listening: "Listening", signed: "Signed", passed: "Passed" } as const;

function Links({ text }: { text: string }) {
  return (
    <ul className="space-y-1">
      {text
        .split(/\s+/)
        .filter(Boolean)
        .map((part, i) =>
          /^https?:\/\//i.test(part) ? (
            <li key={i} className="truncate">
              <a href={part} target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">
                {part.replace(/^https?:\/\/(www\.)?/i, "")}
              </a>
            </li>
          ) : null,
        )}
    </ul>
  );
}

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const { supabase } = await requireAdmin();
  const { tab: tabParam } = await searchParams;
  const tab = TABS.find((t) => t.key === tabParam) ?? TABS[0];
  const origin = await siteOrigin();

  const [{ data: all }, { data: invites }] = await Promise.all([
    supabase.from("submissions").select("*").order("created_at", { ascending: false }),
    supabase.from("artist_invites").select("submission_id, email, token, used_at"),
  ]);
  const submissions = (all ?? []) as Submission[];
  const inviteList = (invites ?? []) as Invite[];

  const shown = submissions.filter((s) => (tab.statuses as readonly string[]).includes(s.status));
  const counts = Object.fromEntries(
    TABS.map((t) => [t.key, submissions.filter((s) => (t.statuses as readonly string[]).includes(s.status)).length]),
  );
  const byEmail = new Map<string, Submission[]>();
  for (const s of submissions) {
    const key = s.email.toLowerCase();
    byEmail.set(key, [...(byEmail.get(key) ?? []), s]);
  }

  return (
    <div className="flex flex-1 flex-col bg-white text-plum">
      <header className="border-b-2 border-plum">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 pt-4 sm:px-8">
          <Logo size={40} />
          <p className="font-display text-xl font-semibold">Review</p>
          <Link href="/dashboard" className="ml-auto text-sm text-muted underline-offset-4 hover:text-plum hover:underline">
            Your artist dashboard
          </Link>
        </div>
        <nav className="mx-auto flex max-w-4xl gap-6 overflow-x-auto px-4 pt-4 sm:px-8" aria-label="Submission status">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={t.key === "todo" ? "/admin" : `/admin?tab=${t.key}`}
              aria-current={t.key === tab.key ? "page" : undefined}
              className={`shrink-0 border-b-4 pb-2.5 text-[15px] font-medium ${
                t.key === tab.key ? "border-plum" : "border-transparent text-muted hover:text-plum"
              }`}
            >
              {t.label} <span className="text-muted">({counts[t.key]})</span>
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-8 sm:py-12">
        {shown.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-plum/30 px-6 py-12 text-center text-muted">
            {tab.key === "todo" ? "You’re all caught up. New submissions will appear here." : "Nothing here yet."}
          </p>
        ) : (
          <ul className="space-y-10">
            {shown.map((s) => {
              const history = (byEmail.get(s.email.toLowerCase()) ?? []).filter((h) => h.id !== s.id);
              const invite =
                inviteList.find((i) => i.submission_id === s.id) ??
                inviteList.find((i) => i.email.toLowerCase() === s.email.toLowerCase() && !i.used_at);
              const release = { release_type: s.release_type, release_title: s.release_title };
              return (
                <li key={s.id} className="border-t-2 border-plum pt-6 first:border-t-0 first:pt-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-display text-3xl leading-tight font-semibold">{s.artist_name}</h2>
                      <p className="mt-1">
                        {s.release_type ? KIND_LABEL[s.release_type] : "Music"}
                        {s.release_title && `: ${s.release_title}`}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {[s.location, s.email, `sent ${formatDate(s.created_at.slice(0, 10))}`].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${
                        s.status === "signed" ? "bg-plum text-yellow" : s.status === "new" ? "bg-yellow" : "ring-1 ring-plum/25"
                      }`}
                    >
                      {STATUS_LABEL[s.status]}
                    </span>
                  </div>

                  <div className="mt-4">
                    <Links text={s.links} />
                  </div>
                  {s.about && <p className="mt-3 leading-relaxed whitespace-pre-line">{s.about}</p>}

                  {history.length > 0 && (
                    <p className="mt-3 text-sm text-muted">
                      Sent {history.length} other {history.length === 1 ? "release" : "releases"} before:{" "}
                      {history
                        .map(
                          (h) =>
                            `${h.release_title ?? h.release_type ?? "music"} (${STATUS_LABEL[h.status].toLowerCase()}, ${formatDate(h.created_at.slice(0, 10))})`,
                        )
                        .join("; ")}
                    </p>
                  )}

                  <div className="mt-5">
                    <DecisionButtons id={s.id} status={s.status} name={s.artist_name} />
                  </div>

                  {s.status === "signed" && invite && !invite.used_at && (
                    <EmailDraft
                      label="Send their invite"
                      draft={signedEmail(s.email, s.artist_name, release, `${origin}/signup?invite=${invite.token}`)}
                    />
                  )}
                  {s.status === "signed" && invite?.used_at && (
                    <p className="mt-4 text-sm">They’ve created their account. ✓</p>
                  )}
                  {s.status === "passed" && (
                    <EmailDraft label="Send the “not this time” email" draft={passEmail(s.email, s.artist_name, release, `${origin}/submit`)} />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
