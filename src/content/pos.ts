// Part-of-speech labels. Kept apart from index.ts so client components can import it without the lessons.
export type Pos = "n" | "v" | "adj" | "phrase";

export const POS_LABEL: Record<Pos, { abbr: string; th: string }> = {
  n: { abbr: "n.", th: "คำนาม" },
  v: { abbr: "v.", th: "กริยา" },
  adj: { abbr: "adj.", th: "คำคุณศัพท์" },
  phrase: { abbr: "phr.", th: "วลี" },
};
