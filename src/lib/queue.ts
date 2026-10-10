import type { CardMap } from "./data";

const LEVEL_RANK: Record<string, number> = { A1: 0, A2: 1, B1: 2, B2: 3 };

/**
 * Up to `size` items for one practice round: cards due today first, then items never seen,
 * easier levels before harder ones.
 */
export function buildQueue<T extends { id: string; level?: string }>(pool: T[], cards: CardMap, today: string, round: number, size = 10): T[] {
  if (!pool.length) return [];
  const due = pool.filter((item) => cards[item.id] && cards[item.id].due_on <= today);
  // Shuffle new items within a level with a seed per round, so the order is stable while the round is open.
  const fresh = pool
    .filter((item) => !cards[item.id])
    .map((item, i) => ({ item, rank: LEVEL_RANK[item.level ?? ""] ?? 0, k: Math.sin((i + 1) * (round + 7) * 99.13) }))
    .sort((a, b) => a.rank - b.rank || a.k - b.k)
    .map((x) => x.item);
  const queue = [...due, ...fresh].slice(0, size);
  if (queue.length) return queue;
  // Nothing due and nothing new: practise the next batch anyway.
  const start = (round * size) % pool.length;
  return [...pool.slice(start), ...pool.slice(0, start)].slice(0, size);
}
