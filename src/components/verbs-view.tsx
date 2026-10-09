"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { reviewCard } from "@/app/actions";
import type { Verb, VerbGroup } from "@/content";
import { verbFormOk } from "@/content/lookup";
import type { CardMap } from "@/lib/data";
import { buildQueue } from "@/lib/queue";
import { speak } from "./speak";
import { SpeakButton } from "./speak-button";

type Groups = Record<VerbGroup, { name: string; tip: string }>;
const ORDER: VerbGroup[] = ["REG", "AAA", "ABB", "ABC", "ABA"];
const SAMPLE: Record<VerbGroup, string> = {
  REG: "work worked worked",
  AAA: "cut cut cut",
  ABB: "send sent sent",
  ABC: "go went gone",
  ABA: "run ran run",
};

export function VerbsView({ verbs, groups, cards: initialCards, signedIn, today }: { verbs: Verb[]; groups: Groups; cards: CardMap; signedIn: boolean; today: string }) {
  // Starts from the server's copy, then follows each answer so a new round skips cards that are no longer due.
  const [cards, setCards] = useState(initialCards);
  const [mode, setMode] = useState<"table" | "drill">("drill");
  const [group, setGroup] = useState<VerbGroup | "ALL">("ALL");
  const [round, setRound] = useState(0);
  const pool = group === "ALL" ? verbs : verbs.filter((v) => v.g === group);
  const known = verbs.filter((v) => (cards[v.id]?.box ?? 0) >= 3).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        <GroupButton on={group === "ALL"} onClick={() => setGroup("ALL")} title="ทั้งหมด" sub={`${verbs.length} คำ`} />
        {ORDER.map((g) => (
          <GroupButton key={g} on={group === g} onClick={() => setGroup(g)} title={g === "REG" ? "-ed" : g} sub={SAMPLE[g]} />
        ))}
      </div>

      {group !== "ALL" && (
        <p className="rounded-lg bg-brand-soft px-4 py-3 text-sm leading-6">
          <b className="font-semibold">{groups[group].name}</b> · {groups[group].tip}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" className="grid w-full max-w-xs grid-cols-2 rounded-[10px] bg-[#e6ebe8] p-1">
          {(["drill", "table"] as const).map((m) => (
            <button key={m} role="tab" type="button" aria-selected={mode === m} onClick={() => setMode(m)}
              className={"rounded-lg py-2 text-sm " + (mode === m ? "bg-surface font-semibold shadow-sm" : "text-muted")}>
              {m === "drill" ? "ฝึกพิมพ์" : "ตาราง"}
            </button>
          ))}
        </div>
        <p className="font-mono text-xs text-muted tabular">จำได้แล้ว {known}/{verbs.length}</p>
      </div>

      {mode === "table" ? (
        <VerbTable verbs={pool} cards={cards} />
      ) : (
        <Drill key={`${group}-${round}`} round={round} onRestart={() => setRound((r) => r + 1)}
          onReviewed={(id, card) => setCards((c) => ({ ...c, [id]: { custom_en: null, custom_th: null, ...card } }))}
          pool={pool} cards={cards} today={today} groups={groups} signedIn={signedIn} />
      )}
    </div>
  );
}

function GroupButton({ on, onClick, title, sub }: { on: boolean; onClick: () => void; title: string; sub: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      className={"rounded-lg border px-2 py-2 text-center transition " + (on ? "border-ink bg-ink text-white" : "border-line bg-surface hover:border-brand")}>
      <b className="block font-mono text-[13px]">{title}</b>
      <small className={"block truncate text-[10.5px] " + (on ? "text-[#b7c5bf]" : "text-muted")}>{sub}</small>
    </button>
  );
}

function VerbTable({ verbs, cards }: { verbs: Verb[]; cards: CardMap }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-[15px]">
        <thead className="eyebrow">
          <tr className="border-b border-line">
            <th className="px-4 py-3 font-normal">V1</th>
            <th className="px-4 py-3 font-normal">V2</th>
            <th className="px-4 py-3 font-normal">V3</th>
            <th className="px-4 py-3 font-normal">ความหมาย</th>
            <th className="px-4 py-3 font-normal"><span className="sr-only">ฟัง</span></th>
          </tr>
        </thead>
        <tbody>
          {verbs.map((v) => (
            <tr key={v.id} className="border-b border-line last:border-0">
              <td className="px-4 py-2.5 font-display font-medium">
                {v.v1}
                {(cards[v.id]?.box ?? 0) >= 3 && <span className="ml-2 text-xs text-obj" aria-label="จำได้แล้ว">✓</span>}
              </td>
              <td className="px-4 py-2.5 font-display text-verb">{v.v2}</td>
              <td className="px-4 py-2.5 font-display text-obj">{v.v3}</td>
              <td className="px-4 py-2.5 text-sm text-muted">{v.th}</td>
              <td className="px-4 py-2.5"><SpeakButton text={`${v.v1}, ${v.v2.replace("/", ", ")}, ${v.v3}`} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function elapsedSince(start: number) {
  return start ? Date.now() - start : undefined;
}

type DrillProps = { pool: Verb[]; cards: CardMap; today: string; groups: Groups; signedIn: boolean; round: number; onRestart: () => void;
  onReviewed: (id: string, card: { box: number; due_on: string }) => void };

function Drill({ pool, cards, today, groups, signedIn, round, onRestart, onReviewed }: DrillProps) {
  const [queue, setQueue] = useState(() => buildQueue(pool, cards, today, round));
  const [stats, setStats] = useState({ done: 0, right: 0 });
  const [v2, setV2] = useState("");
  const [v3, setV3] = useState("");
  const [result, setResult] = useState<null | boolean>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [, start] = useTransition();
  const startedAt = useRef(0);
  const v2Ref = useRef<HTMLInputElement>(null);

  const verb = queue[0];

  if (!verb) {
    return (
      <div className="card flex flex-col items-start gap-3 p-6">
        <p className="font-display text-2xl font-bold">ครบรอบนี้แล้ว</p>
        <p className="text-sm text-muted">ทำ {stats.done} ข้อ ถูก {stats.right} ข้อ {signedIn ? "คำที่ตอบถูกจะกลับมาให้ทวนตามรอบ 1, 3, 7, 14 และ 30 วัน" : ""}</p>
        <button type="button" className="btn" onClick={onRestart}>
          ฝึกอีกรอบ
        </button>
      </div>
    );
  }

  function check(e: React.FormEvent) {
    e.preventDefault();
    if (result !== null) return next();
    const ok = verbFormOk(v2, verb.v2) && verbFormOk(v3, verb.v3);
    setResult(ok);
    setStats((s) => ({ done: s.done + 1, right: s.right + (ok ? 1 : 0) }));
    if (ok) speak(`${verb.v1}, ${verb.v2.replace("/", ", ")}, ${verb.v3}`);
    const ms = elapsedSince(startedAt.current);
    start(async () => {
      try {
        const card = await reviewCard({
          itemId: verb.id,
          kind: "verb",
          correct: ok,
          answer: `${v2.trim()} ${v3.trim()}`,
          ms,
          expected: ok ? undefined : `${verb.v1} – ${verb.v2} – ${verb.v3}`,
        });
        if (card) onReviewed(verb.id, card);
        setSaveFailed(false);
      } catch {
        setSaveFailed(true);
      }
    });
  }

  function next() {
    setQueue((q) => (result ? q.slice(1) : [...q.slice(1), q[0]]));
    setV2("");
    setV3("");
    setResult(null);
    startedAt.current = 0;
    v2Ref.current?.focus();
  }

  const slot = (state: "ok" | "no" | null) =>
    state === "ok" ? "border-[#9ccdb8] bg-obj-bg text-obj" : state === "no" ? "border-[#f3c3bd] bg-bad-bg text-bad" : "border-line bg-surface";

  return (
    <form onSubmit={check} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between font-mono text-xs text-muted tabular">
          <span>{groups[verb.g].name} · เหลือ {queue.length}</span>
          <span>ถูก {stats.right}/{stats.done}</span>
        </div>
        <div className="flex flex-col gap-1.5 rounded-2xl bg-ink px-6 py-6 text-white">
          <span className="font-mono text-[11px] tracking-[0.08em] text-mark">V1 · เติม V2 และ V3</span>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-5xl font-bold tracking-tight">{verb.v1}</h2>
            <button type="button" onClick={() => speak(verb.v1)} className="rounded-full border border-[#2c3f37] px-3 py-1.5 text-xs text-[#c9d4cf]">ฟัง</button>
          </div>
          <p className="text-sm text-[#b7c5bf]">{verb.th}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-[10px] border-[1.5px] border-line bg-surface px-3 py-2.5">
            <small className="block font-mono text-[10.5px] text-muted">V1</small>
            <b className="block font-display text-lg font-medium">{verb.v1}</b>
          </div>
          {([["V2", v2, setV2, verbFormOk(v2, verb.v2)], ["V3", v3, setV3, verbFormOk(v3, verb.v3)]] as const).map(([label, value, set, ok], i) => (
            <label key={label} className={"rounded-[10px] border-[1.5px] px-3 py-2.5 focus-within:border-brand " + slot(result === null ? null : ok ? "ok" : "no")}>
              <small className="block font-mono text-[10.5px] text-muted">{label}</small>
              <input
                ref={i === 0 ? v2Ref : undefined}
                value={value}
                onChange={(e) => { if (!startedAt.current) startedAt.current = e.timeStamp + performance.timeOrigin; set(e.target.value); }}
                readOnly={result !== null}
                autoCapitalize="off" autoComplete="off" spellCheck={false} aria-label={`${label} ของ ${verb.v1}`}
                className="w-full bg-transparent font-display text-lg outline-none"
              />
            </label>
          ))}
        </div>

        {result !== null && (
          <p className={"text-sm " + (result ? "text-obj" : "text-bad")}>
            {result ? "✓ ถูกต้อง " : "✗ ยังไม่ใช่ "}
            <b className="font-mono">{verb.v1} – {verb.v2} – {verb.v3}</b>
            {!result && <span className="block text-xs">คำนี้จะกลับมาให้ลองอีกครั้งในรอบนี้</span>}
          </p>
        )}

        <button type="submit" className="btn self-start" disabled={result === null && (!v2.trim() || !v3.trim())}>
          {result === null ? "ตรวจ" : "ข้อต่อไป →"}
        </button>

        {!signedIn && (
          <p className="text-xs text-muted">
            <Link href="/login" className="font-semibold text-brand underline">เข้าสู่ระบบ</Link> เพื่อให้เว็บจำว่าคำไหนต้องทวนวันไหน
          </p>
        )}
        {saveFailed && <p className="text-xs text-bad">บันทึกผลข้อนี้ไม่สำเร็จ ตรวจการเชื่อมต่อแล้วทำข้อต่อไปได้เลย</p>}
      </div>
    </form>
  );
}
