import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const TYPES = new Set<EmailOtpType>(["email", "signup", "recovery", "email_change", "invite", "magiclink"]);

/**
 * Email links built from {{ .TokenHash }} land here (see supabase/email-templates). Unlike the
 * code flow in /auth/callback this needs nothing from the browser that signed up, so a link opened
 * in the Gmail app on a phone still signs the learner in. The link also shows our own address
 * instead of the Supabase project's, which spam filters trust more.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  // Only same-site paths, so the link can't be used to send someone to another site.
  const raw = searchParams.get("next") ?? "/welcome";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/welcome";

  if (tokenHash && type && TYPES.has(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  // Expired or already used: the reset page explains itself, everything else goes to login with a note.
  return NextResponse.redirect(type === "recovery" ? `${origin}/reset-password` : `${origin}/login?error=confirm`);
}
