import "server-only";
import { and, eq, gt, lt } from "drizzle-orm";
import { after } from "next/server";
import { db, schema } from "@/server/db";
import { esewaPaid } from "@/server/shop/esewa";
import { autoTopup } from "@/server/shop/topup";

/** Mark an unpaid order as paid (processing) exactly once, then start the auto top-up in the background.
 *  Returns true only for the single call that actually flipped it — so a double refresh can't top up twice. */
export async function settlePaid(orderId: string, ref: string): Promise<boolean> {
  const flipped = await db
    .update(schema.orders)
    .set({ status: "processing", seenByAdmin: false, paymentRef: `eSewa ${ref}`, updatedAt: new Date() })
    .where(and(eq(schema.orders.id, orderId), eq(schema.orders.status, "unpaid")))
    .returning({ id: schema.orders.id });
  if (!flipped.length) return false;
  after(() => autoTopup(orderId));
  return true;
}

/** Catch payments where the customer paid but never came back to our site (closed tab, lost signal).
 *  Asks eSewa about unpaid orders from the last 48h that are at least 2 min old. Returns how many were found paid. */
export async function reconcileEsewa(): Promise<number> {
  const now = Date.now();
  const rows = await db
    .select({ id: schema.orders.id, total: schema.orders.total })
    .from(schema.orders)
    .where(
      and(
        eq(schema.orders.status, "unpaid"),
        gt(schema.orders.createdAt, new Date(now - 48 * 3600_000)),
        lt(schema.orders.createdAt, new Date(now - 2 * 60_000)),
      ),
    )
    .limit(100);
  let found = 0;
  for (const o of rows) {
    const check = await esewaPaid(o.id, o.total);
    if (check.paid && (await settlePaid(o.id, check.refId ?? "status-check"))) found++;
  }
  return found;
}
