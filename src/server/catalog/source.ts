import "server-only";
import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db, schema } from "@/server/db";
import type { Domain, Product, ProductTag } from "@/types/catalog";

// Catalog from PostgreSQL, cached by Next.js.
// - The whole catalog (sections, categories, active products, packages) is loaded in one go and cached.
// - Sections come in `sort_order` (Gaming first — TOPX is gaming-first; same order in the menu and footer).
// - Admin changes call `updateTag(CATALOG_TAG)` so the store updates immediately.
// - Edits made directly in the database (pgAdmin, scripts/fetch-product-images.ts) show up within the cache life (hours).

export const CATALOG_TAG = "catalog";

export interface Catalog {
  domains: Domain[];
  products: Product[];
}

export async function loadCatalog(): Promise<Catalog> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");

  const [domainRows, categoryRows, productRows, planRows] = await Promise.all([
    db.select().from(schema.domains).orderBy(asc(schema.domains.sortOrder)),
    db.select().from(schema.categories).orderBy(asc(schema.categories.sortOrder)),
    db.select().from(schema.products).where(eq(schema.products.isActive, true)).orderBy(asc(schema.products.sortOrder)),
    db.select().from(schema.plans).orderBy(asc(schema.plans.sortOrder)),
  ]);

  const categorySlug = new Map(categoryRows.map((c) => [c.id, c.slug]));
  const plansByProduct = Map.groupBy(planRows, (p) => p.productId);

  const domains: Domain[] = domainRows.map((d) => ({
    slug: d.slug as Domain["slug"],
    name: d.name,
    shortName: d.shortName,
    tagline: d.tagline,
    description: d.description,
    icon: d.icon,
    gradient: d.gradient,
    highlights: d.highlights,
    categories: categoryRows
      .filter((c) => c.domainSlug === d.slug)
      .map((c) => ({ slug: c.slug, name: c.name, icon: c.icon })),
  }));

  const products: Product[] = productRows.map((p) => ({
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    domain: p.domainSlug as Product["domain"],
    category: (p.categoryId && categorySlug.get(p.categoryId)) || "",
    deliveryType: p.deliveryType,
    image: p.imageUrl,
    initials: p.initials,
    color: p.color,
    shortDescription: p.shortDescription,
    description: p.description,
    region: p.region,
    deliveryTime: p.deliveryTime,
    rating: p.rating,
    reviewCount: p.reviewCount,
    sold: p.sold,
    tags: p.tags as ProductTag[],
    fields: p.fields,
    howTo: p.howTo,
    faq: p.faq,
    plans: (plansByProduct.get(p.id) ?? []).map((pl) => ({
      id: pl.slug,
      name: pl.name,
      price: pl.price,
      ...(pl.originalPrice != null && { originalPrice: pl.originalPrice }),
      ...(pl.bonus && { bonus: pl.bonus }),
      ...(pl.validity && { validity: pl.validity }),
      inStock: pl.inStock,
      ...(pl.popular && { popular: true }),
    })),
  }));

  return { domains, products };
}
