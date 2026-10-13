/* eslint-disable @next/next/no-img-element -- user uploads are served straight from Supabase Storage */
import { ActionForm } from "@/components/action-form";
import { ImageUpload } from "@/components/file-upload";
import { requireArtist } from "@/lib/auth";
import { fileUrl } from "@/lib/format";
import { setProfileImage, updateProfile } from "./profile-actions";

export default async function ProfilePage({ searchParams }: PageProps<"/dashboard">) {
  const { profile, user } = await requireArtist();
  const { welcome, password } = await searchParams;
  const avatar = fileUrl("avatars", profile.avatar_path);
  const background = fileUrl("backgrounds", profile.background_path);
  const host = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div className="space-y-8">
      {welcome && (
        <div className="rounded-xl bg-yellow px-5 py-4">
          <p className="heading text-lg">You&apos;re verified — welcome to Ufora.</p>
          <p className="text-sm">Start by adding a photo, a background image and a short bio, then head to Music.</p>
        </div>
      )}
      {password && <p className="rounded-md bg-yellow/50 px-4 py-2 text-sm">Your password was updated.</p>}

      {/* Images */}
      <section className="overflow-hidden rounded-xl border border-line bg-surface">
        <div
          className="relative h-44 bg-plum bg-cover bg-center sm:h-56"
          style={background ? { backgroundImage: `url("${background}")` } : undefined}
        >
          {!background && (
            <p className="heading absolute inset-0 flex items-center justify-center text-sm text-yellow/70">
              No background image yet
            </p>
          )}
          <div className="absolute right-3 bottom-3">
            <ImageUpload
              bucket="backgrounds"
              userId={user.id}
              label="background"
              hasImage={Boolean(background)}
              onSaved={setProfileImage.bind(null, "background")}
              onRemove={setProfileImage.bind(null, "background", null)}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-4 px-6 pb-5">
          <div className="-mt-12 size-24 shrink-0 overflow-hidden rounded-full border-4 border-surface bg-yellow">
            {avatar ? (
              <img src={avatar} alt="" className="size-full object-cover" />
            ) : (
              <span className="heading flex size-full items-center justify-center text-3xl">
                {profile.artist_name.slice(0, 1)}
              </span>
            )}
          </div>
          <ImageUpload
            bucket="avatars"
            userId={user.id}
            label="photo"
            hasImage={Boolean(avatar)}
            onSaved={setProfileImage.bind(null, "avatar")}
            onRemove={setProfileImage.bind(null, "avatar", null)}
          />
        </div>
      </section>

      {/* Details */}
      <section className="card">
        <h2 className="heading mb-5 text-xl">Artist details</h2>
        <ActionForm action={updateProfile} submitLabel="Save details">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="artist_name">
                Artist / band name
              </label>
              <input id="artist_name" name="artist_name" className="input" defaultValue={profile.artist_name} required maxLength={120} />
            </div>
            <div>
              <label className="field-label" htmlFor="location">
                Based in
              </label>
              <input id="location" name="location" className="input" defaultValue={profile.location ?? ""} placeholder="Chicago, IL" maxLength={120} />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="slug">
              Page URL
            </label>
            <div className="flex items-center overflow-hidden rounded-md border border-line bg-background focus-within:border-plum focus-within:ring-2 focus-within:ring-yellow">
              <span className="pl-3 text-sm whitespace-nowrap text-muted">{host}/artists/</span>
              <input
                id="slug"
                name="slug"
                className="w-full bg-surface px-2 py-2 text-[15px] outline-none"
                defaultValue={profile.slug}
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                title="Lowercase letters, numbers and dashes"
                maxLength={60}
              />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="bio">
              Bio
            </label>
            <textarea id="bio" name="bio" className="input min-h-44" defaultValue={profile.bio ?? ""} maxLength={5000} />
          </div>
        </ActionForm>
      </section>
    </div>
  );
}
