"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { saveAttempt } from "@/app/actions";
import type { Lesson, PracticeItem } from "@/content";
import { normalize } from "@/content/lookup";
import { Sentence } from "./sentence";

const TABS = [
  { id: "theory", label: "ทฤษฎี" },
  { id: "practice", label: "ฝึก" },
  { id: "quiz", label: "ทดสอบ" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export function LessonView({ lesson, next, passMark }: { lesson: Lesson; next?: { href: string; title: string }; passMark: number }) {
  const [tab, setTab] = useState<Tab>("theory");
  const go = (t: Tab) => {
    setTab(t);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" aria-label="ส่วนของบทเรียน" className="grid grid-cols-3 rounded-[10px] bg-[#e6ebe8] p-1">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={
              "rounded-lg py-2 text-sm transition " +
              (tab === t.id ? "bg-surface font-semibold shadow-sm" : "text-muted hover:text-ink")
            }
          >
            <span className="mr-1.5 font-mono text-xs text-muted">{i + 1}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "theory" && <Theory lesson={lesson} onNext={() => go("practice")} />}
      {tab === "practice" && <Practice lesson={lesson} onNext={() => go("quiz")} />}
      {tab === "quiz" && <Quiz lesson={lesson} next={next} passMark={passMark} />}
    </div>
  );
}

function Theory({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="card p-5 sm:p-6">
        <p className="eyebrow mb-2">ทำไมต้องรู้</p>
        <p className="mb-4 text-[15px] leading-7">{lesson.why}</p>
        <div className="prose-lesson" dangerouslySetInnerHTML={{ __html: lesson.theory }} />
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

function Practice({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">ฝึกได้ไม่จำกัด ตอบผิดไม่เสียคะแนน และกดดูเฉลยได้ทุกข้อ</p>
      <div className="grid gap-4 lg:grid-cols-2">
        {lesson.practice.map((item, i) => (
          <PracticeCard key={i} n={i + 1} item={item} />
        ))}
      </div>
      <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
        <p className="text-sm">
          <b className="font-semibold">การบ้าน:</b> {lesson.homework}
        </p>
        <button type="button" className="btn" onClick={onNext}>ไปทดสอบ →</button>
      </div>
    </div>
  );
}

function answerOf(item: PracticeItem) {
  if (item.t === "pick") return item.o[item.a];
  if (item.t === "order") return item.a;
  return item.a[0];
}

function PracticeCard({ n, item }: { n: number; item: PracticeItem }) {
  const [text, setText] = useState("");
  const [picked, setPicked] = useState<number[]>([]);
  const [result, setResult] = useState<"ok" | "no" | "shown" | null>(null);

  const check = (value: string) => {
    const accepted = item.t === "order" ? [item.a] : item.t === "pick" ? [] : item.a;
    setResult(accepted.some((a) => normalize(a) === normalize(value)) ? "ok" : "no");
  };

  return (
    <div className="card flex flex-col gap-3 p-5">
      <p className="eyebrow">ข้อ {n} · {KIND_LABEL[item.t]}</p>

      {item.t === "order" && (
        <>
          <p className="text-[15px]">เรียงให้ได้ความหมาย: {item.th}</p>
          <div className="flex min-h-12 flex-wrap gap-1.5 rounded-lg border border-dashed border-line p-2">
            {picked.map((idx, i) => (
              <button key={i} type="button" className="rounded-md bg-brand-soft px-2.5 py-1 font-mono text-sm"
                onClick={() => { setPicked(picked.filter((_, j) => j !== i)); setResult(null); }}>
                {item.w[idx]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {item.w.map((w, idx) => (
              <button key={idx} type="button" disabled={picked.includes(idx)}
                className="rounded-md border border-line bg-surface px-2.5 py-1 font-mono text-sm disabled:opacity-25"
                onClick={() => { setPicked([...picked, idx]); setResult(null); }}>
                {w}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn" disabled={picked.length !== item.w.length}
              onClick={() => check(picked.map((i) => item.w[i]).join(" "))}>ตรวจ</button>
            <button type="button" className="btn-ghost" onClick={() => { setPicked([]); setResult(null); }}>ล้าง</button>
            <button type="button" className="btn-ghost" onClick={() => setResult("shown")}>ดูเฉลย</button>
          </div>
        </>
      )}

      {(item.t === "fill" || item.t === "fix") && (
        <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); check(text); }}>
          <p className="font-mono text-[15px]">{item.t === "fix" ? `แก้ให้ถูก: ${item.q}` : item.q}</p>
          <input className="input" value={text} onChange={(e) => { setText(e.target.value); setResult(null); }}
            placeholder={item.t === "fix" ? "พิมพ์ประโยคที่ถูก" : "พิมพ์คำที่หายไป"} autoCapitalize="off" autoComplete="off" spellCheck={false}
            aria-label={`คำตอบข้อ ${n}`} />
          <div className="flex gap-2">
            <button type="submit" className="btn" disabled={!text.trim()}>ตรวจ</button>
            <button type="button" className="btn-ghost" onClick={() => setResult("shown")}>ดูเฉลย</button>
          </div>
        </form>
      )}

      {item.t === "pick" && (
        <>
          <p className="text-[15px]">{item.q}</p>
          <div className="flex flex-col gap-2">
            {item.o.map((o, i) => (
              <button key={o} type="button" onClick={() => setResult(i === item.a ? "ok" : "no")}
                className="rounded-lg border-[1.5px] border-line bg-surface px-3 py-2.5 text-left text-[15px] hover:border-brand">
                {o}
              </button>
            ))}
          </div>
        </>
      )}

      {result === "ok" && <p className="text-sm font-semibold text-obj">✓ ถูกต้อง</p>}
      {result === "no" && <p className="text-sm font-semibold text-bad">✗ ยังไม่ใช่ ลองอีกครั้ง หรือกดดูเฉลย</p>}
      {result === "shown" && <p className="text-sm">เฉลย: <b className="font-semibold text-obj">{answerOf(item)}</b></p>}
      {result && result !== "no" && item.th && <p className="text-xs text-muted">{item.th}</p>}
    </div>
  );
}

function Quiz({ lesson, next, passMark }: { lesson: Lesson; next?: { href: string; title: string }; passMark: number }) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => lesson.quiz.map(() => null));
  const [done, setDone] = useState<{ score: number; saved: boolean } | null>(null);
  const [error, setError] = useState(false);
  const [pending, start] = useTransition();
  const allAnswered = answers.every((a) => a !== null);

  function submit() {
    const right = lesson.quiz.filter((q, i) => answers[i] === q.a).length;
    const score = Math.round((right / lesson.quiz.length) * 100);
    const wrongs = lesson.quiz
      .map((q, i) => ({ q, a: answers[i] }))
      .filter(({ q, a }) => a !== q.a)
      .map(({ q, a }) => ({ wrong: q.o[a ?? 0], correct: q.o[q.a], note: q.why }));
    start(async () => {
      try {
        const saved = await saveAttempt(lesson.id, score, score >= passMark, wrongs);
        setDone({ score, saved });
        setError(false);
      } catch {
        setDone({ score, saved: false });
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
          </div>
          {passed && next ? (
            <Link href={next.href} className="btn">บทถัดไป: {next.title} →</Link>
          ) : (
            <button type="button" className="btn-ghost" onClick={() => { setAnswers(lesson.quiz.map(() => null)); setDone(null); }}>ทำใหม่</button>
          )}
        </div>
      )}

      <ol className="grid gap-4 lg:grid-cols-2">
        {lesson.quiz.map((q, i) => (
          <li key={i} className="card flex flex-col gap-3 p-5">
            <p className="eyebrow">ข้อ {i + 1} จาก {lesson.quiz.length}</p>
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
          {pending ? "กำลังตรวจ…" : allAnswered ? "ส่งคำตอบ" : `ตอบให้ครบก่อน (${answers.filter((a) => a !== null).length}/${lesson.quiz.length})`}
        </button>
      )}
    </div>
  );
}
