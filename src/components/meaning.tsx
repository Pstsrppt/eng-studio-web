"use client";

import { useState } from "react";
import { meaningShown } from "./meaning-pref";
import { useStudy } from "./study-context";

/**
 * A word's Thai meaning in a word list. It follows the header's Thai toggle; with Thai off,
 * a small "ดูความหมาย" button shows this one meaning without turning Thai back on everywhere.
 */
export function Meaning({ th, en, className = "" }: { th: string; en: string; className?: string }) {
  const { showThai } = useStudy();
  const [peek, setPeek] = useState(false);
  if (meaningShown({ revealed: peek, showThai })) return <span lang="th" className={className}>{th}</span>;
  return (
    <button type="button" onClick={() => setPeek(true)} aria-label={`ดูความหมายของ ${en}`}
      className="inline-flex h-6 items-center rounded-md bg-sunken px-2 text-xs text-muted hover:bg-line">
      ดูความหมาย
    </button>
  );
}
