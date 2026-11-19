import { NextResponse } from "next/server";

// Customer cancelled or the payment failed on eSewa. The order stays "unpaid" (hidden).
export function GET(req: Request) {
  return NextResponse.redirect(new URL("/account?esewa=failed", req.url));
}
