import { NextResponse } from "next/server";
import { reconcileEsewa } from "@/server/shop/settle";

// Run every 5–10 min by a cron (Vercel Cron / cron-job.org) with header `Authorization: Bearer $CRON_SECRET`.
// Finds eSewa payments where the customer never returned to the site.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ found: await reconcileEsewa() });
}
