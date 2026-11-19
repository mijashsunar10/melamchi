import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { hashPassword } from "@/server/auth/password";
import { createSession, setSessionCookie } from "@/server/auth/session";
import { db, schema } from "@/server/db";

const safeNext = (n?: string) => (n && n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/admin") ? n : "/account");

// Google sends the visitor back here → find or create the customer account and sign them in.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const fail = (code: string) => NextResponse.redirect(new URL(`/login?error=${code}`, url));
  const jar = await cookies();
  const saved = jar.get("g_state")?.value;
  jar.delete("g_state");
  let st: { state: string; next: string } | null = null;
  try {
    st = saved ? JSON.parse(saved) : null;
  } catch {}
  const code = url.searchParams.get("code");
  if (!st || !code || url.searchParams.get("state") !== st.state) return fail("google");

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: `${url.origin}/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) return fail("google");
  const { access_token } = (await tokenRes.json()) as { access_token?: string };
  const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${access_token}` } });
  if (!infoRes.ok) return fail("google");
  const info = (await infoRes.json()) as { email?: string; email_verified?: boolean; name?: string };
  const email = info.email?.toLowerCase();
  if (!email || !info.email_verified) return fail("google");

  let [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (user && user.role !== "customer") return fail("google-staff"); // team members use /admin/login
  if (user && !user.isActive) return fail("google-blocked");
  if (!user) {
    // Google users get a random password they never need (they can always use Google)
    [user] = await db
      .insert(schema.users)
      .values({ email, name: (info.name || email.split("@")[0]).slice(0, 80), passwordHash: await hashPassword(randomBytes(24).toString("hex")), role: "customer" })
      .returning();
  }

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "local";
  const { token, expiresAt } = await createSession(user.id, { ip, userAgent: h.get("user-agent") });
  await setSessionCookie(token, expiresAt);
  await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, user.id));
  return NextResponse.redirect(new URL(safeNext(st.next), url));
}
