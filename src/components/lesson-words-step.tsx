"use client";

import { useState } from "react";
import type { LessonWord, LessonWords } from "@/content/lesson-words";
import { PhotoWordCard } from "./photo-word-card";
import { Sentence } from "./sentence";
import { speak } from "./speak";
import { POS_STYLE, PosBadge, WordIcon } from "./vocab-view";

const CHECK_SIZE = 5;

/** The sentence from the lesson first, then the word's own example if it is a different one. */
function examplesOf(item: LessonWord) {
  const list: { en: string; th?: string }[] = [];
  if (item.ex) list.push({ en: item.ex, th: item.exTh });
  if (item.word.ex && item.word.ex !== item.ex) list.push({ en: item.word.ex, th: item.word.exTh });
  return list;
}

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
  const [view, setView] = useState<"cards" | "list">("cards");
  const [at, setAt] = useState(0);
  const all = [...words.fresh, ...words.review];
  const first = words.fresh[0] ?? all[0];
  const current = all[Math.min(at, all.length - 1)];
  const lastCard = at >= all.length - 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">
            คำศัพท์ในบทนี้ {all.length} คำ
            {words.review.length > 0 && <span className="ml-2 text-sm font-normal text-muted">ใหม่ {words.fresh.length} · เรียนแล้ว {words.review.length}</span>}
          </h2>
          <p className="text-sm text-muted">รู้ความหมายก่อน แล้วทฤษฎีจะอ่านง่ายขึ้น · แตะไอคอนเพื่อฟังเสียง · สอบผ่านบทนี้แล้วคำใหม่จะเข้าการ์ดทวนให้เอง</p>
        </div>
        <button type="button" className="btn-ghost py-2" onClick={onNext}>รู้หมดแล้ว ข้ามไปทฤษฎี →</button>
      </div>

      {checking ? (
        <QuickCheck words={words.fresh.length >= 2 ? words.fresh : all} pool={all} onDone={onNext} onBack={() => setChecking(false)} />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex rounded-[10px] bg-[#e6ebe8] p-1 text-sm" role="radiogroup" aria-label="รูปแบบการดูคำศัพท์">
              {([["cards", "ทีละคำ"], ["list", "ดูทั้งหมด"]] as const).map(([id, label]) => (
                <button key={id} type="button" role="radio" aria-checked={view === id} onClick={() => setView(id)}
                  className={"rounded-lg px-3 py-1.5 transition " + (view === id ? "bg-surface font-semibold shadow-sm" : "text-muted hover:text-ink")}>
                  {label}
                </button>
              ))}
            </div>
            {view === "cards" && current && (
              <span className="font-mono text-xs text-muted tabular">
                คำที่ {at + 1}/{all.length} · {at < words.fresh.length ? "คำใหม่" : "เรียนแล้ว"}
              </span>
            )}
          </div>

          {view === "cards" && current ? (
            <div className="flex flex-col gap-3">
              <PhotoWordCard key={current.word.id} word={current.word} photo={current.photo} index={at} examples={examplesOf(current)} />
              <div className="flex items-center justify-between gap-3">
                <button type="button" className="btn-ghost py-2" disabled={at === 0} onClick={() => setAt(at - 1)}>← คำก่อน</button>
                <div className="hidden flex-wrap justify-center gap-1 sm:flex" aria-hidden>
                  {all.map((x, i) => (
                    <span key={x.word.id} className={"size-1.5 rounded-full " + (i === at ? "bg-brand" : i < words.fresh.length ? "bg-[#b9c6c0]" : "bg-line")} />
                  ))}
                </div>
                {lastCard ? (
                  <button type="button" className="btn py-2" onClick={() => { setChecking(true); speak((first ?? current).word.en); }}>เช็คตัวเอง →</button>
                ) : (
                  <button type="button" className="btn py-2" onClick={() => { setAt(at + 1); speak(all[at + 1].word.en); }}>คำถัดไป →</button>
                )}
              </div>
            </div>
          ) : (
            <ol className="grid gap-2.5 lg:grid-cols-2">
              {words.fresh.map((x) => <WordCard key={x.word.id} item={x} />)}
              {words.review.map((x) => <WordCard key={x.word.id} item={x} learned />)}
            </ol>
          )}
          <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-sm">ลองเช็คตัวเองสั้น ๆ {Math.min(CHECK_SIZE, all.length)} ข้อ ฟังเสียงแล้วเลือกความหมาย</p>
            <div className="flex gap-2">
              {all.length >= 2 && first && (
                <button type="button" className="btn-ghost py-2" onClick={() => { setChecking(true); speak(first.word.en); }}>เช็คตัวเอง</button>
              )}
              <button type="button" className="btn" onClick={onNext}>ไปทฤษฎี →</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function WordCard({ item, learned = false }: { item: LessonWord; learned?: boolean }) {
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
          {learned && <span className="rounded-full bg-[#eef2ef] px-2 py-0.5 text-[11px] text-muted">เรียนแล้ว</span>}
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
