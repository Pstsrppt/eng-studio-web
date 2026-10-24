"use client";

import Link from "next/link";
import { useState } from "react";

type StageInfo = { n: number; id: string; title: string; th: string; blurb: string };

/** The seven stations on a golden path. Hover, focus or tap one to read about it; its link opens the roadmap there. */
export function RoadmapPreview({ stages }: { stages: StageInfo[] }) {
  const [active, setActive] = useState<string | null>(null);
  const shown = stages.find((s) => s.id === active);
  return (
    <div className="mt-8">
      <ol className="relative grid grid-cols-7 gap-1" onMouseLeave={() => setActive(null)}>
        {/* The path behind the stations. */}
        <span className="absolute top-6 right-[7%] left-[7%] h-[3px] rounded-full bg-[linear-gradient(90deg,#e9bb70,#ffe2a0_60%,#69d8ff)] opacity-70" aria-hidden />
        {stages.map((s) => {
          const on = active === s.id;
          return (
            <li key={s.id} className="relative flex justify-center">
              <Link href={`/roadmap?stage=${s.id}`} onMouseEnter={() => setActive(s.id)} onFocus={() => setActive(s.id)} onBlur={() => setActive(null)}
                aria-describedby={on ? "stage-tip" : undefined}
                className="group flex flex-col items-center gap-2 rounded-xl px-1 pb-1 text-center">
                <span className={"relative grid size-12 place-items-center rounded-full border-2 font-brand text-sm font-bold transition " +
                  (on ? "scale-110 border-gold-soft bg-gold text-navy shadow-[0_0_24px_rgba(233,187,112,0.55)]" : "border-gold/70 bg-navy-2 text-gold-soft group-hover:border-gold-soft")}>
                  {String(s.n).padStart(2, "0")}
                </span>
                <span className={"hidden text-xs leading-4 sm:block " + (on ? "text-white" : "text-mist")}>{s.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>
      <div id="stage-tip" role="status" aria-live="polite" className="glass mt-5 min-h-[92px] p-4">
        {shown ? (
          <>
            <p className="text-sm text-gold-soft">Stage {String(shown.n).padStart(2, "0")} · {shown.th}</p>
            <p className="font-brand text-lg font-semibold tracking-wide">{shown.title}</p>
            <p className="text-sm text-mist">{shown.blurb}</p>
          </>
        ) : (
          <p className="pt-2 text-sm text-mist">ชี้หรือแตะสถานีเพื่อดูว่าแต่ละช่วงเรียนอะไร</p>
        )}
      </div>
    </div>
  );
}
