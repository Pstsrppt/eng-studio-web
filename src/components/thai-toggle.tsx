"use client";

import { useStudy } from "./study-context";

export function ThaiToggle() {
  const { showThai, toggleThai } = useStudy();
  return (
    <button
      type="button"
      onClick={toggleThai}
      aria-pressed={showThai}
      className="rounded-full border border-rule bg-card px-3 py-1.5 text-xs whitespace-nowrap text-body transition hover:border-primary"
    >
      <span className="max-sm:hidden">คำแปล</span>ไทย: <b className="font-semibold">{showThai ? "แสดง" : "ซ่อน"}</b>
    </button>
  );
}
