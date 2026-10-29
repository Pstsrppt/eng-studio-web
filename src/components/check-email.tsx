"use client";

import { MailCheckIcon } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { resendConfirmation, type AuthState } from "@/app/actions";

/** Shown instead of a form once a confirmation link is on its way, so the learner knows what to do next.
    `signup`: wording for the sign-up page, which gets the same screen whether or not the address already has an
    account (Supabase sends no email then), so it says what to do in that case too. */
export function CheckEmail({ email, note, onBack, signup = false }: { email: string; note?: string; onBack: () => void; signup?: boolean }) {
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
        <h2 className="text-2xl font-bold">{signup ? "ตรวจสอบอีเมลเพื่อยืนยันบัญชี" : "เช็กอีเมลของคุณ"}</h2>
        {note && <p className="mt-1 text-sm text-muted">{note}</p>}
        <p className="mt-2 leading-7">{signup ? "ถ้าอีเมลนี้ยังไม่มีบัญชี ระบบส่งลิงก์ยืนยันไปที่" : "เราส่งลิงก์ยืนยันไปที่"}<br /><b className="break-all">{email}</b>{signup && " แล้ว"}</p>
        {signup && <p className="mt-1 text-sm text-muted">บัญชียังไม่ได้ยืนยันจนกว่าจะกดลิงก์ในอีเมล</p>}
      </div>
      <ol className="w-full list-decimal rounded-lg bg-paper px-4 py-3 pl-9 text-left text-sm leading-7">
        <li>เปิดกล่องจดหมายของอีเมลนี้</li>
        <li>เปิดอีเมลยืนยันบัญชีที่ระบบส่งให้ แล้วกดปุ่ม <b>ยืนยันอีเมล</b></li>
        <li>เว็บจะเปิดหน้า &ldquo;ยืนยันอีเมลสำเร็จ&rdquo; และพาเข้าใช้งานให้เลย</li>
      </ol>
      <p className="text-xs leading-5 text-muted">ไม่เจออีเมล? รอ 1–2 นาที แล้วดูในโฟลเดอร์ <b>สแปม</b> หรือ <b>โปรโมชัน</b> ด้วย</p>
      {signup && (
        <p className="text-xs leading-5 text-muted">
          ถ้าเคยสมัครด้วยอีเมลนี้แล้ว จะไม่มีอีเมลยืนยันฉบับใหม่ ให้ <Link href="/login" className="font-semibold text-brand underline underline-offset-2">เข้าสู่ระบบ</Link> หรือ <Link href="/forgot-password" className="font-semibold text-brand underline underline-offset-2">ตั้งรหัสผ่านใหม่</Link>
        </p>
      )}
      <form action={resend} className="flex w-full flex-col gap-2">
        <input type="hidden" name="email" value={email} />
        <button className="btn-ghost w-full" disabled={pending || wait > 0}>
          {pending ? "กำลังส่ง…" : wait > 0 ? `ส่งลิงก์อีกครั้งได้ใน ${wait} วินาที` : "ส่งลิงก์อีกครั้ง"}
        </button>
        {state.resent && <p className="text-sm text-obj">ส่งลิงก์ใหม่แล้ว ใช้ลิงก์ในอีเมลฉบับล่าสุด</p>}
        {state.error && <p className="text-sm text-bad" role="alert">{state.error}</p>}
      </form>
      <button type="button" onClick={onBack} className="text-sm text-brand underline underline-offset-2">{signup ? "ใช้อีเมลอื่น" : "ใช้อีเมลอื่น หรือเข้าสู่ระบบ"}</button>
    </div>
  );
}
