// The lesson page frame: the stage's lessons on the left, the lesson in the middle, and words and a
// tip on the right. Below 1280px the side columns fold into the page so nothing is squeezed.
import { ArrowLeftIcon, CheckIcon, ChevronDownIcon, ClockIcon, LightbulbIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import type { Lesson } from "@/content";
import { lessonWords } from "@/content/lesson-words";
import { stageOfLesson, type Stage, type StageItem } from "@/content/stages";
import { getLessonBest } from "@/lib/data";
import { LessonView } from "./lesson-view";
import { SpeakButton } from "./speak-button";

type Props = { lesson: Lesson; kind: "grammar" | "sounds"; passMark: number; next?: { href: string; title: string } };
const pad = (n: number) => String(n).padStart(2, "0");
const LEVEL_TH: Record<string, string> = { A1: "Beginner", A2: "Elementary", B1: "Intermediate", B2: "Upper-intermediate" };

export function LessonShell({ lesson, kind, passMark, next }: Props) {
  const found = stageOfLesson(lesson.id);
  const stage = found?.stage;
  const items = stage?.items ?? [];
  const index = found?.index ?? 0;
  const words = lessonWords(lesson.id);
  const minutes = items[index]?.minutes ?? 20;
  const tip = lesson.mistakes[0];
  const later = items.slice(index + 1, index + 4);

  return (
    <div className="page-bleed on-dark bg-navy text-white">
      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 pt-6 pb-32 sm:px-6 lg:pb-14 xl:grid-cols-[260px_minmax(0,1fr)_300px] xl:px-8">
        <aside className="xl:sticky xl:top-[78px] xl:max-h-[calc(100dvh-94px)] xl:self-start xl:overflow-y-auto" aria-label="บทเรียนในสถานีนี้">
          <StageNav stage={stage} items={items} current={lesson.id} />
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          <section className="relative isolate overflow-hidden rounded-3xl border border-white/10" aria-labelledby="lesson-title">
            {/* eslint-disable-next-line @next/next/no-img-element -- scene pre-sized to WebP in public/scenes */}
            <img src="/scenes/library-1600.webp" alt="" className="absolute inset-0 -z-10 size-full object-cover object-[70%_center]" />
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(7,24,43,0.95)_0%,rgba(7,24,43,0.82)_45%,rgba(7,24,43,0.25)_100%)]" aria-hidden />
            <div className="flex max-w-2xl flex-col gap-3 p-6 sm:p-9">
              <p className="font-mono text-xs tracking-[0.25em] text-gold">
                {stage ? `STAGE ${pad(stage.n)} · ` : ""}LESSON {pad(index + 1)}
              </p>
              <h1 id="lesson-title" className="font-brand text-[30px] leading-tight font-bold tracking-wide sm:text-[40px]">{lesson.title}</h1>
              <p className="text-[15px] leading-7 text-[#dce5ee]">{lesson.why}</p>
              <ul className="flex flex-wrap gap-2 text-xs">
                <li className="rounded-full border border-white/20 bg-navy/60 px-3 py-1">{kind === "grammar" ? "Grammar" : "Pronunciation"}</li>
                <li className="rounded-full border border-white/20 bg-navy/60 px-3 py-1">{lesson.level} · {LEVEL_TH[lesson.level] ?? lesson.level}</li>
                <li className="flex items-center gap-1 rounded-full border border-white/20 bg-navy/60 px-3 py-1"><ClockIcon className="size-3" aria-hidden />ประมาณ {minutes} นาที</li>
              </ul>
              <p className="w-fit rounded-lg bg-navy/80 px-3 py-2 font-mono text-[13px] text-gold-soft">{lesson.formula}</p>
              <a href="#lesson-content" className="btn mt-1 self-start px-5 py-3">Continue Learning ↓</a>
            </div>
          </section>

          <div id="lesson-content" className="on-light scroll-mt-20 rounded-3xl bg-paper p-4 text-ink sm:p-6">
            <LessonView key={lesson.id} lesson={lesson} words={words} passMark={passMark} next={next} />
          </div>
        </div>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-[78px] xl:self-start" aria-label="ข้อมูลประกอบบทเรียน">
          {later.length > 0 && (
            <section className="glass p-4" aria-labelledby="up-next">
              <h2 id="up-next" className="mb-2 font-mono text-[11px] tracking-[0.25em] text-gold">NEXT IN THIS STAGE</h2>
              <ol className="flex flex-col gap-2">
                {later.map((item) => (
                  <li key={item.id}>
                    <Link href={item.href} className="flex items-center gap-3 rounded-xl border border-white/10 p-2 transition hover:bg-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element -- scene pre-sized to WebP in public/scenes */}
                      <img src="/scenes/library-900.webp" alt="" className="h-11 w-14 shrink-0 rounded-lg object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-white">{item.title}</span>
                        <span className="text-xs text-mist">{item.minutes} นาที</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          )}
          {words.fresh.length > 0 && (
            <section className="glass p-4" aria-labelledby="vocab-preview">
              <h2 id="vocab-preview" className="mb-2 font-mono text-[11px] tracking-[0.25em] text-gold">VOCABULARY</h2>
              <ul className="flex flex-col divide-y divide-white/10">
                {words.fresh.slice(0, 5).map(({ word }) => (
                  <li key={word.id} className="flex items-center gap-3 py-2">
                    <span className="min-w-0 flex-1">
                      <b className="block font-semibold text-white">{word.en}</b>
                      <span className="block truncate text-xs text-mist">{word.th}</span>
                    </span>
                    <span className="[&_button]:border-white/20 [&_button]:text-mist"><SpeakButton text={word.en} /></span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-mist">บทนี้มีคำใหม่ {words.fresh.length} คำ ดูทั้งหมดได้ในแท็บ Learn</p>
            </section>
          )}
          {tip && (
            <section className="glass p-4" aria-labelledby="coach-tip">
              <h2 id="coach-tip" className="mb-2 flex items-center gap-2 font-mono text-[11px] tracking-[0.25em] text-gold">
                <LightbulbIcon className="size-4" aria-hidden /> COACH TIP
              </h2>
              <p className="text-sm leading-6 text-[#dce5ee]">
                ระวังจุดที่คนไทยพลาดบ่อย: <s className="text-[#ff9c8f]">{tip[0]}</s> → <b className="text-[#7fe0b8]">{tip[1]}</b>
              </p>
              <p className="mt-1 text-xs leading-5 text-mist">{tip[2]}</p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function StageNav({ stage, items, current }: { stage?: Stage; items: StageItem[]; current: string }) {
  const list = (
    <Suspense fallback={<Timeline items={items} current={current} passed={new Set()} />}>
      <TimelineWithProgress items={items} current={current} />
    </Suspense>
  );
  return (
    <div className="glass flex flex-col gap-3 p-4">
      <Link href={stage ? `/roadmap?stage=${stage.id}` : "/roadmap"} className="flex items-center gap-1.5 text-sm text-mist hover:text-white">
        <ArrowLeftIcon className="size-4" aria-hidden /> Back to Roadmap
      </Link>
      {stage && (
        <div>
          <p className="font-mono text-[11px] tracking-[0.25em] text-gold">STAGE {pad(stage.n)} / 07</p>
          <p className="font-brand text-lg font-bold tracking-wide">{stage.title}</p>
        </div>
      )}
      {/* Phones and tablets: folded, so the lesson comes first. */}
      <details className="group xl:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-white/15 px-3 py-2 text-sm">
          บทเรียนในสถานีนี้ ({items.length}) <ChevronDownIcon className="size-4 transition group-open:rotate-180" aria-hidden />
        </summary>
        <div className="mt-2">{list}</div>
      </details>
      <div className="hidden xl:block">{list}</div>
    </div>
  );
}

async function TimelineWithProgress({ items, current }: { items: StageItem[]; current: string }) {
  const best = await getLessonBest();
  const passed = new Set(Object.keys(best).filter((id) => best[id].passed));
  return <Timeline items={items} current={current} passed={passed} />;
}

function Timeline({ items, current, passed }: { items: StageItem[]; current: string; passed: Set<string> }) {
  const tracked = items.filter((i) => i.lessonId);
  const done = tracked.filter((i) => passed.has(i.lessonId!)).length;
  const percent = tracked.length ? Math.round((done / tracked.length) * 100) : 0;
  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="flex justify-between text-xs text-mist"><span>Stage progress</span><span className="tabular">{done}/{tracked.length}</span></div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gold" style={{ width: `${percent}%` }} /></div>
      </div>
      <ol className="relative flex flex-col">
        <span className="absolute top-3 bottom-3 left-[13px] w-px bg-white/15" aria-hidden />
        {items.map((item, i) => {
          const on = item.lessonId === current;
          const ok = item.lessonId ? passed.has(item.lessonId) : false;
          return (
            <li key={item.id} className="relative">
              <Link href={item.href} aria-current={on ? "page" : undefined}
                className={"flex items-start gap-3 rounded-lg py-2 pr-2 text-sm transition " + (on ? "bg-gold/15 text-white" : "text-mist hover:text-white")}>
                <span className={"relative z-10 grid size-[27px] shrink-0 place-items-center rounded-full text-[11px] font-semibold " +
                  (on ? "bg-gold text-navy" : ok ? "bg-[#7fe0b8] text-navy" : "border border-white/25 bg-navy-2")}>
                  {ok && !on ? <CheckIcon className="size-3.5" aria-label="ผ่านแล้ว" /> : pad(i + 1)}
                </span>
                <span className={"pt-1 leading-5 " + (on ? "font-semibold" : "")}>{item.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
