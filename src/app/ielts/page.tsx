import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AcademicPage, PageHeader } from "@/components/academic-page";
import { IeltsIntro } from "@/components/ielts-intro";
import { DISCLAIMER, TRADEMARK_NOTE } from "@/content/ielts-guide";

export const metadata: Metadata = { title: "IELTS คืออะไร" };

/** Stage 1 of the roadmap: what the test is, before any preparation. */
export default function IeltsPage() {
  return (
    <AcademicPage className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link href="/roadmap" className="inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-semibold text-(--ac-navy) hover:underline">
          <ArrowLeftIcon className="size-4" aria-hidden /> Roadmap · Stage 01
        </Link>
        <PageHeader eyebrow="STAGE 01 · WHAT IS IELTS?" title="What is IELTS?" lead="รู้จักข้อสอบก่อนเริ่มเตรียมตัว: วัดอะไร มีกี่แบบ และ Band คิดอย่างไร" />
      </div>
      <IeltsIntro headingLevel={2} />
      <section id="about-odyssey" className="card flex scroll-mt-24 flex-col gap-2 p-5 sm:p-6" aria-labelledby="about-odyssey-title">
        <h2 id="about-odyssey-title" className="ac-serif text-xl font-bold text-(--ac-heading)">เกี่ยวกับ Odyssey</h2>
        <p className="text-sm leading-6 text-(--ac-body)">{DISCLAIMER.th}</p>
        <p className="text-sm leading-6 text-(--ac-body)">{TRADEMARK_NOTE.th}</p>
        <p lang="en" className="text-sm leading-6 text-(--ac-muted)">{DISCLAIMER.en} {TRADEMARK_NOTE.en}</p>
        <p className="text-sm leading-6 text-(--ac-body)">คำอธิบาย Band ในเว็บนี้เป็นบทสรุปที่เราเขียนเองเพื่อวางแผนการเรียน ข้อเท็จจริงเรื่องรูปแบบสอบและการคิดคะแนนอ้างอิงจาก ielts.org พร้อมวันที่ตรวจ ควรตรวจกับศูนย์สอบอีกครั้งก่อนสมัคร</p>
      </section>
      <div className="card flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
        <div>
          <p className="font-semibold text-(--ac-heading)">ขั้นต่อไป: รู้ระดับของตัวเอง</p>
          <p className="text-sm text-(--ac-muted)">สอบวัดระดับ 5–8 นาที แล้วเว็บจะแนะนำบทที่ควรเริ่ม</p>
        </div>
        <Link href="/placement" className="btn">สอบวัดระดับ <ArrowRightIcon className="size-4" aria-hidden /></Link>
      </div>
    </AcademicPage>
  );
}
