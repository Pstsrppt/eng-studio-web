"use client";

import { ArrowRightIcon, CheckIcon, CircleDotIcon, ClockIcon, ListIcon, LockIcon, MapIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { STAGE_LOOK } from "@/components/stage-look";
import type { StageItem, StageProgress } from "@/content/stages";

type Props = {
  stages: StageProgress[];
  passed: string[];
  overall: { done: number; total: number; percent: number };
  level: string | null;
  signedIn: boolean;
  initialStage?: string;
  /** "world" is the path view (kept as the URL value so old links still work). */
  initialView: "world" | "list";
  /** The atmosphere photo strip, rendered on the server. */
  banner: React.ReactNode;
};

const STATUS: Record<StageProgress["status"], { th: string; tone: string }> = {
  done: { th: "ผ่านแล้ว", tone: "bg-[#e3f1ea] text-[#22694b]" },
  current: { th: "กำลังเรียน", tone: "bg-(--ac-gold-soft) text-accent-text" },
  todo: { th: "ยังไม่เริ่ม", tone: "bg-sunken text-(--ac-muted)" },
  open: { th: "เปิดอ่านได้", tone: "bg-tint text-(--ac-navy-2)" },
  soon: { th: "กำลังจัดทำ", tone: "bg-sunken text-(--ac-muted)" },
};
const pad = (n: number) => String(n).padStart(2, "0");

export function RoadmapView({ stages, passed, overall, level, signedIn, initialStage, initialView, banner }: Props) {
  const current = stages.find((s) => s.status === "current") ?? stages[1];
  const [selected, setSelected] = useState(initialStage ?? current.id);
  const [view, setView] = useState(initialView);
  const stage = stages.find((s) => s.id === selected) ?? current;
  const done = new Set(passed);

  function choose(id: string) {
    setSelected(id);
    // Keep the choice in the address, so reload and "back" return to the same station.
    const url = new URL(window.location.href);
    url.searchParams.set("stage", id);
    window.history.replaceState(null, "", url);
  }

  return (
    <div className="flex flex-col">
      <header className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">{banner}</div>
        {/* Phones: the title spans the whole width, so the photo is washed out evenly behind it. */}
        <div className="absolute inset-0 -z-10 bg-[color-mix(in_srgb,var(--ac-bg)_86%,transparent)] md:bg-[linear-gradient(90deg,var(--ac-bg)_0%,color-mix(in_srgb,var(--ac-bg)_92%,transparent)_30%,color-mix(in_srgb,var(--ac-bg)_55%,transparent)_55%,color-mix(in_srgb,var(--ac-bg)_10%,transparent)_80%)]" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-16 bg-[linear-gradient(180deg,transparent,var(--ac-bg))]" aria-hidden />
        <div className="mx-auto flex max-w-[1520px] flex-wrap items-end justify-between gap-5 px-4 pt-10 pb-10 sm:px-6 lg:px-10 lg:pt-14 lg:pb-14 2xl:px-12">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] tracking-[0.22em] text-(--ac-gold-ink)">YOUR LEARNING ROADMAP</p>
            <h1 className="ac-serif mt-2 text-[34px] leading-[1.1] font-bold text-(--ac-heading) sm:text-[44px]">From Foundation to Your Target Band</h1>
            <p className="mt-3 text-[17px] leading-7 text-(--ac-body)">Seven stages, one clear path. Choose a stage to see its lessons and where to continue.</p>
          </div>
          <div role="tablist" aria-label="มุมมอง" className="flex rounded-xl border border-(--ac-line) bg-card p-1 shadow-(--ac-shadow)">
            {([["world", "Stage Path", MapIcon], ["list", "Learning List", ListIcon]] as const).map(([id, label, Icon]) => (
              <button key={id} type="button" role="tab" aria-selected={view === id} onClick={() => setView(id)}
                className={"flex items-center gap-2 rounded-lg px-4 py-2 text-[15px] transition " + (view === id ? "bg-(--ac-navy) font-semibold text-white" : "text-(--ac-body) hover:bg-(--ac-gold-soft)")}>
                <Icon className="size-4" aria-hidden /> {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-6 px-4 pb-32 sm:px-6 lg:px-10 lg:pb-16 2xl:px-12">
        {view === "world" ? (
          <>
            <StagePath stages={stages} selected={stage.id} onChoose={choose} />
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,0.9fr)] lg:items-start">
              <StageCard stage={stage} signedIn={signedIn} />
              <LessonPreview stage={stage} done={done} />
              <MyProgress overall={overall} level={level} signedIn={signedIn} />
            </div>
          </>
        ) : (
          <LearningList stages={stages} done={done} selected={stage.id} />
        )}
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: StageProgress["status"] }) {
  const Icon = status === "done" ? CheckIcon : status === "current" ? CircleDotIcon : status === "soon" ? LockIcon : null;
  return (
    <span className={"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap " + STATUS[status].tone}>
      {Icon && <Icon className="size-3" aria-hidden />}{STATUS[status].th}
    </span>
  );
}

/** The seven stages in order. Selecting one updates the cards below without leaving the page. */
function StagePath({ stages, selected, onChoose }: { stages: StageProgress[]; selected: string; onChoose: (id: string) => void }) {
  return (
    <section aria-label="7 สถานีการเรียน" className="rounded-2xl border border-(--ac-line) bg-card p-5 shadow-(--ac-shadow) lg:px-8 lg:py-8">
      <ol className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:grid lg:grid-cols-7 lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0">
        {stages.map((s, i) => {
          const look = STAGE_LOOK[s.id];
          const on = s.id === selected;
          return (
            <li key={s.id} className="relative flex w-[150px] shrink-0 snap-start lg:w-auto">
              {i < stages.length - 1 && (
                <span className={"absolute top-10 left-[calc(50%+38px)] right-[calc(-50%+38px)] hidden h-0.5 rounded-full lg:block " + (s.status === "done" ? "bg-(--ac-gold-bright)" : "bg-(--ac-line)")} aria-hidden />
              )}
              <button type="button" onClick={() => onChoose(s.id)} aria-pressed={on} aria-label={`Stage ${s.n}: ${s.title} (${STATUS[s.status].th})`}
                className={"group flex w-full flex-col items-center gap-2.5 rounded-xl px-2 py-2 text-center transition " + (on ? "bg-(--ac-bg)" : "hover:bg-(--ac-bg)")}>
                <span className={"relative grid size-16 place-items-center rounded-full transition " +
                  (on ? "bg-(--ac-navy) text-white shadow-[0_0_0_6px_var(--ac-gold-soft)]" : "bg-sunken text-(--ac-navy) group-hover:bg-(--ac-gold-soft)")}>
                  <look.Icon className="size-7" strokeWidth={1.5} aria-hidden />
                  {s.status === "done" && <span className="absolute -right-1 -bottom-1 grid size-6 place-items-center rounded-full bg-[#2e7d5b] text-white ring-2 ring-card"><CheckIcon className="size-3.5" aria-hidden /></span>}
                </span>
                <span className="font-mono text-[11px] tracking-[0.16em] text-(--ac-gold-ink)">STAGE {pad(s.n)}</span>
                <span className="flex min-h-[2.5em] items-start text-[15px] leading-[1.25] font-semibold text-balance text-(--ac-heading)">{s.title}</span>
                <StatusChip status={s.status} />
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function StageCard({ stage, signedIn }: { stage: StageProgress; signedIn: boolean }) {
  const look = STAGE_LOOK[stage.id];
  return (
    <section key={stage.id} aria-labelledby="stage-title" className="learn-in relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-(--ac-dark) p-6 text-white lg:p-7">
      <look.Icon className="absolute -right-6 -bottom-6 size-40 text-white/5" strokeWidth={1} aria-hidden />
      <div className="relative flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs tracking-[0.18em] text-(--ac-gold-bright)">STAGE {pad(stage.n)} / 07</span>
        <StatusChip status={stage.status} />
      </div>
      <div className="relative">
        <h2 id="stage-title" className="ac-serif text-[28px] leading-tight font-bold">{stage.title}</h2>
        <p className="mt-1 text-sm text-(--ac-gold-bright)">{stage.th}</p>
      </div>
      <p className="relative text-[15px] leading-7 text-on-dark">{stage.blurb}</p>
      {stage.total > 0 && (
        <div className="relative">
          <div className="flex justify-between text-xs text-on-dark-muted"><span>Progress</span><span className="tabular">{stage.percent}% · {stage.done}/{stage.total} บท</span></div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-label={`ความคืบหน้า ${stage.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={stage.percent}>
            <div className="h-full rounded-full bg-(--ac-gold-bright) transition-[width] duration-700" style={{ width: `${stage.percent}%` }} />
          </div>
        </div>
      )}
      <div className="relative flex flex-col gap-2 pt-2">
        {stage.next ? (
          <>
            <Link href={stage.next.href} className="inline-flex w-fit items-center gap-2 rounded-lg bg-(--ac-gold-bright) px-5 py-3 text-[15px] font-semibold text-(--ac-navy) transition hover:bg-accent-on-dark-hover">
              {stage.done > 0 ? "Continue Learning" : "Start Stage"} <ArrowRightIcon className="size-4" aria-hidden />
            </Link>
            <span className="text-sm text-on-dark-muted">Next: <span className="text-white">{stage.next.title}</span></span>
          </>
        ) : (
          <p className="flex items-center gap-2 text-sm text-on-dark-muted"><LockIcon className="size-4" aria-hidden /> สถานีนี้กำลังจัดทำ ยังไม่มีบทเรียนให้เริ่ม</p>
        )}
        {!signedIn && stage.total > 0 && <p className="text-xs text-on-dark-muted">เรียนได้เลย แต่ต้องเข้าสู่ระบบเพื่อบันทึกบทที่ผ่าน</p>}
      </div>
    </section>
  );
}

function ItemRow({ item, done, n }: { item: StageItem; done: Set<string>; n: number }) {
  const passed = item.lessonId ? done.has(item.lessonId) : false;
  return (
    <li>
      <Link href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-(--ac-bg)">
        <span className={"grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold " + (passed ? "bg-[#2e7d5b] text-white" : "border border-(--ac-line) text-(--ac-muted)")}>
          {passed ? <CheckIcon className="size-4" aria-label="ผ่านแล้ว" /> : pad(n)}
        </span>
        <span className="min-w-0 flex-1 text-[15px] leading-6 text-(--ac-ink)">{item.title}</span>
        <span className="flex shrink-0 items-center gap-1 text-xs text-(--ac-muted)"><ClockIcon className="size-3.5" aria-hidden />{item.minutes} นาที</span>
      </Link>
    </li>
  );
}

function LessonPreview({ stage, done }: { stage: StageProgress; done: Set<string> }) {
  return (
    <section aria-labelledby="stage-lessons" className="flex max-h-[560px] flex-col rounded-2xl border border-(--ac-line) bg-card p-5 shadow-(--ac-shadow) lg:p-6">
      <div className="mb-2 flex items-baseline justify-between gap-3 px-3">
        <h2 id="stage-lessons" className="ac-serif text-[20px] font-bold text-(--ac-heading)">Lessons in this stage</h2>
        <span className="text-sm text-(--ac-muted)">{stage.items.length} รายการ</span>
      </div>
      {stage.items.length > 0 ? (
        <ol className="flex-1 divide-y divide-(--ac-line) overflow-y-auto">
          {stage.items.map((item, i) => <ItemRow key={item.id} item={item} done={done} n={i + 1} />)}
        </ol>
      ) : (
        <p className="px-3 py-4 text-[15px] text-(--ac-muted)">ยังไม่มีบทเรียนในสถานีนี้</p>
      )}
      {stage.soon && (
        <div className="mt-3 rounded-xl bg-(--ac-bg) p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-(--ac-heading)"><SparklesIcon className="size-4 text-(--ac-gold)" aria-hidden /> กำลังจัดทำ</p>
          <ul className="mt-1.5 flex flex-col gap-1 text-sm text-(--ac-body)">
            {stage.soon.map((s) => <li key={s}>· {s}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}

function Ring({ percent }: { percent: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 80 80" className="size-24 -rotate-90" aria-hidden>
      <circle cx="40" cy="40" r={r} fill="none" className="stroke-page-alt" strokeWidth="7" />
      <circle cx="40" cy="40" r={r} fill="none" className="stroke-accent" strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - percent / 100)} />
    </svg>
  );
}

function MyProgress({ overall, level, signedIn }: { overall: Props["overall"]; level: string | null; signedIn: boolean }) {
  return (
    <section aria-labelledby="my-progress" className="flex flex-col gap-4 rounded-2xl border border-(--ac-line) bg-card p-6 shadow-(--ac-shadow)">
      <h2 id="my-progress" className="ac-serif text-[20px] font-bold text-(--ac-heading)">My Progress</h2>
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <Ring percent={overall.percent} />
          <span className="ac-serif absolute inset-0 grid place-items-center text-2xl font-bold text-(--ac-heading)">{overall.percent}%</span>
        </div>
        <dl className="flex flex-col gap-2 text-sm">
          <div><dt className="text-(--ac-muted)">บทที่ผ่าน</dt><dd className="font-semibold text-(--ac-ink)">{overall.done} จาก {overall.total} บท</dd></div>
          <div><dt className="text-(--ac-muted)">ระดับ (สอบวัดระดับ)</dt><dd className="font-semibold text-(--ac-ink)">{level ? (level === "pre-A1" ? "ก่อน A1" : level) : "ยังไม่ได้สอบ"}</dd></div>
        </dl>
      </div>
      <p className="text-xs leading-5 text-(--ac-muted)">
        {signedIn ? "นับจากแบบทดสอบท้ายบทที่ผ่าน · ระดับเป็น CEFR ไม่ใช่ Band IELTS" : "เข้าสู่ระบบเพื่อให้เว็บจำบทที่ผ่าน"}
      </p>
      <Link href={signedIn ? (level ? "/today" : "/placement") : "/login"}
        className="inline-flex w-fit items-center gap-1.5 text-[15px] font-semibold text-(--ac-navy) hover:text-(--ac-gold-ink)">
        {signedIn ? (level ? "ดูแผนวันนี้" : "สอบวัดระดับ") : "เข้าสู่ระบบ"} <ArrowRightIcon className="size-4" aria-hidden />
      </Link>
    </section>
  );
}

function LearningList({ stages, done, selected }: { stages: StageProgress[]; done: Set<string>; selected: string }) {
  return (
    <ol className="grid gap-5 lg:grid-cols-2 lg:items-start">
      {stages.map((s) => {
        const look = STAGE_LOOK[s.id];
        return (
          <li key={s.id} id={`stage-${s.id}`} className={"flex flex-col gap-3 rounded-2xl border bg-card p-6 shadow-(--ac-shadow) " + (s.id === selected ? "border-(--ac-navy) ring-2 ring-(--ac-gold-soft)" : "border-(--ac-line)")}>
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-sunken text-(--ac-navy)"><look.Icon className="size-6" strokeWidth={1.5} aria-hidden /></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs tracking-[0.16em] text-(--ac-gold-ink)">STAGE {pad(s.n)}</span>
                  <StatusChip status={s.status} />
                </div>
                <h2 className="ac-serif mt-1 text-[22px] font-bold text-(--ac-heading)">{s.title}</h2>
                <p className="text-sm text-(--ac-muted)">{s.th}</p>
              </div>
              {s.total > 0 && <span className="shrink-0 font-mono text-sm text-(--ac-gold-ink) tabular">{s.done}/{s.total}</span>}
            </div>
            {s.items.length > 0 && <ol className="divide-y divide-(--ac-line)">{s.items.map((item, i) => <ItemRow key={item.id} item={item} done={done} n={i + 1} />)}</ol>}
            {s.soon && <p className="rounded-xl bg-(--ac-bg) px-4 py-3 text-sm text-(--ac-body)">กำลังจัดทำ: {s.soon.join(" · ")}</p>}
          </li>
        );
      })}
    </ol>
  );
}
