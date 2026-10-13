"use client";

import { useTransition } from "react";
import type { ActionState } from "@/lib/types";

export function TrackMoveButtons({ up, down }: { up?: () => Promise<ActionState>; down?: () => Promise<ActionState> }) {
  const [pending, start] = useTransition();
  const cls = "size-7 rounded-full text-muted ring-1 ring-line hover:text-plum hover:ring-plum disabled:opacity-30";
  return (
    <div className="flex gap-1">
      <button type="button" aria-label="Move up" className={cls} disabled={!up || pending} onClick={() => up && start(() => up().then(() => {}))}>
        ↑
      </button>
      <button type="button" aria-label="Move down" className={cls} disabled={!down || pending} onClick={() => down && start(() => down().then(() => {}))}>
        ↓
      </button>
    </div>
  );
}
