import "server-only";
import { count, desc, eq } from "drizzle-orm";
import { db, schema } from "@/server/db";

export type OrderRow = typeof schema.orders.$inferSelect;

export async function listMyOrders(userId: string): Promise<OrderRow[]> {
  return db.select().from(schema.orders).where(eq(schema.orders.userId, userId)).orderBy(desc(schema.orders.createdAt));
}

export async function listAllOrders(status?: OrderRow["status"]) {
  const q = db
    .select({ order: schema.orders, customer: { name: schema.users.name, email: schema.users.email } })
    .from(schema.orders)
    .innerJoin(schema.users, eq(schema.users.id, schema.orders.userId))
    .orderBy(desc(schema.orders.createdAt))
    .limit(300);
  return status ? q.where(eq(schema.orders.status, status)) : q;
}

export async function countPendingOrders() {
  const [r] = await db.select({ n: count() }).from(schema.orders).where(eq(schema.orders.status, "pending"));
  return r?.n ?? 0;
}
