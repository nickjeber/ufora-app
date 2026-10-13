"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/dashboard", label: "Profile" },
  { href: "/dashboard/music", label: "Music" },
  { href: "/dashboard/videos", label: "Videos" },
  { href: "/dashboard/tour", label: "Tour dates" },
  { href: "/dashboard/press", label: "Press" },
] as const;

export function DashboardNav() {
  const path = usePathname();
  return (
    <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-2 sm:px-4" aria-label="Dashboard">
      {ITEMS.map(({ href, label }) => {
        const active = href === "/dashboard" ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`heading shrink-0 border-b-[3px] px-3 py-2.5 text-sm transition ${
              active ? "border-plum text-plum" : "border-transparent text-muted hover:text-plum"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
