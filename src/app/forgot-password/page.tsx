import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotForm } from "@/components/password-forms";
import { hasSupabase } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "ลืมรหัสผ่าน" };

const RECOVERY = { photo: null, eyebrow: "ACCOUNT RECOVERY", lead: "ตั้งรหัสผ่านใหม่ได้จากลิงก์ในอีเมล คะแนนและการ์ดที่สะสมไว้ยังอยู่ครบ" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="ลืมรหัสผ่าน" editorial={RECOVERY}
      lead="ใส่อีเมลที่ใช้สมัคร ระบบจะส่งลิงก์ให้ตั้งรหัสผ่านใหม่ คะแนนและการ์ดที่สะสมไว้ยังอยู่ครบ">
      <ForgotForm configured={hasSupabase} />
      <p className="text-center text-[15px] text-(--ac-body)">
        นึกออกแล้ว? <Link href="/login" className="font-semibold text-(--ac-navy) underline underline-offset-2">กลับไปเข้าสู่ระบบ</Link>
      </p>
    </AuthShell>
  );
}
