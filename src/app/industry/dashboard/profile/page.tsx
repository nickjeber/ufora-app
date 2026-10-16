/* eslint-disable @next/next/no-img-element -- profile photos are served straight from Supabase Storage */
import { ActionForm } from "@/components/action-form";
import { ImageUpload } from "@/components/file-upload";
import { Field, siteInput } from "@/components/site/site-form";
import { requireIndustry } from "@/lib/auth";
import { INDUSTRY_ROLE_LABEL, fileUrl } from "@/lib/format";
import { setIndustryPhoto, updateIndustryProfile } from "../actions";

export const metadata = { title: "Your profile" };

export default async function IndustryProfilePage() {
  const { profile, user } = await requireIndustry();
  const photo = fileUrl("avatars", profile.avatar_path);

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.25rem)] leading-[0.9] font-semibold">Your profile</h1>
      <p className="mt-3 text-lg text-muted">Artists see this when you ask to license or book them.</p>

      <div className="mt-10 flex flex-wrap items-center gap-6">
        <div className="size-28 overflow-hidden rounded-full bg-yellow ring-2 ring-plum">
          {photo ? (
            <img src={photo} alt="Your photo" className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center font-display text-5xl font-semibold">
              {profile.name.slice(0, 1)}
            </span>
          )}
        </div>
        <ImageUpload
          bucket="avatars"
          userId={user.id}
          label="photo"
          hasImage={Boolean(photo)}
          onSaved={setIndustryPhoto}
          onRemove={setIndustryPhoto.bind(null, null)}
        />
      </div>

      <div className="mt-10 border-t-2 border-plum pt-8">
        <ActionForm
          action={updateIndustryProfile}
          submitLabel="Save profile"
          className="space-y-6"
          buttonClassName="site-btn px-7 py-3 text-base disabled:opacity-60"
        >
          <Field label="Name" htmlFor="name">
            <input id="name" name="name" required maxLength={120} defaultValue={profile.name} className={siteInput} />
          </Field>
          <Field label="Title" htmlFor="title">
            <input
              id="title"
              name="title"
              maxLength={160}
              defaultValue={profile.title ?? ""}
              placeholder="Music supervisor"
              className={siteInput}
            />
          </Field>
          <Field label="Company or show" htmlFor="organization">
            <input
              id="organization"
              name="organization"
              maxLength={200}
              defaultValue={profile.organization ?? ""}
              className={siteInput}
            />
          </Field>
          <p className="text-sm text-muted">
            Signed in as {user.email} · {INDUSTRY_ROLE_LABEL[profile.role]}
          </p>
        </ActionForm>
      </div>
    </div>
  );
}
