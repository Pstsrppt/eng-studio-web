"use client";

import { isGlossed } from "@/content/lookup";
import { SpeakButton } from "./speak-button";
import { useStudy } from "./study-context";

/** An English sentence where every word can be tapped for its meaning, with an optional Thai line. */
export function Sentence({ en, th, size = "md" }: { en: string; th?: string; size?: "md" | "lg" }) {
  const { showThai, openWord } = useStudy();
  const parts = en.split(/(\s+)/);
  return (
    <div className="flex items-start justify-between gap-3 cramped:flex-wrap">
      <div className="min-w-0 cramped:basis-full">
        <p className={size === "lg" ? "font-display text-lg leading-relaxed" : "font-display text-[17px] leading-relaxed"}>
          {parts.map((p, i) =>
            /^\s+$/.test(p) || !/[a-z]/i.test(p) ? (
              p
            ) : (
              <button
                key={i}
                type="button"
                onClick={() => openWord(p, en)}
                className={
                  // Short words like "I" and "a" would otherwise be a few pixels wide; the space between words keeps boxes apart.
                  // In px like the text beside it. A one-letter first word moves back so the sentence still starts at the margin.
                  "min-w-[24px] rounded-sm hover:bg-brand-soft " + (i === 0 && p.length === 1 ? "-ml-[8px] " : "") +
                  (isGlossed(p) ? "underline decoration-accent decoration-dotted underline-offset-4" : "")
                }
              >
                {p}
              </button>
            ),
          )}
        </p>
        {th && showThai && <p className="mt-0.5 text-[13px] text-muted">{th}</p>}
      </div>
      <SpeakButton text={en} />
    </div>
  );
}
