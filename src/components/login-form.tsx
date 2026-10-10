"use client";

import Link from "next/link";
import { useActionState } from "react";
import { continueWithEmail, continueWithGoogle, type AuthState } from "@/app/actions";

export function LoginForm({ configured, google }: { configured: boolean; google: boolean }) {
  const [emailState, emailAction, emailPending] = useActionState(continueWithEmail, {} as AuthState);
  const [googleState, googleAction, googlePending] = useActionState(continueWithGoogle, {} as AuthState);
  const state = googleState.error ? googleState : emailState;
  const pending = emailPending || googlePending;

  return (
    <div className="card flex flex-col gap-5 p-6">
      {google && (
        <>
          <form action={googleAction}>
            <button className="flex w-full items-center justify-center gap-3 rounded-lg border-[1.5px] border-line bg-surface px-4 py-3 text-[15px] font-semibold transition hover:border-ink disabled:opacity-50"
              disabled={pending || !configured}>
              <GoogleMark />
              {googlePending ? "กำลังไปที่ Google…" : "เข้าใช้งานด้วย Google"}
            </button>
          </form>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" />หรือใช้อีเมล<span className="h-px flex-1 bg-line" />
          </div>
        </>
      )}

      <form action={emailAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          อีเมล
          <input id="email" name="email" type="email" required autoComplete="email" className="input" placeholder="you@example.com" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          <span className="flex items-baseline justify-between">
            รหัสผ่าน
            <Link href="/forgot-password" className="text-xs font-normal text-brand underline underline-offset-2">ลืมรหัสผ่าน?</Link>
          </span>
          <input id="password" name="password" type="password" required minLength={8} autoComplete="current-password" className="input" placeholder="อย่างน้อย 8 ตัวอักษร" />
        </label>
        {state.error && <p className="text-sm text-bad" role="alert">{state.error}</p>}
        {state.info && <p className="text-sm text-obj" role="status">{state.info}</p>}
        <button className="btn py-3 text-[15px]" disabled={pending || !configured}>
          {emailPending ? "รอสักครู่…" : "เข้าใช้งาน"}
        </button>
        <p className="text-xs leading-5 text-muted">ยังไม่มีบัญชีก็กดปุ่มเดียวกันนี้ ระบบจะสร้างบัญชีให้อัตโนมัติ</p>
      </form>
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
