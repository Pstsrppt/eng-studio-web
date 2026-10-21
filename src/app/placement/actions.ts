"use server";

import questions from "@/content/data/placement.json";
import { getUser } from "@/lib/data";
import { nextBlock, scorePlacement, type PlacementAnswers, type PlacementLevel, type PlacementQuestion, type PlacementResult } from "@/lib/placement";
import { createClient } from "@/lib/supabase/server";

const QUESTIONS = questions as PlacementQuestion[];
const IDS = new Set(QUESTIONS.map((q) => q.id));

/** Keeps only known question ids and valid option indexes; anything else counts as "not sure". */
function clean(answers: PlacementAnswers): PlacementAnswers {
  const out: PlacementAnswers = {};
  for (const [id, v] of Object.entries(answers ?? {})) {
    if (IDS.has(id)) out[id] = Number.isInteger(v) && (v as number) >= 0 && (v as number) < 4 ? (v as number) : null;
  }
  return out;
}

/** Which level block comes next, or null when the test is over. Answers stay on the server. */
export async function placementNext(answers: PlacementAnswers): Promise<PlacementLevel | null> {
  return nextBlock(QUESTIONS, clean(answers));
}

export type PlacementReview = { id: string; q: string; chosen: string | null; correct: string; why: string; lesson: string };

/**
 * Scores on the server and, for a signed-in learner, saves the result. Returns the right answers
 * with explanations only now, after the test. `saved` is false for visitors or if saving failed.
 */
export async function submitPlacement(answers: PlacementAnswers): Promise<PlacementResult & { saved: boolean; wrong: PlacementReview[] }> {
  const given = clean(answers);
  const result = scorePlacement(QUESTIONS, given);
  const wrong = QUESTIONS.filter((q) => q.id in given && given[q.id] !== q.a).map((q) => ({
    id: q.id, q: q.q, chosen: given[q.id] === null ? null : q.o[given[q.id]!], correct: q.o[q.a], why: q.why, lesson: q.lesson,
  }));
  const user = await getUser();
  if (!user || result.total === 0) return { ...result, saved: false, wrong };
  const supabase = await createClient();
  const { error } = await supabase
    .from("placement_results")
    .insert({ level: result.level, correct: result.correct, total: result.total, by_level: result.byLevel });
  return { ...result, saved: !error, wrong };
}
