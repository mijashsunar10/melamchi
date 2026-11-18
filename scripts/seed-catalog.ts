// Load the starter catalog (src/data: 6 sections, categories, products, packages) and the starter
// content (deals, reviews, FAQ, help topics, blog, legal pages, settings) into the database.
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

  await seedContent(db, schema);

  console.log(
    force
      ? `✓ Catalog reset to starter data: ${domains.length} sections, ${categoryIds.size} categories, ${added} products`
      : `✓ Catalog seeded: ${added} product(s) added, ${skipped} already existed (left unchanged). Use --force to overwrite.`,
  );
  process.exit(0);
}

/**
 * Starter content (deals, reviews, FAQ, help topics, blog, legal pages, settings).
 * Each kind is only added when its table is still empty, so admin edits are never overwritten.
 */
async function seedContent(
  db: typeof import("../src/server/db").db,
  schema: typeof import("../src/server/db").schema,
) {
  const { count } = await import("drizzle-orm");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isEmpty = async (table: any) =>
    (await db.select({ n: count() }).from(table))[0].n === 0;
  const productId = new Map((await db.select({ id: schema.products.id, slug: schema.products.slug }).from(schema.products)).map((p) => [p.slug, p.id]));
  const done: string[] = [];

  if (await isEmpty(schema.deals)) {
    const { deals } = await import("../src/data/deals");
    const rows = deals
      .filter((d) => productId.has(d.productSlug))
      // starter deals run for a week from now so the countdowns are live
      .map((d, i) => ({
        productId: productId.get(d.productSlug)!,
        planSlug: d.planId,
        discountPercent: d.discountPercent,
        endsAt: new Date(Date.now() + (2 + i) * 86_400_000),
        label: d.label ?? null,
      }));
    if (rows.length) await db.insert(schema.deals).values(rows);
    done.push(`${rows.length} deals`);
  }
  if (await isEmpty(schema.reviews)) {
    const { reviews } = await import("../src/data/reviews");
    const rows = reviews
      .filter((r) => productId.has(r.productSlug))
      .map((r) => ({ productId: productId.get(r.productSlug)!, name: r.name, city: r.city, rating: r.rating, comment: r.comment, date: r.date, verified: r.verified }));
    if (rows.length) await db.insert(schema.reviews).values(rows);
    done.push(`${rows.length} reviews`);
  }
  if (await isEmpty(schema.faqs)) {
    const { homeFaq } = await import("../src/data/faq");
    const { accountFaq, codeFaq, licenseFaq, topupFaq } = await import("../src/data/fields");
    const bySection: Record<string, { q: string; a: string }[]> = {
      home: homeFaq,
      "ai-tools": accountFaq,
      gaming: topupFaq,
      "gift-cards": codeFaq,
      software: licenseFaq,
      "digital-products": accountFaq,
    };
    const rows = Object.entries(bySection).flatMap(([scope, list]) => list.map((f, i) => ({ scope, q: f.q, a: f.a, sortOrder: i })));
    await db.insert(schema.faqs).values(rows);
    done.push(`${rows.length} FAQ`);
  }
  if (await isEmpty(schema.supportTopics)) {
    const { supportTopics } = await import("../src/data/support");
    await db.insert(schema.supportTopics).values(supportTopics.map((t, i) => ({ slug: t.slug, name: t.name, icon: t.icon, faqs: t.faqs, sortOrder: i })));
    done.push(`${supportTopics.length} help topics`);
  }
  if (await isEmpty(schema.blogPosts)) {
    const { blogPosts } = await import("../src/data/blog");
    await db.insert(schema.blogPosts).values(blogPosts.map((p) => ({ ...p, isPublished: true })));
    done.push(`${blogPosts.length} blog posts`);
  }
  if (await isEmpty(schema.legalPages)) {
    const { legalPages } = await import("../src/data/legal");
    await db.insert(schema.legalPages).values(legalPages);
    done.push(`${legalPages.length} legal pages`);
  }
  if (await isEmpty(schema.settings)) {
    const { defaultSiteSettings } = await import("../src/lib/site");
    await db.insert(schema.settings).values({ key: "site", value: defaultSiteSettings() });
    done.push("settings (from .env)");
  }
  console.log(done.length ? `✓ Content added: ${done.join(", ")}` : "✓ Content already in the database (left unchanged)");
}

main().catch((err) => {
  console.error("✗", err instanceof Error ? err.message : err);
  process.exit(1);
});
