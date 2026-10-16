/* eslint-disable @next/next/no-img-element -- artist photos are served straight from Supabase Storage */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { Field, siteInput } from "@/components/site/site-form";
import { requireIndustry } from "@/lib/auth";
import { BOOKING_KIND_LABEL, fileUrl, todayIso } from "@/lib/format";
import type { Profile, TourDate } from "@/lib/types";
import { requestBooking } from "../../actions";
import { DatePicker } from "./date-picker";

export const metadata = { title: "Book an artist" };

export default async function BookPage({ params }: PageProps<"/industry/dashboard/book/[slug]">) {
  const { slug } = await params;
  const { supabase } = await requireIndustry();

  const { data: artist } = await supabase
    .from("profiles")
    .select("id, slug, artist_name, location, avatar_path, is_signed")
    .eq("slug", slug)
    .eq("is_signed", true)
    .maybeSingle<Pick<Profile, "id" | "slug" | "artist_name" | "location" | "avatar_path" | "is_signed">>();
  if (!artist) notFound();

  const today = todayIso();
  const { data: dates } = await supabase
    .from("tour_dates")
    .select("event_date, venue, city")
    .eq("artist_id", artist.id)
    .gte("event_date", today)
    .order("event_date");
  const shows = ((dates ?? []) as Pick<TourDate, "event_date" | "venue" | "city">[]).map((d) => ({
    date: d.event_date,
    label: `${d.venue}, ${d.city}`,
  }));
  const photo = fileUrl("avatars", artist.avatar_path);

  return (
    <div className="max-w-4xl">
      <Link href="/industry/dashboard" className="text-muted underline-offset-4 hover:text-plum hover:underline">
        Back to new music
      </Link>

      <div className="mt-6 flex items-center gap-5">
        <div className="size-20 shrink-0 overflow-hidden rounded-full bg-yellow ring-2 ring-plum">
          {photo && <img src={photo} alt="" className="size-full object-cover" />}
        </div>
        <div>
          <h1 className="font-display text-[clamp(2.4rem,5vw,3.5rem)] leading-[0.95] font-semibold">
            Book {artist.artist_name}
          </h1>
          <p className="text-muted">
            {artist.location && `${artist.location} · `}
            <Link href={`/artists/${artist.slug}`} className="underline-offset-4 hover:text-plum hover:underline">
              View their page
            </Link>
          </p>
        </div>
      </div>

      <ActionForm
        action={requestBooking.bind(null, artist.id)}
        submitLabel="Send booking request"
        pendingLabel="Sending…"
        className="mt-10 grid gap-x-10 gap-y-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
        buttonClassName="site-btn px-7 py-3 text-base disabled:opacity-60"
      >
        <div className="md:row-span-6">
          <p className="mb-1.5 font-medium" id="dates-label">
            Dates
          </p>
          <div role="group" aria-labelledby="dates-label">
            <DatePicker shows={shows} today={today} />
          </div>
        </div>
        <Field label="What you’re booking" htmlFor="kind">
          <select id="kind" name="kind" required defaultValue="" className={siteInput}>
            <option value="" disabled>
              Choose one
            </option>
            {Object.entries(BOOKING_KIND_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Venue, show or event" htmlFor="venue">
          <input id="venue" name="venue" maxLength={200} className={siteInput} placeholder="The Empty Bottle" />
        </Field>
        <Field label="City" htmlFor="city">
          <input id="city" name="city" maxLength={120} className={siteInput} placeholder="Chicago, IL" />
        </Field>
        <Field label="Fee or budget (optional)" htmlFor="budget">
          <input id="budget" name="budget" maxLength={120} className={siteInput} placeholder="$1,500 guarantee" />
        </Field>
        <Field label="Details (optional)" htmlFor="details" hint="Set length, other acts, travel and backline, anything they should know.">
          <textarea id="details" name="details" rows={4} maxLength={2000} className={siteInput} />
        </Field>
      </ActionForm>
    </div>
  );
}
