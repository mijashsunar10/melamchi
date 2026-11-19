"use server";

import { eq } from "drizzle-orm";
import { db, schema } from "@/server/db";
import type { OrderStatus, TrackResult } from "@/lib/orders";

/** Public order lookup by reference (TX-XXXXXX). Shows only status, product and total — no customer details. */
export async function trackOrderAction(orderId: string): Promise<TrackResult> {
  const id = String(orderId).trim().toUpperCase().slice(0, 20);
  const [o] = await db.select().from(schema.orders).where(eq(schema.orders.id, id)).limit(1);
  if (!o) return { found: false, reason: "not-found" };
  const created = o.createdAt.toISOString();
  const updated = o.updatedAt.toISOString();
  const history: { status: OrderStatus; at: string }[] = [{ status: "received", at: created }];
  if (o.status === "processing" || o.status === "delivered") history.push({ status: "paid", at: updated }, { status: "processing", at: updated });
  if (o.status === "delivered") history.push({ status: "delivered", at: updated });
  if (o.status === "failed" || o.status === "refunded") history.push({ status: o.status, at: updated });
  const status: OrderStatus = o.status === "pending" ? "received" : o.status;
  return { found: true, order: { orderId: o.id, status, productName: o.productName, packageName: o.planName, total: o.total, history } };
}
