import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AcademicPage, PageHeader } from "@/components/academic-page";
import { ResetForm } from "@/components/password-forms";
import { getUser } from "@/lib/data";

export const metadata: Metadata = { title: "ตั้งรหัสผ่านใหม่" };

export default function ResetPasswordPage() {
  return (
    <AcademicPage className="mx-auto flex max-w-md flex-col gap-5 pt-2 lg:pt-10">
      <PageHeader eyebrow="ACCOUNT · บัญชีผู้เรียน" title="ตั้งรหัสผ่านใหม่" />
      <Suspense fallback={<div className="card h-56 animate-pulse" />}>
        <ResetOrExpired />
      </Suspense>
    </AcademicPage>
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
