import { AudioLinesIcon, BookMarkedIcon, BookOpenIcon, RepeatIcon, ChevronRightIcon, GaugeIcon, LayersIcon, LogOutIcon, RotateCcwIcon, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/app/actions";
import { getUser } from "@/lib/data";

export const metadata: Metadata = { title: "บัญชีของฉัน" };

/** The account menu. Phones reach it from the header; it holds what the desktop sidebar shows. */
export default function AccountPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 pt-2 lg:pt-10">
      <header>
        <p className="eyebrow">บัญชีผู้เรียน</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">บัญชีของฉัน</h1>
      </header>
      <Suspense fallback={<div className="card h-24 animate-pulse" />}>
        <Who />
      </Suspense>
      <nav aria-label="เมนูเพิ่มเติม" className="card divide-y divide-line">
        <Row href="/grammar" icon={BookMarkedIcon} title="บทเรียนทั้งหมด" sub="ไวยากรณ์ A1–B2 ทีละบท" />
        <Row href="/verbs" icon={RepeatIcon} title="V1-V2-V3" sub="กริยาผันไม่ปกติ ฝึกพิมพ์และตาราง" />
        <Row href="/sounds" icon={AudioLinesIcon} title="ออกเสียง" sub="เสียงที่คนไทยมักออกผิด" />
        <Row href="/mistakes" icon={RotateCcwIcon} title="ทบทวนข้อผิด" sub="ทำข้อที่เคยตอบผิดซ้ำจนถูก" />
        <Row href="/learn" icon={LayersIcon} title="ฝึกศัพท์" sub="Smart Flashcard และ Daily Quest" />
        <Row href="/placement" icon={GaugeIcon} title="สอบวัดระดับ" sub="รู้ระดับ A1–B2 และบทที่ควรเริ่ม" />
        <Row href="/guide" icon={BookOpenIcon} title="คู่มือ" sub="n. v. adj. V3 กริยาช่วย คืออะไร" />
      </nav>
    </div>
  );
}

function Row({ href, icon: Icon, title, sub }: { href: string; icon: LucideIcon; title: string; sub: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-paper">
      <Icon className="size-5 shrink-0 text-brand" aria-hidden />
      <span className="min-w-0 flex-1"><b className="block font-semibold">{title}</b><span className="text-xs text-muted">{sub}</span></span>
      <ChevronRightIcon className="size-4 text-muted" aria-hidden />
    </Link>
  );
}

async function Who() {
  const user = await getUser();
  if (!user) {
    return (
      <div className="card flex flex-col items-start gap-3 p-5">
        <p className="text-sm text-muted">ยังไม่ได้เข้าสู่ระบบ เข้าสู่ระบบแล้วเว็บจะจำบทที่ผ่าน คำที่ต้องทวน และ XP ให้ทุกเครื่อง</p>
        <Link href="/login" className="btn">เข้าสู่ระบบ</Link>
      </div>
    );
  }
  return (
    <div className="card flex flex-col gap-4 p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ink font-display text-lg font-bold text-mark" aria-hidden>
          {user.email.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted">เข้าสู่ระบบในชื่อ</p>
          <p className="truncate font-semibold">{user.email}</p>
        </div>
      </div>
      <form action={signOut}>
        <button type="submit" className="btn-ghost w-full border-[#f3c3bd]! text-bad! hover:bg-bad-bg!">
          <LogOutIcon className="size-4" aria-hidden /> ออกจากระบบ
        </button>
      </form>
    </div>
  );
}
