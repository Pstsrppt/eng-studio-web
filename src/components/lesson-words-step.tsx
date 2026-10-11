"use client";

import { useState } from "react";
import type { LessonWord, LessonWords } from "@/content/lesson-words";
import { Sentence } from "./sentence";
import { speak } from "./speak";
import { POS_STYLE, PosBadge, WordIcon } from "./vocab-view";

const CHECK_SIZE = 5;

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** The right meaning and up to three others from this lesson, in an order fixed by the word. */
function options(target: LessonWord, pool: LessonWord[]) {
  const others = [...new Set(pool.map((x) => x.word.th).filter((th) => th !== target.word.th))]
    .sort((a, b) => hash(target.word.id + a) - hash(target.word.id + b))
    .slice(0, 3);
  return [target.word.th, ...others].sort((a, b) => hash(a + target.word.id) - hash(b + target.word.id));
}

/** Step 1 of a lesson: meet the new words in a sentence from the lesson, then a quick listening check. */
export function LessonWordsStep({ words, onNext }: { words: LessonWords; onNext: () => void }) {
  const [checking, setChecking] = useState(false);
  const pool = [...words.fresh, ...words.more, ...words.review];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">คำใหม่ในบทนี้ {words.fresh.length} คำ</h2>
          <p className="text-sm text-muted">รู้ความหมายก่อน แล้วทฤษฎีจะอ่านง่ายขึ้น · แตะไอคอนเพื่อฟังเสียง · สอบผ่านบทนี้แล้วคำเหล่านี้จะเข้าการ์ดทวนให้เอง</p>
        </div>
        <button type="button" className="btn-ghost py-2" onClick={onNext}>รู้หมดแล้ว ข้ามไปทฤษฎี →</button>
      </div>

      {checking ? (
        <QuickCheck words={words.fresh} pool={pool} onDone={onNext} onBack={() => setChecking(false)} />
      ) : (
        <>
          <ol className="grid gap-2.5 lg:grid-cols-2">
            {words.fresh.map((x) => <WordCard key={x.word.id} item={x} />)}
          </ol>
          <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-sm">ลองเช็คตัวเองสั้น ๆ {Math.min(CHECK_SIZE, words.fresh.length)} ข้อ ฟังเสียงแล้วเลือกความหมาย</p>
            <div className="flex gap-2">
              {words.fresh.length >= 2 && pool.length >= 2 && (
                <button type="button" className="btn-ghost py-2" onClick={() => { setChecking(true); speak(words.fresh[0].word.en); }}>เช็คตัวเอง</button>
              )}
              <button type="button" className="btn" onClick={onNext}>ไปทฤษฎี →</button>
            </div>
          </div>
        </>
      )}

      {(words.more.length > 0 || words.review.length > 0) && (
        <details className="card p-4 text-sm">
          <summary className="cursor-pointer font-semibold">
            คำอื่นในบทนี้ {words.more.length + words.review.length} คำ
            <span className="ml-1 font-normal text-muted">(เรียนแล้วในบทก่อน ๆ หรือเจอไม่บ่อย)</span>
          </summary>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {[...words.more, ...words.review].map((x) => (
              <li key={x.word.id}>
                <button type="button" onClick={() => speak(x.word.en)}
                  className="rounded-full border border-line bg-surface px-3 py-1 hover:border-brand">
                  <b className="font-semibold">{x.word.en}</b> <span className="text-muted">{x.word.th}</span>
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function WordCard({ item }: { item: LessonWord }) {
  const w = item.word;
  const tone = POS_STYLE[w.pos ?? "phrase"];
  return (
    <li className="flex gap-3 rounded-xl border border-line bg-surface p-3">
      <button type="button" onClick={() => speak(w.en)} aria-label={`ฟังเสียง ${w.en}`}
        className={"grid size-11 shrink-0 place-items-center rounded-lg transition hover:brightness-95 active:scale-95 " + tone.tile}>
        <WordIcon word={w} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <span className="text-lg font-bold leading-tight">{w.en}</span>
          {w.pos && <PosBadge pos={w.pos} />}
          {w.level && <span className="font-mono text-[10px] text-muted">{w.level}</span>}
        </div>
        <p className="text-[15px]">{w.th}</p>
        {item.ex && (
          <div className={"mt-2 rounded-lg px-3 py-2 " + tone.chip}>
            <Sentence en={item.ex} th={item.exTh} />
          </div>
        )}
      </div>
    </li>
  );
}

/** Up to five listen-and-pick questions on the new words. */
function QuickCheck({ words, pool, onDone, onBack }: { words: LessonWord[]; pool: LessonWord[]; onDone: () => void; onBack: () => void }) {
  const items = words.slice(0, CHECK_SIZE);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const item = items[i];

  if (!item) {
    return (
      <div className="card flex flex-col items-start gap-3 p-5">
        <p className="font-display text-2xl font-bold">ถูก {right} จาก {items.length}</p>
        <p className="text-sm text-muted">{right === items.length ? "พร้อมแล้ว ไปอ่านทฤษฎีกัน" : "คำที่ยังจำไม่ได้ไม่เป็นไร จะเจออีกในทฤษฎีและแบบฝึก"}</p>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost py-2" onClick={onBack}>ดูคำอีกครั้ง</button>
          <button type="button" className="btn" onClick={onDone}>ไปทฤษฎี →</button>
        </div>
      </div>
    );
  }

  const opts = options(item, pool);
  function choose(th: string) {
    if (picked) return;
    setPicked(th);
    if (th === item.word.th) setRight((r) => r + 1);
  }
  function next() {
    setPicked(null);
    setI(i + 1);
    const nextItem = items[i + 1];
    if (nextItem) speak(nextItem.word.en);
  }

  return (
    <div className="card flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <p className="eyebrow">ข้อ {i + 1} จาก {items.length}</p>
        <button type="button" onClick={() => speak(item.word.en)} className="btn-ghost py-1.5">ฟังอีกครั้ง</button>
      </div>
      <p className="text-[15px] font-medium">
        {picked ? <>คำว่า <b>{item.word.en}</b> แปลว่า</> : "ได้ยินคำว่าอะไร เลือกความหมาย"}
      </p>
      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="เลือกความหมาย">
        {opts.map((th) => {
          const tone = !picked ? "border-line bg-surface hover:border-brand"
            : th === item.word.th ? "border-obj bg-obj-bg"
            : th === picked ? "border-bad bg-bad-bg" : "border-line bg-surface opacity-60";
          return (
            <button key={th} type="button" role="radio" aria-checked={picked === th} disabled={!!picked} onClick={() => choose(th)}
              className={"rounded-lg border-[1.5px] px-3 py-2.5 text-left text-[15px] transition " + tone}>
              {th}
            </button>
          );
        })}
      </div>
      {picked && <button type="button" className="btn self-start" onClick={next}>{i + 1 < items.length ? "ข้อต่อไป →" : "ดูผล"}</button>}
    </div>
  );
}
