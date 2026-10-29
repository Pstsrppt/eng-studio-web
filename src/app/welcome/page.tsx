import { ArrowRightIcon, BookOpenIcon, CheckIcon, LayersIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { getUser } from "@/lib/data";

export const metadata: Metadata = { title: "ยินดีต้อนรับ" };

const WELCOME = { eyebrow: "WELCOME TO ODYSSEY", lead: "บัญชีพร้อมแล้ว เลือกเริ่มจากบทเรียนหรือคำศัพท์ก็ได้ ความคืบหน้าจะถูกบันทึกให้ทุกเครื่อง" };
const NEUTRAL = { title: "ยินดีต้อนรับสู่ Odyssey", lead: "เข้าสู่ระบบเพื่อเรียนต่อ หรือสมัครสมาชิกฟรีเพื่อบันทึกความคืบหน้า" };

/**
 * Where a confirmation link lands. /auth/callback and /auth/confirm only send the learner here after the link
 * worked and the session is set (a failed link goes to /login?error=confirm), so a session here means the
 * confirmation succeeded. Without one this was a direct visit, so the page doesn't say anything was verified.
 */
export default function WelcomePage() {
  return (
    <Suspense fallback={<AuthShell title={NEUTRAL.title}><div className="h-40 animate-pulse rounded-xl bg-sunken motion-reduce:animate-none" aria-busy="true" /></AuthShell>}>
      <Welcome />
    </Suspense>
  );
}

async function Welcome() {
  const user = await getUser();
  if (!user) {
    return (
      <AuthShell title={NEUTRAL.title} lead={NEUTRAL.lead}>
        <div className="flex flex-col gap-3">
          <Link href="/login" className="btn min-h-12 w-full text-[15px] font-semibold">เข้าสู่ระบบ</Link>
          <Link href="/signup" className="btn-ghost min-h-12 w-full text-[15px] font-semibold">สมัครสมาชิกฟรี</Link>
        </div>
        <p className="text-sm leading-6 text-(--ac-muted)">
          เพิ่งกดลิงก์ยืนยันในอีเมลจากอีกเครื่องหรืออีกแอป? เข้าสู่ระบบด้วยอีเมลและรหัสผ่านได้เลย ถ้าบัญชียังไม่ได้ยืนยัน ระบบจะบอกและส่งลิงก์ให้ใหม่
        </p>
      </AuthShell>
    );
  }
  return (
    <AuthShell title="ยืนยันอีเมลสำเร็จ" editorial={WELCOME}
      lead={<>เข้าสู่ระบบแล้วในชื่อ <b className="text-(--ac-ink)">{user.email}</b> ความคืบหน้าจะถูกบันทึกทุกเครื่อง</>}>
      <span className="grid size-14 place-items-center rounded-full bg-[#2e7d5b] text-white" aria-hidden>
        <CheckIcon className="size-7" strokeWidth={2.5} />
      </span>
      <div className="flex flex-col gap-3">
        <Link href="/roadmap" className="flex min-h-16 items-center gap-3 rounded-xl border border-(--ac-line) bg-card px-4 py-3 transition hover:border-(--ac-navy)/50">
          <BookOpenIcon className="size-5 shrink-0 text-(--ac-navy)" aria-hidden />
          <span className="min-w-0 flex-1"><b className="block font-semibold text-(--ac-heading)">เริ่มบทเรียนแรก</b><span className="text-sm text-(--ac-muted)">ไวยากรณ์ทีละบท พร้อมแบบฝึกหัด</span></span>
          <ArrowRightIcon className="size-4 shrink-0 text-(--ac-muted)" aria-hidden />
        </Link>
        <Link href="/learn" className="flex min-h-16 items-center gap-3 rounded-xl border border-(--ac-line) bg-card px-4 py-3 transition hover:border-(--ac-navy)/50">
          <LayersIcon className="size-5 shrink-0 text-(--ac-navy)" aria-hidden />
          <span className="min-w-0 flex-1"><b className="block font-semibold text-(--ac-heading)">ฝึกคำศัพท์</b><span className="text-sm text-(--ac-muted)">การ์ดคำพร้อมภาพ เสียง และ Daily Quest</span></span>
          <ArrowRightIcon className="size-4 shrink-0 text-(--ac-muted)" aria-hidden />
        </Link>
      </div>
    </AuthShell>
  );
}
