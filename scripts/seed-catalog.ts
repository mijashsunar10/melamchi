// Load the starter catalog (src/data: 6 sections, categories, products, packages) into the database.
//
//   npm run db:seed
//
// Safe to run again: by default it only ADDS what's missing — anything already in the
// database (and possibly edited in the admin panel) is left untouched.
//   npm run db:seed -- --force   → also overwrite existing sections/categories/products/packages
//                                   with the starter data (undoes admin edits!)

import { and, eq } from "drizzle-orm";

for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // missing — fine
  }
}

const force = process.argv.includes("--force");

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
    const insertDomain = db.insert(schema.domains).values({ slug: d.slug, ...values });
    await (force ? insertDomain.onConflictDoUpdate({ target: schema.domains.slug, set: values }) : insertDomain.onConflictDoNothing());

    for (const [j, c] of d.categories.entries()) {
      const insertCat = db.insert(schema.categories).values({ domainSlug: d.slug, slug: c.slug, name: c.name, icon: c.icon, sortOrder: j });
      if (force) {
        await insertCat.onConflictDoUpdate({
          target: [schema.categories.domainSlug, schema.categories.slug],
          set: { name: c.name, icon: c.icon, sortOrder: j },
        });
      } else {
        await insertCat.onConflictDoNothing();
      }
      const [row] = await db
        .select({ id: schema.categories.id })
        .from(schema.categories)
        .where(and(eq(schema.categories.domainSlug, d.slug), eq(schema.categories.slug, c.slug)))
        .limit(1);
      if (row) categoryIds.set(`${d.slug}/${c.slug}`, row.id);
    }
  }

  // Products + packages
  let added = 0;
  let skipped = 0;
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
    const [existingProduct] = await db.select({ id: schema.products.id }).from(schema.products).where(eq(schema.products.slug, p.slug)).limit(1);
    if (existingProduct && !force) {
      skipped++;
      continue; // already in the database — leave admin edits alone
    }
    const [row] = await db
      .insert(schema.products)
      .values({ slug: p.slug, ...values })
      .onConflictDoUpdate({ target: schema.products.slug, set: values })
      .returning({ id: schema.products.id });
    added++;

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

  console.log(
    force
      ? `✓ Catalog reset to starter data: ${domains.length} sections, ${categoryIds.size} categories, ${added} products`
      : `✓ Catalog seeded: ${added} product(s) added, ${skipped} already existed (left unchanged). Use --force to overwrite.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("✗", err instanceof Error ? err.message : err);
  process.exit(1);
});
