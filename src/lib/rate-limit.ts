type RateLimiterOptions = {
  limit: number;
  maxKeys?: number;
  windowMs: number;
  now?: () => number;
};

export type RateLimiter = (key: string) => boolean;

export function createRateLimiter({
  limit,
  maxKeys = 500,
  windowMs,
  now = () => Date.now(),
}: RateLimiterOptions): RateLimiter {
  const hits = new Map<string, number[]>();

  return function consume(key: string) {
    const current = now();
    const cutoff = current - windowMs;
    const recent = (hits.get(key) ?? []).filter((timestamp) => timestamp > cutoff);

    if (!hits.has(key) && hits.size >= maxKeys) {
      pruneStaleHits(hits, cutoff);

      while (hits.size >= maxKeys) {
        const oldestKey = hits.keys().next().value;

        if (oldestKey === undefined) {
          break;
        }

        hits.delete(oldestKey);
      }
    }

    if (recent.length >= limit) {
      hits.set(key, recent);
      return false;
    }

    recent.push(current);
    hits.set(key, recent);

    pruneStaleHits(hits, cutoff);

    return true;
  };
}

function pruneStaleHits(hits: Map<string, number[]>, cutoff: number) {
  for (const [staleKey, timestamps] of hits) {
    const recent = timestamps.filter((timestamp) => timestamp > cutoff);

    if (recent.length === 0) {
      hits.delete(staleKey);
    } else if (recent.length !== timestamps.length) {
      hits.set(staleKey, recent);
    }
  }
}
