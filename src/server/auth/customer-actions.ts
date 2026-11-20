"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/server/db";
import { getDummyHash, hashPassword, verifyPassword } from "./password";
import { checkLoginRateLimit, clearLoginAttempts, recordFailedLogin } from "./rate-limit";
import { createSession, deleteSessionCookie, getSessionToken, invalidateAllSessions, invalidateSession, setSessionCookie } from "./session";
import { checkResetToken, makeResetToken, readResetToken } from "./reset-token";
import { sendEmail, site } from "@/server/email/send";

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

// ---------------------------------------------------------------- forgot password

export interface ResetState {
  error?: string;
  sent?: boolean;
}

export async function forgotPasswordAction(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const email = z.string().trim().toLowerCase().email().safeParse(formData.get("email"));
  if (!email.success) return { error: "Enter a valid email address." };
  const { ip } = await clientMeta();
  const key = `reset:${ip}`;
  const limit = checkLoginRateLimit(key);
  if (!limit.ok) return { error: `Too many requests. Try again in ${limit.retryInMinutes} minute(s).` };
  recordFailedLogin(key);
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email.data)).limit(1);
  // same answer whether or not the account exists (no email guessing); staff reset via the admin
  if (user && user.isActive && user.role === "customer") {
    const url = `${site()}/reset-password?token=${makeResetToken(user.id, user.passwordHash)}`;
    await sendEmail(user.email, "Reset your TopX password", [`Hi ${user.name},`, "Click the button below to set a new password. The link works for 1 hour.", "If you didn't ask for this, ignore this email."], { label: "Reset password", url });
  }
  return { sent: true };
}

export async function resetPasswordAction(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const pw = String(formData.get("password") ?? "");
  if (pw.length < 8 || pw.length > 200) return { error: "Password must be at least 8 characters." };
  if (pw !== String(formData.get("confirm") ?? "")) return { error: "The two passwords don't match." };
  const t = readResetToken(String(formData.get("token") ?? ""));
  const [user] = t ? await db.select().from(schema.users).where(eq(schema.users.id, t.userId)).limit(1) : [];
  if (!t || !user || !user.isActive || !checkResetToken(t, user.passwordHash))
    return { error: "This reset link is invalid or expired. Please ask for a new one." };
  await db.update(schema.users).set({ passwordHash: await hashPassword(pw), updatedAt: new Date() }).where(eq(schema.users.id, user.id));
  await invalidateAllSessions(user.id);
  await signIn(user.id);
  redirect("/account");
}
