// Shapes shared by the product editor (client) and its server actions. No server code here.

import type { DeliveryType, FAQ, OrderField, ProductTag } from "@/types/catalog";

export interface PlanInput {
  /** existing package id (slug) — empty for a new package */
  key: string;
  name: string;
  price: number;
  originalPrice: number | null;
  bonus: string;
  validity: string;
  inStock: boolean;
  popular: boolean;
}

export interface ProductInput {
  id?: string;
  slug: string;
  name: string;
  brand: string;
  domainSlug: string;
  categoryId: string | null;
  deliveryType: DeliveryType;
  shortDescription: string;
  description: string;
  region: string;
  deliveryTime: string;
  color: string;
  initials: string;
  tags: ProductTag[];
  isActive: boolean;
  plans: PlanInput[];
  fields: OrderField[];
  howTo: string[];
  faq: FAQ[];
}

export const PRODUCT_TAGS: { value: ProductTag; label: string }[] = [
  { value: "hot", label: "🔥 Hot" },
  { value: "new", label: "✨ New" },
  { value: "bestseller", label: "⭐ Best seller" },
  { value: "official", label: "✔ Official" },
  { value: "limited", label: "⏳ Limited" },
];

export const DELIVERY_TYPES: { value: DeliveryType; label: string; help: string }[] = [
  { value: "TOPUP", label: "Game / app top-up", help: "We send it straight to the customer’s Player ID." },
  { value: "CODE", label: "Code or gift card", help: "The customer gets a code to redeem." },
  { value: "ACCOUNT", label: "Subscription on their account", help: "We activate a plan on the customer’s email / account." },
  { value: "LICENSE", label: "Software licence key", help: "The customer gets a key and download link." },
  { value: "SERVICE", label: "Service / help request", help: "We contact the customer to do a job." },
];

export type ProductActionResult = { ok?: boolean; error?: string; message?: string; id?: string };

/** "Live-stream Coins!" → "live-stream-coins" */
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

/** "Player ID (optional)" → "playerIdOptional" — the key an order stores the answer under */
export const fieldKey = (label: string) =>
  slugify(label)
    .split("-")
    .filter(Boolean)
    .map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1)))
    .join("")
    .slice(0, 40);
