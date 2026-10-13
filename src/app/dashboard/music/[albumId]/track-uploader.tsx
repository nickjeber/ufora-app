"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadToBucket } from "@/components/file-upload";
import { addTrack } from "../actions";

type Item = { name: string; status: "uploading" | "done" | "error"; error?: string };

/** Read an audio file's length in the browser so we can show durations. */
function readDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    const done = (value: number | null) => {
      URL.revokeObjectURL(url);
      resolve(value);
    };
    audio.preload = "metadata";
    audio.onloadedmetadata = () => done(Number.isFinite(audio.duration) ? Math.round(audio.duration) : null);
    audio.onerror = () => done(null);
    setTimeout(() => done(null), 8000);
    audio.src = url;
  });
}

/** "03 - My Song (master).wav" → "My Song (master)" */
function titleFromFile(name: string) {
  return (
    name
      .replace(/\.[^.]+$/, "")
      .replace(/^\s*\d{1,3}\s*[-_.)]\s*/, "")
      .replace(/_/g, " ")
      .trim() || "Untitled"
  ).slice(0, 200);
}

export function TrackUploader({ albumId, userId }: { albumId: string; userId: string }) {
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const busy = items.some((i) => i.status === "uploading");

  async function handle(files: File[]) {
    // Upload in filename order so "01 …", "02 …" land in sequence.
    const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    setItems(sorted.map((f) => ({ name: f.name, status: "uploading" })));

    for (const [index, file] of sorted.entries()) {
      const update = (patch: Partial<Item>) =>
        setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
      try {
        const [path, duration] = await Promise.all([uploadToBucket("audio", userId, file), readDuration(file)]);
        const res = await addTrack(albumId, { title: titleFromFile(file.name), path, duration });
        if (res.error) throw new Error(res.error);
        update({ status: "done" });
      } catch (e) {
        update({ status: "error", error: e instanceof Error ? e.message : "Upload failed" });
      }
    }
    router.refresh();
    if (input.current) input.current.value = "";
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <input
        ref={input}
        type="file"
        accept="audio/*,.mp3,.wav,.flac,.m4a,.aac,.ogg"
        multiple
        className="sr-only"
        onChange={(e) => e.target.files?.length && handle(Array.from(e.target.files))}
      />
      <button type="button" className="btn-primary" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? "Uploading…" : "+ Add tracks"}
      </button>
      {items.length > 0 && (
        <ul className="w-full max-w-xs space-y-1 text-xs">
          {items.map((it, i) => (
            <li key={i} className="flex justify-between gap-2">
              <span className="truncate">{it.name}</span>
              <span className={it.status === "error" ? "text-danger" : "text-muted"}>
                {it.status === "uploading" ? "Uploading…" : it.status === "done" ? "✓" : it.error}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
