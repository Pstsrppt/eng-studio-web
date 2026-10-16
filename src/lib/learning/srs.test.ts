import { describe, expect, it } from "vitest";
import { boxFor, fromRow, MIN_EASE, NEW_CARD, schedule, type Grade, type Schedule } from "./srs";

const run = (grades: Grade[], from: Schedule = NEW_CARD) => grades.reduce<Schedule>((card, g) => schedule(card, g), from);

describe("schedule", () => {
  it("a new word graded Good is due tomorrow and still learning", () => {
    const next = schedule(NEW_CARD, "good");
    expect(next).toMatchObject({ state: "learning", intervalDays: 1, reps: 1, lapses: 0, box: 1 });
  });

  it("graduates to review after a second Good", () => {
    expect(run(["good", "good"])).toMatchObject({ state: "review", intervalDays: 3 });
  });

  it("never masters a word from a single Good, or from four", () => {
    expect(schedule(NEW_CARD, "good").state).not.toBe("mastered");
    expect(run(["good", "good", "good", "good"]).state).toBe("review");
  });

  it("masters a word after five Goods in a row (1, 3, 8, 20, 50 days)", () => {
    const steps: number[] = [];
    let card: Schedule = NEW_CARD;
    for (let i = 0; i < 5; i++) {
      card = schedule(card, "good");
      steps.push(card.intervalDays);
    }
    expect(steps).toEqual([1, 3, 8, 20, 50]);
    expect(card.state).toBe("mastered");
  });

  it("Again makes the word due today and counts a lapse only for a word that was learned", () => {
    const fromNew = schedule(NEW_CARD, "again");
    expect(fromNew).toMatchObject({ state: "learning", intervalDays: 0, lapses: 0 });
    const learned = run(["good", "good", "good"]);
    const forgot = schedule(learned, "again");
    expect(forgot).toMatchObject({ state: "learning", intervalDays: 0, lapses: 1, box: 0 });
  });

  it("Hard comes back sooner than Good and lowers ease", () => {
    const review = run(["good", "good", "good"]); // 8 days
    const hard = schedule(review, "hard");
    const good = schedule(review, "good");
    expect(hard.intervalDays).toBeLessThan(good.intervalDays);
    expect(hard.intervalDays).toBeGreaterThan(review.intervalDays);
    expect(hard.ease).toBeLessThan(review.ease);
    expect(good.ease).toBe(review.ease);
  });

  it("ease never drops below the minimum", () => {
    const card = run(Array<Grade>(30).fill("again"));
    expect(card.ease).toBeCloseTo(MIN_EASE);
  });

  it("caps the interval at a year", () => {
    expect(run(Array<Grade>(20).fill("good")).intervalDays).toBe(365);
  });

  it("a mastered word that is forgotten goes back to learning", () => {
    const mastered = run(["good", "good", "good", "good", "good"]);
    expect(schedule(mastered, "again").state).toBe("learning");
  });
});

describe("boxFor", () => {
  it("matches the old Leitner days 0, 1, 3, 7, 14, 30", () => {
    expect([0, 1, 2, 3, 6, 7, 13, 14, 29, 30, 200].map(boxFor)).toEqual([0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
  });
});

describe("fromRow", () => {
  it("treats a missing card as new and fills columns from before the migration", () => {
    expect(fromRow(null)).toEqual(NEW_CARD);
    expect(fromRow({ state: "review", interval_days: 7 })).toEqual({ state: "review", intervalDays: 7, ease: 2.5, reps: 0, lapses: 0 });
  });
});
