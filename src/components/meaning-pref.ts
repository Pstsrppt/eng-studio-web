// When a word's Thai meaning is on screen. Kept apart from the components so it can be tested without a browser.

/**
 * A meaning the learner still has to work out stays covered. Otherwise a reveal the learner asked for
 * (an answer, "เปิดเฉลย", "ดูความหมาย") shows it, and only then does the header's Thai toggle decide.
 */
export function meaningShown({ covered = false, revealed = false, showThai }: { covered?: boolean; revealed?: boolean; showThai: boolean }): boolean {
  if (covered) return false;
  return revealed || showThai;
}
