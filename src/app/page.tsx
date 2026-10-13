import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <Logo size={140} href={null} />
      <h1 className="heading mt-10 text-4xl sm:text-5xl">Artist platform</h1>
      <p className="mt-4 max-w-md text-muted">
        Your music, videos, tour dates and press — in one place you control. Sign up, verify your email, and build your
        page.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/signup" className="btn-primary">
          Create account
        </Link>
        <Link href="/login" className="btn-ghost">
          Sign in
        </Link>
      </div>
    </main>
  );
}
