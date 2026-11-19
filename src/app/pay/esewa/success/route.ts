import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/server/db";
import { esewaPaid, readEsewaResponse } from "@/server/shop/esewa";
import { autoTopup } from "@/server/shop/topup";

// eSewa sends the customer here after paying (?data=…). We check with eSewa itself, then mark the order paid (processing) and start the auto top-up.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const done = (q: string) => NextResponse.redirect(new URL(`/account?esewa=${q}`, url));
  const res = readEsewaResponse(url.searchParams.get("data") ?? "");
  if (!res) return done("failed");
  const [o] = await db.select().from(schema.orders).where(eq(schema.orders.id, res.orderId)).limit(1);
  if (!o) return done("failed");
  if (o.status !== "unpaid") return done("paid"); // already handled (page refreshed)
  const check = await esewaPaid(o.id, o.total);
  if (!check.paid) return done("failed");
  await db
    .update(schema.orders)
    .set({ status: "processing", seenByAdmin: false, paymentRef: `eSewa ${check.refId ?? res.transactionCode}`, updatedAt: new Date() })
    .where(and(eq(schema.orders.id, o.id), eq(schema.orders.status, "unpaid")));
  await autoTopup(o.id); // paid → processing → delivered (once the supplier is connected)
  return done("paid");
}
