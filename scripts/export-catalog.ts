// Saves the current catalog from PostgreSQL to src/server/catalog/catalog-snapshot.json
// (used by the static cPanel build). Run automatically by `npm run build:cpanel`.

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { asc, eq } from "drizzle-orm";

for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // missing — fine
  }
}

async function main() {
  const { db, schema } = await import("../src/server/db");

  const [domainRows, categoryRows, productRows, planRows] = await Promise.all([
    db.select().from(schema.domains).orderBy(asc(schema.domains.sortOrder)),
    db.select().from(schema.categories).orderBy(asc(schema.categories.sortOrder)),
    db.select().from(schema.products).where(eq(schema.products.isActive, true)).orderBy(asc(schema.products.sortOrder)),
    db.select().from(schema.plans).orderBy(asc(schema.plans.sortOrder)),
  ]);
  const categorySlug = new Map(categoryRows.map((c) => [c.id, c.slug]));

  const catalog = {
    domains: domainRows.map((d) => ({
      slug: d.slug,
      name: d.name,
      shortName: d.shortName,
      tagline: d.tagline,
      description: d.description,
      icon: d.icon,
      gradient: d.gradient,
      highlights: d.highlights,
      categories: categoryRows.filter((c) => c.domainSlug === d.slug).map((c) => ({ slug: c.slug, name: c.name, icon: c.icon })),
    })),
    products: productRows.map((p) => ({
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      domain: p.domainSlug,
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
      tags: p.tags,
      fields: p.fields,
      howTo: p.howTo,
      faq: p.faq,
      plans: planRows
        .filter((pl) => pl.productId === p.id)
        .map((pl) => ({
          id: pl.slug,
          name: pl.name,
          price: pl.price,
          ...(pl.originalPrice != null && { originalPrice: pl.originalPrice }),
          ...(pl.bonus && { bonus: pl.bonus }),
          ...(pl.validity && { validity: pl.validity }),
          inStock: pl.inStock,
          ...(pl.popular && { popular: true }),
        })),
    })),
  };

  const out = join(process.cwd(), "src", "server", "catalog", "catalog-snapshot.json");
  writeFileSync(out, JSON.stringify(catalog));
  console.log(`✓ Catalog snapshot: ${catalog.domains.length} sections, ${catalog.products.length} products → ${out}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("✗", err instanceof Error ? err.message : err);
  process.exit(1);
});
