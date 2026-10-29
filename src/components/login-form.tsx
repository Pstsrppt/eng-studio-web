"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { continueWithGoogle, signInWithEmail, type AuthState } from "@/app/actions";
import { PasswordField } from "@/components/auth/password-field";
import { CheckEmail } from "@/components/check-email";

export function LoginForm({ configured, google }: { configured: boolean; google: boolean }) {
  const [emailState, emailAction, emailPending] = useActionState(signInWithEmail, {} as AuthState);
  const [googleState, googleAction, googlePending] = useActionState(continueWithGoogle, {} as AuthState);
  const state = googleState.error ? googleState : emailState;
  const pending = emailPending || googlePending;
  // Controlled, so the address survives the form reset React does after each submit.
  const [email, setEmail] = useState("");
  const [dismissed, setDismissed] = useState<string | null>(null);

  if (emailState.sent && dismissed !== emailState.sent) {
    return <CheckEmail email={emailState.sent} note={emailState.info} onBack={() => setDismissed(emailState.sent!)} />;
  }

  return (
    <div className="flex flex-col gap-5">
      {google && (
        <>
          <form action={googleAction}>
            <button className="flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-(--ac-line-strong) bg-card px-4 text-[15px] font-semibold text-(--ac-ink) transition hover:border-(--ac-navy) disabled:opacity-50"
              disabled={pending || !configured}>
              <GoogleMark />
              {googlePending ? "กำลังไปที่ Google…" : "เข้าใช้งานด้วย Google"}
            </button>
          </form>
          <div className="flex items-center gap-3 text-xs text-(--ac-muted)">
            <span className="h-px flex-1 bg-(--ac-line)" />หรือใช้อีเมล<span className="h-px flex-1 bg-(--ac-line)" />
          </div>
        </>
      )}

      {/* noValidate: the server action checks the fields and answers in Thai, the same on every browser. */}
      <form action={emailAction} className="flex flex-col gap-4" noValidate aria-describedby={state.error ? "login-error" : undefined}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-(--ac-ink)">อีเมล</label>
          <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false}
            className="input w-full" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <PasswordField id="password" label="รหัสผ่าน" autoComplete="current-password" />
        {/* After the field, so Tab goes email → password → this link. */}
        <Link href="/forgot-password" className="-mt-2 inline-flex min-h-11 items-center self-end text-sm font-medium text-(--ac-navy) underline underline-offset-2">ลืมรหัสผ่าน?</Link>
        {state.error && <p id="login-error" className="rounded-lg bg-bad-bg px-3 py-2 text-sm text-bad" role="alert">{state.error}</p>}
        {state.info && <p className="text-sm text-obj" role="status">{state.info}</p>}
        <button className="btn min-h-12 w-full text-[15px] font-semibold" disabled={pending || !configured}>
          {emailPending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
        </button>
      </form>
      <p className="text-center text-[15px] text-(--ac-body)">
        ยังไม่มีบัญชี? <Link href="/signup" className="font-semibold text-(--ac-navy) underline underline-offset-2">สมัครสมาชิกฟรี</Link>
      </p>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
