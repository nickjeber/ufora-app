"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatDuration } from "@/lib/format";

type PlayerTrack = { id: string; title: string; number: number; duration: number | null; src: string };

/** Pause any other album player on the page when this one starts. */
const PLAY_EVENT = "ufora:play";

/** `licenseBase`, when set, adds a "License" link per track pointing at `${licenseBase}/${track.id}`. */
export function AlbumPlayer({ tracks, licenseBase }: { tracks: PlayerTrack[]; licenseBase?: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const onOtherPlay = (e: Event) => {
      if ((e as CustomEvent).detail !== audio.current) audio.current?.pause();
    };
    window.addEventListener(PLAY_EVENT, onOtherPlay);
    return () => window.removeEventListener(PLAY_EVENT, onOtherPlay);
  }, []);

  function play(index: number) {
    const el = audio.current;
    if (!el) return;
    if (index === current) {
      if (el.paused) void el.play();
      else el.pause();
      return;
    }
    setCurrent(index);
    setProgress(0);
    el.src = tracks[index].src;
    void el.play();
  }

  const active = current !== null ? tracks[current] : null;

  return (
    <div>
      <audio
        ref={audio}
        preload="none"
        onPlay={() => {
          setPlaying(true);
          window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: audio.current }));
        }}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => {
          if (current !== null && current < tracks.length - 1) play(current + 1);
          else setPlaying(false);
        }}
      />
      <ol className="divide-y divide-line rounded-xl border border-line bg-surface">
        {tracks.map((t, i) => {
          const isCurrent = i === current;
          return (
            <li key={t.id} className={`flex items-center ${isCurrent ? "bg-yellow/40" : ""}`}>
              <button
                type="button"
                onClick={() => play(i)}
                className="flex min-w-0 flex-1 items-center gap-4 px-4 py-3 text-left transition hover:bg-yellow/30"
                aria-label={`${isCurrent && playing ? "Pause" : "Play"} ${t.title}`}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-plum text-[10px] text-yellow">
                  {isCurrent && playing ? "❚❚" : "▶"}
                </span>
                <span className="w-5 font-display text-sm text-muted tabular-nums">{t.number}</span>
                <span className="min-w-0 flex-1 truncate font-medium">{t.title}</span>
                <span className="text-sm text-muted tabular-nums">{formatDuration(t.duration)}</span>
              </button>
              {licenseBase && (
                <Link
                  href={`${licenseBase}/${t.id}`}
                  className="mr-3 shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium ring-2 ring-plum transition-colors hover:bg-plum hover:text-yellow"
                  aria-label={`License ${t.title}`}
                >
                  License
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      {active && (
        <div className="mt-3 flex items-center gap-3 text-xs text-muted tabular-nums">
          <span>{formatDuration(progress)}</span>
          <input
            type="range"
            min={0}
            max={duration || active.duration || 0}
            step={1}
            value={progress}
            onChange={(e) => {
              if (audio.current) audio.current.currentTime = Number(e.target.value);
            }}
            className="flex-1 accent-plum"
            aria-label="Seek"
          />
          <span>{formatDuration(duration || active.duration)}</span>
        </div>
      )}
    </div>
  );
}
