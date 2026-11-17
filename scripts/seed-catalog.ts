// Load the starter catalog (src/data: 6 sections, categories, products, packages) into the database.
//
//   npm run db:seed
//
// Safe to run again: existing rows are updated by slug, nothing is deleted.
// After launch, manage the catalog in the admin panel instead.

import { and, eq } from "drizzle-orm";

for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // missing — fine
  }
}

async function main() {
  const { db, schema } = await import("../src/server/db");
  const { domains } = await import("../src/data/domains");
  const { products } = await import("../src/data/products");

  // Sections + categories
  const categoryIds = new Map<string, string>(); // "domain/category" → id
  for (const [i, d] of domains.entries()) {
    const values = {
      name: d.name,
      shortName: d.shortName,
      tagline: d.tagline,
      description: d.description,
      icon: d.icon,
      gradient: d.gradient,
      highlights: d.highlights,
      sortOrder: i,
      updatedAt: new Date(),
    };
    await db.insert(schema.domains).values({ slug: d.slug, ...values }).onConflictDoUpdate({ target: schema.domains.slug, set: values });

    for (const [j, c] of d.categories.entries()) {
      const [row] = await db
        .insert(schema.categories)
        .values({ domainSlug: d.slug, slug: c.slug, name: c.name, icon: c.icon, sortOrder: j })
        .onConflictDoUpdate({
          target: [schema.categories.domainSlug, schema.categories.slug],
          set: { name: c.name, icon: c.icon, sortOrder: j },
        })
        .returning({ id: schema.categories.id });
      categoryIds.set(`${d.slug}/${c.slug}`, row.id);
    }
  }

  // Products + packages
  for (const [i, p] of products.entries()) {
    const values = {
      name: p.name,
      brand: p.brand,
      domainSlug: p.domain,
      categoryId: categoryIds.get(`${p.domain}/${p.category}`) ?? null,
      deliveryType: p.deliveryType,
      imageUrl: p.image,
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
      sortOrder: i,
      updatedAt: new Date(),
    };
    const [row] = await db
      .insert(schema.products)
      .values({ slug: p.slug, ...values })
      .onConflictDoUpdate({ target: schema.products.slug, set: values })
      .returning({ id: schema.products.id });

    for (const [j, pl] of p.plans.entries()) {
      const planValues = {
        name: pl.name,
        price: pl.price,
        originalPrice: pl.originalPrice ?? null,
        bonus: pl.bonus ?? null,
        validity: pl.validity ?? null,
        inStock: pl.inStock,
        popular: pl.popular ?? false,
        sortOrder: j,
      };
      const [existing] = await db
        .select({ id: schema.plans.id })
        .from(schema.plans)
        .where(and(eq(schema.plans.productId, row.id), eq(schema.plans.slug, pl.id)))
        .limit(1);
      if (existing) await db.update(schema.plans).set(planValues).where(eq(schema.plans.id, existing.id));
      else await db.insert(schema.plans).values({ productId: row.id, slug: pl.id, ...planValues });
    }
  }

  console.log(`✓ Catalog loaded: ${domains.length} sections, ${categoryIds.size} categories, ${products.length} products, ${products.reduce((n, p) => n + p.plans.length, 0)} packages`);
  process.exit(0);
}

main().catch((err) => {
  console.error("✗", err instanceof Error ? err.message : err);
  process.exit(1);
});
