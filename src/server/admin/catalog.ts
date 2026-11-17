import "server-only";
import { asc, count, eq } from "drizzle-orm";
import { db, schema } from "@/server/db";

const { domains, categories, products } = schema;

export type AdminCategory = typeof categories.$inferSelect & { productCount: number };
export type AdminSection = typeof domains.$inferSelect & { categories: AdminCategory[]; productCount: number };

/** Sections with their categories and product counts (admin view — includes hidden products). */
export async function listSectionsWithCategories(): Promise<AdminSection[]> {
  const [sectionRows, categoryRows, perCategory, perSection] = await Promise.all([
    db.select().from(domains).orderBy(asc(domains.sortOrder)),
    db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name)),
    db.select({ id: products.categoryId, n: count() }).from(products).groupBy(products.categoryId),
    db.select({ slug: products.domainSlug, n: count() }).from(products).groupBy(products.domainSlug),
  ]);
  const catCount = new Map(perCategory.map((r) => [r.id, r.n]));
  const secCount = new Map(perSection.map((r) => [r.slug, r.n]));

  return sectionRows.map((s) => ({
    ...s,
    productCount: secCount.get(s.slug) ?? 0,
    categories: categoryRows
      .filter((c) => c.domainSlug === s.slug)
      .map((c) => ({ ...c, productCount: catCount.get(c.id) ?? 0 })),
  }));
}

export async function countProductsInCategory(categoryId: string) {
  const [row] = await db.select({ n: count() }).from(products).where(eq(products.categoryId, categoryId));
  return row.n;
}
