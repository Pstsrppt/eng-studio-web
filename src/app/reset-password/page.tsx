import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetForm } from "@/components/password-forms";
import { getUser } from "@/lib/data";

export const metadata: Metadata = { title: "ตั้งรหัสผ่านใหม่" };

const RECOVERY = { photo: null, eyebrow: "ACCOUNT RECOVERY", lead: "ตั้งรหัสผ่านใหม่ได้จากลิงก์ในอีเมล คะแนนและการ์ดที่สะสมไว้ยังอยู่ครบ" };

export default function ResetPasswordPage() {
  return (
    <AuthShell title="ตั้งรหัสผ่านใหม่" editorial={RECOVERY}>
      <Suspense fallback={<div className="h-56 animate-pulse rounded-xl bg-sunken motion-reduce:animate-none" />}>
        <ResetOrExpired />
      </Suspense>
    </AuthShell>
  );
}

/** The reset link signs the learner in first, so no session means the link expired or was already used. */
async function ResetOrExpired() {
  const user = await getUser();
  if (!user) {
    return (
      <div className="flex flex-col items-start gap-4 text-[15px] leading-7 text-(--ac-body)">
        <p>ลิงก์นี้หมดอายุหรือใช้ไปแล้ว หรือเปิดคนละเบราว์เซอร์กับที่กดขอลิงก์</p>
        <Link href="/forgot-password" className="btn min-h-12 w-full">ขอลิงก์ใหม่</Link>
        <Link href="/login" className="self-center text-[15px] font-semibold text-(--ac-navy) underline underline-offset-2">กลับไปเข้าสู่ระบบ</Link>
      </div>
    );
  }
  return (
    <>
      <p className="-mt-2 text-sm text-(--ac-muted)">สำหรับบัญชี {user.email}</p>
      <ResetForm />
    </>
  );
}
