"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/server/db";
import { getDummyHash, hashPassword, verifyPassword } from "./password";
import { checkLoginRateLimit, clearLoginAttempts, recordFailedLogin } from "./rate-limit";
import { createSession, deleteSessionCookie, getSessionToken, invalidateSession, setSessionCookie } from "./session";

export interface CustomerAuthState {
  error?: string;
  email?: string;
  name?: string;
}

/** Only same-site paths (no open redirects); admin pages are not a customer destination. */
const safeNext = (next?: string | null) =>
  next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/admin") ? next : "/account";

async function clientMeta() {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "local";
  return { ip, userAgent: h.get("user-agent") };
}

async function signIn(userId: string) {
  const meta = await clientMeta();
  const { token, expiresAt } = await createSession(userId, meta);
  await setSessionCookie(token, expiresAt);
  await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, userId));
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password.").max(200),
});

export async function customerLoginAction(_prev: CustomerAuthState, formData: FormData): Promise<CustomerAuthState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  const typedEmail = String(formData.get("email") ?? "");
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input.", email: typedEmail };
  const { email, password } = parsed.data;

  const { ip } = await clientMeta();
  const key = `${ip}:${email}`;
  const limit = checkLoginRateLimit(key);
  if (!limit.ok) return { error: `Too many attempts. Try again in ${limit.retryInMinutes} minute(s).`, email };

  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));
  if (!user || !valid || !user.isActive) {
    recordFailedLogin(key);
    return { error: "Incorrect email or password.", email };
  }
  clearLoginAttempts(key);
  await signIn(user.id);
  redirect(safeNext(String(formData.get("next") ?? "")));
}

const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(200),
});

export async function registerAction(_prev: CustomerAuthState, formData: FormData): Promise<CustomerAuthState> {
  const typed = { email: String(formData.get("email") ?? ""), name: String(formData.get("name") ?? "") };
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input.", ...typed };
  const { name, email, password } = parsed.data;

  const [exists] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (exists) return { error: "An account with this email already exists. Please log in.", ...typed };

  const [user] = await db
    .insert(schema.users)
    .values({ name, email, passwordHash: await hashPassword(password), role: "customer" })
    .returning({ id: schema.users.id });
  await signIn(user.id);
  redirect(safeNext(String(formData.get("next") ?? "")));
}

export async function customerLogoutAction() {
  const token = await getSessionToken();
  if (token) await invalidateSession(token);
  await deleteSessionCookie();
  redirect("/");
}
