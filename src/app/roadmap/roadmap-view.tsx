"use client";

import { ArrowRightIcon, CheckIcon, ClockIcon, GlobeIcon, ListIcon, LockIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { StageItem, StageProgress } from "@/content/stages";

type Props = {
  stages: StageProgress[];
  passed: string[];
  overall: { done: number; total: number; percent: number };
  level: string | null;
  signedIn: boolean;
  initialStage?: string;
  initialView: "world" | "list";
};

const STATUS_TH: Record<StageProgress["status"], string> = {
  done: "ผ่านแล้ว", current: "กำลังเรียน", todo: "ยังไม่เริ่ม", open: "เปิดอ่านได้", soon: "เร็วๆ นี้",
};
const pad = (n: number) => String(n).padStart(2, "0");

export function RoadmapView({ stages, passed, overall, level, signedIn, initialStage, initialView }: Props) {
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
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-end justify-between gap-4 px-4 pt-8 sm:px-6 lg:px-10">
        <div>
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold">THE FLOATING ACADEMY</p>
          <h1 className="mt-1 font-brand text-3xl font-bold tracking-wide">Your Roadmap</h1>
        </div>
        <div role="tablist" aria-label="มุมมอง" className="flex rounded-xl border border-white/10 bg-white/5 p-1">
          {([["world", "Explore World", GlobeIcon], ["list", "Learning List", ListIcon]] as const).map(([id, label, Icon]) => (
            <button key={id} type="button" role="tab" aria-selected={view === id} onClick={() => setView(id)}
              className={"flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition " + (view === id ? "bg-gold font-semibold text-navy" : "text-mist hover:text-white")}>
              <Icon className="size-4" aria-hidden /> {label}
            </button>
          ))}
        </div>
      </div>

      {view === "world" ? (
        <>
          <World stages={stages} selected={stage.id} onChoose={choose} />
          <div className="relative z-10 mx-auto -mt-4 grid w-full max-w-[1440px] gap-4 px-4 pb-32 sm:px-6 sm:-mt-20 lg:-mt-40 lg:grid-cols-[260px_minmax(0,1fr)_340px] lg:px-10 lg:pb-14">
            <MyProgress overall={overall} level={level} signedIn={signedIn} />
            <StageCard stage={stage} signedIn={signedIn} />
            <LessonPreview stage={stage} done={done} />
          </div>
        </>
      ) : (
        <LearningList stages={stages} done={done} selected={stage.id} />
      )}
    </div>
  );
}

function World({ stages, selected, onChoose }: { stages: StageProgress[]; selected: string; onChoose: (id: string) => void }) {
  return (
    <div className="relative mt-6 isolate overflow-hidden">
      <picture>
        <source media="(max-width: 700px)" srcSet="/scenes/roadmap-900.webp" />
        <img src="/scenes/roadmap-1600.webp" alt="เมืองเกาะลอยฟ้า ที่ตั้งของ 7 สถานีการเรียน" className="hero-drift h-[420px] w-full object-cover sm:h-[560px] lg:h-[680px]" />
      </picture>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,24,43,0.55)_0%,rgba(7,24,43,0)_30%,rgba(7,24,43,0)_55%,#07182b_100%)]" aria-hidden />
      {/* The golden path, joining the stations in order. */}
      <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <polyline points={stages.map((s) => `${s.pin.x},${s.pin.y}`).join(" ")} fill="none" stroke="#ffe2a0" strokeWidth="0.45" strokeDasharray="1.4 1" strokeLinecap="round" opacity="0.85" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 3 }} />
      </svg>
      <ol className="absolute inset-0">
        {stages.map((s) => {
          const on = s.id === selected;
          return (
            <li key={s.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${s.pin.x}%`, top: `${s.pin.y}%` }}>
              <button type="button" onClick={() => onChoose(s.id)} aria-pressed={on} aria-label={`Stage ${s.n}: ${s.title} (${STATUS_TH[s.status]})`}
                className="group flex flex-col items-center gap-1.5">
                <span className={"grid size-11 place-items-center rounded-full border-2 font-brand text-sm font-bold transition sm:size-12 " +
                  (on ? "pin-glow scale-110 border-gold-soft bg-gold text-navy" :
                    s.status === "done" ? "border-[#7fe0b8] bg-[#0b3a2e] text-[#bff5dc]" :
                    s.status === "soon" ? "border-white/30 bg-navy-2/80 text-mist" :
                    "border-gold/80 bg-navy-2/90 text-gold-soft group-hover:border-gold-soft")}>
                  {s.status === "done" && !on ? <CheckIcon className="size-5" aria-hidden /> : pad(s.n)}
                </span>
                <span className={"hidden rounded-md px-2 py-0.5 text-xs whitespace-nowrap backdrop-blur sm:block " + (on ? "bg-gold text-navy font-semibold" : "bg-navy/70 text-white")}>{s.title}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Ring({ percent }: { percent: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 80 80" className="size-20 -rotate-90" aria-hidden>
      <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="7" />
      <circle cx="40" cy="40" r={r} fill="none" stroke="#e9bb70" strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - percent / 100)} />
    </svg>
  );
}

function MyProgress({ overall, level, signedIn }: { overall: Props["overall"]; level: string | null; signedIn: boolean }) {
  return (
    <section aria-labelledby="my-progress" className="glass order-3 flex flex-col gap-3 p-5 lg:order-none">
      <h2 id="my-progress" className="font-mono text-[11px] tracking-[0.25em] text-gold">MY PROGRESS</h2>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Ring percent={overall.percent} />
          <span className="absolute inset-0 grid place-items-center font-brand text-lg font-bold">{overall.percent}%</span>
        </div>
        <div className="text-sm">
          <p className="text-white">ผ่าน {overall.done} / {overall.total} บท</p>
          <p className="text-mist">ระดับ: {level ? (level === "pre-A1" ? "ก่อน A1" : level) : "ยังไม่ได้สอบวัดระดับ"}</p>
        </div>
      </div>
      <p className="text-xs leading-5 text-mist">{signedIn ? "นับจากแบบทดสอบท้ายบทที่ผ่าน · ระดับมาจากการสอบวัดระดับ (CEFR) ไม่ใช่ Band IELTS" : "เข้าสู่ระบบเพื่อให้เว็บจำบทที่ผ่าน"}</p>
      <Link href={signedIn ? "/today" : "/login"} className="btn-dark py-2 text-xs">{signedIn ? "ดูรายละเอียด" : "เข้าสู่ระบบ"}</Link>
    </section>
  );
}

function StageCard({ stage, signedIn }: { stage: StageProgress; signedIn: boolean }) {
  return (
    <section aria-labelledby="stage-title" key={stage.id} className="glass learn-in grid overflow-hidden md:grid-cols-[minmax(0,1fr)_220px]">
      <div className="flex flex-col gap-3 p-6">
        <p className="font-mono text-xs tracking-[0.2em] text-gold">STAGE {pad(stage.n)} / 07 · <span className="text-mist">{STATUS_TH[stage.status]}</span></p>
        <h2 id="stage-title" className="font-brand text-[28px] leading-tight font-bold tracking-wide">{stage.title}</h2>
        <p className="text-sm text-gold-soft">{stage.th}</p>
        <p className="text-[15px] leading-7 text-[#dce5ee]">{stage.blurb}</p>
        {stage.total > 0 && (
          <div>
            <div className="flex justify-between text-xs text-mist"><span>Progress</span><span className="tabular">{stage.percent}% · {stage.done}/{stage.total} บท</span></div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label={`ความคืบหน้า ${stage.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={stage.percent}>
              <div className="h-full rounded-full bg-gold transition-[width] duration-700" style={{ width: `${stage.percent}%` }} />
            </div>
          </div>
        )}
        {stage.next ? (
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <Link href={stage.next.href} className="btn px-5 py-3">{stage.done > 0 ? "Continue Learning" : "Start Stage"} <ArrowRightIcon className="size-4" /></Link>
            <span className="text-sm text-mist">Next: <span className="text-white">{stage.next.title}</span></span>
          </div>
        ) : (
          <p className="flex items-center gap-2 text-sm text-mist"><LockIcon className="size-4" aria-hidden /> สถานีนี้กำลังจัดทำ ยังไม่มีบทเรียนให้เริ่ม</p>
        )}
        {!signedIn && stage.total > 0 && <p className="text-xs text-mist">เรียนได้เลย แต่ต้องเข้าสู่ระบบเพื่อบันทึกบทที่ผ่าน</p>}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- scene pre-sized to WebP in public/scenes */}
      <img src="/scenes/roadmap-900.webp" alt="" className="hidden h-full w-full object-cover object-[55%_40%] md:block" />
    </section>
  );
}

function ItemRow({ item, done, n }: { item: StageItem; done: Set<string>; n: number }) {
  const passed = item.lessonId ? done.has(item.lessonId) : false;
  return (
    <li>
      <Link href={item.href} className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition hover:bg-white/5">
        <span className={"grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold " + (passed ? "bg-[#7fe0b8] text-navy" : "border border-white/20 text-mist")}>
          {passed ? <CheckIcon className="size-4" aria-label="ผ่านแล้ว" /> : pad(n)}
        </span>
        <span className="min-w-0 flex-1 text-sm leading-5 text-white">{item.title}</span>
        <span className="flex shrink-0 items-center gap-1 text-xs text-mist"><ClockIcon className="size-3" aria-hidden />{item.minutes}′</span>
      </Link>
    </li>
  );
}

function LessonPreview({ stage, done }: { stage: StageProgress; done: Set<string> }) {
  return (
    <section aria-labelledby="stage-lessons" className="glass flex max-h-[420px] flex-col p-5">
      <h2 id="stage-lessons" className="mb-2 font-mono text-[11px] tracking-[0.25em] text-gold">LESSONS IN THIS STAGE</h2>
      {stage.items.length > 0 && (
        <ol className="-mx-2 flex-1 overflow-y-auto">
          {stage.items.map((item, i) => <ItemRow key={item.id} item={item} done={done} n={i + 1} />)}
        </ol>
      )}
      {stage.soon && (
        <div className="mt-3 border-t border-white/10 pt-3">
          <p className="flex items-center gap-1.5 text-xs text-gold-soft"><SparklesIcon className="size-3.5" aria-hidden /> กำลังจัดทำ</p>
          <ul className="mt-1.5 flex flex-col gap-1 text-sm text-mist">
            {stage.soon.map((s) => <li key={s}>· {s}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}

function LearningList({ stages, done, selected }: { stages: StageProgress[]; done: Set<string>; selected: string }) {
  return (
    <ol className="mx-auto grid w-full max-w-[1440px] gap-4 px-4 pt-6 pb-32 sm:px-6 lg:grid-cols-2 lg:px-10 lg:pb-14">
      {stages.map((s) => (
        <li key={s.id} id={`stage-${s.id}`} className={"glass flex flex-col gap-3 p-5 " + (s.id === selected ? "ring-2 ring-gold/70" : "")}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs tracking-[0.2em] text-gold">STAGE {pad(s.n)} · <span className="text-mist">{STATUS_TH[s.status]}</span></p>
              <h2 className="font-brand text-xl font-bold tracking-wide">{s.title}</h2>
              <p className="text-sm text-mist">{s.th}</p>
            </div>
            {s.total > 0 && <span className="shrink-0 font-mono text-sm text-gold-soft tabular">{s.done}/{s.total}</span>}
          </div>
          {s.items.length > 0 && <ol className="-mx-2">{s.items.map((item, i) => <ItemRow key={item.id} item={item} done={done} n={i + 1} />)}</ol>}
          {s.soon && <p className="text-sm text-mist">กำลังจัดทำ: {s.soon.join(" · ")}</p>}
        </li>
      ))}
    </ol>
  );
}
