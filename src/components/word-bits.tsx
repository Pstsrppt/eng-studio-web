// Small shared pieces for showing a word: part-of-speech colours, the badge and the word's icon.
import type { Word } from "@/content";
import { POS_LABEL, type Pos } from "@/content/pos";
import { WORD_ICONS } from "./word-icons";

export const POS_TONE: Record<Pos, string> = {
  n: "bg-subj-bg text-subj",
  v: "bg-verb-bg text-verb",
  adj: "bg-obj-bg text-obj",
  adv: "bg-[#f3e8fb] text-[#7a3fa6]",
  prep: "bg-[#e3f2f1] text-[#0f6e69]",
  conj: "bg-[#e3f2f1] text-[#0f6e69]",
  phrase: "bg-[#fbf0d9] text-[#9a6200]",
};

/** Icon tile, example box and highlight colours for each part of speech. */
export const POS_STYLE: Record<Pos, { tile: string; chip: string; mark: string }> = {
  n: { tile: "bg-subj-bg text-subj", chip: "bg-[#eef3fd]", mark: "text-subj" },
  v: { tile: "bg-verb-bg text-verb", chip: "bg-[#fdf3ec]", mark: "text-verb" },
  adj: { tile: "bg-obj-bg text-obj", chip: "bg-[#ecf7f2]", mark: "text-obj" },
  adv: { tile: "bg-[#f3e8fb] text-[#7a3fa6]", chip: "bg-[#f8f2fc]", mark: "text-[#7a3fa6]" },
  prep: { tile: "bg-[#e3f2f1] text-[#0f6e69]", chip: "bg-[#eef7f6]", mark: "text-[#0f6e69]" },
  conj: { tile: "bg-[#e3f2f1] text-[#0f6e69]", chip: "bg-[#eef7f6]", mark: "text-[#0f6e69]" },
  phrase: { tile: "bg-[#fbf0d9] text-[#9a6200]", chip: "bg-[#fdf7ea]", mark: "text-[#9a6200]" },
};

export function PosBadge({ pos, pill = false }: { pos: Pos; pill?: boolean }) {
  return (
    <abbr title={POS_LABEL[pos].th}
      className={(pill ? "rounded-full px-2.5 text-[11px] " : "rounded px-1.5 text-[11px] ") + "py-0.5 font-mono no-underline " + POS_TONE[pos]}>
      {POS_LABEL[pos].abbr}
    </abbr>
  );
}


/** The icon picked for this word's meaning, or a dot for words added by the learner. */
export function WordIcon({ word, className = "size-5" }: { word: Word; className?: string }) {
  const Icon = word.icon ? WORD_ICONS[word.icon] : undefined;
  if (!Icon) return <span className="size-2.5 rounded-full bg-current" aria-hidden />;
  return <Icon className={className} strokeWidth={2} aria-hidden />;
}

