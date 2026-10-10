import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ResetForm } from "@/components/password-forms";
import { getUser } from "@/lib/data";

export const metadata: Metadata = { title: "ตั้งรหัสผ่านใหม่" };

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-5 pt-4 lg:pt-12">
      <header>
        <p className="eyebrow">บัญชีผู้เรียน</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">ตั้งรหัสผ่านใหม่</h1>
      </header>
      <Suspense fallback={<div className="card h-56 animate-pulse" />}>
        <ResetOrExpired />
      </Suspense>
    </div>
  );
}

/** The reset link signs the learner in first, so no session means the link expired or was already used. */
async function ResetOrExpired() {
  const user = await getUser();
  if (!user) {
    return (
      <div className="card flex flex-col items-start gap-3 p-6 text-sm leading-6">
        <p>ลิงก์นี้หมดอายุหรือใช้ไปแล้ว หรือเปิดคนละเบราว์เซอร์กับที่กดขอลิงก์</p>
        <Link href="/forgot-password" className="btn">ขอลิงก์ใหม่</Link>
      </div>
    );
  }
  return (
    <>
      <p className="-mt-2 text-sm text-muted">สำหรับบัญชี {user.email}</p>
      <ResetForm />
    </>
  );
}
