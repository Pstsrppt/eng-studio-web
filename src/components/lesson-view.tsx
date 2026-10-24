"use client";

import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, CheckCircle2Icon, KeyboardIcon, LightbulbIcon, RotateCcwIcon, XCircleIcon } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { addLessonCards, saveAttempt } from "@/app/actions";
import type { Lesson, PracticeItem, QuizItem } from "@/content";
import type { LessonWords } from "@/content/lesson-words";
import { normalize } from "@/content/lookup";
import { LessonWordsStep } from "./lesson-words-step";
import { PlayableProse } from "./playable-prose";
import { Sentence } from "./sentence";
import { SpeakingDrill } from "./speaking-drill";

const TABS = [
  { id: "learn", label: "Learn", th: "เรียน" },
  { id: "practice", label: "Practice", th: "ฝึก" },
  { id: "quiz", label: "Quiz", th: "ทดสอบ" },
  { id: "real", label: "Real-life", th: "ใช้จริง" },
  { id: "summary", label: "Summary", th: "สรุป" },
] as const;
type Tab = (typeof TABS)[number]["id"];

type Props = { lesson: Lesson; words: LessonWords; next?: { href: string; title: string }; passMark: number };

export function LessonView({ lesson, words, next, passMark }: Props) {
  const [tab, setTab] = useState<Tab>("learn");
  const hasWords = words.fresh.length + words.review.length > 0;
  // Learn starts with the lesson's new words, then the theory (the order the course has always used).
  const [step, setStep] = useState<"words" | "theory">(hasWords ? "words" : "theory");
  const go = (t: Tab) => {
    setTab(t);
    document.getElementById("lesson-content")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" aria-label="ส่วนของบทเรียน" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        {TABS.map((t, i) => (
          <button key={t.id} role="tab" type="button" aria-selected={tab === t.id} aria-controls="lesson-panel" onClick={() => setTab(t.id)}
            className={"flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition " +
              (tab === t.id ? "border-navy bg-navy font-semibold text-white" : "border-line bg-surface text-ink-2 hover:border-navy/40")}>
            <span className={"font-mono text-xs " + (tab === t.id ? "text-gold" : "text-muted")}>{i + 1}</span>
            {t.label}<span className={"text-xs " + (tab === t.id ? "text-mist" : "text-muted")}>{t.th}</span>
          </button>
        ))}
      </div>

      <div id="lesson-panel" role="tabpanel" key={tab} className="learn-in">
        {tab === "learn" && (
          <div className="flex flex-col gap-4">
            {hasWords && (
              <div className="flex w-fit rounded-xl bg-[#ebe5d8] p-1 text-sm" role="group" aria-label="ขั้นตอนใน Learn">
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

  // Keyboard: A–D choose (multiple choice), Enter checks, ← → move. Typing in a box is left alone.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (review || e.altKey || e.ctrlKey || e.metaKey) return;
      if ((e.target as HTMLElement).closest("input, textarea, select")) return;
      const k = e.key.toUpperCase();
      if (item?.t === "pick" && LETTERS.includes(k) && LETTERS.indexOf(k) < item.o.length && st.checked !== "ok") {
        update({ choice: LETTERS.indexOf(k), checked: null });
      } else if (e.key === "ArrowRight") move(at + 1);
      else if (e.key === "ArrowLeft") move(at - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (total === 0) return <p className="text-muted">บทนี้ยังไม่มีแบบฝึก ไปที่แท็บ Quiz ได้เลย</p>;

  if (review) {
    const right = states.filter((s) => s.firstTry).length;
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-navy p-5 text-white">
          <p className="font-brand text-4xl font-bold text-gold-soft tabular">{right}/{total}</p>
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold">ถูกตั้งแต่ครั้งแรก {right} จาก {total} ข้อ</p>
            <p className="text-mist">แบบฝึกไม่นับคะแนน ใช้ดูว่าพร้อมทำ Quiz หรือยัง</p>
          </div>
          <button type="button" className="btn-dark" onClick={restart}><RotateCcwIcon className="size-4" /> ฝึกอีกรอบ</button>
          <button type="button" className="btn" onClick={onNext}>ไปทำ Quiz <ArrowRightIcon className="size-4" /></button>
        </div>
        <ol className="flex flex-col gap-2">
          {items.map((it, i) => (
            <li key={i} className="card flex items-start gap-3 p-4 text-sm">
              {states[i].firstTry ? <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-obj" aria-label="ถูกครั้งแรก" /> : <XCircleIcon className="mt-0.5 size-5 shrink-0 text-[#b45309]" aria-label="ต้องลองหลายครั้งหรือดูเฉลย" />}
              <div className="min-w-0">
                <p className="font-medium">{it.t === "order" ? it.th : it.q}</p>
                <p className="text-obj">คำตอบ: <b>{answerOf(it)}</b></p>
                {it.t !== "order" && it.th && <p className="text-xs text-muted">{it.th}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  const percent = Math.round((checkedCount / total) * 100);
  return (
    <div className="flex flex-col gap-4">
      {lesson.speak && <SpeakingDrill items={lesson.speak} />}
      <div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">ข้อ {at + 1} จาก {total}</span>
          <span className="text-muted tabular">ทำแล้ว {percent}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#ebe5d8]" role="progressbar" aria-label="ความคืบหน้าแบบฝึก" aria-valuemin={0} aria-valuemax={total} aria-valuenow={checkedCount}>
          <div className="h-full rounded-full bg-navy transition-[width] duration-300" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <section key={at} className="learn-in overflow-hidden rounded-2xl border border-line bg-surface" aria-labelledby="ex-q">
        <div className="h-1 bg-[linear-gradient(90deg,#0d233b,#e9bb70)]" aria-hidden />
        <div className="flex flex-col gap-5 p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-3 text-sm text-ink-2">
              <span className="grid size-9 place-items-center rounded-full bg-brand-soft font-semibold text-navy">{at + 1}</span>
              {KIND_LABEL[item.t]}
            </p>
            {item.t === "pick" && <p className="hidden items-center gap-1.5 text-xs text-muted sm:flex"><KeyboardIcon className="size-4" aria-hidden /> A–D เลือก · ← → เปลี่ยนข้อ</p>}
          </div>

          <ExerciseBody item={item} st={st} update={update} onSubmit={check} />

          <div className="flex flex-wrap gap-2">
            {st.checked !== "ok" && !st.shown && (
              <button type="button" className="btn" disabled={!ready(item, st)} onClick={check}>ตรวจคำตอบ</button>
            )}
            {!st.hint && st.checked !== "ok" && !st.shown && (
              <button type="button" className="btn-ghost" onClick={() => update({ hint: true })}><LightbulbIcon className="size-4" /> คำใบ้</button>
            )}
            {st.checked === "no" && !st.shown && (
              <button type="button" className="btn-ghost" onClick={() => update({ shown: true, firstTry: st.firstTry ?? false })}>ดูเฉลย</button>
            )}
          </div>

          {st.hint && st.checked !== "ok" && !st.shown && (
            <p className="rounded-xl bg-[#fbf3cf] px-4 py-3 text-sm"><b>คำใบ้:</b> {hintOf(item)}</p>
          )}
          <Feedback item={item} st={st} />
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" className="btn-ghost" disabled={at === 0} onClick={() => move(at - 1)}><ArrowLeftIcon className="size-4" /> ข้อก่อน</button>
        <ol className="flex flex-wrap justify-center gap-1.5" aria-label="ทุกข้อ">
          {states.map((s, i) => (
            <li key={i}>
              <button type="button" onClick={() => move(i)} aria-label={`ข้อ ${i + 1}${s.checked === "ok" ? " ถูกแล้ว" : s.shown ? " ดูเฉลยแล้ว" : s.checked === "no" ? " ยังไม่ถูก" : ""}`}
                aria-current={i === at ? "step" : undefined}
                className={"size-3.5 rounded-full transition " + (i === at ? "ring-2 ring-navy ring-offset-2 " : "") +
                  (s.checked === "ok" ? "bg-obj" : s.shown ? "bg-[#d9a84a]" : s.checked === "no" ? "bg-[#f0b9a8]" : "bg-[#ddd5c4]")} />
            </li>
          ))}
        </ol>
        {finished ? (
          <button type="button" className="btn" onClick={() => setReview(true)}>ดูสรุปผล <ArrowRightIcon className="size-4" /></button>
        ) : (
          <button type="button" className="btn-ghost" disabled={at === total - 1} onClick={() => move(at + 1)}>ข้อต่อไป <ArrowRightIcon className="size-4" /></button>
        )}
      </div>
      <p className="text-sm text-muted"><b className="text-ink">การบ้าน:</b> {lesson.homework}</p>
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

function ExerciseBody({ item, st, update, onSubmit }: { item: PracticeItem; st: ItemState; update: (p: Partial<ItemState>) => void; onSubmit: () => void }) {
  const locked = st.checked === "ok" || st.shown;
  if (item.t === "pick") {
    return (
      <>
        <p id="ex-q" className="font-display text-2xl leading-snug font-semibold sm:text-[28px]">{item.q}</p>
        <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-labelledby="ex-q">
          {item.o.map((o, i) => {
            const chosen = st.choice === i;
            const right = locked && i === item.a;
            const wrong = st.checked === "no" && chosen;
            return (
              <button key={o} type="button" role="radio" aria-checked={chosen} disabled={locked} onClick={() => update({ choice: i, checked: null })}
                className={"flex items-center gap-4 rounded-2xl border-2 px-4 py-4 text-left text-[17px] transition " +
                  (right ? "border-obj bg-obj-bg" : wrong ? "border-[#e8a58f] bg-bad-bg" : chosen ? "border-navy bg-brand-soft" : "border-line bg-surface hover:border-navy/40")}>
                <span className={"grid size-9 shrink-0 place-items-center rounded-lg font-mono text-sm font-semibold " + (right ? "bg-obj text-white" : chosen ? "bg-navy text-white" : "text-muted")}>{LETTERS[i]}</span>
                <span className="flex-1">{o}</span>
                {right && <CheckCircle2Icon className="size-6 text-obj" aria-hidden />}
                {wrong && <XCircleIcon className="size-6 text-bad" aria-hidden />}
              </button>
            );
          })}
        </div>
      </>
    );
  }
  if (item.t === "order") {
    return (
      <>
        <p id="ex-q" className="text-[17px]">เรียงคำให้ได้ความหมาย: <b>{item.th}</b></p>
        <div className="flex min-h-14 flex-wrap gap-2 rounded-xl border-2 border-dashed border-line p-2.5" aria-label="ประโยคที่เรียงแล้ว">
          {st.picked.map((idx, i) => (
            <button key={i} type="button" disabled={locked} className="rounded-lg bg-navy px-3 py-1.5 font-mono text-[15px] text-white"
              onClick={() => update({ picked: st.picked.filter((_, j) => j !== i), checked: null })}>{item.w[idx]}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {item.w.map((w, idx) => (
            <button key={idx} type="button" disabled={locked || st.picked.includes(idx)}
              className="rounded-lg border border-line bg-surface px-3 py-1.5 font-mono text-[15px] hover:border-navy/40 disabled:opacity-25"
              onClick={() => update({ picked: [...st.picked, idx], checked: null })}>{w}</button>
          ))}
        </div>
      </>
    );
  }
  return (
    <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); if (ready(item, st)) onSubmit(); }}>
      <p id="ex-q" className="font-display text-2xl leading-snug font-semibold">{item.t === "fix" ? <><span className="text-base font-normal text-muted">แก้ให้ถูก: </span>{item.q}</> : item.q}</p>
      <input className="input text-lg" value={st.value} readOnly={locked} onChange={(e) => update({ value: e.target.value, checked: null })}
        placeholder={item.t === "fix" ? "พิมพ์ประโยคที่ถูก" : "พิมพ์คำที่หายไป"} autoCapitalize="off" autoComplete="off" spellCheck={false} aria-labelledby="ex-q" />
    </form>
  );
}

function Feedback({ item, st }: { item: PracticeItem; st: ItemState }) {
  if (st.checked === "ok") {
    return (
      <div className="flex gap-3 rounded-xl border-l-4 border-obj bg-obj-bg px-4 py-3" role="status">
        <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-obj" aria-hidden />
        <div className="text-sm leading-6">
          <p className="font-semibold text-obj">ถูกต้อง!{st.attempts > 1 ? ` (ครั้งที่ ${st.attempts})` : ""}</p>
          <p>คำตอบ: <b>{answerOf(item)}</b></p>
          {item.th && <p className="text-muted">{item.th}</p>}
        </div>
      </div>
    );
  }
  if (st.shown) {
    return (
      <div className="flex gap-3 rounded-xl border-l-4 border-[#d9a84a] bg-[#fbf3cf] px-4 py-3" role="status">
        <LightbulbIcon className="mt-0.5 size-5 shrink-0 text-[#8a5a00]" aria-hidden />
        <div className="text-sm leading-6">
          <p>เฉลย: <b>{answerOf(item)}</b></p>
          {item.th && <p className="text-muted">{item.th}</p>}
        </div>
      </div>
    );
  }
  if (st.checked === "no") {
    return (
      <div className="flex gap-3 rounded-xl border-l-4 border-bad bg-bad-bg px-4 py-3" role="status">
        <XCircleIcon className="mt-0.5 size-5 shrink-0 text-bad" aria-hidden />
        <p className="text-sm leading-6"><b className="text-bad">ยังไม่ใช่</b> แก้คำตอบแล้วตรวจอีกครั้ง หรือกดดูคำใบ้</p>
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
        <p className="rounded-lg bg-navy px-3 py-2.5 font-mono text-[14px] text-gold-soft">{lesson.formula}</p>
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
              <li key={word.id} className="rounded-full border border-line bg-paper px-3 py-1 text-sm"><b className="font-semibold">{word.en}</b> <span className="text-muted">{word.th}</span></li>
            ))}
          </ul>
        </section>
      )}
      <section className="flex flex-wrap items-center gap-3 rounded-2xl bg-navy p-5 text-white lg:col-span-2">
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
  const allAnswered = answers.every((a) => a !== null);

  function submit() {
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const passed = done && done.score >= passMark;

  return (
    <div className="flex flex-col gap-4">
      {done && (
        <div className={"card flex flex-wrap items-center gap-4 p-5 " + (passed ? "border-[#9ccdb8] bg-obj-bg" : "border-[#f3c3bd] bg-bad-bg")}>
          <p className="font-display text-4xl font-bold tabular">{done.score}%</p>
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold">{passed ? "ผ่านแล้ว" : `ยังไม่ผ่าน ต้องได้ ${passMark}% ขึ้นไป`}</p>
            <p className="text-muted">
              {error ? "บันทึกคะแนนไม่สำเร็จ ลองส่งอีกครั้ง" : done.saved ? "บันทึกคะแนนแล้ว" : "ยังไม่ได้เข้าสู่ระบบ คะแนนนี้จึงไม่ถูกบันทึก"}
            </p>
            {done.added > 0 && <p className="text-obj">เพิ่มคำใหม่ {done.added} คำเข้าการ์ดทวนแล้ว</p>}
          </div>
          {passed && next ? (
            <Link href={next.href} className="btn">บทถัดไป: {next.title} →</Link>
          ) : (
            <button type="button" className="btn-ghost" onClick={() => { setQuiz(shuffleQuiz(lesson.quiz)); setAnswers(lesson.quiz.map(() => null)); setDone(null); }}>ทำใหม่</button>
          )}
        </div>
      )}

      <ol className="grid gap-4 lg:grid-cols-2">
        {quiz.map((q, i) => (
          <li key={i} className="card flex flex-col gap-3 p-5">
            <p className="eyebrow">ข้อ {i + 1} จาก {quiz.length}</p>
            <p className="text-[15px] font-medium">{q.q}</p>
            <div className="flex flex-col gap-2" role="radiogroup" aria-label={`ข้อ ${i + 1}`}>
              {q.o.map((o, j) => {
                const chosen = answers[i] === j;
                const reveal = done !== null;
                const tone = reveal && j === q.a ? "border-obj bg-obj-bg" : reveal && chosen ? "border-bad bg-bad-bg" : chosen ? "border-brand bg-brand-soft" : "border-line bg-surface hover:border-brand";
                return (
                  <button key={j} type="button" role="radio" aria-checked={chosen} disabled={reveal}
                    onClick={() => setAnswers(answers.map((a, k) => (k === i ? j : a)))}
                    className={"rounded-lg border-[1.5px] px-3 py-2.5 text-left text-[15px] transition " + tone}>
                    {o}
                  </button>
                );
              })}
            </div>
            {done && q.why && <p className="text-xs text-muted">{q.why}</p>}
          </li>
        ))}
      </ol>

      {!done && (
        <button type="button" className="btn self-start" disabled={!allAnswered || pending} onClick={submit}>
          {pending ? "กำลังตรวจ…" : allAnswered ? "ส่งคำตอบ" : `ตอบให้ครบก่อน (${answers.filter((a) => a !== null).length}/${quiz.length})`}
        </button>
      )}
    </div>
  );
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
