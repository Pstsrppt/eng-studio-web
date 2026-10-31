"use client";

import { ArrowLeftIcon, CheckIcon, EyeIcon, EyeOffIcon, RotateCcwIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Word } from "@/content";
import { PhotoWordCard } from "@/components/photo-word-card";
import { ActionPanel } from "@/components/pinned-bar";
import { gradeCard, resumeSession, startSession, type GradeResult } from "../actions";
import { dayOf } from "@/lib/learning/day";
import type { LearnMode } from "@/lib/learning/queue";
import { clearSession, inProgress, readSession, writeSession, type SavedSession } from "@/lib/learning/session-store";
import { NEW_CARD, schedule, type Grade, type Schedule } from "@/lib/learning/srs";

type Props = { mode: LearnMode; deck?: string; userKey: string; explicit: boolean };
type Phase = "loading" | "empty" | "card" | "summary" | "error";

const GRADE_UI: Record<Grade, { label: string; key: string; tone: string }> = {
  again: { label: "จำไม่ได้", key: "1", tone: "border-[#f3c3bd] bg-bad-bg text-bad hover:bg-[#fbdcd7]" },
  hard: { label: "ยังไม่แม่น", key: "2", tone: "border-[#efd9a3] bg-[#fbf0d9] text-[#8a5a00] hover:bg-[#f7e6c0]" },
  good: { label: "จำได้", key: "3", tone: "border-[#9ccdb8] bg-obj-bg text-obj hover:bg-[#cbe9dc]" },
};
const MODE_LABEL: Record<LearnMode, string> = { all: "เรียนทั้งหมด", due: "ทวนที่ถึงกำหนด", new: "คำใหม่", bookmarks: "บุ๊กมาร์ก", deck: "ตามหมวด" };

function whenLabel(days: number) {
  if (days <= 0) return "อีกครั้งวันนี้";
  if (days === 1) return "พรุ่งนี้";
  if (days < 30) return `อีก ${days} วัน`;
  return `อีก ${Math.round(days / 30)} เดือน`;
}

// "Hide the picture before the answer" is a per-browser preference.
const HIDE_KEY = "learn-hide-picture";
function readHide() {
  try {
    return localStorage.getItem(HIDE_KEY) !== "0";
  } catch {
    return true;
  }
}
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export function LearnSession({ mode, deck, userKey, explicit }: Props) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [session, setSession] = useState<SavedSession | null>(null);
  const [words, setWords] = useState<Record<string, Word>>({});
  const [schedules, setSchedules] = useState<Record<string, Schedule>>({});
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ text: string; quest?: string } | null>(null);
  const [storageOff, setStorageOff] = useState(false);
  const busy = useRef(false);
  const shownAt = useRef(0);
  const answer = useRef<HTMLDivElement>(null);
  const storedHide = useSyncExternalStore(subscribe, readHide, () => true);
  const [hideOverride, setHideOverride] = useState<boolean | null>(null);
  const hidePicture = hideOverride ?? storedHide;

  const save = useCallback((s: SavedSession) => {
    setSession(s);
    setStorageOff(!writeSession(userKey, s));
  }, [userKey]);

  /** Applies a saved grade to the session: next position, Again cards come back once at the end. */
  const applyResult = useCallback((s: SavedSession, itemId: string, grade: Grade, res: GradeResult | null) => {
    const prev = schedules[itemId] ?? NEW_CARD;
    const next = schedule(prev, grade);
    setSchedules((all) => ({ ...all, [itemId]: next }));
    const queue = [...s.queue];
    const later = queue.slice(s.pos + 1);
    if (grade === "again" && !later.includes(itemId) && queue.filter((x) => x === itemId).length < 2) queue.push(itemId);
    const ok = res && res.ok ? res : null;
    const updated: SavedSession = {
      ...s,
      queue,
      pos: s.pos + 1,
      pending: undefined,
      counts: { ...s.counts, [grade]: (s.counts[grade] ?? 0) + 1 },
      results: { ...s.results, [itemId]: { grade, dueOn: ok?.dueOn, intervalDays: ok?.intervalDays ?? next.intervalDays } },
      xpNow: ok ? ok.xpToday : s.xpNow,
    };
    const quest = ok?.completed[0];
    setToast({
      text: s.guest
        ? (grade === "again" ? "คำนี้จะกลับมาอีกครั้งท้ายรอบ (โหมดทดลอง ไม่บันทึก)" : "ไปคำถัดไป (โหมดทดลอง ไม่บันทึก)")
        : grade === "again" ? "บันทึกแล้ว · คำนี้จะกลับมาอีกครั้งท้ายรอบ" : `บันทึกแล้ว · ทวน${whenLabel(ok?.intervalDays ?? next.intervalDays)}`,
      quest: quest ? `สำเร็จ Quest: ${quest.title} +${quest.xp} XP` : undefined,
    });
    return updated;
  }, [schedules]);

  /** Sends one grade. The event id is stored first, so a reload re-sends the same answer, never a second one. */
  const send = useCallback(async (s: SavedSession, pending: NonNullable<SavedSession["pending"]>) => {
    save({ ...s, pending });
    setSaving(true);
    setError("");
    try {
      const res = s.guest ? null : await gradeCard(pending);
      if (res && !res.ok && res.reason !== "signed-out") throw new Error(res.reason);
      const updated = applyResult(s, pending.itemId, pending.grade, res);
      save(updated);
      setRevealed(false);
      shownAt.current = Date.now();
      setPhase(updated.pos >= updated.queue.length ? "summary" : "card");
    } catch {
      setError("บันทึกคะแนนไม่สำเร็จ ตรวจอินเทอร์เน็ตแล้วกดลองอีกครั้ง คำตอบนี้จะไม่ถูกนับซ้ำ");
    } finally {
      setSaving(false);
      busy.current = false;
    }
  }, [applyResult, save]);

  // Start or resume once, on the client (the session lives in this browser).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = readSession(userKey);
        const sameRound = saved && (!explicit || (saved.mode === mode && (saved.deck ?? "") === (deck ?? "")));
        if (inProgress(saved) && saved.day === dayOf() && sameRound) {
          const data = await resumeSession([...new Set(saved.queue.slice(saved.pos))]);
          if (cancelled) return;
          setSchedules(data.schedules);
          setWords(Object.fromEntries(data.words.map((w) => [w.id, w])));
          // Words removed from the course since the session began are skipped, not shown blank.
          const known = new Set(data.words.map((w) => w.id));
          const queue = [...saved.queue.slice(0, saved.pos), ...saved.queue.slice(saved.pos).filter((id) => known.has(id))];
          const s = { ...saved, queue };
          if (s.pending) {
            setPhase("card");
            setRevealed(true);
            busy.current = true;
            await send(s, s.pending);
          } else {
            save(s);
            setPhase(s.pos >= s.queue.length ? "summary" : "card");
          }
          shownAt.current = Date.now();
          return;
        }
        const started = await startSession(mode, deck);
        if (cancelled) return;
        setSchedules(started.schedules);
        setWords(Object.fromEntries(started.words.map((w) => [w.id, w])));
        if (started.ids.length === 0) {
          clearSession(userKey);
          setPhase("empty");
          return;
        }
        save({
          v: 1, id: crypto.randomUUID(), day: started.day, mode, deck, queue: started.ids, newIds: started.newIds, pos: 0,
          results: {}, counts: { again: 0, hard: 0, good: 0 }, xpStart: started.xpToday, xpNow: started.xpToday, guest: started.guest,
        });
        shownAt.current = Date.now();
        setPhase("card");
      } catch {
        if (!cancelled) setPhase("error");
      }
    })();
    return () => {
      cancelled = true;
    };
    // Runs once per page visit; mode/deck come from the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = session && phase === "card" ? words[session.queue[session.pos]] : undefined;

  // A new card or an opened answer: the word and meaning must clear the bars. Moves only as far as that takes, or not at all.
  useLayoutEffect(() => {
    answer.current?.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [phase, revealed]);

  const grade = useCallback((g: Grade) => {
    if (!session || !current || !revealed || busy.current) return;
    busy.current = true; // set before any await, so a double click can't send twice
    send(session, { itemId: current.id, grade: g, eventId: crypto.randomUUID(), ms: Date.now() - shownAt.current });
  }, [current, revealed, send, session]);

  // Keyboard: Space or Enter reveals, 1 / 2 / 3 grade.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, select")) return;
      // Space and Enter on a focused button or link already press it.
      if (!revealed && (e.key === " " || e.key === "Enter") && current && !el.closest("button, a")) {
        e.preventDefault();
        setRevealed(true);
      } else if (revealed && ["1", "2", "3"].includes(e.key)) {
        grade((["again", "hard", "good"] as const)[Number(e.key) - 1]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, grade, revealed]);

  if (phase === "loading") return <SessionSkeleton />;
  if (phase === "error") {
    return (
      <Panel title="เปิดรอบเรียนไม่สำเร็จ" body="ตรวจการเชื่อมต่ออินเทอร์เน็ต แล้วลองใหม่อีกครั้ง">
        <button type="button" className="btn" onClick={() => location.reload()}><RotateCcwIcon className="size-4" /> ลองใหม่</button>
      </Panel>
    );
  }
  if (phase === "empty") {
    return (
      <Panel title="รอบนี้ไม่มีคำให้เรียน"
        body={mode === "due" ? "ยังไม่มีคำที่ถึงกำหนดทวนวันนี้ เก่งมาก ลองเรียนคำใหม่แทนได้" : mode === "new" ? "วันนี้เรียนคำใหม่ครบโควตาแล้ว (วันละ 10 คำ) พรุ่งนี้มีคำใหม่ให้อีก" : mode === "bookmarks" ? "ยังไม่มีคำที่บุ๊กมาร์กไว้ กดไอคอนบุ๊กมาร์กบนการ์ดคำเพื่อเก็บคำไว้ฝึก" : "ไม่มีคำที่ถึงกำหนดและเรียนคำใหม่ครบโควตาวันนี้แล้ว"}>
        <Link href="/learn" className="btn">กลับหน้าฝึกศัพท์</Link>
        {mode !== "new" && <Link href="/learn/session?mode=new" className="btn-ghost">เรียนคำใหม่</Link>}
      </Panel>
    );
  }
  if (!session) return null;
  if (phase === "summary") return <Summary session={session} words={words} />;

  const total = session.queue.length;
  const atLabel = `คำที่ ${Math.min(session.pos + 1, total)} จาก ${total}`;
  const preview = (g: Grade) => schedule(schedules[current?.id ?? ""] ?? NEW_CARD, g).intervalDays;

  return (
    <div className="flex flex-col gap-4 pb-[calc(var(--action-panel-h)+1rem)] lg:pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/learn" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted hover:bg-paper hover:text-ink max-lg:min-h-11">
          <ArrowLeftIcon className="size-4" /> พักไว้ก่อน
        </Link>
        <span className="font-mono text-xs text-muted">{MODE_LABEL[session.mode]}</span>
        <button type="button" onClick={() => {
          const next = !hidePicture;
          setHideOverride(next);
          try { localStorage.setItem(HIDE_KEY, next ? "1" : "0"); } catch {}
        }} aria-pressed={hidePicture}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs text-muted hover:text-ink max-lg:min-h-11">
          {hidePicture ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />} ซ่อนภาพก่อนเฉลย
        </button>
      </div>

      <div>
        <div className="flex justify-between text-sm"><span className="font-semibold" aria-live="polite">{atLabel}</span><span className="font-mono text-xs text-muted tabular">XP วันนี้ {session.xpNow}</span></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-page-alt" role="progressbar" aria-label="ความคืบหน้ารอบนี้" aria-valuemin={0} aria-valuemax={total} aria-valuenow={session.pos}>
          <div className="h-full rounded-full bg-(--ac-gold) transition-[width] duration-300" style={{ width: `${(session.pos / total) * 100}%` }} />
        </div>
      </div>

      {session.guest && (
        <p className="rounded-xl border border-(--ac-gold-soft) bg-accent-wash px-4 py-3 text-sm">โหมดทดลอง: ผลรอบนี้ไม่ถูกบันทึก <Link href="/login" className="font-semibold text-brand underline">เข้าสู่ระบบ</Link> เพื่อเก็บความคืบหน้าและทวนตามรอบ</p>
      )}
      {storageOff && <p className="text-xs text-muted">เบราว์เซอร์นี้เก็บตำแหน่งรอบเรียนไม่ได้ ถ้าปิดหน้าไปจะเริ่มรอบใหม่ แต่คะแนนที่ให้แล้วถูกบันทึกครบ</p>}
      {toast && (
        <p role="status" className="od-pop flex flex-wrap items-center gap-2 text-sm text-obj">
          <CheckIcon className="size-4" aria-hidden /> {toast.text}
          {toast.quest && <span className="inline-flex items-center gap-1 rounded-full bg-(--ac-gold-soft) px-2.5 py-0.5 font-semibold text-(--ac-gold-ink)"><SparklesIcon className="size-3.5" aria-hidden />{toast.quest}</span>}
        </p>
      )}

      {current && (
        <div key={`${session.pos}-${revealed}`} className="learn-in">
          <PhotoWordCard word={current} photo={current.photo} diagram={current.diagram} answerRef={answer}
            examples={current.ex ? [{ en: current.ex, th: current.exTh }] : []}
            cover={revealed ? {} : { th: true, examples: true, photo: hidePicture }} revealed={revealed}
            hint="นึกความหมายในใจก่อน แล้วกดเปิดเฉลย" />
          {revealed && current.note && (
            <p className="mt-3 rounded-xl border border-(--ac-line) bg-card px-4 py-3 text-sm leading-6"><b className="font-semibold text-(--ac-heading)">เกร็ดการใช้คำ:</b> {current.note}</p>
          )}
        </div>
      )}

      {/* Sits above the phone tab bar so the buttons are always in reach of a thumb. */}
      <ActionPanel className="fixed inset-x-0 bottom-(--tabbar-h) z-30 border-t border-line bg-card/95 px-4 py-2 backdrop-blur short:static short:border-0 short:bg-transparent short:p-0 lg:static lg:border-0 lg:bg-transparent lg:p-0">
        {error && <p role="alert" className="mb-2 text-sm text-bad">{error}</p>}
        {!revealed ? (
          <button type="button" className="btn od-press w-full py-3 text-base lg:py-3.5" onClick={() => setRevealed(true)}>เปิดเฉลย <kbd className="hidden rounded bg-white/20 px-1.5 font-mono text-xs lg:inline">Space</kbd></button>
        ) : error && session.pending ? (
          <button type="button" className="btn w-full py-3 lg:py-3.5" disabled={saving} onClick={() => { busy.current = true; send(session, session.pending!); }}>
            <RotateCcwIcon className="size-4" /> ลองบันทึกอีกครั้ง
          </button>
        ) : (
          <div className="od-pop grid grid-cols-3 gap-2" role="group" aria-label="ให้คะแนนความจำ">
            {(["again", "hard", "good"] as const).map((g) => (
              <button key={g} type="button" disabled={saving} onClick={() => grade(g)}
                className={"od-press flex min-h-11 flex-col items-center gap-0.5 rounded-xl border-[1.5px] px-1.5 py-1.5 disabled:opacity-50 lg:px-2 lg:py-2.5 " + GRADE_UI[g].tone}>
                <span className="text-[15px] font-semibold">{GRADE_UI[g].label}</span>
                <span className="text-[11px] opacity-80">{g === "again" ? "ทวนอีกครั้งรอบนี้" : `ทวน${whenLabel(preview(g))}`}</span>
                <kbd className="hidden font-mono text-[10.5px] opacity-60 lg:block">{GRADE_UI[g].key}</kbd>
              </button>
            ))}
          </div>
        )}
      </ActionPanel>
    </div>
  );
}

function SessionSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4" aria-busy="true" aria-label="กำลังเตรียมการ์ด">
      <div className="h-6 w-40 rounded bg-line" />
      <div className="h-2 rounded-full bg-line" />
      <div className="h-[420px] rounded-[28px] bg-line/60" />
    </div>
  );
}

function Panel({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-start gap-3 p-6">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <p className="max-w-[60ch] text-muted">{body}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Summary({ session, words }: { session: SavedSession; words: Record<string, Word> }) {
  const studied = Object.keys(session.results);
  const isNew = new Set(session.newIds);
  const fresh = studied.filter((id) => isNew.has(id)).length;
  const upcoming = studied
    .map((id) => ({ id, ...session.results[id] }))
    .sort((a, b) => (a.intervalDays ?? 0) - (b.intervalDays ?? 0));
  const stats: [string, number | string][] = [
    ["คำที่ฝึก", studied.length],
    ["คำใหม่", fresh],
    ["ทวนคำเดิม", studied.length - fresh],
    ["XP ที่ได้", session.guest ? "-" : `+${Math.max(0, session.xpNow - session.xpStart)}`],
  ];
  return (
    <div className="learn-in flex flex-col gap-5">
      <header>
        <p className="eyebrow">จบรอบแล้ว</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">เยี่ยมมาก ฝึกครบ {studied.length} คำ</h1>
        {session.guest && <p className="mt-2 text-sm text-muted">รอบทดลองนี้ไม่ได้บันทึก <Link href="/login" className="font-semibold text-brand underline">เข้าสู่ระบบ</Link> แล้วคำที่ฝึกจะกลับมาให้ทวนตามรอบ</p>}
      </header>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map(([k, v]) => (
          <div key={k} className="card px-4 py-3"><dt className="text-xs text-muted">{k}</dt><dd className="font-display text-2xl font-bold tabular">{v}</dd></div>
        ))}
      </dl>
      <div className="card flex flex-wrap gap-x-6 gap-y-2 px-4 py-3 text-sm">
        <span><b className="text-bad">จำไม่ได้</b> {session.counts.again} ครั้ง</span>
        <span><b className="text-[#8a5a00]">ยังไม่แม่น</b> {session.counts.hard} ครั้ง</span>
        <span><b className="text-obj">จำได้</b> {session.counts.good} ครั้ง</span>
      </div>
      {!session.guest && (
        <section className="card p-4">
          <h2 className="mb-2 text-sm font-semibold">นัดทวนครั้งถัดไป</h2>
          <ul className="grid gap-1.5 text-sm sm:grid-cols-2">
            {upcoming.map((u) => (
              <li key={u.id} className="flex justify-between gap-3 border-b border-line py-1.5">
                <span className="font-medium">{words[u.id]?.en ?? u.id}</span>
                <span className="text-muted">{whenLabel(u.intervalDays ?? 0)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="flex flex-wrap gap-2">
        <Link href={`/learn/session?mode=${session.mode}${session.deck ? `&deck=${session.deck}` : ""}&again=${session.id}`} className="btn">เรียนอีกรอบ</Link>
        <Link href="/learn" className="btn-ghost">กลับหน้าฝึกศัพท์</Link>
      </div>
    </div>
  );
}
