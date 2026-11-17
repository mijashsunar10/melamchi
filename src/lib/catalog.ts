// Data-access layer. Pages and components get catalog data ONLY through these functions.
// Sections, categories, products and packages come from PostgreSQL (cached — see
// src/server/catalog/source.ts). Deals, reviews and payments still use src/data until B5.

import { deals } from "@/data/deals";
import { paymentMethods } from "@/data/payments";
import { reviews } from "@/data/reviews";
import { loadCatalog } from "@/server/catalog/source";
import { dealPrice } from "@/lib/orders";
import { scoreEntry, toSearchEntry } from "@/lib/search";
import type { Deal, Domain, DomainSlug, Plan, Product } from "@/types/catalog";

export async function getDomains(): Promise<Domain[]> {
  return (await loadCatalog()).domains;
}

export async function getDomain(slug: string): Promise<Domain | undefined> {
  return (await loadCatalog()).domains.find((d) => d.slug === slug);
}

export async function getProducts(filter?: {
  domain?: DomainSlug;
  category?: string;
  tag?: Product["tags"][number];
}): Promise<Product[]> {
  const { products } = await loadCatalog();
  return products.filter(
    (p) =>
      (!filter?.domain || p.domain === filter.domain) &&
      (!filter?.category || p.category === filter.category) &&
      (!filter?.tag || p.tags.includes(filter.tag)),
  );
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return (await loadCatalog()).products.find((p) => p.slug === slug);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const { products } = await loadCatalog();
  const sameCategory = products.filter((p) => p.slug !== product.slug && p.category === product.category);
  const sameDomain = products.filter(
    (p) => p.slug !== product.slug && p.domain === product.domain && p.category !== product.category,
  );
  return [...sameCategory, ...sameDomain].slice(0, limit);
}

export async function getBestSellers(limit = 8): Promise<Product[]> {
  const { products } = await loadCatalog();
  return [...products].filter((p) => p.domain !== "support").sort((a, b) => b.sold - a.sold).slice(0, limit);
}

/** Ranked search (same scoring as the search page). BACKEND: may call GET /api/search?q=… instead. */
export async function searchProducts(query: string, limit = 10): Promise<Product[]> {
  if (!query.trim()) return [];
  const { products, domains } = await loadCatalog();
  return products
    .map((p) => ({
      p,
      score: scoreEntry(
        toSearchEntry(p, domains.find((d) => d.slug === p.domain), startingPrice(p)),
        query,
      ),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.p);
}

export interface DealWithProduct extends Deal {
  product: Product;
  plan: Plan;
  dealPrice: number;
}

export async function getDeals(): Promise<DealWithProduct[]> {
  const { products } = await loadCatalog();
  return deals.flatMap((deal) => {
    const product = products.find((p) => p.slug === deal.productSlug);
    const plan = product?.plans.find((pl) => pl.id === deal.planId);
    if (!product || !plan) return [];
    return [{ ...deal, product, plan, dealPrice: dealPrice(plan.price, deal.discountPercent) }];
  });
}

/** Active deal for a product, if any (backend: only return deals whose endsAt is in the future). */
export async function getProductDeal(productSlug: string): Promise<Deal | null> {
  // only a deal whose product and package still exist in the catalog; plain Deal fields only
  const d = (await getDeals()).find((x) => x.productSlug === productSlug);
  return d ? { productSlug: d.productSlug, planId: d.planId, discountPercent: d.discountPercent, endsAt: d.endsAt, label: d.label } : null;
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
