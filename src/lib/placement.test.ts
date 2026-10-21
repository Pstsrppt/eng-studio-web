import { describe, expect, it } from "vitest";
import questions from "@/content/data/placement.json";
import { nextBlock, PLACEMENT_LEVELS, scorePlacement, startLesson, type PlacementAnswers, type PlacementQuestion } from "./placement";

const Q = questions as PlacementQuestion[];
/** Answers every question of the given levels, `right` of each block correctly. */
function answer(levels: string[], right: number): PlacementAnswers {
  const out: PlacementAnswers = {};
  for (const lv of levels) {
    Q.filter((q) => q.level === lv).forEach((q, i) => (out[q.id] = i < right ? q.a : (q.a + 1) % q.o.length));
  }
  return out;
}

describe("question bank", () => {
  it("has 6 questions per level, 4 options each, a valid answer and a lesson", () => {
    for (const lv of PLACEMENT_LEVELS) expect(Q.filter((q) => q.level === lv)).toHaveLength(6);
    for (const q of Q) {
      expect(q.o).toHaveLength(4);
      expect(new Set(q.o).size).toBe(4);
      expect(q.a).toBeGreaterThanOrEqual(0);
      expect(q.a).toBeLessThan(4);
      expect(q.lesson).toBeTruthy();
    }
    expect(new Set(Q.map((q) => q.id)).size).toBe(Q.length);
  });
});

describe("nextBlock", () => {
  it("starts at A1 and moves up block by block", () => {
    expect(nextBlock(Q, {})).toBe("A1");
    expect(nextBlock(Q, answer(["A1"], 6))).toBe("A2");
  });

  it("stops after a failed block, so a beginner doesn't see the harder levels", () => {
    expect(nextBlock(Q, answer(["A1"], 3))).toBeNull();
    expect(nextBlock(Q, answer(["A1", "A2"], 2))).toBeNull();
  });

  it("finishes after B2", () => {
    expect(nextBlock(Q, answer(["A1", "A2", "B1", "B2"], 6))).toBeNull();
  });
});

describe("scorePlacement", () => {
  it("places at the highest level passed with all easier ones passed", () => {
    expect(scorePlacement(Q, answer(["A1", "A2", "B1"], 4)).level).toBe("B1");
    expect(scorePlacement(Q, { ...answer(["A1", "A2"], 5), ...answer(["B1"], 3) }).level).toBe("A2");
  });

  it("is pre-A1 when even A1 isn't passed", () => {
    const r = scorePlacement(Q, answer(["A1"], 2));
    expect(r).toMatchObject({ level: "pre-A1", correct: 2, total: 6 });
  });

  it("counts 'not sure' as not correct", () => {
    const answers = Object.fromEntries(Q.filter((q) => q.level === "A1").map((q) => [q.id, null]));
    expect(scorePlacement(Q, answers)).toMatchObject({ level: "pre-A1", correct: 0 });
  });

  it("lists lessons behind wrong answers at or below the level, once each", () => {
    const answers = answer(["A1", "A2"], 6);
    const wrongA1 = Q.find((q) => q.level === "A1")!;
    answers[wrongA1.id] = (wrongA1.a + 1) % 4;
    const r = scorePlacement(Q, answers);
    expect(r.level).toBe("A2");
    expect(r.review).toEqual([wrongA1.lesson]);
  });

  it("all right is B2 with 24 of 24", () => {
    expect(scorePlacement(Q, answer(PLACEMENT_LEVELS, 6))).toMatchObject({ level: "B2", correct: 24, total: 24 });
  });
});

describe("startLesson", () => {
  const lessons = [{ id: "1-1", level: "A1" }, { id: "1-7", level: "A2" }, { id: "b1-1", level: "B1" }, { id: "b2-1", level: "B2" }];
  it("starts at the level above the one placed at", () => {
    expect(startLesson(lessons, "pre-A1")?.id).toBe("1-1");
    expect(startLesson(lessons, "A1")?.id).toBe("1-7");
    expect(startLesson(lessons, "B1")?.id).toBe("b2-1");
    expect(startLesson(lessons, "B2")?.id).toBe("b2-1");
  });
});
