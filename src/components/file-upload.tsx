"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ActionState, Bucket } from "@/lib/types";

const LIMITS: Record<Bucket, { mb: number; accept: string }> = {
  avatars: { mb: 5, accept: "image/jpeg,image/png,image/webp,image/gif" },
  backgrounds: { mb: 10, accept: "image/jpeg,image/png,image/webp" },
  "album-art": { mb: 10, accept: "image/jpeg,image/png,image/webp" },
  audio: { mb: 50, accept: "audio/*" },
};

export function extensionOf(file: File) {
  const fromName = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "";
  return /^[a-z0-9]{1,5}$/.test(fromName) ? fromName : "bin";
}

/** Upload one file straight to Supabase Storage under the artist's folder. */
export async function uploadToBucket(bucket: Bucket, userId: string, file: File) {
  const { mb } = LIMITS[bucket];
  if (file.size > mb * 1024 * 1024) throw new Error(`${file.name} is larger than ${mb} MB.`);
  const path = `${userId}/${crypto.randomUUID()}.${extensionOf(file)}`;
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return path;
}

/**
 * Button that uploads a single image, then hands the storage path to a
 * server action that saves it (and cleans up the previous file).
 */
export function ImageUpload({
  bucket,
  userId,
  onSaved,
  onRemove,
  hasImage,
  label,
}: {
  bucket: Exclude<Bucket, "audio">;
  userId: string;
  onSaved: (path: string) => Promise<ActionState>;
  onRemove?: () => Promise<ActionState>;
  hasImage: boolean;
  label: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();
  const working = busy || pending;

  async function handle(file: File) {
    setError(undefined);
    setBusy(true);
    try {
      const path = await uploadToBucket(bucket, userId, file);
      start(async () => {
        const res = await onSaved(path);
        if (res.error) setError(res.error);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={input}
        type="file"
        accept={LIMITS[bucket].accept}
        className="sr-only"
        onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])}
      />
      <button type="button" className="btn-ghost bg-surface px-4 py-1.5 text-xs" disabled={working} onClick={() => input.current?.click()}>
        {working ? "Uploading…" : hasImage ? `Change ${label}` : `Upload ${label}`}
      </button>
      {hasImage && onRemove && (
        <button
          type="button"
          className="rounded-full bg-surface/90 px-3 py-1.5 text-xs text-muted ring-1 ring-line hover:text-plum"
          disabled={working}
          onClick={() =>
            start(async () => {
              const res = await onRemove();
              if (res.error) setError(res.error);
            })
          }
        >
          Remove
        </button>
      )}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
