"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { after } from "next/server";
import { getProduct, getProductDeal } from "@/lib/catalog";
import { newOrderRef, type OrderRequest, priceOrder, validateOrder } from "@/lib/orders";
import { getCurrentUser, requireRole, requireStaff } from "@/server/auth/dal";
import { db, schema } from "@/server/db";
import { sendOrderStatusEmail } from "@/server/email/send";
import { esewaEnabled, esewaForm } from "@/server/shop/esewa";
import { reconcileEsewa } from "@/server/shop/settle";

/** Is someone signed in, and is eSewa on? (the product page checks before showing checkout) */
export async function whoAmIAction(): Promise<{ signedIn: boolean; esewa: boolean }> {
  return { signedIn: !!(await getCurrentUser()), esewa: esewaEnabled() };
}

/** Re-check the order on the server (fields, stock, price). */
type OrderValues = Omit<typeof schema.orders.$inferInsert, "id" | "userId">;
async function prepareOrder(req: OrderRequest): Promise<{ error: string } | { total: number; row: OrderValues }> {
  const product = await getProduct(String(req.productSlug));
  if (!product) return { error: "Product not found." };
  const clean: OrderRequest = {
    productSlug: product.slug,
    planId: String(req.planId),
    quantity: Number(req.quantity) || 1,
    details: Object.fromEntries(product.fields.map((f) => [f.name, String(req.details?.[f.name] ?? "").trim().slice(0, 300)])),
  };
  const errors = validateOrder(product, clean);
  if (Object.keys(errors).length) return { error: Object.values(errors)[0] };
  const deal = await getProductDeal(product.slug);
  const { plan, quantity, unitPrice, total, isQuote } = priceOrder(product, clean.planId, clean.quantity, deal);
  if (isQuote || total <= 0) return { error: "This package has no fixed price. Please ask for a quote on WhatsApp." };
  return {
    total,
    row: {
      productSlug: product.slug,
      productName: product.name,
      planId: plan.id,
      planName: plan.name,
      quantity,
      details: clean.details,
      unitPrice,
      total,
    },
  };
}

export type StartEsewaResult = { ok: true; url: string; fields: Record<string, string> } | { ok: false; error: string; needLogin?: boolean };

/** Pay with eSewa: save the order as "unpaid" and return the form that sends the customer to eSewa. */
export async function startEsewaAction(req: OrderRequest): Promise<StartEsewaResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in first.", needLogin: true };
  if (!esewaEnabled()) return { ok: false, error: "eSewa is not available right now." };
  const o = await prepareOrder(req);
  if ("error" in o) return { ok: false, error: o.error };
  const id = newOrderRef();
  await db.insert(schema.orders).values({ id, userId: user.id, status: "unpaid", seenByAdmin: true, ...o.row });
  // In production use the fixed site address so a faked Host header can't change eSewa's return links.
  const h = await headers();
  const origin =
    process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SITE_URL
      ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
      : `${h.get("x-forwarded-proto") ?? "http"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
  return { ok: true, ...esewaForm(id, o.total, origin) };
}

const STATUSES = ["pending", "processing", "delivered", "failed", "refunded"] as const;

/** Admin/staff: change an order's status (e.g. after adding the diamonds → delivered). */
export async function setOrderStatusAction(orderId: string, status: (typeof STATUSES)[number], note?: string) {
  await requireStaff();
  if (!STATUSES.includes(status)) return;
  const [old] = await db.select({ status: schema.orders.status }).from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1);
  await db
    .update(schema.orders)
    .set({ status, adminNote: note?.trim() || null, seenByAdmin: true, updatedAt: new Date() })
    .where(eq(schema.orders.id, orderId));
  if (old && old.status !== status) after(() => sendOrderStatusEmail(orderId));
  revalidatePath("/admin/orders");
}

/** Admin/staff: mark one new order as seen (clears the notification). */
export async function markOrderSeenAction(orderId: string) {
  await requireStaff();
  await db
    .update(schema.orders)
    .set({ seenByAdmin: true })
    .where(and(eq(schema.orders.id, orderId), eq(schema.orders.seenByAdmin, false)));
}

/** Admin: delete a finished order (delivered / failed / refunded) and its payment screenshot. */
export async function deleteOrderAction(orderId: string): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["admin"]);
  const [o] = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1);
  if (!o) return { ok: false, error: "Order not found." };
  if (!["delivered", "failed", "refunded"].includes(o.status)) return { ok: false, error: "Only finished orders can be deleted." };
  await db.delete(schema.orders).where(eq(schema.orders.id, orderId));
  if (o.paymentProofId) await db.delete(schema.media).where(eq(schema.media.id, o.paymentProofId));
  revalidatePath("/admin/orders");
  return { ok: true };
}

/** Admin/staff: ask eSewa about recent unpaid orders (customer paid but never came back). */
export async function checkEsewaAction(): Promise<number> {
  await requireStaff();
  const found = await reconcileEsewa();
  revalidatePath("/admin/orders");
  return found;
}
