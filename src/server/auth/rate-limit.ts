import "server-only";

// Simple in-memory limiter for login attempts (per IP + email).
// Fine for one server process. With several servers, move this to the database or Redis.

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkLoginRateLimit(key: string): { ok: true } | { ok: false; retryInMinutes: number } {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) return { ok: true };
  if (entry.count >= MAX_ATTEMPTS) return { ok: false, retryInMinutes: Math.ceil((entry.resetAt - now) / 60000) };
  return { ok: true };
}

export function recordFailedLogin(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  else entry.count++;
  // keep the map small
  if (attempts.size > 5000) for (const [k, v] of attempts) if (v.resetAt <= now) attempts.delete(k);
}

export function clearLoginAttempts(key: string) {
  attempts.delete(key);
}
