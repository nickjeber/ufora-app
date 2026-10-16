/* eslint-disable @next/next/no-img-element -- profile photos are served straight from Supabase Storage */
import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { Logo } from "@/components/logo";
import { requireIndustry } from "@/lib/auth";
import { fileUrl } from "@/lib/format";
import { IndustryNav } from "./nav";

export const metadata = { title: "Industry" };

export default async function IndustryDashboardLayout({ children }: LayoutProps<"/industry/dashboard">) {
  const { profile } = await requireIndustry();
  const photo = fileUrl("avatars", profile.avatar_path);

  return (
    <div className="flex flex-1 flex-col bg-white text-plum">
      <header className="border-b-2 border-plum">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 pt-4 sm:px-8">
          <Logo size={44} />
          <div className="ml-auto flex items-center gap-3">
            <Link href="/industry/dashboard/profile" className="flex items-center gap-3 rounded-full pr-1 hover:opacity-80">
              <span className="hidden text-right leading-tight sm:block">
                <span className="block font-medium">{profile.name}</span>
                {profile.title && <span className="block text-sm text-muted">{profile.title}</span>}
              </span>
              <span className="size-10 overflow-hidden rounded-full bg-yellow ring-2 ring-plum">
                {photo ? (
                  <img src={photo} alt="" className="size-full object-cover" />
                ) : (
                  <span className="flex size-full items-center justify-center font-display text-lg font-semibold">
                    {profile.name.slice(0, 1)}
                  </span>
                )}
              </span>
            </Link>
            <form action={signOut}>
              <button className="text-sm text-muted underline-offset-4 hover:text-plum hover:underline">Sign out</button>
            </form>
          </div>
        </div>
        <IndustryNav />
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-8 sm:py-14">{children}</main>
    </div>
  );
}
