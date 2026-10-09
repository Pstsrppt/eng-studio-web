import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LESSONS, LEVELS, PASS_MARK } from "@/content";
import { getLessonBest } from "@/lib/data";

export const metadata: Metadata = { title: "Grammar" };

export default function GrammarPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="eyebrow">Grammar · {LESSONS.length} บท</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">เรียนทีละบท ทฤษฎี ฝึก แล้วทดสอบ</h1>
        <p className="mt-2 max-w-[60ch] text-muted">
          แต่ละบทผ่านเมื่อได้ {PASS_MARK}% ขึ้นไป เรียงจากโครงสร้างที่ใช้บ่อยที่สุดก่อน
        </p>
      </header>
      <Suspense fallback={<LessonList best={{}} />}>
        <LessonListWithProgress />
      </Suspense>
    </div>
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
                    <Link href={`/grammar/${l.id}`} className="card flex h-full items-start gap-3 p-4 transition hover:border-brand">
                      <span
                        className={
                          "grid size-9 shrink-0 place-items-center rounded-lg font-mono text-xs " +
                          (b?.passed ? "bg-brand text-white" : "bg-subj-bg text-subj")
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
