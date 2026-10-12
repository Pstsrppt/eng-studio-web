// Which vocabulary words each lesson uses, so a lesson can teach its new words before the theory.
import { LESSONS, PHOTOS, SOUNDS, WORDS, type Lesson, type Photo, type Word } from "./index";

/** Words shown at the start of a lesson: new ones first, then ones taught in earlier lessons. */
export const WORDS_PER_LESSON = 20;

export type LessonWord = { word: Word; ex?: string; exTh?: string; photo?: Photo };
/** `fresh`: first met in this lesson. `review`: taught in an earlier lesson, shown to fill up to 20. */
export type LessonWords = { fresh: LessonWord[]; review: LessonWord[] };

const BY_EN = new Map(WORDS.map((w) => [w.en.toLowerCase(), w]));
const LEVEL_RANK: Record<string, number> = { A1: 0, A2: 1, B1: 2, B2: 3 };

/** The vocabulary word behind a token, allowing -s, -ed, -ing and 's (same stems as tap-to-translate). */
function wordFor(token: string): Word | undefined {
  const t = token.toLowerCase();
  const stems = [t, t.replace(/'s$/, ""), t.replace(/ies$/, "y"), t.replace(/es$/, ""), t.replace(/s$/, ""),
    t.replace(/ied$/, "y"), t.replace(/ed$/, ""), t.replace(/d$/, ""), t.replace(/ing$/, ""), t.replace(/ing$/, "e")];
  for (const s of stems) {
    const w = BY_EN.get(s);
    if (w) return w;
  }
  return undefined;
}

/** English sentences in the lesson with a Thai line, examples first (they are the best context). */
function sentences(lesson: Lesson): { en: string; th?: string }[] {
  const out: { en: string; th?: string }[] = lesson.examples.map(([en, th]) => ({ en, th }));
  for (const p of lesson.practice) {
    if (p.t === "order") out.push({ en: p.a, th: p.th });
    if (p.t === "fix") out.push({ en: p.a[0], th: p.th });
  }
  for (const q of lesson.quiz) out.push({ en: q.q });
  return out;
}

/** Words in a lesson, in the order they first appear. */
function wordsIn(lesson: Lesson): LessonWord[] {
  const seen = new Map<string, LessonWord>();
  for (const s of sentences(lesson)) {
    for (const token of s.en.match(/[A-Za-z']+/g) ?? []) {
      const w = wordFor(token);
      if (w && !seen.has(w.id)) seen.set(w.id, { word: w, ex: s.th ? s.en : w.ex, exTh: s.th ? s.th : w.exTh, photo: PHOTOS[w.id] });
    }
  }
  return [...seen.values()];
}

function build(list: Lesson[]) {
  const known = new Set<string>();
  const result = new Map<string, LessonWords>();
  for (const lesson of list) {
    const all = wordsIn(lesson);
    const isNew = all.filter((x) => !known.has(x.word.id));
    // Easier words first, then the order they appear in the lesson.
    const ranked = [...isNew].sort((a, b) => (LEVEL_RANK[a.word.level ?? ""] ?? 1) - (LEVEL_RANK[b.word.level ?? ""] ?? 1));
    const fresh = ranked.slice(0, WORDS_PER_LESSON);
    result.set(lesson.id, {
      fresh,
      review: all.filter((x) => known.has(x.word.id)).slice(0, WORDS_PER_LESSON - fresh.length),
    });
    all.forEach((x) => known.add(x.word.id));
  }
  return result;
}

const GRAMMAR_WORDS = build(LESSONS);
const SOUND_WORDS = build(SOUNDS);

export function lessonWords(id: string): LessonWords {
  return GRAMMAR_WORDS.get(id) ?? SOUND_WORDS.get(id) ?? { fresh: [], review: [] };
}
