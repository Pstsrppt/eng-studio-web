import "server-only";
import { cache } from "react";
import { hasSupabase } from "./supabase/env";
import { createClient } from "./supabase/server";

export type User = { id: string; email: string };
export type CardState = { box: number; due_on: string; custom_en: string | null; custom_th: string | null };
export type CardMap = Record<string, CardState>;

/** The signed-in learner, or null. Reads the session cookie, so call it inside <Suspense>. */
export const getUser = cache(async (): Promise<User | null> => {
  if (!hasSupabase) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  return { id: claims.sub, email: String(claims.email ?? "") };
});

/** Today's date in Thailand as YYYY-MM-DD. */
export function bangkokToday(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
}

export async function getLessonBest(): Promise<Record<string, { best: number; passed: boolean }>> {
  const user = await getUser();
  if (!user) return {};
  const supabase = await createClient();
  const { data } = await supabase.from("lesson_best").select("lesson_id, best_score, passed");
  return Object.fromEntries((data ?? []).map((r) => [r.lesson_id, { best: r.best_score, passed: r.passed }]));
}

export async function getCards(kind: "word" | "verb"): Promise<CardMap> {
  const user = await getUser();
  if (!user) return {};
  const supabase = await createClient();
  const { data } = await supabase
    .from("cards")
    .select("item_id, box, due_on, custom_en, custom_th")
    .eq("kind", kind);
  return Object.fromEntries((data ?? []).map(({ item_id, ...rest }) => [item_id, rest]));
}

export async function getDashboard() {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const today = bangkokToday();
  const since = bangkokToday(-41);

  const startOfToday = `${today}T00:00:00+07:00`;
  const [best, cards, days, mistakes, reviewsToday, passedToday] = await Promise.all([
    getLessonBest(),
    supabase.from("cards").select("item_id, kind, box, due_on"),
    supabase.from("activity_days").select("day, actions").gte("day", since),
    supabase.from("mistakes").select("wrong, correct, note").order("created_at", { ascending: false }).limit(200),
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .gte("reviewed_at", startOfToday),
    supabase
      .from("lesson_attempts")
      .select("id", { count: "exact", head: true })
      .eq("passed", true)
      .gte("created_at", startOfToday),
  ]);

  const cardRows = cards.data ?? [];
  const due = { word: 0, verb: 0 };
  const known = { word: 0, verb: 0 };
  for (const c of cardRows) {
    const k = c.kind as "word" | "verb";
    if (c.due_on <= today) due[k]++;
    if (c.box >= 3) known[k]++;
  }

  const activity = Object.fromEntries((days.data ?? []).map((d) => [d.day, d.actions as number]));
  let streak = 0;
  for (let i = activity[today] ? 0 : 1; activity[bangkokToday(-i)]; i++) streak++;

  const tally = new Map<string, { wrong: string; correct: string; note: string | null; n: number }>();
  for (const m of mistakes.data ?? []) {
    const key = `${m.wrong}→${m.correct}`;
    const t = tally.get(key);
    if (t) t.n++;
    else tally.set(key, { ...m, n: 1 });
  }

  return {
    user,
    today,
    best,
    due,
    known,
    activity,
    streak,
    studyDays: Object.keys(activity).length,
    reviewsToday: reviewsToday.count ?? 0,
    passedToday: (passedToday.count ?? 0) > 0,
    topMistakes: [...tally.values()].sort((a, b) => b.n - a.n).slice(0, 3),
  };
}
