"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { resolveMistake } from "@/app/actions";
import type { MistakeGroup } from "@/lib/data";
import { speak } from "./speak";

export type MistakeItem = MistakeGroup & { from: { title: string; href: string } | null };

/** Same order on the server and in the browser, but not always "correct answer first". */
function correctFirst(m: MistakeGroup) {
  let h = 0;
  for (const c of m.wrong + m.correct) h = (h * 31 + c.charCodeAt(0)) | 0;
  return (h & 1) === 0;
}

/** Each past mistake as a two-way choice. Picking the right one clears it from the list. */
export function MistakesView({ items }: { items: MistakeItem[] }) {
  const [state, setState] = useState<Record<string, "fixed" | "missed">>({});
  const [failed, setFailed] = useState(false);
  const [, start] = useTransition();
  const fixed = Object.values(state).filter((s) => s === "fixed").length;

  function choose(m: MistakeItem, pickedCorrect: boolean) {
    const key = m.wrong + "→" + m.correct;
    if (!pickedCorrect) {
      setState((s) => ({ ...s, [key]: "missed" }));
      return;
    }
    setState((s) => ({ ...s, [key]: "fixed" }));
    if (/[a-z]/i.test(m.correct)) speak(m.correct);
    start(async () => {
      try {
        await resolveMistake(m.wrong, m.correct);
        setFailed(false);
      } catch {
        setFailed(true);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-muted">เลือกข้อที่ถูก ตอบถูกแล้วข้อนั้นจะหายจากรายการ ตอบผิดจะอยู่ต่อจนกว่าจะแก้ได้</p>
        <p className="font-mono text-xs text-muted tabular">แก้แล้ว {fixed}/{items.length}</p>
      </div>
      {failed && <p className="text-sm text-bad">บันทึกไม่สำเร็จ ตรวจการเชื่อมต่อแล้วลองอีกครั้ง</p>}

      <ol className="grid gap-3 lg:grid-cols-2">
        {items.map((m, i) => {
          const key = m.wrong + "→" + m.correct;
          const result = state[key];
          const options = correctFirst(m) ? [true, false] : [false, true];
          return (
            <li key={key} className={"card flex flex-col gap-3 p-4 " + (result === "fixed" ? "border-[#9ccdb8] bg-obj-bg/60" : "")}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="eyebrow">ข้อ {i + 1} · ผิดมาแล้ว {m.n} ครั้ง</p>
                {m.from && (
                  <Link href={m.from.href} className="truncate text-xs text-brand underline underline-offset-2">{m.from.title}</Link>
                )}
              </div>
              <p className="text-[15px] font-medium">ข้อไหนถูก?</p>
              <div className="flex flex-col gap-2">
                {options.map((isCorrect) => {
                  const text = isCorrect ? m.correct : m.shown;
                  const tone = !result
                    ? "border-line bg-surface hover:border-brand"
                    : isCorrect
                      ? "border-obj bg-obj-bg"
                      : result === "missed"
                        ? "border-bad bg-bad-bg"
                        : "border-line bg-surface opacity-50";
                  return (
                    <button key={String(isCorrect)} type="button" disabled={!!result} onClick={() => choose(m, isCorrect)}
                      className={"rounded-lg border-[1.5px] px-3 py-2.5 text-left text-[15px] transition " + tone}>
                      {text}
                    </button>
                  );
                })}
              </div>
              {result === "fixed" && <p className="text-sm font-semibold text-obj">✓ แก้ได้แล้ว ข้อนี้จะไม่อยู่ในรายการอีก</p>}
              {result === "missed" && (
                <div className="text-sm">
                  <p className="font-semibold text-bad">✗ ยังผิดอยู่</p>
                  {m.note && <p className="mt-1 text-muted">เหตุผล: {m.note}</p>}
                  <button type="button" className="mt-2 text-sm font-semibold text-brand underline underline-offset-2"
                    onClick={() => setState((s) => {
                      const next = { ...s };
                      delete next[key];
                      return next;
                    })}>
                    ลองอีกครั้ง
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
