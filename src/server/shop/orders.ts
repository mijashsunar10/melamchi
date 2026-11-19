import "server-only";
import { and, count, desc, eq, ne } from "drizzle-orm";
import { db, schema } from "@/server/db";

export type OrderRow = typeof schema.orders.$inferSelect;

export async function listMyOrders(userId: string): Promise<OrderRow[]> {
  return db.select().from(schema.orders).where(and(eq(schema.orders.userId, userId), ne(schema.orders.status, "unpaid"))).orderBy(desc(schema.orders.createdAt));
}

export async function listAllOrders(status?: OrderRow["status"]) {
  const q = db
    .select({ order: schema.orders, customer: { name: schema.users.name, email: schema.users.email } })
    .from(schema.orders)
    .innerJoin(schema.users, eq(schema.users.id, schema.orders.userId))
    .orderBy(desc(schema.orders.createdAt))
    .limit(300);
  return q.where(status ? eq(schema.orders.status, status) : ne(schema.orders.status, "unpaid"));
}

export async function countPendingOrders() {
  const [r] = await db.select({ n: count() }).from(schema.orders).where(eq(schema.orders.status, "pending"));
  return r?.n ?? 0;
}
