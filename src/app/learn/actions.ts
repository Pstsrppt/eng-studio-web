"use server";

import { WORDS, withImages, type Word } from "@/content";
import { getUser } from "@/lib/data";
import { addDays, dayOf } from "@/lib/learning/day";
import { DAILY_NEW_LIMIT, LEARN_MODES, buildSession, type LearnMode } from "@/lib/learning/queue";
import { metricsOf, questProgress, toClaim, xpFor } from "@/lib/learning/quests";
import { fromRow, GRADES, NEW_CARD, schedule, type CardState, type Grade, type Schedule } from "@/lib/learning/srs";
import { getClaims, getTodayEvents, getWordCards } from "@/lib/learning/server";
import { createClient } from "@/lib/supabase/server";

const WORD_IDS = new Set(WORDS.map((w) => w.id));
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type GradeResult =
  | { ok: true; state: CardState; dueOn: string; intervalDays: number; completed: { id: string; title: string; xp: number }[]; xpToday: number }
  | { ok: false; reason: "signed-out" | "invalid" | "busy" };

export type SessionWords = { words: Word[]; schedules: Record<string, Schedule> };
export type StartedSession = SessionWords & { day: string; ids: string[]; newIds: string[]; xpToday: number; guest: boolean };

const WORDS_WITH_IMAGES = new Map(withImages(WORDS).map((w) => [w.id, w]));

/** The card data (with picture or diagram) and current schedule for each id, skipping removed words. */
function sessionWords(ids: string[], cards: Record<string, { state: CardState; intervalDays: number; ease: number; reps: number; lapses: number }>): SessionWords {
  const words = ids.flatMap((id) => (WORDS_WITH_IMAGES.has(id) ? [WORDS_WITH_IMAGES.get(id)!] : []));
  const schedules = Object.fromEntries(words.map((w) => {
    const c = cards[w.id];
    return [w.id, c ? { state: c.state, intervalDays: c.intervalDays, ease: c.ease, reps: c.reps, lapses: c.lapses } : NEW_CARD];
  }));
  return { words, schedules };
}

/**
 * Picks the words for a new Smart Flashcard session. Signed-out visitors get a practice round of
 * new words that is not saved.
 */
export async function startSession(mode: LearnMode, deck?: string): Promise<StartedSession> {
  if (!LEARN_MODES.includes(mode)) mode = "all";
  const today = dayOf();
  const user = await getUser();
  if (!user) {
    const ids = buildSession(WORDS, {}, { mode: mode === "deck" ? "deck" : "new", deck, today, newLeft: DAILY_NEW_LIMIT });
    return { day: today, ids, newIds: ids, xpToday: 0, guest: true, ...sessionWords(ids, {}) };
  }
  const supabase = await createClient();
  const [cards, events, claims] = await Promise.all([getWordCards(supabase), getTodayEvents(supabase, today), getClaims(supabase, today)]);
  const newLeft = Math.max(0, DAILY_NEW_LIMIT - metricsOf(events).newWords);
  const ids = buildSession(WORDS, cards, { mode, deck, today, newLeft });
  const xpToday = xpFor(events.length, claims.filter((c) => c.day === today).reduce((s, c) => s + c.xp, 0));
  return { day: today, ids, newIds: ids.filter((id) => !cards[id] || cards[id].state === "new"), xpToday, guest: false, ...sessionWords(ids, cards) };
}

/** Card data for a session being resumed after a reload. */
export async function resumeSession(ids: string[]): Promise<SessionWords> {
  const safe = ids.filter((id) => WORD_IDS.has(id)).slice(0, 60);
  const user = await getUser();
  if (!user) return sessionWords(safe, {});
  return sessionWords(safe, await getWordCards(await createClient()));
}

/**
 * Saves one Again / Hard / Good. The same eventId sent twice is saved once (double click, retry
 * after a reload). If another tab graded the word in between, the schedule is recomputed from that.
 */
export async function gradeCard(input: { itemId: string; grade: Grade; eventId: string; ms?: number }): Promise<GradeResult> {
  const user = await getUser();
  if (!user) return { ok: false, reason: "signed-out" };
  if (!WORD_IDS.has(input.itemId) || !GRADES.includes(input.grade) || !UUID.test(input.eventId)) return { ok: false, reason: "invalid" };
  const supabase = await createClient();
  const today = dayOf();
  const ms = Number.isFinite(input.ms) ? Math.max(0, Math.min(Math.round(input.ms!), 600_000)) : null;

  let saved: { state: CardState; due_on: string; interval_days: number } | null = null;
  for (let attempt = 0; attempt < 3 && !saved; attempt++) {
    const { data: row, error: readError } = await supabase
      .from("cards")
      .select("state, interval_days, ease, reps, lapses, updated_at")
      .eq("item_id", input.itemId)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    const next = schedule(fromRow(row), input.grade);
    const { data, error } = await supabase.rpc("apply_grade", {
      p_event_id: input.eventId,
      p_item_id: input.itemId,
      p_grade: input.grade,
      p_expected: row?.updated_at ?? null,
      p_state: next.state,
      p_interval: next.intervalDays,
      p_ease: next.ease,
      p_reps: next.reps,
      p_lapses: next.lapses,
      p_box: next.box,
      p_due: addDays(today, next.intervalDays),
      p_ms: ms,
    });
    if (!error) saved = data;
    else if (error.code === "PT409" || error.code === "40001") continue; // changed in another tab: read again and recompute
    else if (error.code === "23505") {
      // The same event raced itself and the other copy won: it is saved, nothing more to do.
      const { data: again } = await supabase.from("cards").select("state, due_on, interval_days").eq("item_id", input.itemId).single();
      saved = again;
    } else throw new Error(error.message);
  }
  if (!saved) return { ok: false, reason: "busy" };

  // Quests: count today's real reviews, pay any quest that just finished. The table's primary key
  // (learner, day, quest) means a second request can't pay the same quest again.
  const [events, claims] = await Promise.all([getTodayEvents(supabase, today), getClaims(supabase, today)]);
  const claimedToday = claims.filter((c) => c.day === today);
  const due = toClaim(questProgress(metricsOf(events), new Set(claimedToday.map((c) => c.quest_id))));
  const completed: { id: string; title: string; xp: number }[] = [];
  for (const q of due) {
    const { data } = await supabase
      .from("quest_claims")
      .upsert({ day: today, quest_id: q.id, xp: q.xp }, { onConflict: "user_id,day,quest_id", ignoreDuplicates: true })
      .select("quest_id");
    if (data?.length) completed.push({ id: q.id, title: q.title, xp: q.xp });
  }
  const claimedXp = claimedToday.reduce((s, c) => s + c.xp, 0) + completed.reduce((s, q) => s + q.xp, 0);

  return { ok: true, state: saved.state, dueOn: saved.due_on, intervalDays: saved.interval_days, completed, xpToday: xpFor(events.length, claimedXp) };
}
