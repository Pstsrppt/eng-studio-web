import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";
import { hasSupabase } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "เข้าสู่ระบบ" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-5 pt-4 lg:pt-12">
      <header>
        <p className="eyebrow">บัญชีผู้เรียน</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">เข้าสู่ระบบ</h1>
        <p className="mt-2 text-sm text-muted">เข้าสู่ระบบแล้วเว็บจะจำบทที่ผ่าน คำที่ต้องทวน และข้อที่ผิดบ่อยไว้ให้ ใช้ได้ทุกเครื่อง</p>
      </header>
      {!hasSupabase && (
        <p className="rounded-lg bg-bad-bg px-4 py-3 text-sm text-bad">
          ยังไม่ได้ใส่ค่า Supabase ในไฟล์ .env.local ดูขั้นตอนใน README.md ระหว่างนี้เรียนได้ทุกหน้า แต่จะยังไม่บันทึกความคืบหน้า
        </p>
      )}
      <LoginForm configured={hasSupabase} />
    </div>
  );
}
