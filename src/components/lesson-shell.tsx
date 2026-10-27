// The lesson page frame: the stage's lessons on the left, the lesson in the middle, and words and a
// tip on the right. Below 1280px the side columns fold into the page so nothing is squeezed.
// Academic Studio theme (scoped by .theme-academic), like Home and Roadmap.
import { ArrowLeftIcon, BookOpenIcon, CheckIcon, ChevronDownIcon, ClockIcon, LightbulbIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import type { Lesson } from "@/content";
import { lessonWords } from "@/content/lesson-words";
import { stageOfLesson, type Stage, type StageItem } from "@/content/stages";
import { getLessonBest } from "@/lib/data";
import { AcademicPhoto } from "./academic-photo";
import { LessonView } from "./lesson-view";
import { SpeakButton } from "./speak-button";
import { STAGE_LOOK } from "./stage-look";

type Props = { lesson: Lesson; kind: "grammar" | "sounds"; passMark: number; next?: { href: string; title: string } };
const pad = (n: number) => String(n).padStart(2, "0");
const LEVEL_TH: Record<string, string> = { A1: "Beginner", A2: "Elementary", B1: "Intermediate", B2: "Upper-intermediate" };
const card = "rounded-2xl border border-(--ac-line) bg-card shadow-(--ac-shadow)";

export function LessonShell({ lesson, kind, passMark, next }: Props) {
  const found = stageOfLesson(lesson.id);
  const stage = found?.stage;
  const items = stage?.items ?? [];
  const index = found?.index ?? 0;
  const words = lessonWords(lesson.id);
  const minutes = items[index]?.minutes ?? 20;
  const tips = lesson.mistakes.slice(0, 2);
  const later = items.slice(index + 1, index + 4);
  // What this lesson covers, counted from its own content (no invented goals).
  const objectives = [
    `เข้าใจรูปแบบ: ${lesson.formula}`,
    `ดูการใช้จริงจากประโยคตัวอย่าง ${lesson.examples.length} ประโยค`,
    lesson.mistakes.length ? `รู้จุดที่คนไทยพลาดบ่อย ${lesson.mistakes.length} จุด` : null,
    `ฝึก ${lesson.practice.length} ข้อ แล้วทำ Quiz ${lesson.quiz.length} ข้อ ผ่าน ${passMark}% เพื่อปลดบทนี้`,
  ].filter(Boolean) as string[];
  const StageIcon = stage ? STAGE_LOOK[stage.id].Icon : BookOpenIcon;

  return (
    <div className="theme-academic page-bleed bg-(--ac-bg) text-(--ac-ink)">
      <div className="mx-auto grid max-w-[1520px] gap-6 px-4 pt-6 pb-32 sm:px-6 lg:pb-16 xl:grid-cols-[260px_minmax(0,1fr)_290px] xl:px-10 2xl:px-12">
        <aside className="xl:sticky xl:top-[86px] xl:max-h-[calc(100dvh-102px)] xl:self-start xl:overflow-y-auto" aria-label="บทเรียนในสถานีนี้">
          <StageNav stage={stage} items={items} current={lesson.id} />
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          <section className={"relative isolate overflow-hidden " + card} aria-labelledby="lesson-title">
            <div className="absolute inset-y-0 right-0 -z-10 hidden w-[52%] md:block">
              <AcademicPhoto name="lesson-banner" fallback="skill-reading" alt="" icon={BookOpenIcon} className="size-full object-[50%_45%]" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--ac-surface)_0%,color-mix(in_srgb,var(--ac-surface)_75%,transparent)_30%,transparent_70%)]" aria-hidden />
            </div>
            <div className="flex max-w-[640px] flex-col gap-3 p-6 sm:p-9">
              <p className="font-mono text-xs tracking-[0.2em] text-(--ac-gold-ink)">
                {stage ? `STAGE ${pad(stage.n)} · ` : ""}LESSON {pad(index + 1)}
              </p>
              <h1 id="lesson-title" className="ac-serif text-[30px] leading-[1.12] font-bold text-(--ac-heading) sm:text-[40px]">{lesson.title}</h1>
              <p className="text-[16px] leading-7 text-(--ac-body)">{lesson.why}</p>
              <ul className="flex flex-wrap gap-2 text-[13px]">
                <li className="rounded-full border border-(--ac-line) bg-card/90 px-3 py-1 text-(--ac-body)">{kind === "grammar" ? "Grammar" : "Pronunciation"}</li>
                <li className="rounded-full border border-(--ac-line) bg-card/90 px-3 py-1 text-(--ac-body)">{lesson.level} · {LEVEL_TH[lesson.level] ?? lesson.level}</li>
                <li className="flex items-center gap-1 rounded-full border border-(--ac-line) bg-card/90 px-3 py-1 text-(--ac-body)"><ClockIcon className="size-3.5" aria-hidden />ประมาณ {minutes} นาที</li>
              </ul>
              <p className="w-fit rounded-lg border border-(--ac-line) bg-tint px-3 py-2 font-mono text-[13px] text-(--ac-heading)">{lesson.formula}</p>
              <a href="#lesson-content" className="mt-1 inline-flex w-fit items-center gap-2 rounded-lg bg-(--ac-navy) px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-(--ac-navy-2)">Continue Learning ↓</a>
            </div>
          </section>

          <section aria-labelledby="objectives" className="rounded-2xl border border-(--ac-line) bg-card/70 px-6 py-5">
            <h2 id="objectives" className="text-sm font-semibold text-(--ac-heading)">ในบทนี้คุณจะได้</h2>
            <ul className="mt-2 grid gap-x-6 gap-y-1.5 text-[15px] leading-6 text-(--ac-body) sm:grid-cols-2">
              {objectives.map((o) => (
                <li key={o} className="flex gap-2"><CheckIcon className="mt-1 size-4 shrink-0 text-(--ac-gold)" aria-hidden /><span className="min-w-0 break-words">{o}</span></li>
              ))}
            </ul>
          </section>

          <div id="lesson-content" className={"scroll-mt-24 p-4 sm:p-6 " + card}>
            <LessonView key={lesson.id} lesson={lesson} words={words} passMark={passMark} next={next} />
          </div>
        </div>

        {/* Supporting material: quieter than the lesson (smaller headings, muted cards); below 1280px it follows the lesson. */}
        <aside className="grid gap-5 md:grid-cols-2 xl:sticky xl:top-[86px] xl:flex xl:flex-col xl:self-start" aria-label="ข้อมูลประกอบบทเรียน">
          {later.length > 0 && (
            <section className={"p-5 " + card} aria-labelledby="up-next">
              <h2 id="up-next" className="ac-serif text-[17px] font-bold text-(--ac-heading)">Lessons in This Stage</h2>
              <p className="mb-3 text-xs text-(--ac-muted)">บทถัดไป · ทั้งหมด {items.length} รายการ</p>
              <ol className="flex flex-col gap-2">
                {later.map((item) => (
                  <li key={item.id}>
                    <Link href={item.href} className="flex items-center gap-3 rounded-xl border border-(--ac-line) p-2.5 transition hover:border-(--ac-navy)/30 hover:bg-(--ac-bg)">
                      <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-sunken text-(--ac-navy)"><StageIcon className="size-5" strokeWidth={1.6} aria-hidden /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-(--ac-ink)">{item.title}</span>
                        <span className="text-xs text-(--ac-muted)">{item.minutes} นาที</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
              <Link href={stage ? `/roadmap?stage=${stage.id}` : "/roadmap"} className="mt-3 inline-flex text-sm font-semibold text-(--ac-navy) hover:text-(--ac-gold-ink)">ดูทั้งหมดใน Roadmap →</Link>
            </section>
          )}
          {later.length === 0 && stage && (
            <section className={"p-5 " + card} aria-labelledby="up-next">
              <h2 id="up-next" className="ac-serif text-[17px] font-bold text-(--ac-heading)">Lessons in This Stage</h2>
              <p className="mt-1 text-sm leading-6 text-(--ac-body)">นี่คือบทสุดท้ายของ {stage.title} ผ่าน Quiz แล้วไปต่อสถานีถัดไปได้เลย</p>
              <Link href={`/roadmap?stage=${stage.id}`} className="mt-3 inline-flex text-sm font-semibold text-(--ac-navy) hover:text-(--ac-gold-ink)">ดูทั้งสถานีใน Roadmap →</Link>
            </section>
          )}
          {words.fresh.length > 0 && (
            <section className={"p-5 " + card} aria-labelledby="vocab-preview">
              <h2 id="vocab-preview" className="ac-serif mb-2 text-[17px] font-bold text-(--ac-heading)">Vocabulary Preview</h2>
              <ul className="flex flex-col divide-y divide-(--ac-line)">
                {words.fresh.slice(0, 5).map(({ word }) => (
                  <li key={word.id} className="flex items-center gap-3 py-2.5">
                    <span className="min-w-0 flex-1">
                      <b className="block font-semibold text-(--ac-heading)">{word.en}</b>
                      <span className="block truncate text-sm text-(--ac-muted)">{word.th}</span>
                    </span>
                    <SpeakButton text={word.en} />
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-(--ac-muted)">บทนี้มีคำใหม่ {words.fresh.length} คำ ดูทั้งหมดได้ในแท็บ Learn</p>
            </section>
          )}
          {tips.length > 0 && (
            <section className="rounded-2xl border border-(--ac-gold-bright)/40 bg-(--ac-gold-soft)/50 p-5" aria-labelledby="coach-tip">
              <h2 id="coach-tip" className="mb-2 flex items-center gap-2 text-sm font-semibold text-(--ac-heading)">
                <LightbulbIcon className="size-4 text-(--ac-gold)" aria-hidden /> Learning Tips
              </h2>
              <p className="text-xs text-(--ac-body)">จุดที่คนไทยพลาดบ่อยในบทนี้</p>
              <ul className="mt-2 flex flex-col gap-3">
                {tips.map(([wrong, right, note]) => (
                  <li key={wrong} className="text-sm leading-6 text-(--ac-ink)">
                    <s className="text-bad">{wrong}</s> → <b className="text-obj">{right}</b>
                    <span className="block text-xs leading-5 text-(--ac-body)">{note}</span>
                  </li>
                ))}
              </ul>
              <Link href="/guide" className="mt-3 inline-flex text-sm font-semibold text-(--ac-navy) hover:text-(--ac-gold-ink)">คู่มือศัพท์ไวยากรณ์ →</Link>
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
    <div className={"flex flex-col gap-4 p-5 " + card}>
      <Link href={stage ? `/roadmap?stage=${stage.id}` : "/roadmap"} className="flex items-center gap-1.5 text-sm font-medium text-(--ac-body) hover:text-(--ac-navy)">
        <ArrowLeftIcon className="size-4" aria-hidden /> Back to Roadmap
      </Link>
      {stage && (
        <div>
          <p className="font-mono text-[11px] tracking-[0.2em] text-(--ac-gold-ink)">STAGE {pad(stage.n)} / 07</p>
          <p className="ac-serif text-[20px] font-bold text-(--ac-heading)">{stage.title}</p>
        </div>
      )}
      {/* Phones and tablets: folded, so the lesson comes first. */}
      <details className="group xl:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-(--ac-line) px-3 py-2 text-sm text-(--ac-ink) [&::-webkit-details-marker]:hidden">
          บทเรียนในสถานีนี้ ({items.length}) <ChevronDownIcon className="size-4 transition group-open:rotate-180" aria-hidden />
        </summary>
        <div className="mt-3">{list}</div>
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
        <div className="flex justify-between text-xs text-(--ac-muted)"><span>Stage progress</span><span className="tabular">{done}/{tracked.length}</span></div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-page-alt"><div className="h-full rounded-full bg-(--ac-gold)" style={{ width: `${percent}%` }} /></div>
      </div>
      <ol className="relative flex flex-col">
        <span className="absolute top-3 bottom-3 left-[13px] w-px bg-(--ac-line)" aria-hidden />
        {items.map((item, i) => {
          const on = item.lessonId === current;
          const ok = item.lessonId ? passed.has(item.lessonId) : false;
          return (
            <li key={item.id} className="relative">
              <Link href={item.href} aria-current={on ? "page" : undefined}
                className={"flex items-start gap-3 rounded-lg py-2 pr-2 text-sm transition " + (on ? "bg-(--ac-gold-soft) text-(--ac-navy)" : "text-(--ac-body) hover:text-(--ac-navy)")}>
                <span className={"relative z-10 grid size-[27px] shrink-0 place-items-center rounded-full text-[11px] font-semibold " +
                  (on ? "bg-(--ac-navy) text-white" : ok ? "bg-[#2e7d5b] text-white" : "border border-(--ac-line) bg-card text-(--ac-muted)")}>
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
