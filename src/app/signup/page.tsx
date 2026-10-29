import type { Metadata } from "next";
import { AcademicPage, PageHeader } from "@/components/academic-page";
import { SignupForm } from "@/components/signup-form";
import { hasSupabase } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "สมัครสมาชิกฟรี" };

export default function SignupPage() {
  return (
    <AcademicPage className="mx-auto flex max-w-md flex-col gap-5 pt-2 lg:pt-10">
      <PageHeader eyebrow="ACCOUNT · สมัครสมาชิก" title="สมัครสมาชิกฟรี"
        lead="ใช้อีเมลและรหัสผ่าน แล้วเว็บจะจำบทที่ผ่าน คำที่ต้องทวน และข้อที่ผิดบ่อยไว้ให้ ใช้ได้ทุกเครื่อง" />
      {!hasSupabase && (
        <p className="rounded-xl border border-[#f3c3bd] bg-bad-bg px-4 py-3 text-sm text-bad">
          ยังไม่ได้ใส่ค่า Supabase ในไฟล์ .env.local ดูขั้นตอนใน README.md
        </p>
      )}
      <SignupForm configured={hasSupabase} />
    </AcademicPage>
  );
}
