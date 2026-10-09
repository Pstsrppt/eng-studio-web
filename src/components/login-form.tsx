"use client";

import { useActionState } from "react";
import { signIn, signUp, type AuthState } from "@/app/actions";

export function LoginForm({ configured }: { configured: boolean }) {
  const [inState, inAction, inPending] = useActionState(signIn, {} as AuthState);
  const [upState, upAction, upPending] = useActionState(signUp, {} as AuthState);
  const state = upState.error || upState.info ? upState : inState;
  const pending = inPending || upPending;

  return (
    <form className="card flex flex-col gap-4 p-6">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        อีเมล
        <input id="email" name="email" type="email" required autoComplete="email" className="input" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        รหัสผ่าน
        <input id="password" name="password" type="password" required minLength={8} autoComplete="current-password" className="input" />
      </label>
      {state.error && <p className="text-sm text-bad" role="alert">{state.error}</p>}
      {state.info && <p className="text-sm text-obj" role="status">{state.info}</p>}
      <div className="grid grid-cols-2 gap-2">
        <button formAction={upAction} className="btn-ghost" disabled={pending || !configured}>สมัครใหม่</button>
        <button formAction={inAction} className="btn" disabled={pending || !configured}>{pending ? "รอสักครู่…" : "เข้าสู่ระบบ"}</button>
      </div>
    </form>
  );
}
