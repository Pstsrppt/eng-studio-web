import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/login-form";
import { hasGoogle, hasSupabase } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "เข้าสู่ระบบ" };

export default function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; signedout?: string }> }) {
  return (
    <AuthShell tabs="login" title="ยินดีต้อนรับกลับ" lead="เข้าสู่ระบบเพื่อเรียนต่อจากบทล่าสุด">
      {!hasSupabase && (
        <p className="rounded-xl border border-[#f3c3bd] bg-bad-bg px-4 py-3 text-sm text-bad">
          ยังไม่ได้ใส่ค่า Supabase ในไฟล์ .env.local ดูขั้นตอนใน README.md ระหว่างนี้เรียนได้ทุกหน้า แต่จะยังไม่บันทึกความคืบหน้า
        </p>
      )}
      <Suspense fallback={null}>
        <LinkNotice searchParams={searchParams} />
      </Suspense>
      <LoginForm configured={hasSupabase} google={hasGoogle} />
    </AuthShell>
  );
}

/** Explains why an email link landed here instead of signing the learner in. */
async function LinkNotice({ searchParams }: { searchParams: Promise<{ error?: string; signedout?: string }> }) {
  const { error, signedout } = await searchParams;
  if (signedout) return <p role="status" className="rounded-xl border border-[#b9dccb] bg-obj-bg px-4 py-3 text-sm text-obj">ออกจากระบบแล้ว ความคืบหน้าทั้งหมดยังบันทึกอยู่ เข้าสู่ระบบอีกครั้งเมื่อไหร่ก็เรียนต่อได้</p>;
  if (error !== "confirm") return null;
  return (
    <div role="alert" className="rounded-xl border border-(--ac-gold-soft) bg-accent-wash px-4 py-3 text-sm leading-6">
      <b className="font-semibold">ลิงก์ยืนยันพาเข้าสู่ระบบอัตโนมัติไม่ได้</b>
      <ul className="mt-1 list-disc pl-5">
        <li>ถ้าเปิดลิงก์จากอีกเครื่องหรืออีกแอป (เช่น สมัครบนคอม แต่กดลิงก์ใน Gmail บนมือถือ) อีเมลมักยืนยันแล้ว ลองเข้าสู่ระบบด้วยอีเมลและรหัสผ่านด้านล่างได้เลย</li>
        <li>ถ้าลิงก์หมดอายุหรือเคยกดไปแล้ว ให้กรอกอีเมลและรหัสผ่านเดิมอีกครั้ง ระบบจะบอกว่าต้องยืนยันใหม่หรือไม่</li>
      </ul>
    </div>
  );
}
