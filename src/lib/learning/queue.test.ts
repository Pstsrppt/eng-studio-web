import { describe, expect, it } from "vitest";
import { buildSession, type DeckCard } from "./queue";

const today = "2026-10-15";
const words = [
  { id: "c1", level: "A1" }, { id: "c2", level: "A2" }, { id: "c3", level: "A1" },
  { id: "l1", level: "B1" }, { id: "l2", level: "A1" }, { id: "i1", level: "A1" },
];
const card = (over: Partial<DeckCard>): DeckCard => ({ state: "review", dueOn: today, lapses: 0, bookmarked: false, ...over });

describe("buildSession", () => {
  it("puts due reviews first (most overdue), then due learning cards, then new words", () => {
    const cards = {
      c1: card({ state: "learning", dueOn: today }),
      c2: card({ dueOn: "2026-10-10" }),
      l1: card({ dueOn: "2026-10-14" }),
      i1: card({ dueOn: "2026-10-20" }), // not due
    };
    expect(buildSession(words, cards, { mode: "all", today, newLeft: 10 })).toEqual(["c2", "l1", "c1", "c3", "l2"]);
  });

  it("respects what is left of the daily new-word limit", () => {
    expect(buildSession(words, {}, { mode: "new", today, newLeft: 2 })).toHaveLength(2);
    expect(buildSession(words, {}, { mode: "new", today, newLeft: 0 })).toEqual([]);
  });

  it("teaches bookmarked and lesson words before untouched ones, easier levels first", () => {
    const cards = { l1: card({ state: "new", bookmarked: true }) };
    expect(buildSession(words, cards, { mode: "new", today, newLeft: 3 })).toEqual(["l1", "c1", "c3"]);
  });

  it("never pads a short session by repeating words", () => {
    const ids = buildSession(words, {}, { mode: "all", today, newLeft: 100, size: 50 });
    expect(ids).toHaveLength(words.length);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("review-due mode skips new words and cards not yet due", () => {
    const cards = { c1: card({ dueOn: "2026-11-01" }), c2: card({ dueOn: today }) };
    expect(buildSession(words, cards, { mode: "due", today, newLeft: 10 })).toEqual(["c2"]);
  });

  it("bookmark mode studies bookmarks only, due or not", () => {
    const cards = { c1: card({ bookmarked: true, dueOn: "2026-12-01" }), c2: card({ dueOn: today }) };
    expect(buildSession(words, cards, { mode: "bookmarks", today, newLeft: 10 })).toEqual(["c1"]);
  });

  it("category mode keeps to one deck, and words with the same spelling stay separate by id", () => {
    expect(buildSession(words, {}, { mode: "deck", deck: "l", today, newLeft: 10 })).toEqual(["l2", "l1"]);
  });

  it("handles an empty dataset", () => {
    expect(buildSession([], {}, { mode: "all", today, newLeft: 10 })).toEqual([]);
  });

  it("ignores cards for words no longer in the dataset", () => {
    const cards = { gone1: card({ dueOn: "2026-01-01" }) };
    expect(buildSession(words, cards, { mode: "due", today, newLeft: 10 })).toEqual([]);
  });
});
