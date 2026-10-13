import { ActionForm } from "@/components/action-form";
import { DeleteButton } from "@/components/delete-button";
import { requireArtist } from "@/lib/auth";
import { PRESS_KIND_LABEL, formatDate } from "@/lib/format";
import type { PressDate } from "@/lib/types";
import { addPressDate, deletePressDate, updatePressDate } from "./actions";

export const metadata = { title: "Press" };

export default async function PressPage() {
  const { supabase, user } = await requireArtist();
  const { data } = await supabase
    .from("press_dates")
    .select("*")
    .eq("artist_id", user.id)
    .order("press_date", { ascending: false });
  const items = (data ?? []) as PressDate[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading text-3xl">Press</h1>
        <p className="mt-1 text-sm text-muted">Interviews, reviews, features, radio sessions — past and scheduled.</p>
      </div>

      <section className="card">
        <h2 className="heading mb-5 text-xl">Add press</h2>
        <ActionForm action={addPressDate} submitLabel="Add press" pendingLabel="Adding…" resetOnSuccess>
          <PressFields />
        </ActionForm>
      </section>

      <section>
        <h2 className="heading mb-3 text-xl">All press</h2>
        {items.length === 0 ? (
          <p className="text-sm text-muted">Nothing yet.</p>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
            {items.map((p) => (
              <li key={p.id} className="px-4 py-3">
                <div className="flex items-center gap-4">
                  <div className="w-24 shrink-0 font-display text-sm font-semibold tracking-wider uppercase">
                    {formatDate(p.press_date)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {p.outlet}
                      <span className="ml-2 rounded-full bg-yellow px-2 py-0.5 font-display text-[11px] tracking-wider uppercase">
                        {PRESS_KIND_LABEL[p.kind]}
                      </span>
                    </p>
                    {p.title && <p className="truncate text-sm text-muted">{p.title}</p>}
                  </div>
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noreferrer" className="hidden text-xs underline sm:inline">
                      Link
                    </a>
                  )}
                  <DeleteButton action={deletePressDate.bind(null, p.id)} confirmText={`Delete the ${p.outlet} entry?`} />
                </div>
                <details className="mt-1">
                  <summary className="cursor-pointer text-xs text-muted">Edit</summary>
                  <div className="pt-4">
                    <ActionForm action={updatePressDate.bind(null, p.id)} submitLabel="Save">
                      <PressFields item={p} />
                    </ActionForm>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function PressFields({ item }: { item?: PressDate }) {
  const id = item?.id ?? "new";
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[auto_auto_1fr]">
        <div>
          <label className="field-label" htmlFor={`press_date-${id}`}>
            Date
          </label>
          <input id={`press_date-${id}`} name="press_date" type="date" className="input" defaultValue={item?.press_date} required />
        </div>
        <div>
          <label className="field-label" htmlFor={`kind-${id}`}>
            Type
          </label>
          <select id={`kind-${id}`} name="kind" className="input" defaultValue={item?.kind ?? "feature"}>
            {Object.entries(PRESS_KIND_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor={`outlet-${id}`}>
            Outlet
          </label>
          <input id={`outlet-${id}`} name="outlet" className="input" defaultValue={item?.outlet} required maxLength={200} placeholder="Pitchfork, WBEZ, local zine…" />
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor={`title-${id}`}>
          Headline / segment
        </label>
        <input id={`title-${id}`} name="title" className="input" defaultValue={item?.title ?? ""} maxLength={300} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor={`url-${id}`}>
            Link
          </label>
          <input id={`url-${id}`} name="url" type="url" className="input" defaultValue={item?.url ?? ""} placeholder="https://" />
        </div>
        <div>
          <label className="field-label" htmlFor={`notes-${id}`}>
            Notes
          </label>
          <input id={`notes-${id}`} name="notes" className="input" defaultValue={item?.notes ?? ""} maxLength={500} />
        </div>
      </div>
    </>
  );
}
