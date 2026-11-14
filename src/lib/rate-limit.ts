import "server-only";

/**
 * In-memory sliding-window rate limiter + short-lived dedupe cache.
 *
 * IMPORTANT: memory is per server instance. On serverless/multi-instance hosting, put a
 * shared limit in front of it as well (Cloudflare WAF rate-limiting rule on /api/contact,
 * or swap this implementation for Upstash Redis / Cloudflare KV). It remains a useful
 * second layer either way.
 */

const MAX_KEYS = 10_000;

type Store = Map<string, number[]>;
const buckets: Store = new Map();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - hits[0]!)) / 1000) };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > MAX_KEYS) prune(buckets, windowMs);
  return { ok: true, retryAfter: 0 };
}

function prune(store: Store, windowMs: number) {
  const now = Date.now();
  for (const [k, v] of store) {
    if (!v.some((t) => now - t < windowMs)) store.delete(k);
  }
  // Still too big (e.g. under attack): drop oldest entries.
  while (store.size > MAX_KEYS) {
    const first = store.keys().next().value;
    if (first === undefined) break;
    store.delete(first);
  }
}

const seen = new Map<string, number>();

/** Returns true if `key` was already recorded within `ttlMs` (duplicate submission). */
export function isDuplicate(key: string, ttlMs: number): boolean {
  const now = Date.now();
  const at = seen.get(key);
  if (at && now - at < ttlMs) return true;
  return false;
}

export function markSeen(key: string) {
  seen.set(key, Date.now());
  if (seen.size > MAX_KEYS) {
    const first = seen.keys().next().value;
    if (first !== undefined) seen.delete(first);
  }
}
