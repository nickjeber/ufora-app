import { ActionForm } from "@/components/action-form";
import { DeleteButton } from "@/components/delete-button";
import { requireArtist } from "@/lib/auth";
import { formatDate, todayIso } from "@/lib/format";
import type { TourDate } from "@/lib/types";
import { addTourDate, deleteTourDate, updateTourDate } from "./actions";

export const metadata = { title: "Tour dates" };

export default async function TourPage() {
  const { supabase, user } = await requireArtist();
  const { data } = await supabase.from("tour_dates").select("*").eq("artist_id", user.id).order("event_date");
  const dates = (data ?? []) as TourDate[];
  const today = todayIso();
  const upcoming = dates.filter((d) => d.event_date >= today);
  const past = dates.filter((d) => d.event_date < today).reverse();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading text-3xl">Tour dates</h1>
        <p className="mt-1 text-sm text-muted">Upcoming shows appear on your page; past ones move to an archive automatically.</p>
      </div>

      <section className="card">
        <h2 className="heading mb-5 text-xl">Add a show</h2>
        <ActionForm action={addTourDate} submitLabel="Add show" pendingLabel="Adding…" resetOnSuccess>
          <TourFields />
        </ActionForm>
      </section>

      <DateList title="Upcoming" dates={upcoming} empty="No upcoming shows." />
      {past.length > 0 && <DateList title="Past" dates={past} empty="" muted />}
    </div>
  );
}

function DateList({ title, dates, empty, muted }: { title: string; dates: TourDate[]; empty: string; muted?: boolean }) {
  return (
    <section>
      <h2 className="heading mb-3 text-xl">{title}</h2>
      {dates.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ul className={`divide-y divide-line rounded-xl border border-line bg-surface ${muted ? "opacity-75" : ""}`}>
          {dates.map((d) => (
            <li key={d.id} className="px-4 py-3">
              <div className="flex items-center gap-4">
                <div className="w-24 shrink-0 font-display text-sm font-semibold tracking-wider uppercase">
                  {formatDate(d.event_date, { weekday: "short", year: undefined })}
                  <span className="block text-xs font-medium text-muted">{d.event_date.slice(0, 4)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{d.venue}</p>
                  <p className="truncate text-sm text-muted">{[d.city, d.region, d.country].filter(Boolean).join(", ")}</p>
                </div>
                {d.ticket_url && (
                  <a href={d.ticket_url} target="_blank" rel="noreferrer" className="hidden text-xs underline sm:inline">
                    Tickets
                  </a>
                )}
                <DeleteButton action={deleteTourDate.bind(null, d.id)} confirmText={`Delete the ${d.venue} show?`} />
              </div>
              <details className="mt-1">
                <summary className="cursor-pointer text-xs text-muted">Edit</summary>
                <div className="pt-4">
                  <ActionForm action={updateTourDate.bind(null, d.id)} submitLabel="Save">
                    <TourFields date={d} />
                  </ActionForm>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function TourFields({ date }: { date?: TourDate }) {
  const id = date?.id ?? "new";
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
        <div>
          <label className="field-label" htmlFor={`event_date-${id}`}>
            Date
          </label>
          <input id={`event_date-${id}`} name="event_date" type="date" className="input" defaultValue={date?.event_date} required />
        </div>
        <div>
          <label className="field-label" htmlFor={`venue-${id}`}>
            Venue
          </label>
          <input id={`venue-${id}`} name="venue" className="input" defaultValue={date?.venue} required maxLength={200} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="field-label" htmlFor={`city-${id}`}>
            City
          </label>
          <input id={`city-${id}`} name="city" className="input" defaultValue={date?.city} required maxLength={120} />
        </div>
        <div>
          <label className="field-label" htmlFor={`region-${id}`}>
            State / region
          </label>
          <input id={`region-${id}`} name="region" className="input" defaultValue={date?.region ?? ""} maxLength={120} />
        </div>
        <div>
          <label className="field-label" htmlFor={`country-${id}`}>
            Country
          </label>
          <input id={`country-${id}`} name="country" className="input" defaultValue={date?.country ?? ""} maxLength={120} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor={`ticket_url-${id}`}>
            Ticket link
          </label>
          <input id={`ticket_url-${id}`} name="ticket_url" type="url" className="input" defaultValue={date?.ticket_url ?? ""} placeholder="https://" />
        </div>
        <div>
          <label className="field-label" htmlFor={`notes-${id}`}>
            Notes
          </label>
          <input id={`notes-${id}`} name="notes" className="input" defaultValue={date?.notes ?? ""} maxLength={500} placeholder="w/ special guests, 21+, sold out…" />
        </div>
      </div>
    </>
  );
}
