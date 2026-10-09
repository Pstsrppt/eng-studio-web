// Word lookup used in the browser. Imports only the small word lists, not the lessons.
import glossData from "./data/gloss.json";
import verbsData from "./data/verbs.json";
import vocabData from "./data/vocab.json";
import type { Verb, Word } from "./index";

const GLOSS = glossData as unknown as Record<string, [th: string, say: string]>;
const WORDS = vocabData as Word[];
const VERBS = verbsData as Verb[];

const WORD_BY_EN = new Map(WORDS.map((w) => [w.en.toLowerCase(), w]));
const VERB_BY_FORM = new Map<string, Verb>();
for (const v of VERBS) {
  for (const f of [v.v1, ...v.v2.split("/"), v.v3]) VERB_BY_FORM.set(f, v);
}

export type Gloss = { word: string; th: string; say?: string; note?: string; itemId?: string };

/** Meaning of an English word as it appears in a sentence (handles -s, -ed, -ing and V2/V3). */
export function lookup(raw: string): Gloss | undefined {
  const w = raw.toLowerCase().replace(/[^a-z']/g, "");
  if (!w) return undefined;
  const stems = [w, w.replace(/'s$/, ""), w.replace(/ies$/, "y"), w.replace(/es$/, ""), w.replace(/s$/, ""),
    w.replace(/ied$/, "y"), w.replace(/ed$/, ""), w.replace(/d$/, ""), w.replace(/ing$/, ""), w.replace(/ing$/, "e")];
  for (const s of stems) {
    if (GLOSS[s]) return { word: s, th: GLOSS[s][0], say: GLOSS[s][1] };
  }
  for (const s of stems) {
    const word = WORD_BY_EN.get(s);
    if (word) return { word: word.en, th: word.th, itemId: word.id };
  }
  const verb = VERB_BY_FORM.get(w);
  if (verb) {
    return { word: verb.v1, th: verb.th, note: `${verb.v1} – ${verb.v2} – ${verb.v3}`, itemId: verb.id };
  }
  return undefined;
}

/** True when a word has a stored meaning, so the UI can underline it. */
export function isGlossed(raw: string) {
  const w = raw.toLowerCase().replace(/[^a-z']/g, "");
  return Boolean(GLOSS[w] || GLOSS[w.replace(/s$/, "")]);
}

export function normalize(s: string) {
  return s.toLowerCase().replace(/[’']/g, "'").replace(/[.,!?]/g, "").replace(/\s+/g, " ").trim();
}

/** Accepts "was/were", "was or were", or either form alone. */
export function verbFormOk(input: string, answer: string) {
  const v = normalize(input).replace(/\s*\/\s*/g, "/").replace(/ or /g, "/");
  if (!v) return false;
  if (v === answer) return true;
  if (answer.split("/").includes(v)) return true;
  return answer === "got" && v === "gotten";
}
