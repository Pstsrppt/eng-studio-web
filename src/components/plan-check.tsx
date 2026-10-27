"use client";

import { useLocalFlag } from "./use-local-flag";

/** A tick the learner sets by hand, remembered in this browser for today only. */
export function PlanCheck({ id, day, label }: { id: string; day: string; label: string }) {
  const key = `es-plan-${day}-${id}`;
  const [done, setDone] = useLocalFlag(key, false);
  const toggle = () => setDone(!done);

  return (
    <button type="button" onClick={toggle} aria-pressed={done} aria-label={`${label}: ${done ? "ทำแล้ว" : "ยังไม่ได้ทำ"}`}
      className={"grid size-6 shrink-0 place-items-center rounded-md border-[1.5px] text-xs text-white " + (done ? "border-[#2e7d5b] bg-[#2e7d5b]" : "border-rule-strong bg-surface")}>
      {done ? "✓" : ""}
    </button>
  );
}
