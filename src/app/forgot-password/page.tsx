import type { Metadata } from "next";
import Link from "next/link";
import { ForgotForm } from "@/components/password-forms";
import { hasSupabase } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "ลืมรหัสผ่าน" };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-5 pt-4 lg:pt-12">
      <header>
        <p className="eyebrow">บัญชีผู้เรียน</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">ลืมรหัสผ่าน</h1>
        <p className="mt-2 text-sm text-muted">
          ใส่อีเมลที่ใช้สมัคร ระบบจะส่งลิงก์ให้ตั้งรหัสผ่านใหม่ คะแนนและการ์ดที่สะสมไว้ยังอยู่ครบ
        </p>
      </header>
      <ForgotForm configured={hasSupabase} />
      <p className="text-sm text-muted">
        นึกออกแล้ว? <Link href="/login" className="font-semibold text-brand underline underline-offset-2">กลับไปหน้าเข้าใช้งาน</Link>
      </p>
    </div>
  );
}
