import { ArrowRightIcon, BookOpenIcon, CheckIcon, LayersIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { getUser } from "@/lib/data";

export const metadata: Metadata = { title: "ยืนยันอีเมลสำเร็จ" };

const WELCOME = { eyebrow: "WELCOME TO ODYSSEY", lead: "บัญชีพร้อมแล้ว เลือกเริ่มจากบทเรียนหรือคำศัพท์ก็ได้ ความคืบหน้าจะถูกบันทึกให้ทุกเครื่อง" };

/** Where the sign-up confirmation link lands, so the learner sees it worked. */
export default function WelcomePage() {
  return (
    <AuthShell title="ยืนยันอีเมลสำเร็จ" editorial={WELCOME}
      lead={<Suspense fallback={<span>บัญชีของคุณพร้อมใช้งานแล้ว</span>}><Who /></Suspense>}>
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

async function Who() {
  const user = await getUser();
  if (!user) {
    // Confirmed in another browser: the account is verified, this browser just isn't signed in.
    return <>บัญชียืนยันแล้ว <Link href="/login" className="font-semibold text-(--ac-navy) underline">เข้าสู่ระบบ</Link> ด้วยอีเมลและรหัสผ่านเพื่อเริ่มใช้งาน</>;
  }
  return <>เข้าสู่ระบบแล้วในชื่อ <b className="text-(--ac-ink)">{user.email}</b> ความคืบหน้าจะถูกบันทึกทุกเครื่อง</>;
}
