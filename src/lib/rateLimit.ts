/**
 * Small in-memory rate limiter (sliding window per key, e.g. per IP address).
 * On serverless hosting each instance keeps its own memory, so this is a basic guard against
 * accidental floods, not a security boundary.
 */
const hits = new Map<string, number[]>();

export function rateLimit(
  key: string,
  limit = 30,
  windowMs = 60_000,
): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - recent[0])) / 1000) };
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear(); // keep memory bounded
  return { ok: true, retryAfter: 0 };
}
