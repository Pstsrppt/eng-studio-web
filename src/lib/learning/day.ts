// Calendar days for streaks, quests and due dates. The whole app counts days in Thailand time
// (Asia/Bangkok, no daylight saving), on the server's clock, so changing the time zone or clock
// on the learner's device can't move a deadline or reset a quest.

export const TIME_ZONE = "Asia/Bangkok";
const DAY_MS = 86_400_000;

/** The Bangkok calendar day of an instant, as YYYY-MM-DD. */
export function dayOf(at: Date | number = Date.now()) {
  return new Date(at).toLocaleDateString("en-CA", { timeZone: TIME_ZONE });
}

/** YYYY-MM-DD plus n days (calendar arithmetic, no time zone involved). */
export function addDays(day: string, n: number) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) + n * DAY_MS).toISOString().slice(0, 10);
}

/** Midnight at the start of a Bangkok day, as an ISO instant (Bangkok is UTC+7 all year). */
export function startOfDay(day: string) {
  return `${day}T00:00:00+07:00`;
}

/** The last n days ending today, oldest first. */
export function lastDays(today: string, n: number) {
  return Array.from({ length: n }, (_, i) => addDays(today, i - n + 1));
}
