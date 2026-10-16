import Link from "next/link";
import { requireIndustry } from "@/lib/auth";
import {
  BOOKING_KIND_LABEL,
  LICENSE_USAGE_LABEL,
  REQUEST_STATUS_LABEL,
  TERM_LABEL,
  TERRITORY_LABEL,
  formatDate,
} from "@/lib/format";
import type { BookingRequest, LicenseRequest } from "@/lib/types";

export const metadata = { title: "Your requests" };

type WithArtist = { artist: { artist_name: string; slug: string } | null };

const SENT_MESSAGE: Record<string, string> = {
  license: "License request sent. We’ll come back to you with terms and a price.",
  booking: "Booking request sent. We’ll confirm availability with the artist and get back to you.",
};

function Status({ status }: { status: keyof typeof REQUEST_STATUS_LABEL }) {
  const strong = status === "licensed" || status === "confirmed" || status === "quoted";
  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${
        strong ? "bg-plum text-yellow" : status === "requested" ? "bg-yellow" : "text-muted ring-1 ring-plum/25"
      }`}
    >
      {REQUEST_STATUS_LABEL[status]}
    </span>
  );
}

export default async function RequestsPage({ searchParams }: PageProps<"/industry/dashboard/requests">) {
  const { supabase, user } = await requireIndustry();
  const { sent } = await searchParams;

  const [licenses, bookings] = await Promise.all([
    supabase
      .from("license_requests")
      .select("*, artist:profiles(artist_name, slug)")
      .eq("requester_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("booking_requests")
      .select("*, artist:profiles(artist_name, slug)")
      .eq("requester_id", user.id)
      .order("created_at", { ascending: false }),
  ]);
  const licenseList = (licenses.data ?? []) as (LicenseRequest & WithArtist)[];
  const bookingList = (bookings.data ?? []) as (BookingRequest & WithArtist)[];

  return (
    <div className="max-w-4xl">
      {typeof sent === "string" && SENT_MESSAGE[sent] && (
        <p role="status" className="mb-10 rounded-2xl bg-yellow px-6 py-4 text-lg">
          {SENT_MESSAGE[sent]}
        </p>
      )}
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.25rem)] leading-[0.9] font-semibold">Your requests</h1>

      <section className="mt-12">
        <h2 className="font-display text-3xl font-semibold">Licenses</h2>
        {licenseList.length === 0 ? (
          <p className="mt-3 text-muted">
            None yet. Hit <span className="font-medium text-plum">License</span> on any track in{" "}
            <Link href="/industry/dashboard" className="underline underline-offset-4">
              new music
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-plum/15 border-y-2 border-plum">
            {licenseList.map((r) => (
              <li key={r.id} className="flex flex-wrap items-start gap-x-6 gap-y-2 py-5">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-2xl font-semibold">
                    “{r.track_title}”{" "}
                    <span className="font-sans text-base font-normal text-muted">by {r.artist?.artist_name ?? "a former artist"}</span>
                  </p>
                  <p className="mt-1">
                    {r.project_title} — {LICENSE_USAGE_LABEL[r.usage as keyof typeof LICENSE_USAGE_LABEL]},{" "}
                    {TERRITORY_LABEL[r.territory as keyof typeof TERRITORY_LABEL].toLowerCase()},{" "}
                    {TERM_LABEL[r.term as keyof typeof TERM_LABEL].toLowerCase()}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Sent {formatDate(r.created_at.slice(0, 10))}
                    {r.needed_by && ` · needed by ${formatDate(r.needed_by)}`}
                    {r.budget && ` · budget ${r.budget}`}
                  </p>
                </div>
                <Status status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-14">
        <h2 className="font-display text-3xl font-semibold">Bookings</h2>
        {bookingList.length === 0 ? (
          <p className="mt-3 text-muted">
            None yet. Use <span className="font-medium text-plum">Book</span> on any release in{" "}
            <Link href="/industry/dashboard" className="underline underline-offset-4">
              new music
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-plum/15 border-y-2 border-plum">
            {bookingList.map((r) => (
              <li key={r.id} className="flex flex-wrap items-start gap-x-6 gap-y-2 py-5">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-2xl font-semibold">
                    {r.artist?.artist_name ?? "A former artist"}{" "}
                    <span className="font-sans text-base font-normal text-muted">
                      {BOOKING_KIND_LABEL[r.kind as keyof typeof BOOKING_KIND_LABEL].toLowerCase()}
                    </span>
                  </p>
                  <p className="mt-1">
                    {formatDate(r.start_date)}
                    {r.end_date !== r.start_date && ` to ${formatDate(r.end_date)}`}
                    {(r.venue || r.city) && ` — ${[r.venue, r.city].filter(Boolean).join(", ")}`}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Sent {formatDate(r.created_at.slice(0, 10))}
                    {r.budget && ` · ${r.budget}`}
                  </p>
                </div>
                <Status status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
