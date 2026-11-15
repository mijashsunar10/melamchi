// Ordering — the ONE place the frontend talks to the order system.
//
// Today (no backend): orders are sent to WhatsApp and the player-name check is a demo.
// Backend later: replace the bodies of `submitOrder` and `lookupPlayerName` with API
// calls (see BACKEND.md). `validateOrder` and `priceOrder` are plain functions so the
// server can run exactly the same checks.

import { formatNPR } from "@/lib/format";
import { whatsappLink } from "@/lib/site";
import type { Deal, Plan, Product } from "@/types/catalog";

/** What the customer submits from a product page. */
export interface OrderRequest {
  productSlug: string;
  planId: string;
  quantity: number;
  /** values of the product's order fields, keyed by OrderField.name */
  details: Record<string, string>;
  /** name returned by the player-name check, if done */
  playerName?: string;
}

export type SubmitResult =
  | { ok: true; /** where to send the customer next (WhatsApp now, payment page later) */ redirectUrl: string; orderId?: string }
  | { ok: false; error: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MAX_QUANTITY = 10;

/** Quantity is only allowed for top-ups and codes. */
export const allowsQuantity = (product: Product) => product.deliveryType === "TOPUP" || product.deliveryType === "CODE";

/** Deal price for a plan (rounded to whole rupees). */
export const dealPrice = (price: number, discountPercent: number) => Math.round(price * (1 - discountPercent / 100));

/**
 * Price for a plan × quantity, applying an active deal on that plan.
 * `isQuote` = price on request. The server must call this too — never trust a browser price.
 */
export function priceOrder(product: Product, planId: string, quantity: number, deal?: Deal | null) {
  const plan: Plan = product.plans.find((p) => p.id === planId) ?? product.plans[0];
  const qty = allowsQuantity(product) ? Math.min(Math.max(1, quantity), MAX_QUANTITY) : 1;
  // `deal` must be an active deal — expired deals are filtered out by getDeals()/getProductDeal()
  const onDeal = !!deal && deal.planId === plan.id;
  const unitPrice = onDeal ? dealPrice(plan.price, deal.discountPercent) : plan.price;
  return { plan, quantity: qty, unitPrice, onDeal, total: unitPrice * qty, isQuote: plan.price === 0 };
}

/** Field errors keyed by field name. Empty object = valid. Runs on client AND (later) server. */
export function validateOrder(product: Product, req: OrderRequest): Record<string, string> {
  const errors: Record<string, string> = {};
  const plan = product.plans.find((p) => p.id === req.planId);
  if (!plan) errors._plan = "Please choose a package.";
  else if (!plan.inStock) errors._plan = "This package is out of stock.";
  for (const f of product.fields) {
    const v = req.details[f.name]?.trim() ?? "";
    if (f.required && !v) errors[f.name] = `${f.label} is required.`;
    else if (f.type === "email" && v && !EMAIL.test(v)) errors[f.name] = "Enter a valid email address.";
  }
  return errors;
}

/** Human-readable order summary (used for the WhatsApp message, and later order notes). */
export function orderSummary(product: Product, req: OrderRequest, deal?: Deal | null, orderId?: string): string {
  const { plan, quantity, total, isQuote, onDeal } = priceOrder(product, req.planId, req.quantity, deal);
  return [
    "Hi TOPX Nepal! I'd like to order:",
    "",
    ...(orderId ? [`• Order ref: ${orderId}`] : []),
    `• Product: ${product.name}`,
    `• Package: ${plan.name}${onDeal && deal ? ` (deal -${deal.discountPercent}%)` : ""}`,
    ...(allowsQuantity(product) ? [`• Quantity: ${quantity}`] : []),
    ...product.fields
      .filter((f) => req.details[f.name]?.trim())
      .map((f) => `• ${f.label}: ${req.details[f.name].trim()}`),
    ...(req.playerName ? [`• Player name: ${req.playerName}`] : []),
    `• Total: ${isQuote ? "Please send a quote" : formatNPR(total)}`,
  ].join("\n");
}

/**
 * Submit an order.
 * NOW: builds a WhatsApp message.
 * BACKEND: POST /api/orders with `req` → { orderId, paymentUrl } and return
 *          { ok: true, orderId, redirectUrl: paymentUrl }.
 */
export async function submitOrder(product: Product, req: OrderRequest, deal?: Deal | null): Promise<SubmitResult> {
  const errors = validateOrder(product, req);
  if (Object.keys(errors).length) return { ok: false, error: Object.values(errors)[0] };
  const orderId = newOrderRef();
  return { ok: true, orderId, redirectUrl: whatsappLink(orderSummary(product, req, deal, orderId)) };
}

/** Short, readable order reference, e.g. "TX-8K2F9Q" (the backend will issue real order IDs). */
export function newOrderRef(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `TX-${[...bytes].map((b) => alphabet[b % alphabet.length]).join("")}`;
}

/** Order references look like TX-XXXXXX. */
export const ORDER_REF = /^TX-[A-Z0-9]{4,12}$/;

export type OrderStatus = "received" | "paid" | "processing" | "delivered" | "failed" | "refunded";

export interface OrderTracking {
  orderId: string;
  status: OrderStatus;
  productName: string;
  packageName: string;
  total: number;
  /** status changes, oldest first */
  history: { status: OrderStatus; at: string }[];
}

export type TrackResult =
  | { found: true; order: OrderTracking }
  | { found: false; reason: "not-found" }
  /** no backend yet — the page falls back to asking on WhatsApp */
  | { found: false; reason: "offline" };

/**
 * Look up an order's status.
 * NOW: no order database → returns "offline". BACKEND: GET /api/orders/{orderId}?phone=… → OrderTracking | 404.
 */
export async function trackOrder(orderId: string, phone?: string): Promise<TrackResult> {
  void orderId;
  void phone;
  return { found: false, reason: "offline" };
}

/**
 * Look up the in-game name for a Player ID.
 * NOW: demo name. BACKEND: GET /api/player-name?product=…&id=… → { name } | 404.
 */
export async function lookupPlayerName(productSlug: string, playerId: string): Promise<string | null> {
  if (!/^\d{5,15}$/.test(playerId)) return null;
  await new Promise((r) => setTimeout(r, 900));
  const names = ["NepaliGamer", "HimalayanAce", "KTMSniper", "PokharaPro", "EverestKing"];
  const n = [...playerId].reduce((a, c) => a + c.charCodeAt(0), 0);
  return `${names[n % names.length]}${n % 100}`;
}
