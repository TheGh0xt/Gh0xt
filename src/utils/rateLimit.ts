type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Test-only hook. Not used at runtime. */
export function __resetRateLimit(): void {
  buckets.clear();
}

/**
 * Fixed-window rate limiter backed by an in-memory Map.
 *
 * State lives in a single serverless instance, so a caller spreading
 * requests across cold starts will get more through than the limit
 * suggests. This is a deterrent against casual abuse, NOT a security
 * boundary. If abuse becomes real, swap the Map for Redis behind this
 * same signature.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}
