import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Stateless reset link: valid 1 hour, and dies as soon as the password changes (the hash is part of the signature).
const secret = () => process.env.AUTH_SECRET || process.env.DATABASE_URL || "dev";
const sign = (userId: string, exp: number, pwHash: string) => createHmac("sha256", secret()).update(`${userId}.${exp}.${pwHash}`).digest("base64url");

export const makeResetToken = (userId: string, pwHash: string) => {
  const exp = Date.now() + 3600_000;
  return `${Buffer.from(`${userId}.${exp}`).toString("base64url")}.${sign(userId, exp, pwHash)}`;
};

export function readResetToken(token: string): { userId: string; exp: number; sig: string } | null {
  const [head, sig] = token.split(".");
  if (!head || !sig) return null;
  const [userId, expS] = Buffer.from(head, "base64url").toString().split(".");
  const exp = Number(expS);
  if (!userId || !exp || exp < Date.now()) return null;
  return { userId, exp, sig };
}

export const checkResetToken = (t: { userId: string; exp: number; sig: string }, pwHash: string) => {
  const a = Buffer.from(sign(t.userId, t.exp, pwHash));
  const b = Buffer.from(t.sig);
  return a.length === b.length && timingSafeEqual(a, b);
};
