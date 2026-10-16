import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Landing route for links in Supabase auth emails (signup verification,
 * password recovery, email change). Supports both the token-hash template
 * (recommended — works in any browser) and the default PKCE `code` link.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  const supabase = await createClient();
  let failed = true;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    failed = Boolean(error);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    failed = Boolean(error);
  }

  if (failed) {
    // A signup link opened in a different browser than the one used to sign up
    // can't finish signing in, but Supabase has already verified the email by
    // this point, so send them to sign in rather than showing an error.
    const fallback = code && !type ? "/login?verified=1" : "/login?error=link";
    return NextResponse.redirect(new URL(fallback, request.url));
  }

  const dest = new URL(next, request.url);
  if (type === "signup" || type === "email") dest.searchParams.set("welcome", "1");
  return NextResponse.redirect(dest);
}
