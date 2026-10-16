// The review scheduler behind Smart Flashcard. A small, documented algorithm of our own (it borrows
// the "ease factor" idea from SuperMemo but is not SM-2 or FSRS):
//
// - A card starts as "new". Grading moves it through "learning" (short steps) to "review".
// - Again: forgot. Due again today, back to learning; a forgotten review card counts as a lapse.
// - Hard:  remembered with effort. Learning: 1 day. Review: about 1.2 × the last interval.
// - Good:  remembered. Learning: 1 day, then 3 days (graduates to review). Review: last interval × ease.
// - Ease starts at 2.5, drops 0.2 on Again and 0.15 on Hard, never below 1.3. Good leaves it alone.
// - A review card whose interval reaches 21 days is "mastered". It takes at least five Goods in a row
//   (1 → 3 → 8 → 20 → 50 days), so one lucky answer never masters a word.
//
// Intervals are whole days on the Bangkok calendar (see day.ts). `box` (0–5) is kept in step for
// the older parts of the app that still read Leitner boxes.

export type Grade = "again" | "hard" | "good";
export type CardState = "new" | "learning" | "review" | "mastered";
export type Schedule = { state: CardState; intervalDays: number; ease: number; reps: number; lapses: number };

export const GRADES: Grade[] = ["again", "hard", "good"];
export const NEW_CARD: Schedule = { state: "new", intervalDays: 0, ease: 2.5, reps: 0, lapses: 0 };
export const MIN_EASE = 1.3;
export const MAX_INTERVAL = 365;
export const MASTERED_AFTER_DAYS = 21;
/** The old Leitner intervals; a card's box is the highest one its interval has reached. */
const BOX_DAYS = [0, 1, 3, 7, 14, 30];

export function boxFor(intervalDays: number) {
  let box = 0;
  BOX_DAYS.forEach((d, i) => {
    if (intervalDays >= d) box = i;
  });
  return box;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** The card's next schedule after one grade. Pure, so it is unit tested (srs.test.ts). */
export function schedule(prev: Schedule, grade: Grade): Schedule & { box: number } {
  let { ease, lapses } = prev;
  let interval: number;
  let state: CardState;
  const reviewing = prev.state === "review" || prev.state === "mastered";

  if (grade === "again") {
    if (reviewing) lapses++;
    ease = Math.max(MIN_EASE, ease - 0.2);
    interval = 0;
    state = "learning";
  } else if (!reviewing) {
    if (grade === "hard") ease = Math.max(MIN_EASE, ease - 0.15);
    // A card that already survived a day on its own graduates on Good.
    interval = grade === "good" && prev.intervalDays >= 1 ? 3 : 1;
    state = interval >= 3 ? "review" : "learning";
  } else {
    if (grade === "hard") ease = Math.max(MIN_EASE, ease - 0.15);
    const grown = grade === "hard" ? prev.intervalDays * 1.2 : prev.intervalDays * ease;
    interval = Math.max(prev.intervalDays + 1, Math.round(grown));
    state = "review";
  }

  interval = Math.min(interval, MAX_INTERVAL);
  if (state === "review" && interval >= MASTERED_AFTER_DAYS) state = "mastered";
  return { state, intervalDays: interval, ease: round2(ease), reps: prev.reps + 1, lapses, box: boxFor(interval) };
}

/** Rows from the cards table as a Schedule (missing columns mean a card from before Learning Studio). */
export function fromRow(row: { state?: string | null; interval_days?: number | null; ease?: number | null; reps?: number | null; lapses?: number | null } | null | undefined): Schedule {
  if (!row) return NEW_CARD;
  return {
    state: (row.state as CardState) ?? "new",
    intervalDays: row.interval_days ?? 0,
    ease: row.ease ?? 2.5,
    reps: row.reps ?? 0,
    lapses: row.lapses ?? 0,
  };
}
