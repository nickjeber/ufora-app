import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <Logo size={96} />
      <h1 className="heading text-3xl">Page not found</h1>
      <Link href="/" className="btn-ghost">
        Back home
      </Link>
    </main>
  );
}
