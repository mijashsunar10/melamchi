import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { eq, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { db, schema } from "@/server/db";
import type { User } from "@/server/db/schema";

// Database-backed sessions.
// - The cookie holds a random 32-byte token; the DB stores only its SHA-256 hash.
// - Sessions last 7 days and are extended automatically while the user stays active.

export const SESSION_COOKIE = "topx_session";
const DAY = 24 * 60 * 60 * 1000;
const SESSION_DAYS = 7;
const RENEW_WHEN_LESS_THAN_DAYS = 3.5;

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export type SessionUser = Pick<User, "id" | "email" | "name" | "role">;

export async function createSession(userId: string, meta: { userAgent?: string | null; ip?: string | null } = {}) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * DAY);
  await db.insert(schema.sessions).values({
    id: hashToken(token),
    userId,
    expiresAt,
    userAgent: meta.userAgent?.slice(0, 300) ?? null,
    ip: meta.ip ?? null,
  });
  return { token, expiresAt };
}

/** Returns the user for a session token, or null. Extends the session when it is getting old. */
export async function validateSessionToken(token: string): Promise<{ user: SessionUser; expiresAt: Date } | null> {
  const id = hashToken(token);
  const [row] = await db
    .select({
      expiresAt: schema.sessions.expiresAt,
      user: { id: schema.users.id, email: schema.users.email, name: schema.users.name, role: schema.users.role, isActive: schema.users.isActive },
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(eq(schema.sessions.id, id))
    .limit(1);

  if (!row) return null;
  const now = Date.now();
  if (row.expiresAt.getTime() <= now || !row.user.isActive) {
    await db.delete(schema.sessions).where(eq(schema.sessions.id, id));
    return null;
  }

  let expiresAt = row.expiresAt;
  if (expiresAt.getTime() - now < RENEW_WHEN_LESS_THAN_DAYS * DAY) {
    expiresAt = new Date(now + SESSION_DAYS * DAY);
    await db.update(schema.sessions).set({ expiresAt }).where(eq(schema.sessions.id, id));
  }

  const { isActive: _active, ...user } = row.user;
  void _active;
  return { user, expiresAt };
}

export async function invalidateSession(token: string) {
  await db.delete(schema.sessions).where(eq(schema.sessions.id, hashToken(token)));
}

export async function invalidateAllSessions(userId: string) {
  await db.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
}

/** Housekeeping: remove expired sessions (call occasionally, e.g. on login). */
export async function deleteExpiredSessions() {
  await db.delete(schema.sessions).where(lt(schema.sessions.expiresAt, new Date()));
}

// ---- cookie helpers (only usable in Server Actions / Route Handlers) ----

export async function setSessionCookie(token: string, expiresAt: Date) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function deleteSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}
