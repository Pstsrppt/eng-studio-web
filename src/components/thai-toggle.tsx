"use client";

import { useStudy } from "./study-context";

export function ThaiToggle({ dark = false }: { dark?: boolean }) {
  const { showThai, toggleThai } = useStudy();
  return (
    <button
      type="button"
      onClick={toggleThai}
      aria-pressed={showThai}
      className={
        "rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition " +
        (dark ? "border-[#22395a] text-[#c4d0dd] hover:bg-ink-2" : "border-line bg-surface hover:border-brand")
      }
    >
      <span className="max-sm:hidden">คำแปล</span>ไทย: <b className="font-semibold">{showThai ? "แสดง" : "ซ่อน"}</b>
    </button>
  );
}
