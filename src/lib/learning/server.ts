import "server-only";
import { WORDS } from "@/content";
import { getUser } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { addDays, dayOf, lastDays, startOfDay } from "./day";
import { DAILY_NEW_LIMIT, type DeckCard } from "./queue";
import { metricsOf, questProgress, xpFor, type QuestProgress, type ReviewEvent } from "./quests";
import type { CardState } from "./srs";

type Supabase = Awaited<ReturnType<typeof createClient>>;
export type LearnCard = DeckCard & { intervalDays: number; reps: number; ease: number };

const WORD_IDS = new Set(WORDS.map((w) => w.id));

/** The learner's word cards (Learning Studio columns), keyed by word id. Cards for removed words are skipped. */
export async function getWordCards(supabase: Supabase): Promise<Record<string, LearnCard>> {
  const { data, error } = await supabase
    .from("cards")
    .select("item_id, state, due_on, lapses, bookmarked, interval_days, reps, ease")
    .eq("kind", "word");
  if (error) throw new Error(error.message);
  const out: Record<string, LearnCard> = {};
  for (const r of data ?? []) {
    if (!WORD_IDS.has(r.item_id)) continue;
    out[r.item_id] = { state: r.state as CardState, dueOn: r.due_on, lapses: r.lapses, bookmarked: r.bookmarked, intervalDays: r.interval_days, reps: r.reps, ease: r.ease };
  }
  return out;
}

/** Every review saved today (Bangkok day), for quests and XP. */
export async function getTodayEvents(supabase: Supabase, today: string): Promise<ReviewEvent[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("item_id, kind, was_new, grade")
    .gte("reviewed_at", startOfDay(today))
    .lt("reviewed_at", startOfDay(addDays(today, 1)))
    .limit(5000);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getClaims(supabase: Supabase, since: string) {
  const { data, error } = await supabase.from("quest_claims").select("day, quest_id, xp").gte("day", since);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export type DayActivity = { day: string; words: number; reviews: number; xp: number };
export type LearnOverview = {
  today: string;
  streak: number;
  learned: number;
  mastered: number;
  due: number;
  newLeft: number;
  bookmarks: number;
  xpToday: number;
  quests: QuestProgress[];
  week: DayActivity[];
  /** Words forgotten most often, to practise next. */
  weak: { id: string; lapses: number }[];
  hasHistory: boolean;
};

/** Everything the Learning Hub shows, from real saved activity. Null when nobody is signed in. */
export async function getLearnOverview(): Promise<LearnOverview | null> {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const today = dayOf();
  const week = lastDays(today, 7);

  const [cards, todayEvents, claims, weekReviews, days] = await Promise.all([
    getWordCards(supabase),
    getTodayEvents(supabase, today),
    getClaims(supabase, week[0]),
    supabase.from("reviews").select("item_id, kind, reviewed_at").gte("reviewed_at", startOfDay(week[0])).limit(10000),
    supabase.from("activity_days").select("day").gte("day", addDays(today, -400)),
  ]);
  if (weekReviews.error) throw new Error(weekReviews.error.message);

  const list = Object.entries(cards);
  const metrics = metricsOf(todayEvents);
  const claimedToday = claims.filter((c) => c.day === today);

  // The streak counts days with a saved review or lesson attempt; opening the site doesn't count.
  const active = new Set((days.data ?? []).map((d) => d.day as string));
  let streak = 0;
  for (let d = active.has(today) ? today : addDays(today, -1); active.has(d); d = addDays(d, -1)) streak++;

  const perDay = new Map(week.map((d) => [d, { words: new Set<string>(), reviews: 0 }]));
  for (const r of weekReviews.data ?? []) {
    const slot = perDay.get(dayOf(Date.parse(r.reviewed_at)));
    if (!slot) continue;
    slot.reviews++;
    slot.words.add(`${r.kind}:${r.item_id}`);
  }

  return {
    today,
    streak,
    learned: list.filter(([, c]) => c.state !== "new").length,
    mastered: list.filter(([, c]) => c.state === "mastered").length,
    due: list.filter(([, c]) => c.state !== "new" && c.dueOn <= today).length,
    newLeft: Math.max(0, DAILY_NEW_LIMIT - metrics.newWords),
    bookmarks: list.filter(([, c]) => c.bookmarked).length,
    xpToday: xpFor(todayEvents.length, claimedToday.reduce((s, c) => s + c.xp, 0)),
    quests: questProgress(metrics, new Set(claimedToday.map((c) => c.quest_id))),
    week: week.map((day) => {
      const slot = perDay.get(day)!;
      const xp = xpFor(slot.reviews, claims.filter((c) => c.day === day).reduce((s, c) => s + c.xp, 0));
      return { day, words: slot.words.size, reviews: slot.reviews, xp };
    }),
    weak: list.filter(([, c]) => c.lapses > 0).sort((a, b) => b[1].lapses - a[1].lapses).slice(0, 5).map(([id, c]) => ({ id, lapses: c.lapses })),
    hasHistory: list.some(([, c]) => c.reps > 0) || active.size > 0,
  };
}
