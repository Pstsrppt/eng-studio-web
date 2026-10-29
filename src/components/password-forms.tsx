"use client";

import { useActionState } from "react";
import { requestPasswordReset, updatePassword, type AuthState } from "@/app/actions";
import { PasswordField } from "@/components/auth/password-field";

export function ForgotForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(requestPasswordReset, {} as AuthState);
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-(--ac-ink)">อีเมลที่ใช้สมัคร</label>
        <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false}
          className="input w-full" placeholder="you@example.com" />
      </div>
      {state.error && <p className="rounded-lg bg-bad-bg px-3 py-2 text-sm text-bad" role="alert">{state.error}</p>}
      {state.info && <p className="rounded-lg bg-obj-bg px-3 py-2 text-sm text-obj" role="status">{state.info}</p>}
      <button className="btn min-h-12 w-full text-[15px] font-semibold" disabled={pending || !configured}>
        {pending ? "กำลังส่ง…" : "ส่งลิงก์ตั้งรหัสผ่านใหม่"}
      </button>
    </form>
  );
}

export function ResetForm() {
  const [state, action, pending] = useActionState(updatePassword, {} as AuthState);
  return (
    <form action={action} className="flex flex-col gap-4">
      <PasswordField id="password" label="รหัสผ่านใหม่" autoComplete="new-password" minLength={8} hint="อย่างน้อย 8 ตัวอักษร" />
      <PasswordField id="confirm" label="พิมพ์รหัสผ่านใหม่อีกครั้ง" autoComplete="new-password" minLength={8} />
      {state.error && <p className="rounded-lg bg-bad-bg px-3 py-2 text-sm text-bad" role="alert">{state.error}</p>}
      <button className="btn min-h-12 w-full text-[15px] font-semibold" disabled={pending}>
        {pending ? "กำลังบันทึก…" : "ตั้งรหัสผ่านใหม่"}
      </button>
    </form>
  );
}
