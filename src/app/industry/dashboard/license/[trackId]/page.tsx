/* eslint-disable @next/next/no-img-element -- artwork is served straight from Supabase Storage */
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlbumPlayer } from "@/app/artists/[slug]/album-player";
import { ActionForm } from "@/components/action-form";
import { Field, siteInput } from "@/components/site/site-form";
import { requireIndustry } from "@/lib/auth";
import { LICENSE_USAGE_LABEL, TERM_LABEL, TERRITORY_LABEL, fileUrl, todayIso } from "@/lib/format";
import { requestLicense } from "../../actions";

export const metadata = { title: "License a track" };

type TrackForLicense = {
  id: string;
  title: string;
  track_number: number;
  duration_seconds: number | null;
  audio_path: string;
  album: { title: string; art_path: string | null };
  artist: { artist_name: string; slug: string; is_signed: boolean };
};

export default async function LicensePage({ params }: PageProps<"/industry/dashboard/license/[trackId]">) {
  const { trackId } = await params;
  const { supabase } = await requireIndustry();
  if (!/^[0-9a-f-]{36}$/i.test(trackId)) notFound();

  const { data } = await supabase
    .from("tracks")
    .select(
      "id, title, track_number, duration_seconds, audio_path, album:albums(title, art_path), artist:profiles!inner(artist_name, slug, is_signed)",
    )
    .eq("id", trackId)
    .eq("artist.is_signed", true)
    .maybeSingle();
  if (!data) notFound();
  const track = data as unknown as TrackForLicense;
  const art = fileUrl("album-art", track.album.art_path);

  return (
    <div className="max-w-3xl">
      <Link href="/industry/dashboard" className="text-muted underline-offset-4 hover:text-plum hover:underline">
        Back to new music
      </Link>
      <h1 className="mt-4 font-display text-[clamp(2.4rem,5vw,3.5rem)] leading-[0.95] font-semibold">License this track</h1>

      <div className="mt-8 flex items-center gap-5">
        <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-plum">
          {art && <img src={art} alt="" className="size-full object-cover" />}
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-2xl font-semibold">{track.title}</p>
          <p className="text-muted">
            {track.artist.artist_name}, from {track.album.title}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <AlbumPlayer
          tracks={[
            {
              id: track.id,
              title: track.title,
              number: track.track_number,
              duration: track.duration_seconds,
              src: fileUrl("audio", track.audio_path)!,
            },
          ]}
        />
      </div>

      <section className="mt-10 border-t-2 border-plum pt-8">
        <p className="mb-6 max-w-[36rem] leading-relaxed text-muted">
          Tell us how you’ll use it. {track.artist.artist_name} owns the recording outright, so we can usually clear
          it quickly. We’ll reply with terms and a price.
        </p>
        <ActionForm
          action={requestLicense.bind(null, track.id)}
          submitLabel="Send license request"
          pendingLabel="Sending…"
          className="space-y-6"
          buttonClassName="site-btn px-7 py-3 text-base disabled:opacity-60"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="How it will be used" htmlFor="usage">
              <select id="usage" name="usage" required defaultValue="" className={siteInput}>
                <option value="" disabled>
                  Choose one
                </option>
                {Object.entries(LICENSE_USAGE_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Project name" htmlFor="project_title">
              <input id="project_title" name="project_title" required maxLength={200} className={siteInput} />
            </Field>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <Field label="Territory" htmlFor="territory">
              <select id="territory" name="territory" defaultValue="worldwide" className={siteInput}>
                {Object.entries(TERRITORY_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Term" htmlFor="term">
              <select id="term" name="term" defaultValue="1_year" className={siteInput}>
                {Object.entries(TERM_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Needed by" htmlFor="needed_by">
              <input id="needed_by" name="needed_by" type="date" min={todayIso()} className={siteInput} />
            </Field>
          </div>
          <Field label="Budget (optional)" htmlFor="budget">
            <input id="budget" name="budget" maxLength={120} placeholder="$2,500, or a range" className={siteInput} />
          </Field>
          <Field
            label="About the scene or placement (optional)"
            htmlFor="description"
            hint="How long the cue runs, whether it’s background or featured, any edits you need."
          >
            <textarea id="description" name="description" rows={4} maxLength={2000} className={siteInput} />
          </Field>
        </ActionForm>
      </section>
    </div>
  );
}
