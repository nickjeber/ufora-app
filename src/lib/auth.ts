import "server-only";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { IndustryProfile, Profile } from "./types";

/** For pages: returns the signed-in user + their profile, or redirects to login. */
export async function requireArtist() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>();
  if (!profile) {
    // Industry members have no artist profile; send them to their own dashboard.
    const { data: industry } = await supabase.from("industry_profiles").select("id").eq("id", user.id).maybeSingle();
    redirect(industry ? "/industry/dashboard" : "/login?error=profile");
  }

  return { supabase, user, profile };
}

/** For industry pages: returns the signed-in user + their industry profile, or redirects. */
export async function requireIndustry() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/industry/dashboard");

  const { data: profile } = await supabase
    .from("industry_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<IndustryProfile>();
  if (!profile) redirect("/dashboard");

  return { supabase, user, profile };
}

/** For server actions: returns the signed-in user, or null. */
export async function getActionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Absolute site origin, used for links inside auth emails. */
export async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Only allow same-site relative redirects. */
export function safeNext(value: unknown, fallback = "/dashboard") {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

/** For admin pages: returns the signed-in admin, or shows a 404 to everyone else. */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) notFound();
  return { supabase, user };
}
