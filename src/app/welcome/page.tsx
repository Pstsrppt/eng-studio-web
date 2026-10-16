import { BookOpenIcon, CheckIcon, LayersIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getUser } from "@/lib/data";

export const metadata: Metadata = { title: "ยืนยันอีเมลสำเร็จ" };

/** Where the sign-up confirmation link lands, so the learner sees it worked. */
export default function WelcomePage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 pt-6 text-center lg:pt-14">
      <span className="learn-in grid size-20 place-items-center rounded-full bg-obj text-white shadow-[0_14px_30px_-12px_rgba(14,122,87,0.6)]">
        <CheckIcon className="size-10" strokeWidth={2.5} aria-hidden />
      </span>
      <header>
        <p className="eyebrow">English Studio</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">ยืนยันอีเมลสำเร็จ</h1>
        <Suspense fallback={<p className="mt-2 text-muted">บัญชีของคุณพร้อมใช้งานแล้ว</p>}>
          <Who />
        </Suspense>
      </header>
      <div className="grid w-full gap-3 text-left sm:grid-cols-2">
        <Link href="/" className="card flex items-start gap-3 p-4 transition hover:border-brand">
          <BookOpenIcon className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
          <span><b className="block font-semibold">เริ่มบทเรียนแรก</b><span className="text-sm text-muted">ไวยากรณ์ทีละบท พร้อมแบบฝึกหัด</span></span>
        </Link>
        <Link href="/learn" className="card flex items-start gap-3 p-4 transition hover:border-brand">
          <LayersIcon className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
          <span><b className="block font-semibold">ฝึกคำศัพท์</b><span className="text-sm text-muted">การ์ดคำพร้อมภาพ เสียง และ Daily Quest</span></span>
        </Link>
      </div>
    </div>
  );
}

async function Who() {
  const user = await getUser();
  if (!user) {
    // Confirmed in another browser: the account is verified, this browser just isn't signed in.
    return (
      <p className="mt-2 text-muted">
        บัญชียืนยันแล้ว <Link href="/login" className="font-semibold text-brand underline">เข้าสู่ระบบ</Link> ด้วยอีเมลและรหัสผ่านเพื่อเริ่มใช้งาน
      </p>
    );
  }
  return <p className="mt-2 text-muted">เข้าสู่ระบบแล้วในชื่อ <b className="text-ink">{user.email}</b> ความคืบหน้าจะถูกบันทึกทุกเครื่อง</p>;
}
