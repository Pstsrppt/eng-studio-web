import type { Metadata } from "next";
import Link from "next/link";
import { AcademicPage, PageHeader } from "@/components/academic-page";
import { ForgotForm } from "@/components/password-forms";
import { hasSupabase } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "ลืมรหัสผ่าน" };

export default function ForgotPasswordPage() {
  return (
    <AcademicPage className="mx-auto flex max-w-md flex-col gap-5 pt-2 lg:pt-10">
      <PageHeader eyebrow="ACCOUNT · บัญชีผู้เรียน" title="ลืมรหัสผ่าน"
        lead="ใส่อีเมลที่ใช้สมัคร ระบบจะส่งลิงก์ให้ตั้งรหัสผ่านใหม่ คะแนนและการ์ดที่สะสมไว้ยังอยู่ครบ" />
      <ForgotForm configured={hasSupabase} />
      <p className="text-sm text-muted">
        นึกออกแล้ว? <Link href="/login" className="font-semibold text-brand underline underline-offset-2">กลับไปหน้าเข้าใช้งาน</Link>
      </p>
    </AcademicPage>
  );
}
