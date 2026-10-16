"use client";

import { useMemo, useState } from "react";

type Show = { date: string; label: string };

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const pretty = (value: string) =>
  new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(
    new Date(`${value}T12:00:00`),
  );

/**
 * Month calendar for picking a single date or a range. Click once for a single
 * day; click a second, later day to make it a range (tours, residencies).
 * Days the artist already has a show are marked.
 */
export function DatePicker({ shows, today }: { shows: Show[]; today: string }) {
  // `today` comes from the server so the first render matches on both sides.
  const [month, setMonth] = useState(() => new Date(Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 1, 1));
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const showsByDate = useMemo(() => new Map(shows.map((s) => [s.date, s.label])), [shows]);

  const days = useMemo(() => {
    const first = new Date(month);
    const offset = (first.getDay() + 6) % 7; // Monday-first grid
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [
      ...Array.from({ length: offset }, () => null),
      ...Array.from({ length: count }, (_, i) => iso(new Date(month.getFullYear(), month.getMonth(), i + 1))),
    ];
  }, [month]);

  const isCurrentMonth = iso(month).slice(0, 7) === today.slice(0, 7);

  function pick(day: string) {
    if (!start || end || day < start) {
      setStart(day);
      setEnd(null);
    } else if (day === start) {
      setStart(null);
    } else {
      setEnd(day);
    }
  }

  const clashes = shows.filter((s) => start && s.date >= start && s.date <= (end ?? start));

  return (
    <div>
      <input type="hidden" name="start_date" value={start ?? ""} />
      <input type="hidden" name="end_date" value={end ?? start ?? ""} />

      <div className="rounded-2xl border-2 border-plum p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            disabled={isCurrentMonth}
            className="size-10 rounded-full text-2xl leading-none hover:bg-yellow disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Previous month"
          >
            ‹
          </button>
          <p className="font-display text-2xl font-semibold" aria-live="polite">
            {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(month)}
          </p>
          <button
            type="button"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            className="size-10 rounded-full text-2xl leading-none hover:bg-yellow"
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-sm text-muted" aria-hidden>
          {WEEKDAYS.map((d) => (
            <span key={d} className="py-1.5">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (!day) return <span key={`blank-${i}`} />;
            const past = day < today;
            const isEdge = day === start || day === (end ?? start);
            const inRange = start && end && day > start && day < end;
            const show = showsByDate.get(day);
            return (
              <button
                key={day}
                type="button"
                disabled={past}
                onClick={() => pick(day)}
                aria-pressed={Boolean(isEdge || inRange)}
                aria-label={`${pretty(day)}${show ? `, already playing ${show}` : ""}`}
                className={`relative flex aspect-square items-center justify-center rounded-full text-[15px] tabular-nums transition-colors disabled:cursor-not-allowed disabled:text-plum/25 ${
                  isEdge
                    ? "bg-plum font-semibold text-yellow"
                    : inRange
                      ? "bg-yellow"
                      : day === today
                        ? "ring-2 ring-plum/30 hover:bg-yellow/60"
                        : "hover:bg-yellow/60"
                }`}
              >
                {Number(day.slice(8))}
                {show && (
                  <span
                    aria-hidden
                    className={`absolute bottom-1.5 size-1.5 rounded-full ${isEdge ? "bg-yellow" : "bg-plum"}`}
                  />
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-3 flex items-center gap-2 text-sm text-muted">
          <span aria-hidden className="size-1.5 rounded-full bg-plum" /> Already has a show that day
        </p>
      </div>

      <p className="mt-3 min-h-6 leading-relaxed" aria-live="polite">
        {!start && <span className="text-muted">Pick a date. For a tour or run of shows, pick the first day, then the last.</span>}
        {start && !end && (
          <>
            <strong className="font-semibold">{pretty(start)}</strong>
            <span className="text-muted"> — pick a later day to make it a range</span>
          </>
        )}
        {start && end && (
          <strong className="font-semibold">
            {pretty(start)} to {pretty(end)}
          </strong>
        )}
      </p>
      {clashes.length > 0 && (
        <p className="mt-1 text-sm">
          Heads up: they’re already playing {clashes.map((c) => `${c.label} on ${pretty(c.date)}`).join(", ")}.
        </p>
      )}
    </div>
  );
}
