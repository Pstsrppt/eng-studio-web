// Daily quests and XP. Progress is counted from saved reviews (real activity only); a quest pays its
// XP once per day because the quest_claims table has one row per (learner, day, quest).

export type QuestMetric = "newWords" | "reviewedWords" | "verbs";
export type Quest = {
  id: string;
  metric: QuestMetric;
  target: number;
  xp: number;
  title: string;
  description: string;
  icon: "sparkles" | "repeat" | "zap";
  href: string;
};

/** Edit targets and rewards here. Ids are stored in quest_claims, so keep them stable. */
export const QUESTS: Quest[] = [
  { id: "learn-new", metric: "newWords", target: 5, xp: 20, icon: "sparkles", title: "เรียนคำใหม่ 5 คำ",
    description: "เปิดการ์ดคำที่ยังไม่เคยเรียน แล้วให้คะแนนความจำ", href: "/learn/session?mode=new" },
  { id: "review", metric: "reviewedWords", target: 10, xp: 25, icon: "repeat", title: "ทวนคำศัพท์ 10 คำ",
    description: "ทวนคำที่เคยเรียนแล้ว ให้จำได้นานขึ้น", href: "/learn/session?mode=due" },
  // Stands in for "answer 5 quiz questions" until Quick Quiz ships (milestone 6).
  { id: "verbs", metric: "verbs", target: 5, xp: 15, icon: "zap", title: "ฝึก V1-V2-V3 5 คำ",
    description: "พิมพ์ V2 และ V3 ในหน้า V1-V2-V3", href: "/verbs" },
];

/** Each saved review gives 1 XP, up to this many a day, so grading fast can't farm XP. */
export const XP_PER_REVIEW = 1;
export const DAILY_REVIEW_XP_CAP = 50;

/** One saved review, as read back from the reviews table. */
export type ReviewEvent = { item_id: string; kind: string; was_new: boolean; grade: string | null };

/** Distinct words and verbs practised in a set of reviews (a word graded twice counts once). */
export function metricsOf(events: ReviewEvent[]): Record<QuestMetric, number> {
  const newWords = new Set<string>();
  const reviewed = new Set<string>();
  const verbs = new Set<string>();
  for (const e of events) {
    if (e.kind === "verb") verbs.add(e.item_id);
    else if (e.was_new) newWords.add(e.item_id);
    else reviewed.add(e.item_id);
  }
  // A word first learned today and graded again later is still a new word, not a review.
  for (const id of newWords) reviewed.delete(id);
  return { newWords: newWords.size, reviewedWords: reviewed.size, verbs: verbs.size };
}

export type QuestProgress = Quest & { progress: number; done: boolean; claimed: boolean };

export function questProgress(metrics: Record<QuestMetric, number>, claimed: Set<string>): QuestProgress[] {
  return QUESTS.map((q) => {
    const progress = Math.min(metrics[q.metric], q.target);
    return { ...q, progress, done: progress >= q.target, claimed: claimed.has(q.id) };
  });
}

/** Quests finished but not yet paid: the ones to insert into quest_claims now. */
export function toClaim(progress: QuestProgress[]) {
  return progress.filter((q) => q.done && !q.claimed);
}

export function xpFor(reviewCount: number, claimedXp: number) {
  return Math.min(reviewCount * XP_PER_REVIEW, DAILY_REVIEW_XP_CAP) + claimedXp;
}
