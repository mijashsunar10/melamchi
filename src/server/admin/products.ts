import "server-only";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/server/db";

const { domains, categories, products, plans } = schema;

/** One row of the admin product list (includes hidden products). */
export interface AdminProductRow {
  id: string;
  slug: string;
  name: string;
  brand: string;
  image: string | null;
  color: string;
  domainSlug: string;
  domainName: string;
  categoryName: string | null;
  deliveryType: string;
  isActive: boolean;
  planCount: number;
  outOfStock: number;
  minPrice: number | null;
  maxPrice: number | null;
  updatedAt: Date;
}

export async function listAdminProducts(): Promise<AdminProductRow[]> {
  const [productRows, domainRows, categoryRows, planRows] = await Promise.all([
    db.select().from(products).orderBy(asc(products.sortOrder), asc(products.name)),
    db.select({ slug: domains.slug, name: domains.name, order: domains.sortOrder }).from(domains),
    db.select({ id: categories.id, name: categories.name }).from(categories),
    db.select({ productId: plans.productId, price: plans.price, inStock: plans.inStock }).from(plans),
  ]);
  const domainName = new Map(domainRows.map((d) => [d.slug, d.name]));
  const domainOrder = new Map(domainRows.map((d) => [d.slug, d.order]));
  const categoryName = new Map(categoryRows.map((c) => [c.id, c.name]));
  const plansBy = Map.groupBy(planRows, (p) => p.productId);

  return productRows
    .map((p) => {
      const ps = plansBy.get(p.id) ?? [];
      const prices = ps.map((x) => x.price).filter((x) => x > 0);
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        image: p.imageUrl,
        color: p.color,
        domainSlug: p.domainSlug,
        domainName: domainName.get(p.domainSlug) ?? p.domainSlug,
        categoryName: (p.categoryId && categoryName.get(p.categoryId)) || null,
        deliveryType: p.deliveryType,
        isActive: p.isActive,
        planCount: ps.length,
        outOfStock: ps.filter((x) => !x.inStock).length,
        minPrice: prices.length ? Math.min(...prices) : null,
        maxPrice: prices.length ? Math.max(...prices) : null,
        updatedAt: p.updatedAt,
      };
    })
    .sort((a, b) => (domainOrder.get(a.domainSlug) ?? 0) - (domainOrder.get(b.domainSlug) ?? 0));
}

/** Sections with their categories, for the section / category pickers. */
export async function listSectionOptions() {
  const [domainRows, categoryRows] = await Promise.all([
    db.select({ slug: domains.slug, name: domains.name }).from(domains).orderBy(asc(domains.sortOrder)),
    db.select({ id: categories.id, name: categories.name, domainSlug: categories.domainSlug }).from(categories).orderBy(asc(categories.sortOrder)),
  ]);
  return domainRows.map((d) => ({
    slug: d.slug,
    name: d.name,
    categories: categoryRows.filter((c) => c.domainSlug === d.slug).map((c) => ({ id: c.id, name: c.name })),
  }));
}
export type SectionOption = Awaited<ReturnType<typeof listSectionOptions>>[number];

/** Everything the edit page needs for one product. */
export async function getAdminProduct(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return undefined;
  const [p] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!p) return undefined;
  const ps = await db.select().from(plans).where(eq(plans.productId, id)).orderBy(asc(plans.sortOrder));
  return { ...p, plans: ps };
}
export type AdminProduct = NonNullable<Awaited<ReturnType<typeof getAdminProduct>>>;
