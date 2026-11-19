import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "@/server/db";

// Automatic top-up — runs right after eSewa confirms the payment (order is "processing").
// Supplier not connected yet (TOPUP_API_KEY empty) → the order stays "processing" and staff top up by hand.
// When the supplier's API docs/keys arrive: send product/package/player ID to the supplier here,
// then set "delivered" on success or "failed" (with a note for the admin) on error.
export async function autoTopup(orderId: string): Promise<void> {
  if (!process.env.TOPUP_API_KEY) return;
  const [o] = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1);
  if (!o || o.status !== "processing") return;
  // TODO(supplier): call the supplier API with o.productSlug, o.planId, o.quantity, o.details
}
