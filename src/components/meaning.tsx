"use client";

import { useState } from "react";
import { meaningShown } from "./meaning-pref";
import { useStudy } from "./study-context";

/** Grows a 24px-tall control's tap area to 44px without changing how it looks. */
export const TAP_44 = "after:absolute after:inset-x-0 after:-inset-y-2.5 after:content-['']";

/**
 * A word's Thai meaning in a word list. It follows the header's Thai toggle; with Thai off,
 * a small "ดูความหมาย" button shows this one meaning without turning Thai back on everywhere.
 */
export function Meaning({ th, en, className = "" }: { th: string; en: string; className?: string }) {
  const { showThai } = useStudy();
  const [peek, setPeek] = useState(false);
  if (meaningShown({ revealed: peek, showThai })) return <span lang="th" className={className}>{th}</span>;
  return (
    // Looks 24px tall so word lists stay compact; the invisible ::after makes the tap area 44px.
    <button type="button" onClick={() => setPeek(true)} aria-label={`ดูความหมายของ ${en}`}
      className={"relative inline-flex h-6 min-w-11 items-center justify-center rounded-md bg-sunken px-2 text-xs text-muted hover:bg-line " + TAP_44}>
      ดูความหมาย
    </button>
  );
}
