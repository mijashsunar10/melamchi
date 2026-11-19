"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getProduct, getProductDeal } from "@/lib/catalog";
import { newOrderRef, type OrderRequest, priceOrder, validateOrder } from "@/lib/orders";
import { getCurrentUser, requireStaff } from "@/server/auth/dal";
import { db, schema } from "@/server/db";

export type PlaceOrderResult = { ok: true; orderId: string } | { ok: false; error: string; needLogin?: boolean };

/** Is someone signed in? (the product page checks before showing the QR) */
export async function whoAmIAction(): Promise<{ signedIn: boolean }> {
  return { signedIn: !!(await getCurrentUser()) };
}

/** Customer paid by QR → save the order as "pending" so it shows up for the admin. Price is re-calculated here. */
export async function placeOrderAction(req: OrderRequest, paymentRef: string, proof: FormData): Promise<PlaceOrderResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in first.", needLogin: true };

  const file = proof.get("screenshot");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Please upload your payment screenshot." };
  if (file.size > 5 * 1024 * 1024) return { ok: false, error: "Screenshot is too big (max 5 MB)." };

  const product = await getProduct(String(req.productSlug));
  if (!product) return { ok: false, error: "Product not found." };
  const clean: OrderRequest = {
    productSlug: product.slug,
    planId: String(req.planId),
    quantity: Number(req.quantity) || 1,
    details: Object.fromEntries(product.fields.map((f) => [f.name, String(req.details?.[f.name] ?? "").trim().slice(0, 300)])),
  };
  const errors = validateOrder(product, clean);
  if (Object.keys(errors).length) return { ok: false, error: Object.values(errors)[0] };

  const deal = await getProductDeal(product.slug);
  const { plan, quantity, unitPrice, total } = priceOrder(product, clean.planId, clean.quantity, deal);
  let shot;
  try {
    const { default: sharp } = await import("sharp");
    shot = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 50_000_000 })
      .rotate()
      .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    return { ok: false, error: "That file is not a picture. Upload a screenshot (JPG / PNG)." };
  }
  const [img] = await db
    .insert(schema.media)
    .values({ data: shot.data, mime: "image/webp", width: shot.info.width, height: shot.info.height, size: shot.info.size })
    .returning({ id: schema.media.id });

  const id = newOrderRef();
  await db.insert(schema.orders).values({
    paymentProofId: img.id,
    id,
    userId: user.id,
    productSlug: product.slug,
    productName: product.name,
    planId: plan.id,
    planName: plan.name,
    quantity,
    details: clean.details,
    unitPrice,
    total,
    paymentRef: paymentRef?.trim().slice(0, 100) || null,
  });
  return { ok: true, orderId: id };
}

const STATUSES = ["pending", "processing", "delivered", "failed", "refunded"] as const;

/** Admin/staff: change an order's status (e.g. after adding the diamonds → delivered). */
export async function setOrderStatusAction(orderId: string, status: (typeof STATUSES)[number], note?: string) {
  await requireStaff();
  if (!STATUSES.includes(status)) return;
  await db
    .update(schema.orders)
    .set({ status, adminNote: note?.trim() || null, seenByAdmin: true, updatedAt: new Date() })
    .where(eq(schema.orders.id, orderId));
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
