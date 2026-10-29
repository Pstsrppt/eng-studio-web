"use client";

import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { signUpWithEmail, type AuthState } from "@/app/actions";
import { CheckEmail } from "@/components/check-email";
import { PASSWORD_MIN } from "@/lib/auth-input";

/** Free account with email and password. Creating it is all this does: no onboarding starts afterwards. */
export function SignupForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(signUpWithEmail, {} as AuthState);
  // Controlled, so the address survives the form reset React does after each submit.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [dismissed, setDismissed] = useState<string | null>(null);
  const router = useRouter();
  // Email confirmation off: the account is signed in now, so the header should show it.
  useEffect(() => { if (state.created) router.refresh(); }, [state.created, router]);

  if (state.created) {
    return (
      <div className="card flex flex-col items-center gap-4 p-6 text-center" role="status">
        <span className="grid size-16 place-items-center rounded-full bg-[#2e7d5b] text-white"><CheckIcon className="size-8" strokeWidth={2.5} aria-hidden /></span>
        <div>
          <h2 className="text-2xl font-bold">สมัครสมาชิกสำเร็จ</h2>
          <p className="mt-2 leading-7">สร้างบัญชีและเข้าสู่ระบบแล้ว ความคืบหน้าจากนี้จะถูกบันทึกในบัญชีนี้</p>
        </div>
        <Link href="/" className="btn w-full py-3">ไปหน้าแรก</Link>
      </div>
    );
  }
  if (state.sent && dismissed !== state.sent) {
    return <CheckEmail signup email={state.sent} onBack={() => setDismissed(state.sent!)} />;
  }

  return (
    <div className="card flex flex-col gap-5 p-6">
      <form action={action} className="flex flex-col gap-4" noValidate>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          อีเมล
          <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" className="input" placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)} aria-describedby={state.error ? "signup-error" : undefined} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          รหัสผ่าน
          <input id="password" name="password" type="password" required minLength={PASSWORD_MIN} autoComplete="new-password" className="input"
            value={password} onChange={(e) => setPassword(e.target.value)} aria-describedby="password-hint" />
          <span id="password-hint" className="text-xs font-normal text-muted">อย่างน้อย {PASSWORD_MIN} ตัวอักษร ผสมตัวอักษรกับตัวเลขจะปลอดภัยกว่า</span>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          ยืนยันรหัสผ่าน
          <input id="confirm" name="confirm" type="password" required minLength={PASSWORD_MIN} autoComplete="new-password" className="input"
            value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </label>
        {state.error && <p id="signup-error" className="text-sm text-bad" role="alert">{state.error}</p>}
        <button className="btn py-3 text-[15px]" disabled={pending || !configured}>
          {pending ? "กำลังสมัคร…" : "สมัครสมาชิกฟรี"}
        </button>
        {pending && <p className="text-xs text-muted" role="status">กำลังสร้างบัญชีและส่งอีเมลยืนยัน อาจใช้เวลาประมาณ 5–10 วินาที</p>}
      </form>
      <p className="border-t border-line pt-4 text-center text-[15px]">
        มีบัญชีแล้ว? <Link href="/login" className="font-semibold text-brand underline underline-offset-2">เข้าสู่ระบบ</Link>
      </p>
    </div>
  );
}
