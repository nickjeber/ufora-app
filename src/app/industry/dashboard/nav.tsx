"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/industry/dashboard", label: "New music" },
  { href: "/industry/dashboard/requests", label: "Your requests" },
  { href: "/industry/dashboard/profile", label: "Profile" },
  { href: "/artists", label: "Full roster" },
] as const;

export function IndustryNav() {
  const path = usePathname();
  return (
    <nav className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-4 pt-4 sm:px-8" aria-label="Industry">
      {ITEMS.map(({ href, label }) => {
        const active =
          href === "/industry/dashboard"
            ? path === href || path.startsWith("/industry/dashboard/license") || path.startsWith("/industry/dashboard/book")
            : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 border-b-4 pb-2.5 text-[15px] font-medium transition-colors ${
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
