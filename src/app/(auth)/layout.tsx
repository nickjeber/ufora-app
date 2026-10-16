import { SiteFooter, SiteHeader } from "@/components/site/site-header";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col bg-white text-plum">
      <SiteHeader />
      <main className="flex flex-1 items-start justify-center px-4 pt-8 pb-20 sm:pt-14">
        <div className="w-full max-w-sm">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
