import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/server/db";
import { esewaPaid, readEsewaResponse } from "@/server/shop/esewa";
import { settlePaid } from "@/server/shop/settle";

// eSewa sends the customer here after paying (?data=…). We check with eSewa itself, then mark the order paid
// (processing) once and start the auto top-up in the background so the redirect is never slowed down.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const done = (q: string, id?: string) => NextResponse.redirect(new URL(`/account?esewa=${q}${id ? `&order=${id}` : ""}`, url));
  const res = readEsewaResponse(url.searchParams.get("data") ?? "");
  if (!res) return done("failed");
  const [o] = await db.select().from(schema.orders).where(eq(schema.orders.id, res.orderId)).limit(1);
  if (!o) return done("failed");
  if (o.status !== "unpaid") return done("paid", o.id); // already handled (page refreshed)
  const check = await esewaPaid(o.id, o.total);
  if (!check.paid) return done("failed", o.id);
  await settlePaid(o.id, check.refId ?? res.transactionCode);
  return done("paid", o.id);
}
