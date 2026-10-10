"use client";

import Link from "next/link";
import { Fragment, useState, useTransition } from "react";
import { reviewCard } from "@/app/actions";
import type { Deck, Word } from "@/content";
import { POS_LABEL, type Pos } from "@/content/pos";
import type { CardMap } from "@/lib/data";
import { buildQueue } from "@/lib/queue";
import { Sentence } from "./sentence";
import { SpeakButton } from "./speak-button";
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

      <WordTable words={words} mine={mine} decks={decks} cards={cards} signedIn={signedIn} />
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
          <span className="font-mono text-[11px] tracking-[0.08em] text-mark">
            คำนี้แปลว่าอะไร{word.pos ? ` · ${POS_LABEL[word.pos].abbr} ${POS_LABEL[word.pos].th}` : ""}
          </span>
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-5xl font-bold tracking-tight break-words">{word.en}</h2>
            <button type="button" onClick={() => speak(word.en)} className="shrink-0 rounded-full border border-[#2c3f37] px-3 py-1.5 text-xs text-[#c9d4cf]">ฟัง</button>
          </div>
          {shown ? (
            <div>
              <p className="text-lg text-mark">{word.th}</p>
              {word.forms && <p className="mt-1 text-sm text-[#c9d4cf]">{word.forms}</p>}
            </div>
          ) : (
            <p className="text-sm text-[#7f918a]">นึกคำตอบในใจก่อน แล้วกดดูความหมาย</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {word.ex && (
          <div className="card p-5">
            <p className="eyebrow mb-2">ประโยคตัวอย่าง</p>
            <Sentence en={word.ex} />
          </div>
        )}
        {shown && word.note && (
          <p className="rounded-lg bg-[#fbf3cf] px-3.5 py-3 text-sm leading-6"><b className="font-semibold">รู้ไว้</b> {word.note}</p>
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

type Hide = "none" | "th" | "en";
type Sort = "az" | "deck";

const HIDE_OPTIONS: { id: Hide; label: string }[] = [
  { id: "none", label: "แสดงทั้งหมด" },
  { id: "th", label: "ซ่อนความหมาย" },
  { id: "en", label: "ซ่อนภาษาอังกฤษ" },
];

const SORT_OPTIONS: { id: Sort; label: string }[] = [
  { id: "az", label: "A–Z" },
  { id: "deck", label: "ตามชุด" },
];

const POS_TONE: Record<Pos, string> = {
  n: "bg-subj-bg text-subj",
  v: "bg-verb-bg text-verb",
  adj: "bg-obj-bg text-obj",
  phrase: "bg-[#eef2ef] text-muted",
};

const POS_KEYS = Object.keys(POS_LABEL) as Pos[];

type TableProps = { words: Word[]; mine: Word[]; decks: Deck[]; cards: CardMap; signedIn: boolean };

/** Every word in one list, for reading through or self-testing with one column hidden. */
function WordTable({ words, mine, decks, cards, signedIn }: TableProps) {
  const [deck, setDeck] = useState("all");
  const [pos, setPos] = useState<Pos | "all">("all");
  const [sort, setSort] = useState<Sort>("az");
  const [query, setQuery] = useState("");
  const [hide, setHide] = useState<Hide>("none");
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());

  const all = [...words, ...mine];
  const inDeck = deck === "all" ? all : deck === MINE ? mine : words.filter((w) => w.id.startsWith(decks.find((d) => d.id === deck)?.pre ?? "?"));
  const q = query.trim().toLowerCase();
  const filtered = inDeck.filter(
    (w) => (pos === "all" || w.pos === pos) && (!q || w.en.toLowerCase().includes(q) || w.th.includes(q)),
  );
  const rows = sort === "az" ? [...filtered].sort((a, b) => a.en.localeCompare(b.en, "en", { sensitivity: "base" })) : filtered;

  function chooseHide(next: Hide) {
    setHide(next);
    setRevealed(new Set());
  }

  function reveal(id: string) {
    setRevealed((r) => new Set(r).add(id));
  }

  const hidden = (id: string, col: Hide) => hide === col && !revealed.has(id);
  const columns = signedIn ? 5 : 4;

  return (
    <section className="flex flex-col gap-4 pt-4" aria-labelledby="word-table">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="word-table" className="text-xl font-bold">ตารางคำศัพท์</h2>
          <p className="text-sm text-muted">อ่านทวนทีละหลายคำ หรือซ่อนคอลัมน์หนึ่งแล้วท่องเอง แตะช่องที่ซ่อนเพื่อดูคำตอบ</p>
        </div>
        <Segmented label="โหมดท่องศัพท์" options={HIDE_OPTIONS} value={hide} onChange={chooseHide} />
      </div>

      <div className="grid gap-3 sm:grid-cols-[repeat(2,minmax(0,12rem))_minmax(0,1fr)]">
        <select value={deck} onChange={(e) => setDeck(e.target.value)} aria-label="เลือกชุดคำ" className="input">
          <option value="all">ทุกชุด ({all.length})</option>
          {decks.map((d) => (
            <option key={d.id} value={d.id}>{d.name} ({words.filter((w) => w.id.startsWith(d.pre)).length})</option>
          ))}
          {mine.length > 0 && <option value={MINE}>คำที่ฉันเพิ่มเอง ({mine.length})</option>}
        </select>
        <select value={pos} onChange={(e) => setPos(e.target.value as Pos | "all")} aria-label="เลือกชนิดของคำ" className="input">
          <option value="all">ทุกชนิดคำ</option>
          {POS_KEYS.map((p) => (
            <option key={p} value={p}>{POS_LABEL[p].abbr} {POS_LABEL[p].th}</option>
          ))}
        </select>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาคำ ภาษาอังกฤษหรือไทย"
          aria-label="ค้นหาคำศัพท์" className="input" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted">
          {POS_KEYS.map((p) => (
            <span key={p} className="flex items-center gap-1.5"><PosBadge pos={p} /> {POS_LABEL[p].th}</span>
          ))}
          <Link href="/guide#pos" className="font-semibold text-brand underline underline-offset-2">ชนิดของคำคืออะไร</Link>
        </div>
        <Segmented label="เรียงลำดับ" options={SORT_OPTIONS} value={sort} onChange={setSort} />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full border-collapse text-left text-[15px]">
          <thead className="bg-paper text-xs text-muted">
            <tr>
              <th scope="col" className="w-10 px-3 py-2.5 font-medium">#</th>
              <th scope="col" className="px-3 py-2.5 font-medium">คำศัพท์</th>
              <th scope="col" className="px-3 py-2.5 font-medium">ความหมาย</th>
              <th scope="col" className="hidden px-3 py-2.5 font-medium md:table-cell">ประโยคตัวอย่าง</th>
              {signedIn && <th scope="col" className="hidden px-3 py-2.5 font-medium sm:table-cell">สถานะ</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((w, i) => {
              const letter = w.en[0].toUpperCase();
              const newLetter = sort === "az" && (i === 0 || rows[i - 1].en[0].toUpperCase() !== letter);
              return (
                <Fragment key={w.id}>
                  {newLetter && (
                    <tr>
                      <th colSpan={columns} scope="colgroup" className="border-t border-line bg-paper px-3 py-1.5 font-display text-sm font-bold">
                        {hide === "en" ? "" : letter}
                      </th>
                    </tr>
                  )}
                  <tr className="border-t border-line align-top">
                    <td className="px-3 py-3 font-mono text-xs text-muted tabular">{i + 1}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-start gap-2">
                        <SpeakButton text={w.en} />
                        <div className="min-w-0 pt-1">
                          {hidden(w.id, "en") ? <Cover onClick={() => reveal(w.id)} /> : <span className="font-semibold">{w.en}</span>}
                          {w.pos && <span className="ml-2 align-[1px]"><PosBadge pos={w.pos} /></span>}
                        </div>
                      </div>
                      {w.ex && !hidden(w.id, "en") && <p className="mt-1.5 text-[13px] text-muted md:hidden">{w.ex}</p>}
                    </td>
                    <td className="px-3 py-3">
                      {hidden(w.id, "th") ? (
                        <Cover onClick={() => reveal(w.id)} />
                      ) : (
                        <>
                          <span className="inline-block pt-1">{w.th}</span>
                          {w.forms && <p className="mt-1 text-xs text-muted">{w.forms}</p>}
                          {w.note && <p className="mt-1.5 text-xs leading-5"><b className="font-semibold text-verb">รู้ไว้</b> {w.note}</p>}
                        </>
                      )}
                      {signedIn && <div className="mt-1.5 sm:hidden"><Status box={cards[w.id]?.box} /></div>}
                    </td>
                    <td className="hidden px-3 py-3 text-sm text-muted md:table-cell">
                      <span className="inline-block pt-1">{hidden(w.id, "en") ? "" : w.ex}</span>
                    </td>
                    {signedIn && (
                      <td className="hidden px-3 py-3 sm:table-cell">
                        <Status box={cards[w.id]?.box} className="mt-1" />
                      </td>
                    )}
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-sm text-muted">ไม่พบคำที่ค้นหา</p>}
      </div>
    </section>
  );
}

function Segmented<T extends string>({ label, options, value, onChange }: { label: string; options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-[10px] bg-[#e6ebe8] p-1 text-sm" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id} onClick={() => onChange(o.id)}
          className={"rounded-lg px-3 py-1.5 transition " + (value === o.id ? "bg-surface font-semibold shadow-sm" : "text-muted hover:text-ink")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function PosBadge({ pos }: { pos: Pos }) {
  return (
    <abbr title={POS_LABEL[pos].th} className={"rounded px-1.5 py-0.5 font-mono text-[11px] no-underline " + POS_TONE[pos]}>
      {POS_LABEL[pos].abbr}
    </abbr>
  );
}

function Cover({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="h-7 w-28 rounded-md bg-[#e6ebe8] text-xs text-muted hover:bg-line">
      แตะเพื่อดู
    </button>
  );
}

function Status({ box, className = "" }: { box?: number; className?: string }) {
  const [label, tone] =
    box === undefined ? ["ใหม่", "bg-[#eef2ef] text-muted"] : box >= 3 ? ["จำได้แล้ว", "bg-obj-bg text-obj"] : [`กำลังจำ · กล่อง ${box}`, "bg-verb-bg text-verb"];
  return <span className={"inline-block whitespace-nowrap rounded-md px-2 py-0.5 text-xs " + tone + " " + className}>{label}</span>;
}
