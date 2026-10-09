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
        "rounded-full border px-3 py-1.5 text-xs transition " +
        (dark ? "border-[#2c3f37] text-[#c9d4cf] hover:bg-ink-2" : "border-line bg-surface hover:border-brand")
      }
    >
      คำแปลไทย: <b className="font-semibold">{showThai ? "แสดง" : "ซ่อน"}</b>
    </button>
  );
}
