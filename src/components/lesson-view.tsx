"use client";

import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, CheckCircle2Icon, CheckIcon, ClipboardCheckIcon, KeyboardIcon, LightbulbIcon, PencilLineIcon, RotateCcwIcon, XCircleIcon, XIcon } from "lucide-react";
import { type KeyboardEvent as ReactKeyboardEvent, type ReactNode, useEffect, useRef, useState, useTransition } from "react";
import { addLessonCards, saveAttempt } from "@/app/actions";
import type { Lesson, PracticeItem, QuizItem } from "@/content";
import type { LessonWords } from "@/content/lesson-words";
import { normalize } from "@/content/lookup";
import { jumpScroll } from "@/app/roadmap/stage-jump";
import { FocusBar } from "./lesson-focus";
import { TABS, sectionLabel, type Tab } from "./lesson-tabs";
import { LessonWordsStep } from "./lesson-words-step";
import { Meaning } from "./meaning";
import { PlayableProse } from "./playable-prose";
import { Sentence } from "./sentence";
import { SpeakingDrill } from "./speaking-drill";

/** Back to the top of the lesson card, without animation when the learner asks for less motion. */
function toLessonTop() {
  document.getElementById("lesson-content")?.scrollIntoView(jumpScroll(window.matchMedia("(prefers-reduced-motion: reduce)").matches));
}

type Props = { lesson: Lesson; words: LessonWords; next?: { href: string; title: string }; passMark: number; focusable?: boolean };

export function LessonView({ lesson, words, next, passMark, focusable = false }: Props) {
  const [tab, setTab] = useState<Tab>("learn");
  const hasWords = words.fresh.length + words.review.length > 0;
  // Learn starts with the lesson's new words, then the theory (the order the course has always used).
  const [step, setStep] = useState<"words" | "theory">(hasWords ? "words" : "theory");
  const go = (t: Tab) => {
    setTab(t);
    toLessonTop();
  };

  return (
    <div className="flex flex-col gap-5">
      {focusable && <FocusBar title={lesson.title} level={lesson.level} section={sectionLabel(tab)} />}
      <div role="tablist" aria-label="ส่วนของบทเรียน" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        {TABS.map((t, i) => (
          <button key={t.id} role="tab" type="button" aria-selected={tab === t.id} aria-controls="lesson-panel" onClick={() => setTab(t.id)}
            className={"flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition " +
              (tab === t.id ? "border-navy bg-navy font-semibold text-white" : "border-line bg-surface text-ink-2 hover:border-navy/40")}>
            <span className={"font-mono text-xs " + (tab === t.id ? "text-on-dark" : "text-muted")}>{i + 1}</span>
            {t.label}<span className={"text-xs " + (tab === t.id ? "text-on-dark" : "text-muted")}>{t.th}</span>
          </button>
        ))}
      </div>

      <div id="lesson-panel" role="tabpanel" key={tab} className="learn-in">
        {tab === "learn" && (
          <div className="flex flex-col gap-4">
            {hasWords && (
              <div className="flex w-fit rounded-xl bg-page-alt p-1 text-sm" role="group" aria-label="ขั้นตอนใน Learn">
                {([["words", "1 · คำศัพท์ของบท"], ["theory", "2 · ทฤษฎีและตัวอย่าง"]] as const).map(([id, label]) => (
                  <button key={id} type="button" aria-pressed={step === id} onClick={() => setStep(id)}
                    className={"rounded-lg px-3 py-1.5 transition " + (step === id ? "bg-surface font-semibold shadow-sm" : "text-muted hover:text-ink")}>{label}</button>
                ))}
              </div>
            )}
            {step === "words" && hasWords
              ? <LessonWordsStep words={words} onNext={() => setStep("theory")} />
              : <Theory lesson={lesson} onNext={() => go("practice")} />}
          </div>
        )}
        {tab === "practice" && <Practice lesson={lesson} onNext={() => go("quiz")} />}
        {tab === "quiz" && <Quiz lesson={lesson} next={next} passMark={passMark} newWordIds={words.fresh.map((x) => x.word.id)} />}
        {tab === "real" && <RealLife lesson={lesson} onNext={() => go("summary")} />}
        {tab === "summary" && <Summary lesson={lesson} words={words} next={next} onQuiz={() => go("quiz")} />}
      </div>
    </div>
  );
}

function Theory({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="card min-w-0 p-5 sm:p-6">
        <p className="eyebrow mb-2">ทำไมต้องรู้</p>
        <p className="mb-4 text-[15px] leading-7">{lesson.why}</p>
        <PlayableProse html={lesson.theory} className="prose-lesson" />
        <p className="mt-5 border-t border-line pt-4 text-sm text-muted">
          เจอคำที่ไม่คุ้น เช่น กริยาช่วย บุพบท V3 นับไม่ได้?{" "}
          <Link href="/guide" className="font-semibold text-brand underline underline-offset-2">เปิดคู่มือ</Link>
        </p>
      </section>

      <div className="flex flex-col gap-5">
        <section className="card p-5">
          <p className="eyebrow mb-3">ตัวอย่าง · แตะคำเพื่อดูความหมาย</p>
          <div className="flex flex-col divide-y divide-line">
            {lesson.examples.map(([en, th]) => (
              <div key={en} className="py-3 first:pt-0 last:pb-0">
                <Sentence en={en} th={th} />
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <p className="eyebrow mb-3">ผิดบ่อย</p>
          <ul className="flex flex-col gap-3">
            {lesson.mistakes.map(([wrong, right, note]) => (
              <li key={wrong} className="text-sm leading-6">
                <s className="text-bad decoration-[1.5px]">{wrong}</s>
                <span className="mx-2 text-muted">→</span>
                <b className="font-semibold text-obj">{right}</b>
                <span className="block text-xs text-muted">{note}</span>
              </li>
            ))}
          </ul>
        </section>

        <button type="button" className="btn self-start" onClick={onNext}>ไปฝึก →</button>
      </div>
    </div>
  );
}

const KIND_LABEL: Record<PracticeItem["t"], string> = {
  fill: "เติมคำ",
  fix: "แก้ประโยคผิด",
  order: "เรียงคำ",
  pick: "เลือกคำตอบ",
};

/** One exercise's progress in this round. `firstTry`: right on the first check, which is what the summary counts. */
type ItemState = { value: string; picked: number[]; choice: number | null; checked: "ok" | "no" | null; attempts: number; firstTry: boolean | null; hint: boolean; shown: boolean };
const EMPTY: ItemState = { value: "", picked: [], choice: null, checked: null, attempts: 0, firstTry: null, hint: false, shown: false };
const LETTERS = "ABCD";

function answerOf(item: PracticeItem) {
  if (item.t === "pick") return item.o[item.a];
  if (item.t === "order") return item.a;
  return item.a[0];
}

function isRight(item: PracticeItem, st: ItemState) {
  if (item.t === "pick") return st.choice === item.a;
  const given = item.t === "order" ? st.picked.map((i) => item.w[i]).join(" ") : st.value;
  const accepted = item.t === "order" ? [item.a] : item.a;
  return accepted.some((a) => normalize(a) === normalize(given));
}

/**
 * Practice: one exercise at a time. Nothing is marked until "ตรวจคำตอบ"; a hint and the answer are
 * always available, and wrong answers can be tried again. Practice isn't scored or saved; the quiz is.
 */
function Practice({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  const [items, setItems] = useState(lesson.practice);
  const [states, setStates] = useState<ItemState[]>(() => lesson.practice.map(() => EMPTY));
  const [at, setAt] = useState(0);
  const [review, setReview] = useState(false);
  const item = items[at];
  const st = states[at];
  const total = items.length;
  const checkedCount = states.filter((s) => s.checked === "ok" || s.shown).length;
  const finished = checkedCount === total;

  const update = (patch: Partial<ItemState>) => setStates((all) => all.map((s, i) => (i === at ? { ...s, ...patch } : s)));
  const move = (to: number) => setAt(Math.max(0, Math.min(total - 1, to)));

  function check() {
    if (!item || st.checked === "ok") return;
    const ok = isRight(item, st);
    update({ checked: ok ? "ok" : "no", attempts: st.attempts + 1, firstTry: st.firstTry ?? ok });
  }

  function restart() {
    const order = shuffled(lesson.practice);
    setItems(order);
    setStates(order.map(() => EMPTY));
    setAt(0);
    setReview(false);
  }

  // Keyboard: A–D choose (multiple choice), Enter checks or goes on, ← → move. Typing in a box is left alone.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (review || e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select")) return;
      const k = e.key.toUpperCase();
      if (item?.t === "pick" && LETTERS.includes(k) && LETTERS.indexOf(k) < item.o.length && st.checked !== "ok" && !st.shown) {
        update({ choice: LETTERS.indexOf(k), checked: null });
      } else if (e.key === "Enter" && !target.closest("button, a")) {
        if (st.checked === "ok" || st.shown) goOn();
        else if (item && ready(item, st)) check();
      } else if (e.key === "ArrowRight") move(at + 1);
      else if (e.key === "ArrowLeft") move(at - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function goOn() {
    if (finished) setReview(true);
    else move(at + 1 < total ? at + 1 : states.findIndex((s) => !(s.checked === "ok" || s.shown)));
  }

  if (total === 0) return <p className="text-(--ac-muted)">บทนี้ยังไม่มีแบบฝึก ไปที่แท็บ Quiz ได้เลย</p>;

  if (review) {
    const right = states.filter((s) => s.firstTry).length;
    return (
      <div className="flex flex-col gap-5">
        <ModeHeader kind="practice" />
        <section aria-labelledby="practice-summary" className="on-dark flex flex-wrap items-center gap-5 rounded-2xl bg-(--ac-dark) p-6 text-white">
          <p className="ac-serif text-5xl font-bold text-(--ac-gold-bright) tabular">{right}/{total}</p>
          <div className="min-w-0 flex-1">
            <h3 id="practice-summary" className="text-lg font-semibold">ถูกตั้งแต่ครั้งแรก {right} จาก {total} ข้อ</h3>
            <p className="text-sm text-on-dark-muted">แบบฝึกไม่นับคะแนน ใช้ดูว่าพร้อมทำ Quiz หรือยัง</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={restart} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/30 px-4 text-sm font-semibold text-white hover:bg-white/10"><RotateCcwIcon className="size-4" aria-hidden /> ฝึกอีกรอบ</button>
            <button type="button" onClick={onNext} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-(--ac-gold-bright) px-4 text-sm font-semibold text-(--ac-dark) hover:bg-accent-on-dark-hover">ไปทำ Quiz <ArrowRightIcon className="size-4" aria-hidden /></button>
          </div>
        </section>
        <ol className="flex flex-col gap-2.5">
          {items.map((it, i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl border border-(--ac-line) bg-card p-4 text-[15px]">
              {states[i].firstTry
                ? <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#e3f1ea] px-2 py-0.5 text-xs font-semibold text-[#22694b]"><CheckIcon className="size-3.5" aria-hidden />ครั้งแรก</span>
                : <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent-text"><RotateCcwIcon className="size-3.5" aria-hidden />ลองหลายครั้ง</span>}
              <div className="min-w-0">
                <p className="font-medium text-(--ac-ink)">{it.t === "order" ? it.th : it.q}</p>
                <p className="text-(--ac-body)">คำตอบ: <b className="text-[#22694b]">{answerOf(it)}</b></p>
                {it.t !== "order" && it.th && <p className="text-sm text-(--ac-muted)">{it.th}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  const percent = Math.round((checkedCount / total) * 100);
  const locked = st.checked === "ok" || st.shown;
  return (
    <div className="flex flex-col gap-5">
      {lesson.speak && <SpeakingDrill items={lesson.speak} />}
      <ModeHeader kind="practice" />
      <div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-(--ac-heading)">ข้อ {at + 1} จาก {total}</span>
          <span className="text-(--ac-muted) tabular">ทำแล้ว {checkedCount}/{total}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-page-alt" role="progressbar" aria-label="ความคืบหน้าแบบฝึก" aria-valuemin={0} aria-valuemax={total} aria-valuenow={checkedCount}>
          <div className="h-full rounded-full bg-(--ac-gold) transition-[width] duration-300" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <section key={at} aria-labelledby="ex-q" className="overflow-hidden rounded-2xl border border-(--ac-line) bg-card shadow-(--ac-shadow)">
        <div className="flex flex-col gap-6 p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-(--ac-navy) text-sm font-semibold text-white">{at + 1}</span>
              <span className="rounded-full bg-(--ac-gold-soft) px-3 py-1 text-xs font-semibold text-accent-text">{KIND_LABEL[item.t]}</span>
            </p>
            {item.t === "pick" && <p className="hidden items-center gap-1.5 text-xs text-(--ac-muted) sm:flex"><KeyboardIcon className="size-4" aria-hidden /> A–D เลือก · Enter ตรวจ · ← → เปลี่ยนข้อ</p>}
          </div>

          <ExerciseBody item={item} st={st} update={update} onSubmit={check} />

          {st.hint && !locked && (
            <p className="flex gap-2.5 rounded-xl bg-accent-wash px-4 py-3 text-[15px] leading-6 text-(--ac-ink)">
              <LightbulbIcon className="mt-0.5 size-5 shrink-0 text-(--ac-gold)" aria-hidden /><span><b>คำใบ้:</b> {hintOf(item)}</span>
            </p>
          )}

          {/* Announced to screen readers as soon as an answer is checked. */}
          <div aria-live="polite" aria-atomic="true"><Feedback item={item} st={st} /></div>

          <div className="flex flex-wrap items-center gap-2.5 border-t border-(--ac-line) pt-5">
            {!locked ? (
              <>
                <button type="button" disabled={!ready(item, st)} onClick={check}
                  className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-(--ac-navy) px-6 text-[15px] font-semibold text-white transition hover:bg-(--ac-navy-2) disabled:cursor-not-allowed disabled:opacity-40">
                  ตรวจคำตอบ
                </button>
                {!st.hint && (
                  <button type="button" onClick={() => update({ hint: true })} className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-(--ac-line) px-4 text-[15px] font-semibold text-(--ac-navy) hover:bg-(--ac-bg)">
                    <LightbulbIcon className="size-4" aria-hidden /> คำใบ้
                  </button>
                )}
                {st.checked === "no" && (
                  <button type="button" onClick={() => update({ shown: true, firstTry: st.firstTry ?? false })} className="inline-flex min-h-12 items-center rounded-lg px-3 text-[15px] font-semibold text-(--ac-body) underline underline-offset-4 hover:text-(--ac-navy)">
                    ดูเฉลย
                  </button>
                )}
              </>
            ) : (
              <button type="button" onClick={goOn}
                className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-(--ac-navy) px-6 text-[15px] font-semibold text-white transition hover:bg-(--ac-navy-2)">
                {finished ? "ดูสรุปผล" : "ข้อต่อไป"} <ArrowRightIcon className="size-4" aria-hidden />
              </button>
            )}
          </div>
        </div>
      </section>

      <nav aria-label="เปลี่ยนข้อ" className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" disabled={at === 0} onClick={() => move(at - 1)} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-(--ac-navy) hover:bg-card disabled:opacity-30"><ArrowLeftIcon className="size-4" aria-hidden /> ข้อก่อน</button>
        <ol className="flex flex-wrap justify-center gap-2">
          {states.map((s, i) => {
            const label = s.checked === "ok" ? "ถูกแล้ว" : s.shown ? "ดูเฉลยแล้ว" : s.checked === "no" ? "ยังไม่ถูก" : "ยังไม่ทำ";
            return (
              <li key={i}>
                <button type="button" onClick={() => move(i)} aria-label={`ข้อ ${i + 1}: ${label}`} aria-current={i === at ? "step" : undefined}
                  className={"grid size-8 place-items-center rounded-full border text-xs font-semibold transition " + (i === at ? "ring-2 ring-(--ac-navy) ring-offset-2 " : "") +
                    (s.checked === "ok" ? "border-[#2e7d5b] bg-[#e3f1ea] text-[#22694b]" : s.shown ? "border-(--ac-gold) bg-(--ac-gold-soft) text-accent-text" : s.checked === "no" ? "border-[#e0a49a] bg-[#fdecea] text-bad" : "border-(--ac-line) bg-card text-(--ac-muted)")}>
                  {s.checked === "ok" ? <CheckIcon className="size-3.5" aria-hidden /> : s.checked === "no" && !s.shown ? <XIcon className="size-3.5" aria-hidden /> : i + 1}
                </button>
              </li>
            );
          })}
        </ol>
        <button type="button" disabled={at === total - 1} onClick={() => move(at + 1)} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-(--ac-navy) hover:bg-card disabled:opacity-30">ข้อต่อไป <ArrowRightIcon className="size-4" aria-hidden /></button>
      </nav>
      <p className="text-sm leading-6 text-(--ac-body)"><b className="text-(--ac-heading)">การบ้าน:</b> {lesson.homework}</p>
    </div>
  );
}

/** Tells Practice and Quiz apart at a glance: what the mode is for and how it behaves. */
function ModeHeader({ kind, count, passMark }: { kind: "practice" | "quiz"; count?: number; passMark?: number }) {
  const practice = kind === "practice";
  return (
    <div className={"flex flex-wrap items-start gap-4 rounded-2xl border p-5 " + (practice ? "border-(--ac-line) bg-(--ac-bg)" : "border-(--ac-navy)/15 bg-tint")}>
      <span className={"grid size-11 shrink-0 place-items-center rounded-xl " + (practice ? "bg-(--ac-gold-soft) text-accent-text" : "bg-(--ac-navy) text-white")}>
        {practice ? <PencilLineIcon className="size-5" aria-hidden /> : <ClipboardCheckIcon className="size-5" aria-hidden />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="ac-serif text-xl font-bold text-(--ac-heading)">{practice ? "Practice · ฝึกจากข้อผิดพลาด" : "Quiz · วัดความเข้าใจ"}</p>
        <p className="mt-0.5 text-sm leading-6 text-(--ac-body)">
          {practice
            ? "ทำทีละข้อ ตอบผิดได้ไม่จำกัด มีคำใบ้และเฉลย ไม่นับคะแนน"
            : `${count} ข้อ ไม่มีคำใบ้ เฉลยและคำอธิบายจะขึ้นหลังส่งคำตอบ ได้ ${passMark}% ขึ้นไปถือว่าผ่านบทนี้`}
        </p>
      </div>
    </div>
  );
}

function ready(item: PracticeItem, st: ItemState) {
  if (item.t === "pick") return st.choice !== null;
  if (item.t === "order") return st.picked.length === item.w.length;
  return st.value.trim().length > 0;
}

function hintOf(item: PracticeItem) {
  if (item.t === "order") return `คำแรกคือ "${item.a.split(" ")[0]}"`;
  if (item.th) return `ความหมายของประโยคที่ถูก: ${item.th}`;
  const answer = answerOf(item);
  return `คำตอบขึ้นต้นด้วย "${answer.slice(0, 1)}" และยาว ${answer.length} ตัวอักษร`;
}

const questionText = "text-[22px] leading-[1.45] font-semibold text-(--ac-heading) sm:text-[26px]";

function ExerciseBody({ item, st, update, onSubmit }: { item: PracticeItem; st: ItemState; update: (p: Partial<ItemState>) => void; onSubmit: () => void }) {
  const locked = st.checked === "ok" || st.shown;
  if (item.t === "pick") {
    return (
      <>
        <p id="ex-q" className={questionText}>{item.q}</p>
        <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-labelledby="ex-q">
          {item.o.map((o, i) => (
            <OptionButton key={o} letter={LETTERS[i]} text={o} chosen={st.choice === i} disabled={locked}
              state={locked && i === item.a ? "correct" : st.checked === "no" && st.choice === i ? "wrong" : null}
              onPick={() => update({ choice: i, checked: null })} />
          ))}
        </div>
      </>
    );
  }
  if (item.t === "order") {
    return (
      <>
        <p id="ex-q" className="text-[17px] leading-7 text-(--ac-ink)">เรียงคำให้ได้ความหมาย: <b className="text-(--ac-heading)">{item.th}</b></p>
        <div className="flex min-h-16 flex-wrap items-center gap-2 rounded-xl border-2 border-dashed border-(--ac-line) bg-(--ac-bg) p-3" aria-label="ประโยคที่เรียงแล้ว">
          {st.picked.length === 0 && <span className="text-sm text-(--ac-muted)">แตะคำด้านล่างเพื่อเรียงประโยค</span>}
          {st.picked.map((idx, i) => (
            <button key={i} type="button" disabled={locked} aria-label={`เอา "${item.w[idx]}" ออก`}
              className="min-h-11 rounded-lg bg-(--ac-navy) px-3.5 text-[16px] text-white"
              onClick={() => update({ picked: st.picked.filter((_, j) => j !== i), checked: null })}>{item.w[idx]}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {item.w.map((w, idx) => (
            <button key={idx} type="button" disabled={locked || st.picked.includes(idx)}
              className="min-h-11 rounded-lg border border-(--ac-line) bg-card px-3.5 text-[16px] text-(--ac-ink) hover:border-(--ac-navy)/40 disabled:opacity-25"
              onClick={() => update({ picked: [...st.picked, idx], checked: null })}>{w}</button>
          ))}
        </div>
      </>
    );
  }
  return (
    <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); if (ready(item, st)) onSubmit(); }}>
      <p id="ex-q" className={questionText}>{item.t === "fix" ? <><span className="block text-base font-normal text-(--ac-muted)">แก้ประโยคนี้ให้ถูก</span>{item.q}</> : item.q}</p>
      <input value={st.value} readOnly={locked} onChange={(e) => update({ value: e.target.value, checked: null })}
        placeholder={item.t === "fix" ? "พิมพ์ประโยคที่ถูก แล้วกด Enter" : "พิมพ์คำที่หายไป แล้วกด Enter"} autoCapitalize="off" autoComplete="off" spellCheck={false} aria-labelledby="ex-q"
        className={"min-h-13 w-full rounded-xl border-2 bg-card px-4 text-lg outline-none transition focus:border-(--ac-navy) focus:ring-4 focus:ring-(--ac-gold-soft) " +
          (st.checked === "ok" ? "border-[#2e7d5b]" : st.checked === "no" ? "border-[#e0a49a]" : "border-(--ac-line)")} />
    </form>
  );
}

/** One answer choice. States show as border, an icon and a word, never colour alone. */
function OptionButton({ letter, text, chosen, disabled, state, onPick }: { letter: string; text: string; chosen: boolean; disabled: boolean; state: "correct" | "wrong" | null; onPick: () => void }) {
  const tone = state === "correct" ? "border-[#2e7d5b] bg-[#eef7f1]"
    : state === "wrong" ? "border-[#d9776a] bg-[#fdf1ef]"
    : chosen ? "border-(--ac-navy) bg-tint"
    : "border-(--ac-line) bg-card hover:border-(--ac-navy)/40 hover:bg-(--ac-bg)";
  return (
    <button type="button" role="radio" aria-checked={chosen} disabled={disabled} onClick={onPick}
      className={"flex min-h-14 items-center gap-3.5 rounded-xl border-2 px-4 py-3 text-left text-[17px] text-(--ac-ink) transition disabled:cursor-default " + tone}>
      <span className={"grid size-8 shrink-0 place-items-center rounded-lg font-mono text-sm font-semibold " +
        (state === "correct" ? "bg-[#2e7d5b] text-white" : state === "wrong" ? "bg-[#c4483a] text-white" : chosen ? "bg-(--ac-navy) text-white" : "bg-sunken text-(--ac-muted)")}>{letter}</span>
      <span className="min-w-0 flex-1">{text}</span>
      {state === "correct" && <span className="flex items-center gap-1 text-sm font-semibold text-[#22694b]"><CheckCircle2Icon className="size-5" aria-hidden />ถูก</span>}
      {state === "wrong" && <span className="flex items-center gap-1 text-sm font-semibold text-bad"><XCircleIcon className="size-5" aria-hidden />ไม่ใช่</span>}
      {chosen && !state && <span className="sr-only">(เลือกแล้ว)</span>}
    </button>
  );
}

function Feedback({ item, st }: { item: PracticeItem; st: ItemState }) {
  if (st.checked === "ok" || st.shown) {
    const ok = st.checked === "ok";
    return (
      <div className={"flex gap-3 rounded-xl border-l-4 px-4 py-4 " + (ok ? "border-[#2e7d5b] bg-[#eef7f1]" : "border-(--ac-gold) bg-accent-wash")}>
        {ok ? <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-[#2e7d5b]" aria-hidden /> : <LightbulbIcon className="mt-0.5 size-5 shrink-0 text-(--ac-gold)" aria-hidden />}
        <div className="flex flex-col gap-1 text-[15px] leading-6 text-(--ac-ink)">
          <p className={"font-semibold " + (ok ? "text-[#22694b]" : "text-accent-text")}>{ok ? `ถูกต้อง${st.attempts > 1 ? ` (ครั้งที่ ${st.attempts})` : ""}` : "เฉลย"}</p>
          <p>คำตอบ: <b>{answerOf(item)}</b></p>
          {item.th && <p className="text-(--ac-body)"><span className="font-semibold">ความหมาย:</span> {item.th}</p>}
        </div>
      </div>
    );
  }
  if (st.checked === "no") {
    return (
      <div className="flex gap-3 rounded-xl border-l-4 border-[#c4483a] bg-[#fdf1ef] px-4 py-4">
        <XCircleIcon className="mt-0.5 size-5 shrink-0 text-bad" aria-hidden />
        <p className="text-[15px] leading-6 text-(--ac-ink)"><b className="text-bad">ยังไม่ถูก</b> แก้คำตอบแล้วตรวจอีกครั้ง หรือเปิดคำใบ้ก่อนดูเฉลย</p>
      </div>
    );
  }
  return null;
}

function RealLife({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[15px] text-ink-2">ประโยคจริงที่ใช้ไวยากรณ์ของบทนี้ แตะคำเพื่อดูความหมายและฟังเสียง แล้วลองพูดตามทีละประโยค</p>
      <ol className="flex flex-col gap-3">
        {lesson.examples.map(([en, th], i) => (
          <li key={en} className={"flex max-w-[85%] flex-col rounded-2xl px-4 py-3 " + (i % 2 ? "self-end bg-brand-soft" : "border border-line bg-surface")}>
            <Sentence en={en} th={th} />
          </li>
        ))}
      </ol>
      <div className="card flex flex-col gap-2 p-5">
        <p className="eyebrow">ลองใช้ในชีวิตจริง</p>
        <p className="text-[15px] leading-7">{lesson.homework}</p>
      </div>
      <button type="button" className="btn self-start" onClick={onNext}>ไปที่สรุปบทเรียน <ArrowRightIcon className="size-4" /></button>
    </div>
  );
}

function Summary({ lesson, words, next, onQuiz }: { lesson: Lesson; words: LessonWords; next?: { href: string; title: string }; onQuiz: () => void }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="card flex flex-col gap-3 p-5">
        <p className="eyebrow">สูตรของบทนี้</p>
        <p className="rounded-lg border border-line bg-tint px-3 py-2.5 font-mono text-[14px] text-heading">{lesson.formula}</p>
        <p className="text-sm leading-6 text-ink-2">{lesson.why}</p>
      </section>
      <section className="card flex flex-col gap-3 p-5">
        <p className="eyebrow">ผิดบ่อย</p>
        <ul className="flex flex-col gap-2.5">
          {lesson.mistakes.map(([wrong, right, note]) => (
            <li key={wrong} className="text-sm leading-6">
              <s className="text-bad">{wrong}</s> <span className="text-muted">→</span> <b className="text-obj">{right}</b>
              <span className="block text-xs text-muted">{note}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="card flex flex-col gap-3 p-5">
        <p className="eyebrow">ประโยคตัวอย่าง</p>
        {lesson.examples.slice(0, 3).map(([en, th]) => <Sentence key={en} en={en} th={th} />)}
      </section>
      {words.fresh.length > 0 && (
        <section className="card flex flex-col gap-3 p-5">
          <p className="eyebrow">คำศัพท์ของบท ({words.fresh.length})</p>
          <ul className="flex flex-wrap gap-1.5">
            {words.fresh.map(({ word }) => (
              <li key={word.id} className="rounded-full border border-line bg-paper px-3 py-1 text-sm"><b className="font-semibold">{word.en}</b> <Meaning th={word.th} en={word.en} className="text-muted" /></li>
            ))}
          </ul>
        </section>
      )}
      <section className="on-dark flex flex-wrap items-center gap-3 rounded-2xl bg-dark p-5 text-white lg:col-span-2">
        <p className="min-w-0 flex-1 text-sm text-mist">พร้อมแล้ว? ทำ Quiz ให้ผ่านเพื่อปลดบทนี้ใน Roadmap</p>
        <button type="button" className="btn" onClick={onQuiz}>ทำ Quiz</button>
        {next && <Link href={next.href} className="btn-dark">บทถัดไป: {next.title}</Link>}
      </section>
    </div>
  );
}

type QuizProps = { lesson: Lesson; next?: { href: string; title: string }; passMark: number; newWordIds: string[] };

function Quiz({ lesson, next, passMark, newWordIds }: QuizProps) {
  // Retakes reshuffle the questions and options, so the answers can't be learned by position.
  const [quiz, setQuiz] = useState(lesson.quiz);
  const [answers, setAnswers] = useState<(number | null)[]>(() => lesson.quiz.map(() => null));
  const [done, setDone] = useState<{ score: number; saved: boolean; added: number } | null>(null);
  const [error, setError] = useState(false);
  const [pending, start] = useTransition();
  // Set before the first await, so a double click can't save the same attempt twice.
  const submitting = useRef(false);
  const answered = answers.filter((a) => a !== null).length;
  const allAnswered = answered === quiz.length;

  function submit() {
    if (submitting.current || done) return;
    submitting.current = true;
    const right = quiz.filter((q, i) => answers[i] === q.a).length;
    const score = Math.round((right / quiz.length) * 100);
    const wrongs = quiz
      .map((q, i) => ({ q, a: answers[i] }))
      .filter(({ q, a }) => a !== q.a)
      .map(({ q, a }) => ({ wrong: q.o[a ?? 0], correct: q.o[q.a], note: q.why }));
    start(async () => {
      try {
        const passedNow = score >= passMark;
        const saved = await saveAttempt(lesson.id, score, passedNow, wrongs);
        // Passing hands the lesson's new words to the flashcards.
        const added = saved && passedNow ? await addLessonCards(newWordIds).catch(() => 0) : 0;
        setDone({ score, saved, added });
        setError(false);
      } catch {
        setDone({ score, saved: false, added: 0 });
        setError(true);
      }
      toLessonTop();
    });
  }

  function retake() {
    setQuiz(shuffleQuiz(lesson.quiz));
    setAnswers(lesson.quiz.map(() => null));
    setDone(null);
    submitting.current = false;
  }

  const passed = done && done.score >= passMark;
  const rightCount = done ? quiz.filter((q, i) => answers[i] === q.a).length : 0;

  return (
    <div className="flex flex-col gap-5">
      <ModeHeader kind="quiz" count={quiz.length} passMark={passMark} />

      <div aria-live="polite">
        {done && (
          <section aria-labelledby="quiz-result" className={"flex flex-wrap items-center gap-5 rounded-2xl border-2 p-6 " + (passed ? "border-[#2e7d5b] bg-[#eef7f1]" : "border-[#d9776a] bg-[#fdf1ef]")}>
            <p className="ac-serif text-5xl font-bold text-(--ac-navy) tabular">{done.score}%</p>
            <div className="min-w-0 flex-1 text-[15px] leading-6">
              <h3 id="quiz-result" className={"flex items-center gap-1.5 text-lg font-semibold " + (passed ? "text-[#22694b]" : "text-bad")}>
                {passed ? <CheckCircle2Icon className="size-5" aria-hidden /> : <XCircleIcon className="size-5" aria-hidden />}
                {passed ? "ผ่านแล้ว" : `ยังไม่ผ่าน ต้องได้ ${passMark}% ขึ้นไป`}
              </h3>
              <p className="text-(--ac-body)">ถูก {rightCount} จาก {quiz.length} ข้อ · {error ? "บันทึกคะแนนไม่สำเร็จ ลองทำใหม่อีกครั้ง" : done.saved ? "บันทึกคะแนนแล้ว" : "ยังไม่ได้เข้าสู่ระบบ คะแนนนี้จึงไม่ถูกบันทึก"}</p>
              {done.added > 0 && <p className="text-[#22694b]">เพิ่มคำใหม่ {done.added} คำเข้าการ์ดทวนแล้ว</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {passed && next && (
                <Link href={next.href} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-(--ac-navy) px-4 text-sm font-semibold text-white hover:bg-(--ac-navy-2)">บทถัดไป: {next.title} <ArrowRightIcon className="size-4" aria-hidden /></Link>
              )}
              <button type="button" onClick={retake} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-(--ac-line) bg-card px-4 text-sm font-semibold text-(--ac-navy) hover:bg-(--ac-bg)">
                <RotateCcwIcon className="size-4" aria-hidden /> ทำใหม่ (สลับข้อ)
              </button>
            </div>
          </section>
        )}
      </div>

      <ol className="flex flex-col gap-4">
        {quiz.map((q, i) => {
          const reveal = done !== null;
          const ok = reveal && answers[i] === q.a;
          return (
            <li key={`${i}-${q.q}`} className="rounded-2xl border border-(--ac-line) bg-card p-5 shadow-(--ac-shadow) sm:p-7">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2.5 text-sm text-(--ac-muted)">
                  <span className="grid size-8 place-items-center rounded-full bg-(--ac-navy) text-sm font-semibold text-white">{i + 1}</span>
                  ข้อ {i + 1} จาก {quiz.length}
                </p>
                {reveal && (
                  <span className={"inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold " + (ok ? "bg-[#e3f1ea] text-[#22694b]" : "bg-[#fdecea] text-bad")}>
                    {ok ? <CheckIcon className="size-3.5" aria-hidden /> : <XIcon className="size-3.5" aria-hidden />}{ok ? "ถูก" : "ผิด"}
                  </span>
                )}
              </div>
              <p id={`quiz-q-${i}`} className="text-[19px] leading-[1.5] font-semibold text-(--ac-heading) sm:text-[21px]">{q.q}</p>
              <RadioGroup labelledBy={`quiz-q-${i}`} className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {q.o.map((o, j) => (
                  <OptionButton key={j} letter={LETTERS[j]} text={o} chosen={answers[i] === j} disabled={reveal}
                    state={reveal && j === q.a ? "correct" : reveal && answers[i] === j ? "wrong" : null}
                    onPick={() => setAnswers(answers.map((a, k) => (k === i ? j : a)))} />
                ))}
              </RadioGroup>
              {reveal && q.why && (
                <p className="mt-4 rounded-xl bg-(--ac-bg) px-4 py-3 text-[15px] leading-6 text-(--ac-ink)"><b className="text-(--ac-heading)">คำอธิบาย:</b> {q.why}</p>
              )}
            </li>
          );
        })}
      </ol>

      {!done && (
        // Stays in view while scrolling; sits above the phone tab bar.
        <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-10 flex flex-wrap items-center gap-4 rounded-2xl border border-(--ac-line) bg-card/95 p-4 shadow-(--ac-shadow) backdrop-blur lg:bottom-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-(--ac-heading)">ตอบแล้ว {answered} จาก {quiz.length} ข้อ</p>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-page-alt" role="progressbar" aria-label="ตอบแล้ว" aria-valuemin={0} aria-valuemax={quiz.length} aria-valuenow={answered}>
              <div className="h-full rounded-full bg-(--ac-gold) transition-[width] duration-300" style={{ width: `${(answered / quiz.length) * 100}%` }} />
            </div>
          </div>
          <button type="button" disabled={!allAnswered || pending} onClick={submit}
            className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-(--ac-navy) px-6 text-[15px] font-semibold text-white transition hover:bg-(--ac-navy-2) disabled:cursor-not-allowed disabled:opacity-40">
            {pending ? "กำลังตรวจ…" : allAnswered ? "ส่งคำตอบ" : "ตอบให้ครบก่อนส่ง"}
          </button>
        </div>
      )}
    </div>
  );
}

/** Radio-group keyboard behaviour: arrow keys move between the choices and pick them. */
function RadioGroup({ labelledBy, className, children }: { labelledBy: string; className: string; children: ReactNode }) {
  function onKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(e.key)) return;
    const radios = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)')];
    const at = radios.indexOf(document.activeElement as HTMLButtonElement);
    if (at < 0) return;
    e.preventDefault();
    e.stopPropagation();
    const to = radios[(at + (e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1) + radios.length) % radios.length];
    to.focus();
    to.click();
  }
  return <div role="radiogroup" aria-labelledby={labelledBy} className={className} onKeyDown={onKeyDown}>{children}</div>;
}

function shuffled<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** New question order, and new option order inside each question (the answer index follows its option). */
function shuffleQuiz(quiz: QuizItem[]): QuizItem[] {
  return shuffled(quiz).map((q) => {
    const order = shuffled(q.o.map((_, i) => i));
    return { ...q, o: order.map((i) => q.o[i]), a: order.indexOf(q.a) };
  });
}
