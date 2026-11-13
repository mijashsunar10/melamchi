// Data-access layer. Pages and components get catalog data ONLY through
// these functions. They are async so the backend can later replace the
// mock imports with real API/database calls without touching the UI.

import { deals } from "@/data/deals";
import { domains } from "@/data/domains";
import { paymentMethods } from "@/data/payments";
import { products } from "@/data/products";
import { reviews } from "@/data/reviews";
import type { Deal, Domain, DomainSlug, Plan, Product } from "@/types/catalog";

export async function getDomains(): Promise<Domain[]> {
  return domains;
}

export async function getDomain(slug: string): Promise<Domain | undefined> {
  return domains.find((d) => d.slug === slug);
}

export async function getProducts(filter?: {
  domain?: DomainSlug;
  category?: string;
  tag?: Product["tags"][number];
}): Promise<Product[]> {
  return products.filter(
    (p) =>
      (!filter?.domain || p.domain === filter.domain) &&
      (!filter?.category || p.category === filter.category) &&
      (!filter?.tag || p.tags.includes(filter.tag)),
  );
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return products.find((p) => p.slug === slug);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const sameCategory = products.filter((p) => p.slug !== product.slug && p.category === product.category);
  const sameDomain = products.filter(
    (p) => p.slug !== product.slug && p.domain === product.domain && p.category !== product.category,
  );
  return [...sameCategory, ...sameDomain].slice(0, limit);
}

export async function getBestSellers(limit = 8): Promise<Product[]> {
  return [...products].filter((p) => p.domain !== "support").sort((a, b) => b.sold - a.sold).slice(0, limit);
}

export async function searchProducts(query: string, limit = 10): Promise<Product[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products
    .filter((p) => [p.name, p.brand, p.category, p.domain, p.shortDescription].join(" ").toLowerCase().includes(q))
    .slice(0, limit);
}

export interface DealWithProduct extends Deal {
  product: Product;
  plan: Plan;
  dealPrice: number;
}

export async function getDeals(): Promise<DealWithProduct[]> {
  return deals.flatMap((deal) => {
    const product = products.find((p) => p.slug === deal.productSlug);
    const plan = product?.plans.find((pl) => pl.id === deal.planId);
    if (!product || !plan) return [];
    const dealPrice = Math.round(plan.price * (1 - deal.discountPercent / 100));
    return [{ ...deal, product, plan, dealPrice }];
  });
}

export async function getReviews(productSlug?: string) {
  return productSlug ? reviews.filter((r) => r.productSlug === productSlug) : reviews;
}

export async function getPaymentMethods() {
  return paymentMethods;
}

/** Lowest in-stock plan price — for "From Rs X" on product cards. */
export function startingPrice(product: Product): number | null {
  const prices = product.plans.filter((p) => p.inStock && p.price > 0).map((p) => p.price);
  return prices.length ? Math.min(...prices) : null;
}
