"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/server/db";
import { getDummyHash, verifyPassword } from "./password";
import { checkLoginRateLimit, clearLoginAttempts, recordFailedLogin } from "./rate-limit";
import {
  createSession,
  deleteExpiredSessions,
  deleteSessionCookie,
  getSessionToken,
  invalidateSession,
  setSessionCookie,
} from "./session";

export interface LoginState {
  error?: string;
  email?: string;
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password.").max(200),
  next: z.string().optional(),
});

/** Only allow redirects to admin pages after login (no open redirects). */
const safeNext = (next?: string) => (next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input.", email: String(formData.get("email") ?? "") };
  }
  const { email, password, next } = parsed.data;

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "local";
  const limitKey = `${ip}:${email}`;
  const limit = checkLoginRateLimit(limitKey);
  if (!limit.ok) {
    return { error: `Too many attempts. Try again in ${limit.retryInMinutes} minute(s).`, email };
  }

  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  // Always run a hash comparison so response time doesn't reveal whether the email exists
  const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));

  if (!user || !valid || !user.isActive || (user.role !== "admin" && user.role !== "staff")) {
    recordFailedLogin(limitKey);
    return { error: "Incorrect email or password.", email };
  }

  clearLoginAttempts(limitKey);
  const { token, expiresAt } = await createSession(user.id, { userAgent: h.get("user-agent"), ip });
  await setSessionCookie(token, expiresAt);
  await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, user.id));
  void deleteExpiredSessions().catch(() => {});

  redirect(safeNext(next));
}

export async function logoutAction() {
  const token = await getSessionToken();
  if (token) await invalidateSession(token);
  await deleteSessionCookie();
  redirect("/admin/login");
}
