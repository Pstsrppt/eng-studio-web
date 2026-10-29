import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/signup-form";
import { hasSupabase } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "สมัครสมาชิกฟรี" };

export default function SignupPage() {
  return (
    <AuthShell tabs="signup" title="สมัครสมาชิกฟรี" lead="ใช้อีเมลและรหัสผ่าน เว็บจะบันทึกความคืบหน้าไว้ให้ทุกเครื่อง">
      {!hasSupabase && (
        <p className="rounded-xl border border-[#f3c3bd] bg-bad-bg px-4 py-3 text-sm text-bad">
          ยังไม่ได้ใส่ค่า Supabase ในไฟล์ .env.local ดูขั้นตอนใน README.md
        </p>
      )}
      <SignupForm configured={hasSupabase} />
    </AuthShell>
  );
}
