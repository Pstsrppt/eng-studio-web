"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { SpeakItem } from "@/content";
import { speak } from "./speak";

// The Web Speech API isn't in TypeScript's DOM types yet; this is the part we use.
type Recognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
};
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | undefined {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

const clean = (s: string) => s.toLowerCase().replace(/[.,!?]/g, "").trim();

type Verdict = { ok: boolean; heard: string; near: boolean };

/**
 * Compares what the recogniser heard with the word. Its first guess decides; a lower guess only
 * counts when the first one isn't a word learners confuse it with ("tree" for "three" fails).
 */
function judge(item: SpeakItem, guesses: string[]): Verdict {
  const good = [item.say, ...(item.accept ?? [])].map(clean);
  const near = (item.near ?? []).map(clean);
  const heard = guesses[0] ?? "";
  if (good.includes(heard)) return { ok: true, heard, near: false };
  if (near.includes(heard)) return { ok: false, heard, near: true };
  return { ok: guesses.some((g) => good.includes(g)), heard, near: false };
}

const ERRORS: Record<string, string> = {
  "not-allowed": "เบราว์เซอร์ไม่ได้รับอนุญาตให้ใช้ไมโครโฟน กดอนุญาตที่แถบที่อยู่ด้านบนแล้วลองใหม่",
  "service-not-allowed": "เบราว์เซอร์ไม่ได้รับอนุญาตให้ใช้ไมโครโฟน กดอนุญาตที่แถบที่อยู่ด้านบนแล้วลองใหม่",
  "no-speech": "ไม่ได้ยินเสียง ลองพูดใกล้ไมค์อีกนิด",
  "audio-capture": "หาไมโครโฟนไม่เจอ ตรวจว่าเสียบไมค์หรือเปิดใช้งานแล้ว",
  network: "เชื่อมต่อบริการแปลงเสียงไม่ได้ ตรวจอินเทอร์เน็ตแล้วลองใหม่",
};

/** Say each word; the browser's speech recogniser says what it heard. */
export function SpeakingDrill({ items }: { items: SpeakItem[] }) {
  const [index, setIndex] = useState(0);
  const [listening, setListening] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState({ done: 0, right: 0 });
  const rec = useRef<Recognition | null>(null);
  const item = items[index];
  const titleId = useId();

  // Forgets the session before aborting it: its callbacks can arrive later, and they only count while it is rec.current.
  const stop = useCallback(() => {
    const r = rec.current;
    rec.current = null;
    r?.abort();
    setListening(false);
  }, []);

  // Leaving the tab hides this drill without unmounting it, and the microphone must not stay open behind it.
  useEffect(() => stop, [stop]);

  function listen() {
    const Ctor = recognitionCtor();
    if (!Ctor) {
      setError("เบราว์เซอร์นี้ยังฟังเสียงพูดไม่ได้ ลองเปิดด้วย Chrome หรือ Edge");
      return;
    }
    stop();
    const r = new Ctor();
    r.lang = "en-US";
    r.interimResults = false;
    r.maxAlternatives = 5;
    r.onresult = (e) => {
      if (rec.current !== r) return;
      const guesses = Array.from(e.results[0] ?? []).map((a) => clean(a.transcript));
      const v = judge(item, guesses);
      setVerdict(v);
      setScore((s) => ({ done: s.done + 1, right: s.right + (v.ok ? 1 : 0) }));
    };
    r.onerror = (e) => {
      if (rec.current !== r) return;
      setError(ERRORS[e.error] ?? "ฟังเสียงไม่สำเร็จ ลองอีกครั้ง");
    };
    r.onend = () => {
      if (rec.current !== r) return;
      rec.current = null;
      setListening(false);
    };
    setError(null);
    setVerdict(null);
    setListening(true);
    rec.current = r;
    r.start();
  }

  function next() {
    stop();
    setIndex((i) => (i + 1) % items.length);
    setVerdict(null);
    setError(null);
  }

  return (
    <section className="card flex flex-col gap-4 p-5" aria-labelledby={titleId}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={titleId} className="font-sans text-[15px] font-semibold">ฝึกพูด: ให้ระบบฟังเสียงคุณ</h3>
        <span className="font-mono text-xs text-muted tabular">คำที่ {index + 1}/{items.length} · ผ่าน {score.right}/{score.done}</span>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-display text-4xl font-bold tracking-tight">{item.say}</p>
          {item.tip && <p className="mt-1 text-sm text-muted">{item.tip}</p>}
        </div>
        <button type="button" onClick={() => speak(item.say)} className="btn-ghost py-2">ฟังตัวอย่าง</button>
        <button type="button" onClick={listen} disabled={listening} aria-label={`กดแล้วพูดคำว่า ${item.say}`}
          className={"grid size-16 place-items-center rounded-full text-white transition " + (listening ? "animate-pulse bg-bad" : "bg-brand hover:brightness-110")}>
          <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
          </svg>
        </button>
      </div>

      <div aria-live="polite" className="min-h-6 text-sm">
        {listening && <p className="text-muted">กำลังฟัง… พูดคำว่า <b>{item.say}</b></p>}
        {error && <p className="text-bad">{error}</p>}
        {verdict && (
          verdict.ok ? (
            <p className="font-semibold text-obj">✓ ชัดเจน ระบบได้ยินเป็น “{verdict.heard}”</p>
          ) : (
            <div>
              <p className="font-semibold text-bad">✗ ระบบได้ยินเป็น “{verdict.heard || "ไม่ชัด"}”</p>
              {verdict.near && item.tip && <p className="mt-0.5 text-muted">ฟังเหมือนอีกคำหนึ่ง: {item.tip}</p>}
            </div>
          )
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs leading-5 text-muted">
          ใช้ได้ใน Chrome และ Edge · เสียงจะถูกส่งไปให้บริการแปลงเสียงของเบราว์เซอร์ (Google หรือ Microsoft) เพื่อแปลงเป็นข้อความ
          · ระบบเช็คว่าฟังรู้เรื่องไหม แต่ยังวัดการเน้นพยางค์ได้ไม่ละเอียด
        </p>
        <button type="button" onClick={next} className="btn">คำต่อไป →</button>
      </div>
    </section>
  );
}
