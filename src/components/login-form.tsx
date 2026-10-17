"use client";

import { MailCheckIcon } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { continueWithEmail, continueWithGoogle, resendConfirmation, type AuthState } from "@/app/actions";

export function LoginForm({ configured, google }: { configured: boolean; google: boolean }) {
  const [emailState, emailAction, emailPending] = useActionState(continueWithEmail, {} as AuthState);
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
          <input id="email" name="email" type="email" required autoComplete="email" className="input" placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)} />
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
          {emailPending ? "กำลังตรวจสอบ…" : "เข้าใช้งาน"}
        </button>
        {emailPending && <p className="text-xs text-muted" role="status">ถ้าเป็นบัญชีใหม่ ระบบกำลังส่งอีเมลยืนยัน อาจใช้เวลาประมาณ 5–10 วินาที</p>}
        <p className="text-xs leading-5 text-muted">ยังไม่มีบัญชีก็กดปุ่มเดียวกันนี้ ระบบจะสร้างบัญชีให้อัตโนมัติ</p>
      </form>
    </div>
  );
}

/** Shown instead of the form once a confirmation link is on its way, so the learner knows what to do next. */
function CheckEmail({ email, note, onBack }: { email: string; note?: string; onBack: () => void }) {
  const [state, resend, pending] = useActionState(resendConfirmation, {} as AuthState);
  // Supabase sends at most one link a minute to the same address.
  const [wait, setWait] = useState(60);
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);
  const [lastResent, setLastResent] = useState<AuthState | null>(null);
  if (state !== lastResent && state.resent) {
    setLastResent(state);
    setWait(60);
  }

  return (
    <div className="card flex flex-col items-center gap-4 p-6 text-center" role="status" aria-live="polite">
      <span className="learn-in grid size-16 place-items-center rounded-full bg-brand-soft text-brand">
        <MailCheckIcon className="size-8" aria-hidden />
      </span>
      <div>
        <h2 className="text-2xl font-bold">เช็กอีเมลของคุณ</h2>
        {note && <p className="mt-1 text-sm text-muted">{note}</p>}
        <p className="mt-2 leading-7">เราส่งลิงก์ยืนยันไปที่<br /><b className="break-all">{email}</b></p>
      </div>
      <ol className="w-full list-decimal rounded-lg bg-paper px-4 py-3 pl-9 text-left text-sm leading-7">
        <li>เปิดกล่องจดหมายของอีเมลนี้</li>
        <li>เปิดอีเมลจาก <b>English Studio</b> แล้วกดปุ่ม <b>ยืนยันอีเมล</b></li>
        <li>เว็บจะเปิดหน้า &ldquo;ยืนยันอีเมลสำเร็จ&rdquo; และพาเข้าใช้งานให้เลย</li>
      </ol>
      <p className="text-xs leading-5 text-muted">ไม่เจออีเมล? รอ 1–2 นาที แล้วดูในโฟลเดอร์ <b>สแปม</b> หรือ <b>โปรโมชัน</b> ด้วย</p>
      <form action={resend} className="flex w-full flex-col gap-2">
        <input type="hidden" name="email" value={email} />
        <button className="btn-ghost w-full" disabled={pending || wait > 0}>
          {pending ? "กำลังส่ง…" : wait > 0 ? `ส่งลิงก์อีกครั้งได้ใน ${wait} วินาที` : "ส่งลิงก์อีกครั้ง"}
        </button>
        {state.resent && <p className="text-sm text-obj">ส่งลิงก์ใหม่แล้ว ใช้ลิงก์ในอีเมลฉบับล่าสุด</p>}
        {state.error && <p className="text-sm text-bad" role="alert">{state.error}</p>}
      </form>
      <button type="button" onClick={onBack} className="text-sm text-brand underline underline-offset-2">ใช้อีเมลอื่น หรือเข้าสู่ระบบ</button>
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
