import { ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { IeltsIntro } from "@/components/ielts-intro";

export const metadata: Metadata = { title: "IELTS คืออะไร" };

/** Stage 1 of the roadmap: what the test is, before any preparation. */
export default function IeltsPage() {
  return (
    <div className="page-bleed on-dark bg-navy px-4 pt-10 pb-32 text-white sm:px-6 lg:pb-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:px-4">
        <header>
          <Link href="/roadmap" className="text-sm text-mist hover:text-white">← Roadmap · Stage 01</Link>
          <h1 className="mt-3 font-brand text-3xl font-bold tracking-wide sm:text-4xl">What is IELTS?</h1>
          <p className="mt-2 max-w-[62ch] text-mist">รู้จักข้อสอบก่อนเริ่มเตรียมตัว: วัดอะไร มีกี่แบบ และ Band คิดอย่างไร</p>
        </header>
        <IeltsIntro headingLevel={2} />
        <div className="glass flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="font-semibold">ขั้นต่อไป: รู้ระดับของตัวเอง</p>
            <p className="text-sm text-mist">สอบวัดระดับ 5–8 นาที แล้วเว็บจะแนะนำบทที่ควรเริ่ม</p>
          </div>
          <Link href="/placement" className="btn">สอบวัดระดับ <ArrowRightIcon className="size-4" /></Link>
        </div>
      </div>
    </div>
  );
}
