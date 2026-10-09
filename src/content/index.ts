import grammarData from "./data/grammar.json";
import verbsData from "./data/verbs.json";
import verbGroupsData from "./data/verb-groups.json";
import vocabData from "./data/vocab.json";
import decksData from "./data/decks.json";
import levelsData from "./data/levels.json";

export type Level = "A1" | "A2" | "B1" | "B2";

export type PracticeItem =
  | { t: "fill"; q: string; a: string[]; th?: string }
  | { t: "fix"; q: string; a: string[]; th?: string }
  | { t: "order"; w: string[]; a: string; th?: string }
  | { t: "pick"; q: string; o: string[]; a: number; th?: string };

export type QuizItem = { q: string; o: string[]; a: number; why?: string };

export type Lesson = {
  id: string;
  level: Level;
  title: string;
  why: string;
  formula: string;
  /** Trusted HTML written by the course author. */
  theory: string;
  examples: [en: string, th: string][];
  mistakes: [wrong: string, right: string, note: string][];
  practice: PracticeItem[];
  quiz: QuizItem[];
  homework: string;
};

export type VerbGroup = "REG" | "AAA" | "ABB" | "ABC" | "ABA";
export type Verb = { id: string; v1: string; v2: string; v3: string; th: string; g: VerbGroup };
export type Word = { id: string; en: string; th: string; ex?: string };
export type Deck = { id: string; name: string; pre: string };

export const LESSONS = grammarData as unknown as Lesson[];
export const VERBS = verbsData as Verb[];
export const VERB_GROUPS = verbGroupsData as Record<VerbGroup, { name: string; tip: string }>;
export const WORDS = vocabData as Word[];
export const DECKS = decksData as Deck[];
export const LEVELS = levelsData as { id: Level; name: string; can: string }[];

export const PASS_MARK = 80;

export function getLesson(id: string) {
  return LESSONS.find((l) => l.id === id);
}

export function nextLesson(id: string) {
  const i = LESSONS.findIndex((l) => l.id === id);
  return i >= 0 ? LESSONS[i + 1] : undefined;
}

export function deckOf(word: Word) {
  return DECKS.find((d) => word.id.startsWith(d.pre));
}

export { lookup, isGlossed, normalize, verbFormOk, type Gloss } from "./lookup";
