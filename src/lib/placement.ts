// Placement test: which CEFR level a learner is at, and where in the course they should start.
// Pure, so the same scoring runs on the server (for what is saved) and in tests (placement.test.ts).

export type PlacementLevel = "A1" | "A2" | "B1" | "B2";
export type PlacedAt = "pre-A1" | PlacementLevel;
export type PlacementQuestion = { id: string; level: PlacementLevel; lesson: string; q: string; o: string[]; a: number; why: string };
/** The option index chosen for each question id; null means "not sure". */
export type PlacementAnswers = Record<string, number | null>;

export const PLACEMENT_LEVELS: PlacementLevel[] = ["A1", "A2", "B1", "B2"];
/** Right answers needed out of a level's 6 to pass that level (about 2 out of 3). */
export const PASS_PER_LEVEL = 4;

/**
 * Questions come in level blocks, easiest first. After a block the learner failed, the harder ones
 * are skipped: they would only be guesses, and a beginner shouldn't sit through B2 grammar.
 */
export function nextBlock(questions: PlacementQuestion[], answers: PlacementAnswers): PlacementLevel | null {
  for (const level of PLACEMENT_LEVELS) {
    const block = questions.filter((q) => q.level === level);
    if (block.some((q) => !(q.id in answers))) return level;
    if (correctIn(block, answers) < PASS_PER_LEVEL) return null;
  }
  return null;
}

function correctIn(block: PlacementQuestion[], answers: PlacementAnswers) {
  return block.filter((q) => answers[q.id] === q.a).length;
}

export type PlacementResult = {
  level: PlacedAt;
  correct: number;
  total: number;
  byLevel: Partial<Record<PlacementLevel, { correct: number; total: number }>>;
  /** Lessons behind the questions answered wrong at or below the learner's level, to review first. */
  review: string[];
};

/** The learner's level is the highest one passed with every easier level passed too. */
export function scorePlacement(questions: PlacementQuestion[], answers: PlacementAnswers): PlacementResult {
  const byLevel: PlacementResult["byLevel"] = {};
  let level: PlacedAt = "pre-A1";
  let stillPassing = true;
  for (const lv of PLACEMENT_LEVELS) {
    const block = questions.filter((q) => q.level === lv);
    const asked = block.filter((q) => q.id in answers);
    if (asked.length === 0) break;
    const correct = correctIn(asked, answers);
    byLevel[lv] = { correct, total: asked.length };
    if (stillPassing && asked.length === block.length && correct >= PASS_PER_LEVEL) level = lv;
    else stillPassing = false;
  }
  const order = ["pre-A1", ...PLACEMENT_LEVELS];
  const reached = order.indexOf(level);
  const review = [...new Set(questions
    .filter((q) => q.id in answers && answers[q.id] !== q.a && order.indexOf(q.level) <= Math.max(reached, 1))
    .map((q) => q.lesson))];
  const asked = questions.filter((q) => q.id in answers);
  return { level, correct: asked.filter((q) => answers[q.id] === q.a).length, total: asked.length, byLevel, review };
}

/** The lesson to start from: the first lesson of the level above the one placed at (B2 stays at B2). */
export function startLesson<T extends { id: string; level: string }>(lessons: T[], level: PlacedAt): T | undefined {
  const next: Record<PlacedAt, PlacementLevel> = { "pre-A1": "A1", A1: "A2", A2: "B1", B1: "B2", B2: "B2" };
  return lessons.find((l) => l.level === next[level]);
}
