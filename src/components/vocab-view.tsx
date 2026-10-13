"use client";

import { Volume2Icon } from "lucide-react";
import Link from "next/link";
import { Fragment, useRef, useState, useTransition } from "react";
import { flushSync } from "react-dom";
import { reviewCard } from "@/app/actions";
import type { Deck, Word } from "@/content";
import { POS_LABEL, WORD_LEVELS, type Pos, type WordLevel } from "@/content/pos";
import { normalize } from "@/content/lookup";
import type { CardMap } from "@/lib/data";
import { buildQueue } from "@/lib/queue";
import { speak } from "./speak";
import { useStudy } from "./study-context";
import { PhotoWordCard, type Cover } from "./photo-word-card";
import { POS_STYLE, PosBadge, WordIcon } from "./word-bits";

const MINE = "mine";

export function VocabView({ words, decks, cards: initialCards, signedIn, today }: { words: Word[]; decks: Deck[]; cards: CardMap; signedIn: boolean; today: string }) {
  const [cards, setCards] = useState(initialCards);
  const [deck, setDeck] = useState(decks[0]?.id ?? "");
  const [round, setRound] = useState(0);
  const [level, setLevel] = useState<WordLevel | "all">("all");
  const [mode, setMode] = useState<Mode>("recall");

  // Words the learner added from the tap-a-word sheet.
  const mine: Word[] = Object.entries(cards)
    .filter(([id, c]) => id.startsWith("u-") && c.custom_en)
    .map(([id, c]) => ({ id, en: c.custom_en ?? "", th: c.custom_th ?? "" }));

  // Words the learner added have no level, so the level filter leaves them alone.
  const atLevel = (list: Word[]) => (level === "all" ? list : list.filter((w) => !w.level || w.level === level));
  const pool = atLevel(deck === MINE ? mine : words.filter((w) => w.id.startsWith(decks.find((d) => d.id === deck)?.pre ?? "?")));
  const knownIn = (list: Word[]) => list.filter((w) => (cards[w.id]?.box ?? 0) >= 3).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted">วิธีทวน</span>
        <Segmented label="วิธีทวน" options={MODE_OPTIONS} value={mode} onChange={setMode} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted">ระดับ</span>
        <Segmented label="ระดับคำศัพท์" options={LEVEL_OPTIONS} value={level} onChange={setLevel} />
        <Link href="/guide#levels" className="text-xs text-brand underline underline-offset-2">A1–B2 คืออะไร</Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {[...decks, { id: MINE, name: "คำที่ฉันเพิ่มเอง", pre: "u-" }].map((d) => {
          const list = atLevel(d.id === MINE ? mine : words.filter((w) => w.id.startsWith(d.pre)));
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
          {deck !== MINE ? `ชุดนี้ไม่มีคำระดับ ${level} ลองเลือกระดับอื่นหรือชุดอื่น` : <>ยังไม่มีคำในชุดนี้ ระหว่างเรียน Grammar ให้แตะคำในประโยคตัวอย่าง แล้วกด <b className="text-ink">เพิ่มลงการ์ดทวน</b> คำนั้นจะมาอยู่ที่นี่</>}
        </div>
      ) : (
        <Review
          key={`${deck}-${level}-${mode}-${round}`}
          mode={mode}
          allWords={words}
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

type Mode = "recall" | "type" | "listen";

const MODE_OPTIONS: { id: Mode; label: string }[] = [
  { id: "recall", label: "นึกในใจ" },
  { id: "type", label: "พิมพ์ตอบ" },
  { id: "listen", label: "ฟังแล้วเลือก" },
];

const MODE_HINT: Record<Mode, string> = {
  recall: "เห็นคำอังกฤษ นึกความหมายในใจ แล้วกดตามจริงว่าจำได้ไหม",
  type: "เห็นความหมายไทย พิมพ์คำภาษาอังกฤษ ระบบตรวจให้",
  listen: "ฟังเสียงคำ แล้วเลือกความหมายที่ถูก",
};

type ReviewProps = {
  pool: Word[];
  /** Every word, for wrong options in listening mode. */
  allWords: Word[];
  mode: Mode;
  cards: CardMap;
  today: string;
  round: number;
  signedIn: boolean;
  onRestart: () => void;
  onReviewed: (id: string, card: { box: number; due_on: string }) => void;
};

/** A stable number for a string, so options come out the same on the server and in the browser. */
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** The right meaning plus three others, in an order fixed by the word. */
function meaningOptions(word: Word, all: Word[]) {
  const others = [...new Set(all.filter((w) => w.th !== word.th && w.id !== word.id).map((w) => w.th))];
  const picked: string[] = [];
  for (let i = 0; picked.length < 3 && i < others.length; i++) {
    const th = others[(hash(word.id + i) + i * 7919) % others.length];
    if (!picked.includes(th)) picked.push(th);
  }
  return [word.th, ...picked].sort((a, b) => hash(word.id + a) - hash(word.id + b));
}

function Review({ pool, allWords, mode, cards, today, round, signedIn, onRestart, onReviewed }: ReviewProps) {
  const [queue, setQueue] = useState(() => buildQueue(pool, cards, today, round));
  // recall: whether the meaning is shown · type/listen: the learner's answer once checked
  const [shown, setShown] = useState(false);
  const [typed, setTyped] = useState("");
  const [answer, setAnswer] = useState<{ ok: boolean; given: string } | null>(null);
  const [stats, setStats] = useState({ done: 0, right: 0 });
  const [saveFailed, setSaveFailed] = useState(false);
  const [, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const word = queue[0];

  if (!word) {
    return (
      <div className="card flex flex-col items-start gap-3 p-6">
        <p className="font-display text-2xl font-bold">ครบรอบนี้แล้ว</p>
        <p className="text-sm text-muted">ทวน {stats.done} ครั้ง {mode === "recall" ? "จำได้" : "ตอบถูก"} {stats.right} ครั้ง</p>
        <button type="button" className="btn" onClick={onRestart}>ทวนอีกรอบ</button>
      </div>
    );
  }

  function grade(remembered: boolean) {
    setStats((s) => ({ done: s.done + 1, right: s.right + (remembered ? 1 : 0) }));
    const rest = remembered ? queue.slice(1) : [...queue.slice(1), queue[0]];
    setQueue(rest);
    setShown(false);
    setTyped("");
    setAnswer(null);
    // Next card: play it in listening mode (this runs inside the click, so the browser allows sound).
    if (mode === "listen" && rest[0]) speak(rest[0].en);
    if (mode === "type") requestAnimationFrame(() => inputRef.current?.focus());
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

  function checkTyped(e: React.FormEvent) {
    e.preventDefault();
    if (answer) return grade(answer.ok);
    const ok = normalize(typed) === normalize(word.en);
    setAnswer({ ok, given: typed });
    speak(word.en);
  }

  function choose(th: string) {
    if (answer) return;
    setAnswer({ ok: th === word.th, given: th });
  }

  const box = cards[word.id]?.box;
  const answered = mode === "recall" ? shown : answer !== null;
  const options = mode === "listen" ? meaningOptions(word, allWords) : [];
  // Until the learner answers, the card hides whatever would give the answer away.
  const cover: Cover = answered
    ? {}
    : mode === "recall"
      ? { th: true }
      : mode === "type"
        ? { en: true, examples: true }
        : { en: true, th: true, examples: true, photo: true };
  const hint = MODE_HINT[mode];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between font-mono text-xs text-muted tabular">
        <span>เหลือ {queue.length} ใบ{box !== undefined ? ` · กล่อง ${box}` : " · คำใหม่"}</span>
        <span>{mode === "recall" ? "จำได้" : "ถูก"} {stats.right}/{stats.done}</span>
      </div>

      <PhotoWordCard key={word.id} word={word} photo={word.photo} diagram={word.diagram} cover={cover} hint={hint} bookmark={false}
        examples={word.ex ? [{ en: word.ex, th: word.exTh }] : []} />

      <div className="flex flex-col gap-3">
        {mode === "listen" && !answered && (
          <button type="button" onClick={() => speak(word.en)} className="btn self-start">
            <Volume2Icon className="size-4" aria-hidden /> ฟังเสียงอีกครั้ง
          </button>
        )}

        {mode === "type" && (
          <form onSubmit={checkTyped} className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <div className="flex flex-1 flex-col gap-2">
              <input ref={inputRef} value={typed} onChange={(e) => setTyped(e.target.value)} readOnly={answered}
                placeholder="พิมพ์คำภาษาอังกฤษ" autoCapitalize="off" autoComplete="off" spellCheck={false} aria-label="คำตอบภาษาอังกฤษ"
                className={"input text-lg " + (answer ? (answer.ok ? "border-obj bg-obj-bg" : "border-bad bg-bad-bg") : "")} />
              {answer && (
                <p className={"text-sm " + (answer.ok ? "text-obj" : "text-bad")}>
                  {answer.ok ? "✓ ถูกต้อง" : <>✗ ยังไม่ใช่ · คำตอบคือ <b className="font-semibold">{word.en}</b></>}
                </p>
              )}
            </div>
            <button type="submit" className="btn" disabled={!answer && !typed.trim()}>
              {answer ? "ข้อต่อไป →" : "ตรวจ"}
            </button>
          </form>
        )}

        {mode === "listen" && (
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="เลือกความหมาย">
            {options.map((th) => {
              const tone = !answer
                ? "border-line bg-surface hover:border-brand"
                : th === word.th
                  ? "border-obj bg-obj-bg"
                  : th === answer.given
                    ? "border-bad bg-bad-bg"
                    : "border-line bg-surface opacity-60";
              return (
                <button key={th} type="button" role="radio" aria-checked={answer?.given === th} onClick={() => choose(th)} disabled={!!answer}
                  className={"rounded-lg border-[1.5px] px-3.5 py-2.5 text-left text-[15px] transition " + tone}>
                  {th}
                </button>
              );
            })}
          </div>
        )}
        {mode === "listen" && answer && (
          <button type="button" className="btn self-start" onClick={() => grade(answer.ok)}>ข้อต่อไป →</button>
        )}

        {answered && word.note && (
          <p className="rounded-lg bg-[#fbf3cf] px-3.5 py-3 text-sm leading-6"><b className="font-semibold">รู้ไว้</b> {word.note}</p>
        )}

        {mode === "recall" &&
          (shown ? (
            <div className="grid grid-cols-2 gap-2 sm:max-w-md">
              <button type="button" className="btn-ghost border-[#f3c3bd] text-bad hover:bg-bad-bg" onClick={() => grade(false)}>ยังจำไม่ได้</button>
              <button type="button" className="btn" onClick={() => grade(true)}>จำได้</button>
            </div>
          ) : (
            <button type="button" className="btn self-start" onClick={() => setShown(true)}>ดูความหมาย</button>
          ))}

        <p className="text-xs leading-5 text-muted">
          {mode === "recall" ? "จำได้" : "ตอบถูก"} การ์ดจะเลื่อนไปกล่องถัดไปและกลับมาอีกใน 1, 3, 7, 14 หรือ 30 วัน ถ้า{mode === "recall" ? "จำไม่ได้" : "ตอบผิด"}จะกลับไปกล่อง 0 และวนมาในรอบนี้อีกครั้ง
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

const LEVEL_OPTIONS: { id: WordLevel | "all"; label: string }[] = [{ id: "all", label: "ทั้งหมด" }, ...WORD_LEVELS.map((l) => ({ id: l, label: l }))];

const SORT_OPTIONS: { id: Sort; label: string }[] = [
  { id: "az", label: "A–Z" },
  { id: "deck", label: "ตามชุด" },
];

const POS_KEYS = Object.keys(POS_LABEL) as Pos[];

type StatusFilter = "all" | "todo" | "new" | "learning" | "known";

/** Box 3 and up counts as remembered, the same line the flashcards use. */
function statusOf(box: number | undefined, filter: StatusFilter) {
  if (filter === "all") return true;
  if (filter === "new") return box === undefined;
  if (filter === "known") return box !== undefined && box >= 3;
  if (filter === "learning") return box !== undefined && box < 3;
  return box === undefined || box < 3;
}
const PAGE = 50;

type TableProps = { words: Word[]; mine: Word[]; decks: Deck[]; cards: CardMap; signedIn: boolean };

/** Every word in one list, for reading through or self-testing with one column hidden. */
function WordTable({ words, mine, decks, cards, signedIn }: TableProps) {
  const { showThai } = useStudy();
  const [deck, setDeck] = useState("all");
  const [pos, setPos] = useState<Pos | "all">("all");
  const [level, setLevel] = useState<WordLevel | "all">("all");
  const [sort, setSort] = useState<Sort>("az");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [hide, setHide] = useState<Hide>("none");
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());

  const all = [...words, ...mine];
  const inDeck = deck === "all" ? all : deck === MINE ? mine : words.filter((w) => w.id.startsWith(decks.find((d) => d.id === deck)?.pre ?? "?"));
  const q = query.trim().toLowerCase();
  const filtered = inDeck.filter(
    (w) => (pos === "all" || w.pos === pos) && (level === "all" || w.level === level) && statusOf(cards[w.id]?.box, status) && (!q || w.en.toLowerCase().includes(q) || w.th.includes(q)),
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
  const gridCols = signedIn
    ? "md:grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)_7.5rem_1.5rem]"
    : "md:grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)_1.5rem]";

  // Show the list a page at a time; a new filter starts again from the first page.
  const filterKey = [deck, pos, level, status, sort, q].join("|");
  const [paging, setPaging] = useState({ key: filterKey, limit: PAGE });
  const limit = paging.key === filterKey ? paging.limit : PAGE;
  const shown = rows.slice(0, limit);
  const letters = sort === "az" && hide !== "en" ? [...new Set(rows.map((w) => w.en[0].toUpperCase()))] : [];

  const [open, setOpen] = useState<Set<string>>(() => new Set());
  function toggle(id: string) {
    setOpen((o) => {
      const next = new Set(o);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  /** Loads the page that holds the letter, then scrolls to it. */
  function jump(letter: string) {
    const index = rows.findIndex((w) => w.en[0].toUpperCase() === letter);
    flushSync(() => setPaging({ key: filterKey, limit: Math.max(limit, index + PAGE) }));
    document.getElementById(`letter-${letter}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="flex flex-col gap-4 pt-4" aria-labelledby="word-table">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="word-table" className="text-xl font-bold">ตารางคำศัพท์</h2>
          <p className="text-sm text-muted">แตะไอคอนเพื่อฟังคำ · แตะ ⌄ เพื่อดูรูปคำและคำแนะนำ · ซ่อนคอลัมน์หนึ่งแล้วท่องเอง</p>
        </div>
        <Segmented label="โหมดท่องศัพท์" options={HIDE_OPTIONS} value={hide} onChange={chooseHide} />
      </div>

      <div className={"grid gap-3 sm:grid-cols-2 " + (signedIn ? "lg:grid-cols-[repeat(4,minmax(0,10.5rem))_minmax(0,1fr)]" : "lg:grid-cols-[repeat(3,minmax(0,11rem))_minmax(0,1fr)]")}>
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
        <select value={level} onChange={(e) => setLevel(e.target.value as WordLevel | "all")} aria-label="เลือกระดับ" className="input">
          <option value="all">ทุกระดับ</option>
          {WORD_LEVELS.map((l) => (
            <option key={l} value={l}>ระดับ {l} ({all.filter((w) => w.level === l).length})</option>
          ))}
        </select>
        {signedIn && (
          <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} aria-label="เลือกสถานะ" className="input">
            <option value="all">ทุกสถานะ</option>
            <option value="todo">ยังจำไม่ได้ (ใหม่ + กำลังจำ)</option>
            <option value="new">ใหม่ (ยังไม่เคยทวน)</option>
            <option value="learning">กำลังจำ</option>
            <option value="known">จำได้แล้ว</option>
          </select>
        )}
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

      {rows.length === 0 ? (
        <p className="card p-6 text-sm text-muted">ไม่พบคำที่ค้นหา</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="sticky top-[60px] z-20 -mx-1 flex items-center gap-1 overflow-x-auto bg-paper/95 px-1 py-2 backdrop-blur md:flex-wrap lg:top-0">
            <span className="mr-1 shrink-0 text-xs text-muted tabular">{rows.length} คำ</span>
            {letters.map((l) => (
              <button key={l} type="button" onClick={() => jump(l)}
                className="grid h-7 min-w-7 shrink-0 place-items-center rounded-md bg-surface px-1 font-mono text-xs text-ink-2 shadow-[0_0_0_1px_var(--color-line)] hover:bg-brand-soft">
                {l}
              </button>
            ))}
          </div>

          <div className={"hidden items-center gap-x-3 rounded-lg bg-[#e9eeeb] px-3 py-2 text-xs text-muted md:grid " + gridCols}>
            <span className="col-span-2">คำศัพท์</span>
            <span>ความหมาย</span>
            <span>ประโยคตัวอย่าง</span>
            {signedIn && <span>สถานะ</span>}
            <span />
          </div>

          <ol className="flex flex-col gap-1.5">
            {shown.map((w, i) => {
              const letter = w.en[0].toUpperCase();
              const newLetter = sort === "az" && hide !== "en" && (i === 0 || shown[i - 1].en[0].toUpperCase() !== letter);
              const tone = POS_STYLE[w.pos ?? "phrase"];
              const isOpen = open.has(w.id);
              const enHidden = hidden(w.id, "en");
              return (
                <Fragment key={w.id}>
                  {newLetter && (
                    <li id={`letter-${letter}`} aria-hidden className="scroll-mt-32 px-1 pt-2 font-display text-sm font-bold text-muted lg:scroll-mt-16">
                      {letter}
                    </li>
                  )}
                  <li className={"rounded-xl border bg-surface transition " + (isOpen ? "border-[#bfd6cc]" : "border-line")}>
                    <div className={"grid grid-cols-[2.5rem_minmax(0,1fr)_1.5rem] items-center gap-x-3 px-2.5 py-2 " + gridCols}>
                      <button type="button" onClick={() => speak(w.en)} aria-label={`ฟังเสียง ${enHidden ? "คำนี้" : w.en}`}
                        className={"grid size-10 place-items-center rounded-lg transition hover:brightness-95 active:scale-95 " + tone.tile}>
                        <WordIcon word={w} />
                      </button>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                          {enHidden ? <Cover onClick={() => reveal(w.id)} /> : <span className="font-semibold leading-tight">{w.en}</span>}
                          {w.pos && <PosBadge pos={w.pos} />}
                          {w.level && <span className="font-mono text-[10px] text-muted">{w.level}</span>}
                        </div>
                        {/* On phones the meaning sits under the word. */}
                        <div className="mt-0.5 truncate text-sm text-ink-2 md:hidden">
                          {hidden(w.id, "th") ? <Cover onClick={() => reveal(w.id)} /> : w.th}
                        </div>
                      </div>

                      <div className="hidden min-w-0 truncate text-[15px] md:block">
                        {hidden(w.id, "th") ? <Cover onClick={() => reveal(w.id)} /> : w.th}
                      </div>

                      <div className="hidden min-w-0 md:block">
                        {w.ex && !enHidden && (
                          <button type="button" onClick={() => speak(w.ex ?? "")} aria-label={`ฟังประโยค: ${w.ex}`}
                            className={"block w-full truncate rounded-lg px-2.5 py-1 text-left text-sm hover:brightness-[0.98] " + tone.chip}>
                            <Marked text={w.ex} word={w.en} className={tone.mark} />
                          </button>
                        )}
                      </div>

                      {signedIn && <div className="hidden md:block"><Status box={cards[w.id]?.box} /></div>}

                      <button type="button" onClick={() => toggle(w.id)} aria-expanded={isOpen} aria-label={isOpen ? "ซ่อนรายละเอียด" : "ดูรายละเอียด"}
                        className="grid size-6 place-items-center rounded-md text-muted hover:bg-paper hover:text-ink">
                        <svg viewBox="0 0 16 16" className={"size-3.5 transition " + (isOpen ? "rotate-180" : "")} aria-hidden>
                          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>

                    {isOpen && (
                      <div className="flex flex-col gap-2 border-t border-line px-3 py-2.5 text-sm md:pl-[4.1rem]">
                        {w.ex && !enHidden && (
                          <button type="button" onClick={() => speak(w.ex ?? "")} aria-label={`ฟังประโยค: ${w.ex}`}
                            className={"rounded-lg px-3 py-2 text-left leading-6 md:hidden " + tone.chip}>
                            <Marked text={w.ex} word={w.en} className={tone.mark} />
                          </button>
                        )}
                        {w.ex && !enHidden && w.exTh && showThai && <p className="text-[13px] text-muted">{w.exTh}</p>}
                        {!enHidden && w.forms && <p className="text-xs text-muted">{w.forms}</p>}
                        {!enHidden && w.note && <p className="text-xs leading-5"><b className="font-semibold text-verb">รู้ไว้</b> {w.note}</p>}
                        {enHidden && <p className="text-xs text-muted">แตะ “แตะเพื่อดู” เพื่อดูคำ ประโยค และรูปคำ</p>}
                        {signedIn && <div className="md:hidden"><Status box={cards[w.id]?.box} /></div>}
                      </div>
                    )}
                  </li>
                </Fragment>
              );
            })}
          </ol>

          {limit < rows.length && (
            <button type="button" onClick={() => setPaging({ key: filterKey, limit: limit + PAGE })} className="btn-ghost mt-1 self-center">
              แสดงเพิ่มอีก {Math.min(PAGE, rows.length - limit)} คำ · เหลือ {rows.length - limit}
            </button>
          )}
        </div>
      )}
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

/** The example sentence with the word (or its -s/-ed/-ing form) in bold colour. */
function Marked({ text, word, className }: { text: string; word: string; className: string }) {
  const parts = word.toLowerCase().split(/\s+/).map((p) => {
    const stem = p.length > 3 ? p.replace(/(e|y)$/, "") : p;
    return stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\\w']*";
  });
  const m = new RegExp(`\\b${parts.join("\\s+")}`, "i").exec(text);
  if (!m) return <>{text}</>;
  return (
    <>
      {text.slice(0, m.index)}
      <b className={"font-semibold " + className}>{m[0]}</b>
      {text.slice(m.index + m[0].length)}
    </>
  );
}

function Cover({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="h-6 w-24 rounded-md bg-[#e6ebe8] text-xs text-muted hover:bg-line">
      แตะเพื่อดู
    </button>
  );
}

function Status({ box, className = "" }: { box?: number; className?: string }) {
  const [label, tone, dot] =
    box === undefined
      ? ["ใหม่", "bg-[#e6f4ec] text-obj", "bg-obj"]
      : box >= 3
        ? ["จำได้แล้ว", "bg-brand text-white", "bg-mark"]
        : [`กำลังจำ (${box})`, "bg-verb-bg text-verb", "bg-verb"];
  return (
    <span className={"inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs " + tone + " " + className}>
      <span className={"size-1.5 rounded-full " + dot} aria-hidden />
      {label}
    </span>
  );
}
