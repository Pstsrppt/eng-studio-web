import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Email links (confirm sign-up, reset password) land here with a one-time code. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Only same-site paths, so the link can't be used to send someone to another site.
  const raw = searchParams.get("next") ?? "/";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  // A reset link that failed still goes to the reset page, which explains and offers a new link.
  return NextResponse.redirect(next === "/reset-password" ? `${origin}${next}` : `${origin}/login?error=confirm`);
}
