// The one place that decides which Grammar lesson a learner should continue with. Home, /today and /study all
// call it, so they always agree. Pure: it reads progress and the latest placement level and never changes them.
//
// Rules, in order:
//   1. Start from the level after the placement result (no placement: the first lesson).
//   2. Recommend the first lesson from there that is not passed.
//   3. If everything from there is passed, go back to the first earlier lesson that is not passed.
//   4. If every Grammar lesson is passed, say so (grammar-complete) instead of repeating the last one.
// Pronunciation (Sounds) lessons are not part of this sequence. Finishing Grammar is not finishing IELTS.
import { PLACEMENT_LEVELS, startLesson, type PlacedAt } from "./placement";

type LessonLike = { id: string; level: string };

export type NextLesson<L extends LessonLike> =
  | {
      kind: "lesson";
      lesson: L;
      /** Position in the Grammar list, from 0. Show it as `index + 1`. */
      index: number;
      /** start: no placement and nothing passed yet. continue: the next lesson in order. from-placement: the first
          lesson at the level the placement test pointed to. earlier-gap: an easier lesson still to pass. */
      reason: "start" | "continue" | "from-placement" | "earlier-gap";
      passed: number;
      total: number;
    }
  | { kind: "grammar-complete"; passed: number; total: number };

/** A lesson counts as passed only when its saved record says passed: true. Anything else (missing, malformed) is not. */
export function isPassed(best: unknown, id: string): boolean {
  if (!best || typeof best !== "object") return false;
  const row = (best as Record<string, unknown>)[id];
  return !!row && typeof row === "object" && (row as { passed?: unknown }).passed === true;
}

/** The latest placement level, or undefined when there is none or the stored value is not a known level. */
export function placedLevel(level: unknown): PlacedAt | undefined {
  return level === "pre-A1" || (PLACEMENT_LEVELS as readonly unknown[]).includes(level) ? (level as PlacedAt) : undefined;
}

export function nextLesson<L extends LessonLike>(lessons: readonly L[], best: unknown, placement?: unknown): NextLesson<L> {
  const total = lessons.length;
  const done = lessons.map((l) => isPassed(best, l.id));
  const passed = done.filter(Boolean).length;
  if (total === 0 || passed === total) return { kind: "grammar-complete", passed, total };

  const placed = placedLevel(placement);
  const anchor = placed ? startLesson([...lessons], placed) : undefined;
  const from = anchor ? lessons.indexOf(anchor) : 0;

  const ahead = done.findIndex((d, i) => i >= from && !d);
  if (ahead >= 0) {
    const reason = placed && ahead === from ? "from-placement" : passed === 0 && !placed ? "start" : "continue";
    return { kind: "lesson", lesson: lessons[ahead], index: ahead, reason, passed, total };
  }
  const gap = done.findIndex((d) => !d);
  return { kind: "lesson", lesson: lessons[gap], index: gap, reason: "earlier-gap", passed, total };
}
