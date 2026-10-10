"use client";

import { useActionState } from "react";
import { requestPasswordReset, updatePassword, type AuthState } from "@/app/actions";

export function ForgotForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(requestPasswordReset, {} as AuthState);
  return (
    <form action={action} className="card flex flex-col gap-4 p-6">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        อีเมลที่ใช้สมัคร
        <input id="email" name="email" type="email" required autoComplete="email" className="input" placeholder="you@example.com" />
      </label>
      {state.error && <p className="text-sm text-bad" role="alert">{state.error}</p>}
      {state.info && <p className="text-sm text-obj" role="status">{state.info}</p>}
      <button className="btn py-3 text-[15px]" disabled={pending || !configured}>
        {pending ? "กำลังส่ง…" : "ส่งลิงก์ตั้งรหัสผ่านใหม่"}
      </button>
    </form>
  );
}

export function ResetForm() {
  const [state, action, pending] = useActionState(updatePassword, {} as AuthState);
  return (
    <form action={action} className="card flex flex-col gap-4 p-6">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        รหัสผ่านใหม่
        <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="input" placeholder="อย่างน้อย 8 ตัวอักษร" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        พิมพ์รหัสผ่านใหม่อีกครั้ง
        <input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" className="input" />
      </label>
      {state.error && <p className="text-sm text-bad" role="alert">{state.error}</p>}
      <button className="btn py-3 text-[15px]" disabled={pending}>
        {pending ? "กำลังบันทึก…" : "ตั้งรหัสผ่านใหม่"}
      </button>
    </form>
  );
}
