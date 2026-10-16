// Which words go into one Smart Flashcard session, and in what order.
import type { CardState } from "./srs";

export type LearnMode = "all" | "due" | "new" | "bookmarks" | "deck";
export const LEARN_MODES: LearnMode[] = ["all", "due", "new", "bookmarks", "deck"];

/** What the queue needs to know about a card the learner already has. */
export type DeckCard = { state: CardState; dueOn: string; lapses: number; bookmarked: boolean };
export type QueueWord = { id: string; level?: string };

export const SESSION_SIZE = 15;
/** New words per day, so a learner can't bury themselves in reviews for the coming week. */
export const DAILY_NEW_LIMIT = 10;

const LEVEL_RANK: Record<string, number> = { A1: 0, A2: 1, B1: 2, B2: 3 };

type Options = { mode: LearnMode; today: string; deck?: string; newLeft: number; size?: number };

/**
 * Builds a session: 1) review cards that are due (most overdue first, then the most forgotten),
 * 2) learning cards that are due, 3) new words up to what's left of today's new-word limit.
 * Never repeats a word to fill the session: with fewer words available the session is shorter.
 */
export function buildSession(words: QueueWord[], cards: Record<string, DeckCard>, opts: Options): string[] {
  const size = opts.size ?? SESSION_SIZE;
  const pool = opts.mode === "deck" && opts.deck ? words.filter((w) => w.id.replace(/\d+$/, "") === opts.deck) : words;
  const order = new Map(pool.map((w, i) => [w.id, i]));

  const due = (states: CardState[]) =>
    pool
      .filter((w) => {
        const c = cards[w.id];
        return c && states.includes(c.state) && c.dueOn <= opts.today;
      })
      .sort((a, b) => cards[a.id].dueOn.localeCompare(cards[b.id].dueOn) || cards[b.id].lapses - cards[a.id].lapses || order.get(a.id)! - order.get(b.id)!)
      .map((w) => w.id);

  // New: cards the learner bookmarked or got from a lesson come first, then the rest, easiest level first.
  const fresh = () =>
    pool
      .filter((w) => !cards[w.id] || cards[w.id].state === "new")
      .sort((a, b) => Number(!cards[a.id]) - Number(!cards[b.id])
        || (LEVEL_RANK[a.level ?? ""] ?? 1) - (LEVEL_RANK[b.level ?? ""] ?? 1)
        || order.get(a.id)! - order.get(b.id)!)
      .slice(0, Math.max(0, opts.newLeft))
      .map((w) => w.id);

  let ids: string[];
  switch (opts.mode) {
    case "due":
      ids = [...due(["review", "mastered"]), ...due(["learning"])];
      break;
    case "new":
      ids = fresh();
      break;
    case "bookmarks": {
      // Bookmarks are studied on request, due or not, the most urgent first.
      ids = pool
        .filter((w) => cards[w.id]?.bookmarked)
        .sort((a, b) => cards[a.id].dueOn.localeCompare(cards[b.id].dueOn) || order.get(a.id)! - order.get(b.id)!)
        .map((w) => w.id);
      break;
    }
    default:
      ids = [...due(["review", "mastered"]), ...due(["learning"]), ...fresh()];
  }
  return [...new Set(ids)].slice(0, size);
}
