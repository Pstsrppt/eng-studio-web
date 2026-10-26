"use client";

import { useStudy } from "./study-context";

export function ThaiToggle() {
  const { showThai, toggleThai } = useStudy();
  return (
    <button
      type="button"
      onClick={toggleThai}
      aria-pressed={showThai}
      className="rounded-full border border-[#ebe5d9] bg-white px-3 py-1.5 text-xs whitespace-nowrap text-[#3d4757] transition hover:border-[#0f2440]"
    >
      <span className="max-sm:hidden">คำแปล</span>ไทย: <b className="font-semibold">{showThai ? "แสดง" : "ซ่อน"}</b>
    </button>
  );
}
