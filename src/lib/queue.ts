import type { CardMap } from "./data";

/** Up to `size` items for one practice round: cards due today first, then items never seen. */
export function buildQueue<T extends { id: string }>(pool: T[], cards: CardMap, today: string, round: number, size = 10): T[] {
  if (!pool.length) return [];
  const due = pool.filter((item) => cards[item.id] && cards[item.id].due_on <= today);
  // Shuffle new items with a seed per round, so the order is stable while the round is open.
  const fresh = pool
    .filter((item) => !cards[item.id])
    .map((item, i) => ({ item, k: Math.sin((i + 1) * (round + 7) * 99.13) }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.item);
  const queue = [...due, ...fresh].slice(0, size);
  if (queue.length) return queue;
  // Nothing due and nothing new: practise the next batch anyway.
  const start = (round * size) % pool.length;
  return [...pool.slice(start), ...pool.slice(0, start)].slice(0, size);
}
