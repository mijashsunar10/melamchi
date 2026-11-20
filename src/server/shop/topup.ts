import "server-only";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/server/db";
import { sendOrderStatusEmail } from "@/server/email/send";

// Automatic top-up — runs in the background right after eSewa confirms the payment (order is "processing").
// Supplier not connected yet (TOPUP_API_KEY empty) → the order stays "processing" and staff top up by hand.
// Errors never crash the payment flow: the order goes to "failed" with a note so staff can top up by hand or refund.
export async function autoTopup(orderId: string): Promise<void> {
  if (!process.env.TOPUP_API_KEY) return;
  const [o] = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1);
  if (!o || o.status !== "processing") return;
  try {
    await supplierTopup(o);
    await setResult(o.id, "delivered", null);
    await sendOrderStatusEmail(o.id);
  } catch (e) {
    await setResult(o.id, "failed", `Auto top-up failed: ${e instanceof Error ? e.message : String(e)} — top up by hand or refund.`);
  }
}

// TODO(supplier): call the supplier API with o.productSlug, o.planId, o.quantity, o.details. Throw on any error.
async function supplierTopup(o: typeof schema.orders.$inferSelect): Promise<void> {
  void o;
  throw new Error("supplier API not connected yet");
}

const setResult = (id: string, status: "delivered" | "failed", note: string | null) =>
  db
    .update(schema.orders)
    .set({ status, adminNote: note, seenByAdmin: false, updatedAt: new Date() })
    .where(and(eq(schema.orders.id, id), eq(schema.orders.status, "processing")));
