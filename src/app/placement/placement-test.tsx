"use client";

import { ArrowRightIcon, CheckIcon, RotateCcwIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore, useTransition } from "react";
import type { PlacementRecord } from "@/lib/data";
import { startLesson, type PlacedAt, type PlacementAnswers, type PlacementLevel, type PlacementResult } from "@/lib/placement";
import { placementNext, submitPlacement, type PlacementReview } from "./actions";

type PublicQuestion = { id: string; level: PlacementLevel; q: string; o: string[] };
type Lesson = { id: string; level: string; title: string };
type Props = { questions: PublicQuestion[]; lessons: Lesson[]; levels: { id: string; name: string; can: string }[]; signedIn: boolean; history: PlacementRecord[] };
type Saved = { answers: PlacementAnswers; level: PlacementLevel; idx: number };
type Result = PlacementResult & { saved: boolean; wrong: PlacementReview[] };

// Answers so far, kept in this browser so a reload carries on from the same question.
const KEY = "placement:v1";
function readSaved(raw: string | null): Saved | null {
  try {
    const s = raw ? (JSON.parse(raw) as Saved) : null;
    return s && s.answers && typeof s.idx === "number" && s.level ? s : null;
  } catch {
    return null;
  }
}
function store(s: Saved | null) {
  try {
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
  } catch {}
}
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

const PRE_A1 = { name: "ก่อน A1 · เริ่มจากพื้นฐาน", can: "ยังไม่ต้องกังวล เริ่มจากบทแรก แล้วจะเห็นพัฒนาการเร็วมาก" };

export function PlacementTest({ questions, lessons, levels, signedIn, history }: Props) {
  const [phase, setPhase] = useState<"intro" | "test" | "result">("intro");
  const [state, setState] = useState<Saved>({ answers: {}, level: "A1", idx: 0 });
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [retrySubmit, setRetrySubmit] = useState(false);
  const [checking, start] = useTransition();
  const raw = useSyncExternalStore(subscribe, () => {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  }, () => null);
  const resumable = phase === "intro" ? readSaved(raw) : null;

  const block = questions.filter((q) => q.level === state.level);
  const current = block[state.idx];
  const asked = Object.keys(state.answers).length;
  const levelNo = ["A1", "A2", "B1", "B2"].indexOf(state.level) + 1;

  function begin(from: Saved | null) {
    const s = from ?? { answers: {}, level: "A1" as PlacementLevel, idx: 0 };
    setState(s);
    store(s);
    setResult(null);
    setPhase("test");
  }

  function finish(answers: PlacementAnswers) {
    setError("");
    setRetrySubmit(false);
    start(async () => {
      try {
        const r = await submitPlacement(answers);
        setResult(r);
        store(null);
        setPhase("result");
      } catch {
        setError("ส่งคำตอบไม่สำเร็จ ตรวจอินเทอร์เน็ตแล้วกดลองอีกครั้ง คำตอบที่ทำไปยังอยู่ครบ");
        setRetrySubmit(true);
      }
    });
  }

  function choose(value: number | null) {
    if (!current || checking) return;
    const answers = { ...state.answers, [current.id]: value };
    setError("");
    if (state.idx < block.length - 1) {
      const s = { ...state, answers, idx: state.idx + 1 };
      setState(s);
      store(s);
      return;
    }
    // End of a level block: the server says whether the next level is worth trying.
    start(async () => {
      try {
        const next = await placementNext(answers);
        if (next) {
          const s = { answers, level: next, idx: 0 };
          setState(s);
          store(s);
        } else {
          setState({ ...state, answers });
          finish(answers);
        }
      } catch {
        setState({ ...state, answers });
        setError("ตรวจคำตอบไม่สำเร็จ ตรวจอินเทอร์เน็ตแล้วตอบข้อนี้ใหม่อีกครั้ง");
      }
    });
  }

  if (phase === "result" && result) return <ResultView result={result} lessons={lessons} levels={levels} signedIn={signedIn} onAgain={() => begin(null)} />;

  if (phase === "test" && current) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <div className="flex justify-between text-sm">
            <span className="font-semibold" aria-live="polite">ชุดที่ {levelNo} · ข้อ {state.idx + 1} จาก {block.length}</span>
            <span className="font-mono text-xs text-muted tabular">ตอบแล้ว {asked} ข้อ</span>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1.5" aria-hidden>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-2 overflow-hidden rounded-full bg-page-alt">
                <div className="h-full rounded-full bg-(--ac-gold) transition-[width] duration-300"
                  style={{ width: n < levelNo ? "100%" : n === levelNo ? `${(state.idx / block.length) * 100}%` : "0%" }} />
              </div>
            ))}
          </div>
        </div>
        <div key={current.id} className="learn-in card flex flex-col gap-5 p-5 sm:p-7">
          <p className="w-fit rounded-full bg-(--ac-gold-soft) px-3 py-1 text-xs font-semibold text-(--ac-gold-ink)">เลือกคำที่เติมในช่องว่างแล้วถูกต้องที่สุด</p>
          <p className="text-[22px] leading-[1.45] font-semibold text-(--ac-navy) sm:text-[26px]">{current.q.replace("___", "______")}</p>
          <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="ตัวเลือก">
            {current.o.map((opt, i) => (
              <button key={opt} type="button" disabled={checking} onClick={() => choose(i)}
                className="flex min-h-14 items-center gap-3.5 rounded-xl border-2 border-line bg-surface px-4 py-3 text-left text-[17px] font-medium text-(--ac-ink) transition hover:border-(--ac-navy)/40 hover:bg-(--ac-bg) disabled:opacity-50">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-sunken font-mono text-sm font-semibold text-(--ac-muted)">{"ABCD"[i]}</span>{opt}
              </button>
            ))}
          </div>
          <button type="button" disabled={checking} onClick={() => choose(null)} className="min-h-11 self-start text-sm font-semibold text-(--ac-body) underline underline-offset-4 hover:text-(--ac-navy)">
            ไม่แน่ใจ ข้ามข้อนี้
          </button>
        </div>
        {checking && <p className="text-sm text-muted" role="status">กำลังตรวจคำตอบ…</p>}
        {error && (
          <p role="alert" className="text-sm text-bad">
            {error}{" "}
            {retrySubmit && <button type="button" className="font-semibold underline" onClick={() => finish(state.answers)}>ลองอีกครั้ง</button>}
          </p>
        )}
        <p className="text-xs text-muted">ไม่มีการหักคะแนน ถ้าไม่รู้ให้กด &ldquo;ไม่แน่ใจ&rdquo; ดีกว่าเดา ผลจะได้แม่นขึ้น</p>
      </div>
    );
  }

  if (phase === "test" && !current) {
    // The last answer is in and the result is on its way (or failed to send).
    return (
      <div className="card flex flex-col items-start gap-3 p-6">
        <p className="font-semibold">{checking ? "กำลังคิดผล…" : "ส่งคำตอบไม่สำเร็จ"}</p>
        {error && <><p className="text-sm text-bad" role="alert">{error}</p><button type="button" className="btn" onClick={() => finish(state.answers)}>ลองอีกครั้ง</button></>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="card flex flex-col gap-4 p-5 sm:p-7">
        <p className="leading-7">
          ตอบคำถามไวยากรณ์และคำศัพท์สั้นๆ ทีละข้อ เริ่มจากง่ายไปยาก ระบบจะหยุดเองเมื่อถึงระดับที่ยังยากเกินไป
          แล้วบอกว่าคุณอยู่ระดับไหน (A1–B2) ควรเริ่มบทไหน และควรทวนเรื่องอะไร
        </p>
        <ul className="grid gap-2 text-sm sm:grid-cols-3">
          <li className="rounded-lg bg-paper px-3 py-2.5"><b className="block">สูงสุด 24 ข้อ</b><span className="text-muted">ชุดละ 6 ข้อ 4 ระดับ</span></li>
          <li className="rounded-lg bg-paper px-3 py-2.5"><b className="block">ประมาณ 5–8 นาที</b><span className="text-muted">ไม่จับเวลา</span></li>
          <li className="rounded-lg bg-paper px-3 py-2.5"><b className="block">สอบซ้ำได้</b><span className="text-muted">ดูพัฒนาการของตัวเอง</span></li>
        </ul>
        <div className="flex flex-wrap gap-2">
          {resumable && <button type="button" className="btn" onClick={() => begin(resumable)}>ทำต่อจากข้อที่ค้าง ({Object.keys(resumable.answers).length} ข้อ)</button>}
          <button type="button" className={resumable ? "btn-ghost" : "btn"} onClick={() => begin(null)}>
            {resumable ? "เริ่มใหม่" : "เริ่มทำแบบทดสอบ"} <ArrowRightIcon className="size-4" />
          </button>
        </div>
        {!signedIn && <p className="text-xs text-muted"><Link href="/login" className="font-semibold text-brand underline">เข้าสู่ระบบ</Link> ก่อนสอบ เพื่อบันทึกผลและให้หน้า &ldquo;วันนี้&rdquo; เริ่มบทตามระดับของคุณ</p>}
      </div>
      {history.length > 0 && (
        <section className="card p-5">
          <h2 className="mb-2 text-sm font-semibold">ผลที่ผ่านมา</h2>
          <ul className="divide-y divide-line text-sm">
            {history.map((h) => (
              <li key={h.created_at} className="flex justify-between gap-3 py-2">
                <span>{new Date(h.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit", timeZone: "Asia/Bangkok" })}</span>
                <span className="font-semibold">{h.level === "pre-A1" ? "ก่อน A1" : h.level}</span>
                <span className="font-mono text-xs text-muted tabular">{h.correct}/{h.total}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ResultView({ result, lessons, levels, signedIn, onAgain }: { result: Result; lessons: Lesson[]; levels: Props["levels"]; signedIn: boolean; onAgain: () => void }) {
  const info = result.level === "pre-A1" ? PRE_A1 : levels.find((l) => l.id === result.level) ?? PRE_A1;
  const begin = startLesson(lessons, result.level as PlacedAt);
  const titleOf = (id: string) => lessons.find((l) => l.id === id)?.title ?? id;
  return (
    <div className="learn-in flex flex-col gap-5">
      <section className="on-dark flex flex-col items-start gap-3 rounded-2xl bg-(--ac-dark) p-6 text-white sm:p-8">
        <p className="eyebrow">ระดับของคุณตอนนี้</p>
        <p className="font-display text-5xl font-bold">{result.level === "pre-A1" ? "ก่อน A1" : result.level}</p>
        <p className="text-lg font-semibold">{info.name}</p>
        <p className="text-sm text-on-dark-muted">{info.can}</p>
        <p className="font-mono text-xs text-on-dark-muted tabular">ตอบถูก {result.correct} จาก {result.total} ข้อ</p>
      </section>

      <section className="card flex flex-col gap-3 p-5">
        <h2 className="text-sm font-semibold">คะแนนแต่ละระดับ</h2>
        {(["A1", "A2", "B1", "B2"] as const).map((lv) => {
          const s = result.byLevel[lv];
          return (
            <div key={lv} className="grid grid-cols-[2.5rem_1fr_3.5rem] items-center gap-3 text-sm">
              <span className="font-mono font-semibold">{lv}</span>
              <div className="h-2.5 overflow-hidden rounded-full bg-page-alt">
                {s && <div className={"h-full rounded-full " + (s.correct >= 4 ? "bg-obj" : "bg-[#d9a84a]")} style={{ width: `${(s.correct / s.total) * 100}%` }} />}
              </div>
              <span className="text-right font-mono text-xs text-muted tabular">{s ? `${s.correct}/${s.total}` : "ไม่ได้สอบ"}</span>
            </div>
          );
        })}
        <p className="text-xs text-muted">ผ่านระดับเมื่อถูก 4 จาก 6 ข้อขึ้นไป ระดับที่ไม่ได้สอบคือระดับที่ยากเกินไปสำหรับตอนนี้</p>
      </section>

      {begin && (
        <section className="card flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p className="text-xs text-muted">แนะนำให้เริ่มที่</p>
            <p className="font-semibold">{begin.title}</p>
          </div>
          <Link href={`/grammar/${begin.id}`} className="btn">เริ่มบทนี้ <ArrowRightIcon className="size-4" /></Link>
        </section>
      )}

      {result.review.length > 0 && (
        <section className="card p-5">
          <h2 className="mb-2 text-sm font-semibold">ควรทวนก่อน (จากข้อที่ตอบผิด)</h2>
          <ul className="flex flex-col gap-1.5 text-sm">
            {result.review.map((id) => <li key={id}><Link href={`/grammar/${id}`} className="text-brand underline underline-offset-2">{titleOf(id)}</Link></li>)}
          </ul>
        </section>
      )}

      {result.wrong.length > 0 && (
        <details className="card p-5">
          <summary className="cursor-pointer text-sm font-semibold">ดูข้อที่ผิด ({result.wrong.length} ข้อ) พร้อมคำอธิบาย</summary>
          <ul className="mt-3 flex flex-col gap-3">
            {result.wrong.map((w) => (
              <li key={w.id} className="rounded-lg bg-paper p-3 text-sm leading-6">
                <p className="font-medium">{w.q}</p>
                <p className="text-bad"><XIcon className="mr-1 inline size-3.5" aria-hidden />คุณตอบ: {w.chosen ?? "ไม่แน่ใจ"}</p>
                <p className="text-obj"><CheckIcon className="mr-1 inline size-3.5" aria-hidden />ที่ถูก: <b>{w.correct}</b></p>
                <p className="text-muted">{w.why}</p>
              </li>
            ))}
          </ul>
        </details>
      )}

      <p className="text-sm">
        {result.saved
          ? "✓ บันทึกผลแล้ว หน้า “วันนี้” จะเริ่มบทเรียนตามระดับนี้"
          : signedIn
            ? "บันทึกผลไม่สำเร็จ (ผลด้านบนยังถูกต้อง) ลองสอบใหม่ภายหลังเพื่อบันทึก"
            : <><Link href="/login" className="font-semibold text-brand underline">เข้าสู่ระบบ</Link> แล้วสอบอีกครั้ง เพื่อบันทึกผลและให้เว็บเริ่มบทตามระดับของคุณ</>}
      </p>
      <p className="text-xs text-muted">ผลนี้เป็นการประเมินคร่าวๆ เพื่อเลือกจุดเริ่มเรียน ไม่ใช่ใบรับรองระดับภาษา</p>
      <button type="button" onClick={onAgain} className="btn-ghost self-start"><RotateCcwIcon className="size-4" /> สอบอีกครั้ง</button>
    </div>
  );
}
