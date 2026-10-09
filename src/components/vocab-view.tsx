"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { reviewCard } from "@/app/actions";
import type { Deck, Word } from "@/content";
import type { CardMap } from "@/lib/data";
import { buildQueue } from "@/lib/queue";
import { Sentence } from "./sentence";
import { speak } from "./speak";

const MINE = "mine";

export function VocabView({ words, decks, cards: initialCards, signedIn, today }: { words: Word[]; decks: Deck[]; cards: CardMap; signedIn: boolean; today: string }) {
  const [cards, setCards] = useState(initialCards);
  const [deck, setDeck] = useState(decks[0]?.id ?? "");
  const [round, setRound] = useState(0);

  // Words the learner added from the tap-a-word sheet.
  const mine: Word[] = Object.entries(cards)
    .filter(([id, c]) => id.startsWith("u-") && c.custom_en)
    .map(([id, c]) => ({ id, en: c.custom_en ?? "", th: c.custom_th ?? "" }));

  const pool = deck === MINE ? mine : words.filter((w) => w.id.startsWith(decks.find((d) => d.id === deck)?.pre ?? "?"));
  const knownIn = (list: Word[]) => list.filter((w) => (cards[w.id]?.box ?? 0) >= 3).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {[...decks, { id: MINE, name: "คำที่ฉันเพิ่มเอง", pre: "u-" }].map((d) => {
          const list = d.id === MINE ? mine : words.filter((w) => w.id.startsWith(d.pre));
          const on = d.id === deck;
          return (
            <button key={d.id} type="button" aria-pressed={on} onClick={() => setDeck(d.id)}
              className={"rounded-full border px-3.5 py-2 text-sm transition " + (on ? "border-ink bg-ink text-white" : "border-line bg-surface hover:border-brand")}>
              {d.name}
              <span className={"ml-2 font-mono text-[11px] tabular " + (on ? "text-[#b7c5bf]" : "text-muted")}>
                {knownIn(list)}/{list.length}
              </span>
            </button>
          );
        })}
      </div>

      {pool.length === 0 ? (
        <div className="card p-6 text-sm leading-6 text-muted">
          ยังไม่มีคำในชุดนี้ ระหว่างเรียน Grammar ให้แตะคำในประโยคตัวอย่าง แล้วกด <b className="text-ink">เพิ่มลงการ์ดทวน</b> คำนั้นจะมาอยู่ที่นี่
        </div>
      ) : (
        <Review
          key={`${deck}-${round}`}
          today={today}
          pool={pool}
          cards={cards}
          round={round}
          signedIn={signedIn}
          onRestart={() => setRound((r) => r + 1)}
          onReviewed={(id, card) => setCards((c) => ({ ...c, [id]: { ...(c[id] ?? { custom_en: null, custom_th: null }), ...card } }))}
        />
      )}
    </div>
  );
}

type ReviewProps = {
  pool: Word[];
  cards: CardMap;
  today: string;
  round: number;
  signedIn: boolean;
  onRestart: () => void;
  onReviewed: (id: string, card: { box: number; due_on: string }) => void;
};

function Review({ pool, cards, today, round, signedIn, onRestart, onReviewed }: ReviewProps) {
  const [queue, setQueue] = useState(() => buildQueue(pool, cards, today, round));
  const [shown, setShown] = useState(false);
  const [stats, setStats] = useState({ done: 0, right: 0 });
  const [saveFailed, setSaveFailed] = useState(false);
  const [, start] = useTransition();
  const word = queue[0];

  if (!word) {
    return (
      <div className="card flex flex-col items-start gap-3 p-6">
        <p className="font-display text-2xl font-bold">ครบรอบนี้แล้ว</p>
        <p className="text-sm text-muted">ทวน {stats.done} ครั้ง จำได้ {stats.right} ครั้ง</p>
        <button type="button" className="btn" onClick={onRestart}>ทวนอีกรอบ</button>
      </div>
    );
  }

  function grade(remembered: boolean) {
    setStats((s) => ({ done: s.done + 1, right: s.right + (remembered ? 1 : 0) }));
    setQueue((q) => (remembered ? q.slice(1) : [...q.slice(1), q[0]]));
    setShown(false);
    start(async () => {
      try {
        const card = await reviewCard({ itemId: word.id, kind: "word", correct: remembered });
        if (card) onReviewed(word.id, card);
        setSaveFailed(false);
      } catch {
        setSaveFailed(true);
      }
    });
  }

  const box = cards[word.id]?.box;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between font-mono text-xs text-muted tabular">
          <span>เหลือ {queue.length} ใบ{box !== undefined ? ` · กล่อง ${box}` : " · คำใหม่"}</span>
          <span>จำได้ {stats.right}/{stats.done}</span>
        </div>
        <div className="flex min-h-56 flex-col justify-between gap-6 rounded-2xl bg-ink px-6 py-6 text-white">
          <span className="font-mono text-[11px] tracking-[0.08em] text-mark">คำนี้แปลว่าอะไร</span>
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-5xl font-bold tracking-tight break-words">{word.en}</h2>
            <button type="button" onClick={() => speak(word.en)} className="shrink-0 rounded-full border border-[#2c3f37] px-3 py-1.5 text-xs text-[#c9d4cf]">ฟัง</button>
          </div>
          {shown ? <p className="text-lg text-mark">{word.th}</p> : <p className="text-sm text-[#7f918a]">นึกคำตอบในใจก่อน แล้วกดดูความหมาย</p>}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {word.ex && (
          <div className="card p-5">
            <p className="eyebrow mb-2">ประโยคตัวอย่าง</p>
            <Sentence en={word.ex} />
          </div>
        )}
        {shown ? (
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="btn-ghost border-[#f3c3bd] text-bad hover:bg-bad-bg" onClick={() => grade(false)}>ยังจำไม่ได้</button>
            <button type="button" className="btn" onClick={() => grade(true)}>จำได้</button>
          </div>
        ) : (
          <button type="button" className="btn" onClick={() => setShown(true)}>ดูความหมาย</button>
        )}
        <p className="text-xs leading-5 text-muted">
          จำได้ การ์ดจะเลื่อนไปกล่องถัดไปและกลับมาอีกใน 1, 3, 7, 14 หรือ 30 วัน ถ้าจำไม่ได้จะกลับไปกล่อง 0 และวนมาในรอบนี้อีกครั้ง
        </p>
        {!signedIn && (
          <p className="text-xs text-muted">
            <Link href="/login" className="font-semibold text-brand underline">เข้าสู่ระบบ</Link> เพื่อบันทึกว่าคำไหนจำได้แล้ว
          </p>
        )}
        {saveFailed && <p className="text-xs text-bad">บันทึกผลไม่สำเร็จ ตรวจการเชื่อมต่อแล้วทวนต่อได้เลย</p>}
      </div>
    </div>
  );
}
