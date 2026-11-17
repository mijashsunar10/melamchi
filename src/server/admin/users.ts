import "server-only";
import { and, count, desc, eq, gt, inArray, isNotNull } from "drizzle-orm";
import { db, schema } from "@/server/db";

const { users, sessions } = schema;

export type StaffRow = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "staff" | "customer";
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
};

/** Admin & staff accounts, admins first. */
export async function listStaff(): Promise<StaffRow[]> {
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(inArray(users.role, ["admin", "staff"]))
    .orderBy(users.role, users.name);
}

export async function getDashboardStats() {
  const [[admins], [staff], [customers], [activeSessions], recent] = await Promise.all([
    db.select({ n: count() }).from(users).where(and(eq(users.role, "admin"), eq(users.isActive, true))),
    db.select({ n: count() }).from(users).where(and(eq(users.role, "staff"), eq(users.isActive, true))),
    db.select({ n: count() }).from(users).where(eq(users.role, "customer")),
    db.select({ n: count() }).from(sessions).where(gt(sessions.expiresAt, new Date())),
    db
      .select({ name: users.name, email: users.email, role: users.role, lastLoginAt: users.lastLoginAt })
      .from(users)
      .where(isNotNull(users.lastLoginAt))
      .orderBy(desc(users.lastLoginAt))
      .limit(5),
  ]);
  return {
    admins: admins.n,
    staff: staff.n,
    customers: customers.n,
    activeSessions: activeSessions.n,
    recentLogins: recent,
  };
}

export async function countActiveAdmins() {
  const [row] = await db.select({ n: count() }).from(users).where(and(eq(users.role, "admin"), eq(users.isActive, true)));
  return row.n;
}

export async function countUserSessions(userId: string) {
  const [row] = await db
    .select({ n: count() })
    .from(sessions)
    .where(and(eq(sessions.userId, userId), gt(sessions.expiresAt, new Date())));
  return row.n;
}
