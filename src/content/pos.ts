// Part-of-speech labels. Kept apart from index.ts so client components can import it without the lessons.
export type Pos = "n" | "v" | "adj" | "adv" | "prep" | "conj" | "phrase";

export const POS_LABEL: Record<Pos, { abbr: string; th: string }> = {
  n: { abbr: "n.", th: "คำนาม" },
  v: { abbr: "v.", th: "กริยา" },
  adj: { abbr: "adj.", th: "คำคุณศัพท์" },
  adv: { abbr: "adv.", th: "คำวิเศษณ์" },
  prep: { abbr: "prep.", th: "คำบุพบท" },
  conj: { abbr: "conj.", th: "คำสันธาน" },
  phrase: { abbr: "phr.", th: "วลี" },
};

export type WordLevel = "A1" | "A2" | "B1" | "B2";
export const WORD_LEVELS: WordLevel[] = ["A1", "A2", "B1", "B2"];
