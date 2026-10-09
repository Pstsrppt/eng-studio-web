"use client";

import { speak } from "./speak";

export function SpeakButton({ text, label = "ฟังเสียง" }: { text: string; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => speak(text)}
      aria-label={`${label}: ${text}`}
      className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-muted transition hover:border-brand hover:text-brand"
    >
      <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
        <path d="M2 6h3l4-3v10L5 10H2z" fill="currentColor" />
        <path d="M11 5.5a3.5 3.5 0 0 1 0 5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </svg>
    </button>
  );
}
