import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site/site-header";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col bg-white text-plum">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
        <h1 className="font-display text-[clamp(2.6rem,6vw,4rem)] leading-none font-semibold">Page not found</h1>
        <p className="text-lg text-muted">That link doesn’t go anywhere. Try the roster or the homepage.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="site-btn px-6 py-3 text-base">
            Back home
          </Link>
          <Link href="/artists" className="site-btn-outline">
            Browse the roster
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
