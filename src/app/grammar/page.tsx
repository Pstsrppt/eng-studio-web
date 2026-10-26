import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AcademicPage, PageHeader } from "@/components/academic-page";
import { LESSONS, LEVELS, PASS_MARK } from "@/content";
import { lessonWords } from "@/content/lesson-words";
import { getLessonBest } from "@/lib/data";

export const metadata: Metadata = { title: "Grammar" };

export default function GrammarPage() {
  return (
    <AcademicPage className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <PageHeader eyebrow={`GRAMMAR · ${LESSONS.length} บท`} title="เรียนทีละบท คำศัพท์ ทฤษฎี ฝึก แล้วทดสอบ"
          lead={`แต่ละบทผ่านเมื่อได้ ${PASS_MARK}% ขึ้นไป เรียงจากโครงสร้างที่ใช้บ่อยที่สุดก่อน`} />
        <p className="max-w-[64ch] rounded-xl border border-(--ac-line) bg-white px-4 py-3 text-sm leading-6 text-(--ac-body)">
          <b className="font-semibold text-(--ac-navy)">ไม่ต้องรู้ศัพท์มาก่อน</b> ทุกบทเริ่มจากคำศัพท์ที่ใช้ในบท พร้อมความหมายและเสียงอ่าน แล้วค่อยเรียนทฤษฎี ฝึก และทดสอบ
        </p>
      </div>
      <Suspense fallback={<LessonList best={{}} />}>
        <LessonListWithProgress />
      </Suspense>
    </AcademicPage>
  );
}

async function LessonListWithProgress() {
  return <LessonList best={await getLessonBest()} />;
}

function LessonList({ best }: { best: Record<string, { best: number; passed: boolean }> }) {
  return (
    <>
      {LEVELS.filter((lv) => LESSONS.some((l) => l.level === lv.id)).map((lv) => {
        const lessons = LESSONS.filter((l) => l.level === lv.id);
        const passed = lessons.filter((l) => best[l.id]?.passed).length;
        return (
          <section key={lv.id} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold">{lv.name}</h2>
              <span className="font-mono text-xs text-muted tabular">ผ่าน {passed}/{lessons.length}</span>
            </div>
            <p className="-mt-2 text-sm text-muted">{lv.can}</p>
            <ol className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {lessons.map((l) => {
                const b = best[l.id];
                return (
                  <li key={l.id}>
                    <Link href={`/grammar/${l.id}`} className="card flex h-full items-start gap-3 p-4 transition hover:border-(--ac-navy)/40 hover:shadow-(--ac-shadow)">
                      <span
                        className={
                          "grid size-9 shrink-0 place-items-center rounded-lg font-mono text-xs " +
                          (b?.passed ? "bg-[#2e7d5b] text-white" : "bg-[#f4f1ea] text-(--ac-muted)")
                        }
                        aria-label={b?.passed ? "ผ่านแล้ว" : undefined}
                      >
                        {b?.passed ? "✓" : LESSONS.indexOf(l) + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[15px] font-semibold leading-snug">{l.title}</span>
                        <span className="mt-1 block font-mono text-[11px] text-muted">
                          {b ? `คะแนนสูงสุด ${b.best}%` : l.formula}
                        </span>
                        <span className="mt-1 block text-[12px] text-(--ac-gold-ink)">
                          {lessonWords(l.id).fresh.length > 0 ? `คำใหม่ ${lessonWords(l.id).fresh.length} คำ` : "ใช้คำที่เรียนแล้ว"}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </>
  );
}
