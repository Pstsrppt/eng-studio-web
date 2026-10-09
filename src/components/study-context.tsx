"use client";

import { createContext, use, useCallback, useEffect, useState, type ReactNode } from "react";
import { useLocalFlag } from "./use-local-flag";
import { addCard } from "@/app/actions";
import { lookup, type Gloss } from "@/content/lookup";
import { speak } from "./speak";

type Ctx = {
  showThai: boolean;
  toggleThai: () => void;
  openWord: (raw: string, sentence?: string) => void;
};

const StudyContext = createContext<Ctx | null>(null);

export function useStudy() {
  const ctx = use(StudyContext);
  if (!ctx) throw new Error("useStudy must be used inside <StudyProvider>");
  return ctx;
}


export function StudyProvider({ children }: { children: ReactNode }) {
  const [showThai, setShowThai] = useLocalFlag("es-show-thai", true);
  const [sheet, setSheet] = useState<{ raw: string; gloss?: Gloss; sentence?: string } | null>(null);

  const toggleThai = useCallback(() => setShowThai(!showThai), [showThai, setShowThai]);

  const openWord = useCallback((raw: string, sentence?: string) => {
    setSheet({ raw, gloss: lookup(raw), sentence });
  }, []);

  return (
    <StudyContext value={{ showThai, toggleThai, openWord }}>
      {children}
      {sheet && <WordSheet {...sheet} onClose={() => setSheet(null)} />}
    </StudyContext>
  );
}

function WordSheet({ raw, gloss, sentence, onClose }: { raw: string; gloss?: Gloss; sentence?: string; onClose: () => void }) {
  const [state, setState] = useState<"idle" | "saving" | "added" | "signed-out" | "error">("idle");
  const word = gloss?.word ?? raw.toLowerCase().replace(/[^a-z']/g, "");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function add() {
    if (!gloss) return;
    setState("saving");
    try {
      const kind = gloss.itemId?.startsWith("vb-") ? "verb" : "word";
      setState(await addCard({ itemId: gloss.itemId, kind, en: gloss.word, th: gloss.th }));
    } catch {
      setState("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center" role="dialog" aria-modal="true" aria-label={`ความหมายของ ${word}`}>
      <button type="button" aria-label="ปิด" onClick={onClose} className="absolute inset-0 bg-ink/30" />
      <div className="relative flex w-full max-w-md flex-col gap-3 rounded-t-2xl bg-surface px-6 pt-3 pb-[calc(1.75rem+env(safe-area-inset-bottom))] shadow-2xl lg:rounded-2xl lg:pb-6">
        <span className="h-1.5 w-10 self-center rounded-full bg-line lg:hidden" />
        <div className="flex items-baseline gap-3">
          <h3 className="text-3xl font-bold">{word}</h3>
          {gloss?.say && <span className="font-mono text-sm text-muted">{gloss.say}</span>}
        </div>
        {gloss ? (
          <>
            <p className="text-[15px]">{gloss.th}</p>
            {gloss.note && <p className="font-mono text-sm text-verb">{gloss.note}</p>}
          </>
        ) : (
          <p className="text-sm text-muted">คำนี้ยังไม่มีในพจนานุกรมของเว็บ</p>
        )}
        {sentence && (
          <p className="rounded-lg bg-paper px-3 py-2.5 text-sm">&ldquo;{sentence}&rdquo;</p>
        )}
        <div className="flex gap-2.5">
          <button type="button" className="btn-ghost" onClick={() => speak(word)}>ฟัง</button>
          {gloss && (
            <button type="button" className="btn flex-1" onClick={add} disabled={state !== "idle" && state !== "error"}>
              {state === "added" ? "อยู่ในการ์ดทวนแล้ว" : state === "saving" ? "กำลังเพิ่ม…" : "เพิ่มลงการ์ดทวน"}
            </button>
          )}
        </div>
        {state === "signed-out" && <p className="text-sm text-bad">เข้าสู่ระบบก่อน จึงจะเก็บคำไว้ทวนได้</p>}
        {state === "error" && <p className="text-sm text-bad">เพิ่มไม่สำเร็จ ลองอีกครั้ง</p>}
      </div>
    </div>
  );
}
