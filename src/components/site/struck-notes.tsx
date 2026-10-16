"use client";

import { useEffect, useRef } from "react";

/** Executive notes that get crossed out, one after another, as the list scrolls into view. */
export function StruckNotes({ notes }: { notes: string[] }) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const strike = () => el.setAttribute("data-on", "");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      strike();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          strike();
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <ul ref={ref} className="struck-list space-y-3 sm:space-y-4">
      {notes.map((note, i) => (
        <li key={note} className="font-display text-[clamp(1.6rem,4.2vw,3rem)] leading-[1.08] text-plum/45">
          <span className="struck" style={{ transitionDelay: `${250 + i * 220}ms` }}>
            “{note}”
          </span>
        </li>
      ))}
    </ul>
  );
}
