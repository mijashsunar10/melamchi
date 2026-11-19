import "server-only";
import { and, count, desc, eq, gt, inArray, isNotNull, sql } from "drizzle-orm";
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

export type CustomerRow = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  orders: number;
  spent: number;
  online: boolean;
};

/** Customers (people who registered on the website), most recent sign-in first. */
export async function listCustomers(): Promise<CustomerRow[]> {
  const { orders } = schema;
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
      orders: sql<number>`(select count(*)::int from ${orders} where ${orders.userId} = ${users.id})`,
      spent: sql<number>`(select coalesce(sum(${orders.total}), 0)::int from ${orders} where ${orders.userId} = ${users.id} and ${orders.status} = 'delivered')`,
      online: sql<boolean>`exists(select 1 from ${sessions} where ${sessions.userId} = ${users.id} and ${sessions.expiresAt} > now())`,
    })
    .from(users)
    .where(eq(users.role, "customer"))
    .orderBy(sql`${users.lastLoginAt} desc nulls last`, desc(users.createdAt))
    .limit(500);
  return rows;
}

/** One customer (null if the id is not a customer). */
export async function getCustomer(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [u] = await db
    .select({ id: users.id, name: users.name, email: users.email, isActive: users.isActive, lastLoginAt: users.lastLoginAt, createdAt: users.createdAt })
    .from(users)
    .where(and(eq(users.id, id), eq(users.role, "customer")))
    .limit(1);
  return u ?? null;
}
