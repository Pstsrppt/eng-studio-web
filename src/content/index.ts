import grammarData from "./data/grammar.json";
import verbsData from "./data/verbs.json";
import verbGroupsData from "./data/verb-groups.json";
import vocabData from "./data/vocab.json";
import decksData from "./data/decks.json";
import levelsData from "./data/levels.json";
import soundsData from "./data/sounds.json";
import photosData from "./data/photos.json";
import type { Pos } from "./pos";

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
  /** Words to say aloud in the speaking drill (pronunciation lessons). */
  speak?: SpeakItem[];
};

/** `accept`: other spellings of the same sound (right/write). `near`: words learners say by mistake. */
export type SpeakItem = { say: string; accept?: string[]; near?: string[]; tip?: string };

export type VerbGroup = "REG" | "AAA" | "ABB" | "ABC" | "ABA";
export type Verb = {
  id: string;
  v1: string;
  v2: string;
  v3: string;
  th: string;
  g: VerbGroup;
  level?: Level;
  /** Example sentences using V2 and V3, with Thai. */
  ex2?: string;
  ex2Th?: string;
  ex3?: string;
  ex3Th?: string;
  /** IPA of each form, e.g. { v1: "/ɡoʊ/", v2: "/wɛnt/", v3: "/ɡɔn/" }. */
  ipa?: { v1: string; v2: string; v3: string };
  icon?: string;
  photo?: Photo;
};
export type Word = {
  id: string;
  en: string;
  /** American IPA, from the CMU Pronouncing Dictionary (a few fixed by hand). */
  ipa?: string;
  th: string;
  ex?: string;
  /** Thai translation of `ex`. */
  exTh?: string;
  pos?: Pos;
  level?: Level;
  /** Plural or countability for nouns, V2/V3 for verbs, comparative for adjectives. */
  forms?: string;
  /** A short tip about a common mistake or a related word. */
  note?: string;
  /** Lucide icon name for the word's meaning (see components/word-icons.ts). */
  icon?: string;
  /** What to search for a stock photo: the scene of the example sentence. */
  photoQuery?: string;
  /** Filled in by the server for pages that show photo cards. */
  photo?: Photo;
};

export type Deck = { id: string; name: string; pre: string };

/** A stock photo of the scene in a word's example sentence, saved in public/photos (scripts/fetch-photos.mjs). */
export type Photo = { sourceId: number; src: string; alt: string; by: string; byUrl: string; url: string; site: string };
export const PHOTOS = photosData as Record<string, Photo>;

/** Words and verbs with their photo attached, for pages that render photo cards. */
export const withPhoto = <T extends { id: string }>(items: T[]) => items.map((x) => (PHOTOS[x.id] ? { ...x, photo: PHOTOS[x.id] } : x));

export const LESSONS = grammarData as unknown as Lesson[];
/** Pronunciation lessons. Same shape as grammar lessons, shown under /sounds. */
export const SOUNDS = soundsData as unknown as Lesson[];
export const VERBS = verbsData as Verb[];
export const VERB_GROUPS = verbGroupsData as Record<VerbGroup, { name: string; tip: string }>;
export const WORDS = vocabData as unknown as Word[];
export const DECKS = decksData as Deck[];
export const LEVELS = levelsData as { id: Level; name: string; can: string }[];

export const PASS_MARK = 80;

export function getLesson(id: string) {
  return LESSONS.find((l) => l.id === id);
}

export function getSound(id: string) {
  return SOUNDS.find((l) => l.id === id);
}

export function nextLesson(id: string, list: Lesson[] = LESSONS) {
  const i = list.findIndex((l) => l.id === id);
  return i >= 0 ? list[i + 1] : undefined;
}

export function deckOf(word: Word) {
  return DECKS.find((d) => word.id.startsWith(d.pre));
}

export { lookup, isGlossed, normalize, verbFormOk, type Gloss } from "./lookup";
export { POS_LABEL, type Pos } from "./pos";
