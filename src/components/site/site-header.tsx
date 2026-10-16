import Link from "next/link";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);

  return (
    <header className="relative z-20">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-5 sm:px-8">
        <Logo size={52} />
        <nav aria-label="Main" className="ml-auto flex items-center gap-5 text-[15px] sm:gap-7">
          <Link href="/artists" className="site-link">
            Roster
          </Link>
          <Link href="/industry" className="site-link hidden sm:inline">
            For industry
          </Link>
          <Link href={signedIn ? "/dashboard" : "/login"} className="site-link hidden sm:inline">
            {signedIn ? "Your dashboard" : "Artist sign in"}
          </Link>
          <Link href="/submit" className="site-btn">
            Submit music
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-plum text-white/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-[1fr_auto_auto] sm:px-8">
        <div className="flex items-start gap-4">
          <Logo size={64} href={null} />
          <p className="max-w-xs text-sm leading-relaxed">
            Ufora is a record label for uncompromised music. Humans make the art; AI runs the business.
          </p>
        </div>
        <nav aria-label="Artists" className="flex flex-col gap-2 text-sm">
          <p className="font-display text-lg text-white">Artists</p>
          <Link href="/submit" className="hover:text-yellow">
            Submit your music
          </Link>
          <Link href="/login" className="hover:text-yellow">
            Sign in
          </Link>
        </nav>
        <nav aria-label="Industry" className="flex flex-col gap-2 text-sm">
          <p className="font-display text-lg text-white">Industry</p>
          <Link href="/artists" className="hover:text-yellow">
            Browse the roster
          </Link>
          <Link href="/industry" className="hover:text-yellow">
            Request industry access
          </Link>
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-8 text-xs text-white/50 sm:px-8">© {new Date().getFullYear()} Ufora</div>
    </footer>
  );
}
