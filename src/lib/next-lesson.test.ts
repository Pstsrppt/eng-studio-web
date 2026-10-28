import { describe, expect, it } from "vitest";
import { LESSONS, SOUNDS } from "@/content";
import { isPassed, nextLesson, placedLevel } from "./next-lesson";

// Positions come from the real Grammar list, never from assumed totals.
const first = (level: string) => LESSONS.findIndex((l) => l.level === level);
const ids = (from: number, to = LESSONS.length) => LESSONS.slice(from, to).map((l) => l.id);
const passedAll = (list: string[]) => Object.fromEntries(list.map((id) => [id, { best: 90, passed: true }]));
const lessonAt = (r: ReturnType<typeof nextLesson>) => (r.kind === "lesson" ? r.lesson.id : r.kind);

describe("nextLesson: the one Continue rule for Home, /today and /study", () => {
  it("has the Grammar list it expects: every CEFR level present, in order", () => {
    expect(LESSONS.length).toBeGreaterThan(0);
    for (const lv of ["A1", "A2", "B1", "B2"]) expect(first(lv), lv).toBeGreaterThanOrEqual(0);
    expect(first("A1")).toBeLessThan(first("A2"));
    expect(first("B1")).toBeLessThan(first("B2"));
  });

  it("1. guest with no history: the first Grammar lesson", () => {
    const r = nextLesson(LESSONS, {}, undefined);
    expect(r).toMatchObject({ kind: "lesson", index: 0, reason: "start", passed: 0, total: LESSONS.length });
    expect(lessonAt(r)).toBe(LESSONS[0].id);
  });

  it("2. new signed-in learner (attempts but nothing passed): still the first lesson", () => {
    const r = nextLesson(LESSONS, { [LESSONS[0].id]: { best: 40, passed: false } }, undefined);
    expect(r).toMatchObject({ kind: "lesson", index: 0, reason: "start", passed: 0 });
  });

  it("3. placement pre-A1: starts at the first A1 lesson", () => {
    const r = nextLesson(LESSONS, {}, "pre-A1");
    expect(r).toMatchObject({ kind: "lesson", index: first("A1"), reason: "from-placement" });
  });

  it("4. placement A1: the first A2 lesson, even with the first A1 lessons passed (the test account)", () => {
    const r = nextLesson(LESSONS, passedAll(ids(0, 3)), "A1");
    expect(r).toMatchObject({ kind: "lesson", index: first("A2"), reason: "from-placement", passed: 3 });
  });

  it("5. placement B1: the first B2 lesson", () => {
    const r = nextLesson(LESSONS, {}, "B1");
    expect(r).toMatchObject({ kind: "lesson", index: first("B2"), reason: "from-placement" });
  });

  it("6. skipped lessons: the first lesson not passed after the placement start", () => {
    const a2 = first("A2");
    const r = nextLesson(LESSONS, passedAll([LESSONS[a2].id, LESSONS[a2 + 2].id]), "A1");
    expect(r).toMatchObject({ kind: "lesson", index: a2 + 1, reason: "continue" });
  });

  it("7. incomplete earlier lessons: once everything from the start is passed, go back to the first gap", () => {
    const r = nextLesson(LESSONS, passedAll(ids(first("B2"))), "B2");
    expect(r).toMatchObject({ kind: "lesson", index: 0, reason: "earlier-gap" });
    const r2 = nextLesson(LESSONS, passedAll([...ids(0, 2), ...ids(first("B2"))]), "B1");
    expect(r2).toMatchObject({ kind: "lesson", index: 2, reason: "earlier-gap" });
  });

  it("8. all Grammar passed: a grammar-complete state, never the last lesson again", () => {
    const r = nextLesson(LESSONS, passedAll(ids(0)), "A2");
    expect(r).toEqual({ kind: "grammar-complete", passed: LESSONS.length, total: LESSONS.length });
  });

  it("continues in order without placement", () => {
    expect(nextLesson(LESSONS, passedAll(ids(0, 4)), undefined)).toMatchObject({ index: 4, reason: "continue" });
  });

  it("keeps Sounds out of the sequence", () => {
    const withSounds = { ...passedAll(SOUNDS.map((s) => s.id)) };
    const r = nextLesson(LESSONS, withSounds, undefined);
    expect(r).toMatchObject({ index: 0, passed: 0 });
    expect(SOUNDS.some((s) => s.id === lessonAt(r))).toBe(false);
    expect(lessonAt(nextLesson(LESSONS, { ...withSounds, ...passedAll(ids(0)) }, undefined))).toBe("grammar-complete");
  });

  it("treats missing or malformed progress as not passed, and never throws", () => {
    for (const best of [null, undefined, "x", 42, [], { [LESSONS[0].id]: null }, { [LESSONS[0].id]: { passed: "true" } }, { [LESSONS[0].id]: { passed: 1 } }, { [LESSONS[0].id]: { best: 100 } }]) {
      expect(nextLesson(LESSONS, best, undefined), JSON.stringify(best)).toMatchObject({ kind: "lesson", index: 0 });
    }
    expect(isPassed({ a: { passed: true } }, "a")).toBe(true);
    expect(isPassed({ a: { passed: true } }, "b")).toBe(false);
  });

  it("ignores an unknown or malformed placement level", () => {
    for (const p of ["C1", "a1", 42, null, {}, ""]) {
      expect(placedLevel(p), String(p)).toBeUndefined();
      expect(nextLesson(LESSONS, {}, p)).toMatchObject({ index: 0, reason: "start" });
    }
    expect(placedLevel("B2")).toBe("B2");
  });

  it("does not change the progress, placement or lesson list it reads", () => {
    const best = Object.freeze(passedAll(ids(0, 5)));
    const list = Object.freeze([...LESSONS]);
    const before = JSON.stringify(best);
    expect(() => nextLesson(list, best, "A1")).not.toThrow();
    expect(JSON.stringify(best)).toBe(before);
  });

  it("handles an empty lesson list", () => {
    expect(nextLesson([], {}, undefined)).toEqual({ kind: "grammar-complete", passed: 0, total: 0 });
  });
});
