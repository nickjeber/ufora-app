import Link from "next/link";
import { Logo } from "@/components/logo";
import { requireArtist } from "@/lib/auth";
import { signOut } from "../(auth)/actions";
import { DashboardNav } from "./nav";

export const metadata = { title: "Dashboard" };

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const { profile } = await requireArtist();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 sm:px-6">
          <Logo size={40} href="/dashboard" />
          <div className="min-w-0 flex-1">
            <p className="heading truncate text-lg leading-tight">{profile.artist_name}</p>
            <Link
              href={`/artists/${profile.slug}`}
              className="text-xs text-muted underline-offset-4 hover:underline"
              target="_blank"
            >
              View public page ↗
            </Link>
          </div>
          <form action={signOut}>
            <button className="btn-ghost px-4 py-1.5 text-xs">Sign out</button>
          </form>
        </div>
        <DashboardNav />
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
