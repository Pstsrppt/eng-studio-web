import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AcademicPage, PageHeader } from "@/components/academic-page";
import { PASS_MARK, SOUNDS } from "@/content";
import { getLessonBest } from "@/lib/data";

export const metadata: Metadata = { title: "ออกเสียง" };

export default function SoundsPage() {
  return (
    <AcademicPage className="flex flex-col gap-8">
      <PageHeader eyebrow={`PRONUNCIATION · ออกเสียง · ${SOUNDS.length} บท`} title="เสียงที่คนไทยพลาดบ่อย"
        lead={`ออกเสียงถูก คนฟังเข้าใจ และเราก็ฟังเขาออกง่ายขึ้น เรียนแบบเดียวกับ Grammar ผ่านเมื่อได้ ${PASS_MARK}% ขึ้นไป`} />
      <Suspense fallback={<SoundList best={{}} />}>
        <SoundListWithProgress />
      </Suspense>
    </AcademicPage>
  );
}

async function SoundListWithProgress() {
  return <SoundList best={await getLessonBest()} />;
}

function SoundList({ best }: { best: Record<string, { best: number; passed: boolean }> }) {
  return (
    <ol className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
      {SOUNDS.map((l, i) => {
        const b = best[l.id];
        return (
          <li key={l.id}>
            <Link href={`/sounds/${l.id}`} className="card flex h-full items-start gap-3 p-4 transition hover:border-(--ac-navy)/40 hover:shadow-(--ac-shadow)">
              <span
                className={
                  "grid size-9 shrink-0 place-items-center rounded-lg font-mono text-xs " +
                  (b?.passed ? "bg-[#2e7d5b] text-white" : "bg-[#f4f1ea] text-(--ac-muted)")
                }
                aria-label={b?.passed ? "ผ่านแล้ว" : undefined}
              >
                {b?.passed ? "✓" : i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold leading-snug">{l.title}</span>
                <span className="mt-1 block text-[13px] leading-5 text-muted">
                  {b ? `คะแนนสูงสุด ${b.best}%` : l.why}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
