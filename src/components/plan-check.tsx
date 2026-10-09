"use client";

import { useLocalFlag } from "./use-local-flag";

/** A tick the learner sets by hand, remembered in this browser for today only. */
export function PlanCheck({ id, day, label }: { id: string; day: string; label: string }) {
  const key = `es-plan-${day}-${id}`;
  const [done, setDone] = useLocalFlag(key, false);
  const toggle = () => setDone(!done);

  return (
    <button type="button" onClick={toggle} aria-pressed={done} aria-label={`${label}: ${done ? "ทำแล้ว" : "ยังไม่ได้ทำ"}`}
      className={"grid size-5 place-items-center rounded-[5px] border-[1.5px] text-[11px] text-white " + (done ? "border-brand bg-brand" : "border-[#b9c6c0] bg-surface")}>
      {done ? "✓" : ""}
    </button>
  );
}
