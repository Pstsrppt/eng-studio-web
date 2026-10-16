import { describe, expect, it } from "vitest";
import { addDays, dayOf, lastDays, startOfDay } from "./day";
import { DAILY_REVIEW_XP_CAP, metricsOf, QUESTS, questProgress, toClaim, xpFor, type ReviewEvent } from "./quests";

const ev = (item_id: string, over: Partial<ReviewEvent> = {}): ReviewEvent => ({ item_id, kind: "word", was_new: false, grade: "good", ...over });

describe("metricsOf", () => {
  it("counts distinct words, so grading one word twice doesn't count twice", () => {
    const m = metricsOf([ev("c1"), ev("c1"), ev("c2"), ev("v1", { kind: "verb" }), ev("v1", { kind: "verb" })]);
    expect(m).toEqual({ newWords: 0, reviewedWords: 2, verbs: 1 });
  });

  it("a word learned today and graded again later is still one new word, not a review", () => {
    const m = metricsOf([ev("c9", { was_new: true, grade: "again" }), ev("c9", { grade: "good" })]);
    expect(m).toEqual({ newWords: 1, reviewedWords: 0, verbs: 0 });
  });
});

describe("questProgress and toClaim", () => {
  it("only finished, unclaimed quests are paid, so a refresh can't pay twice", () => {
    const progress = questProgress({ newWords: 5, reviewedWords: 3, verbs: 9 }, new Set(["verbs"]));
    expect(progress.find((q) => q.id === "learn-new")).toMatchObject({ done: true, claimed: false, progress: 5 });
    expect(progress.find((q) => q.id === "review")).toMatchObject({ done: false, progress: 3 });
    expect(progress.find((q) => q.id === "verbs")).toMatchObject({ done: true, claimed: true, progress: 5 });
    expect(toClaim(progress).map((q) => q.id)).toEqual(["learn-new"]);
  });

  it("every quest has a stable id, a target and a reward", () => {
    expect(new Set(QUESTS.map((q) => q.id)).size).toBe(QUESTS.length);
    for (const q of QUESTS) expect(q.target > 0 && q.xp > 0).toBe(true);
  });
});

describe("xpFor", () => {
  it("caps review XP per day and adds quest rewards", () => {
    expect(xpFor(10, 0)).toBe(10);
    expect(xpFor(500, 45)).toBe(DAILY_REVIEW_XP_CAP + 45);
  });
});

describe("day helpers (Asia/Bangkok)", () => {
  it("a moment late on the 14th in UTC is already the 15th in Bangkok", () => {
    expect(dayOf(Date.parse("2026-10-14T18:30:00Z"))).toBe("2026-10-15");
    expect(dayOf(Date.parse("2026-10-14T16:59:00Z"))).toBe("2026-10-14");
  });

  it("does calendar arithmetic across months and years", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(lastDays("2026-10-15", 3)).toEqual(["2026-10-13", "2026-10-14", "2026-10-15"]);
    expect(startOfDay("2026-10-15")).toBe("2026-10-15T00:00:00+07:00");
  });
});
