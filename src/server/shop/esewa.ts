import "server-only";
import { createHmac } from "node:crypto";

// eSewa ePay v2. Test keys (sandbox): ESEWA_PRODUCT_CODE=EPAYTEST, ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q, ESEWA_ENV=test
// Live: put the merchant code + secret from eSewa in .env and set ESEWA_ENV=live.
// eSewa is turned off (button hidden) while ESEWA_SECRET_KEY is empty.

const live = () => process.env.ESEWA_ENV === "live";
const productCode = () => process.env.ESEWA_PRODUCT_CODE ?? "";
const secret = () => process.env.ESEWA_SECRET_KEY ?? "";

export const esewaEnabled = () => !!secret() && !!productCode();

const FORM_URL = () =>
  live() ? "https://epay.esewa.com.np/api/epay/main/v2/form" : "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const STATUS_URL = () =>
  live() ? "https://esewa.com.np/api/epay/transaction/status/" : "https://rc.esewa.com.np/api/epay/transaction/status/";

const sign = (message: string) => createHmac("sha256", secret()).update(message).digest("base64");

/** Fields for the auto-submitted form that sends the customer to eSewa. */
export function esewaForm(orderId: string, total: number, origin: string) {
  const fields: Record<string, string> = {
    amount: String(total),
    tax_amount: "0",
    product_service_charge: "0",
    product_delivery_charge: "0",
    total_amount: String(total),
    transaction_uuid: orderId,
    product_code: productCode(),
    success_url: `${origin}/pay/esewa/success`,
    failure_url: `${origin}/pay/esewa/failure`,
    signed_field_names: "total_amount,transaction_uuid,product_code",
  };
  fields.signature = sign(`total_amount=${fields.total_amount},transaction_uuid=${orderId},product_code=${fields.product_code}`);
  return { url: FORM_URL(), fields };
}

/** Read eSewa's `?data=` on the success page and check its signature. Returns the order id, or null. */
export function readEsewaResponse(data: string): { orderId: string; transactionCode: string } | null {
  try {
    const d = JSON.parse(Buffer.from(data, "base64").toString("utf8")) as Record<string, string>;
    const names = String(d.signed_field_names ?? "").split(",");
    if (!names.length || sign(names.map((n) => `${n}=${d[n]}`).join(",")) !== d.signature) return null;
    if (d.status !== "COMPLETE" || d.product_code !== productCode()) return null;
    return { orderId: String(d.transaction_uuid), transactionCode: String(d.transaction_code ?? "") };
  } catch {
    return null;
  }
}

/** Ask eSewa directly whether this order was paid in full (the real check — never trust the browser alone). */
export async function esewaPaid(orderId: string, total: number): Promise<{ paid: boolean; refId?: string }> {
  const q = new URLSearchParams({ product_code: productCode(), total_amount: String(total), transaction_uuid: orderId });
  try {
    const r = await fetch(`${STATUS_URL()}?${q}`, { cache: "no-store" });
    if (!r.ok) return { paid: false };
    const j = (await r.json()) as { status?: string; ref_id?: string };
    return { paid: j.status === "COMPLETE", refId: j.ref_id };
  } catch {
    return { paid: false };
  }
}
