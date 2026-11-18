import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { mergeSettings } from "@/server/content/read";
import { db, schema } from "@/server/db";

// Admin queries for deals, reviews, FAQ, help topics, blog, legal pages and settings (B5).

const { deals, reviews, products, plans, domains, faqs, supportTopics, blogPosts, legalPages, settings } = schema;

/** Products with their packages — for the product / package pickers. Includes hidden products (marked). */
export async function listProductOptions() {
  const [productRows, planRows, domainRows] = await Promise.all([
    db
      .select({ id: products.id, slug: products.slug, name: products.name, domainSlug: products.domainSlug, isActive: products.isActive })
      .from(products)
      .orderBy(asc(products.name)),
    db.select({ productId: plans.productId, slug: plans.slug, name: plans.name, price: plans.price }).from(plans).orderBy(asc(plans.sortOrder)),
    db.select({ slug: domains.slug, name: domains.name }).from(domains),
  ]);
  const domainName = new Map(domainRows.map((d) => [d.slug, d.name]));
  const plansBy = Map.groupBy(planRows, (p) => p.productId);
  return productRows.map((p) => ({
    ...p,
    domainName: domainName.get(p.domainSlug) ?? p.domainSlug,
    plans: (plansBy.get(p.id) ?? []).map(({ slug, name, price }) => ({ slug, name, price })),
  }));
}
export type ProductOption = Awaited<ReturnType<typeof listProductOptions>>[number];

export async function listAdminDeals() {
  const rows = await db
    .select({
      d: deals,
      productName: products.name,
      productSlug: products.slug,
      productActive: products.isActive,
      image: products.imageUrl,
      color: products.color,
    })
    .from(deals)
    .innerJoin(products, eq(products.id, deals.productId))
    .orderBy(desc(deals.endsAt));
  const planRows = await db.select({ productId: plans.productId, slug: plans.slug, name: plans.name, price: plans.price }).from(plans);
  const plan = new Map(planRows.map((p) => [`${p.productId}/${p.slug}`, p]));
  return rows.map(({ d, ...p }) => {
    const pl = plan.get(`${d.productId}/${d.planSlug}`);
    return {
      id: d.id,
      productId: d.productId,
      planSlug: d.planSlug,
      discountPercent: d.discountPercent,
      endsAt: d.endsAt.toISOString(),
      ended: d.endsAt.getTime() <= Date.now(),
      label: d.label ?? "",
      ...p,
      planName: pl?.name ?? null,
      planPrice: pl?.price ?? null,
    };
  });
}
export type AdminDeal = Awaited<ReturnType<typeof listAdminDeals>>[number];

export async function listAdminReviews() {
  const rows = await db
    .select({ r: reviews, productName: products.name, productSlug: products.slug })
    .from(reviews)
    .innerJoin(products, eq(products.id, reviews.productId))
    .orderBy(desc(reviews.date), desc(reviews.createdAt));
  return rows.map(({ r, productName, productSlug }) => ({
    id: r.id,
    productId: r.productId,
    productName,
    productSlug,
    name: r.name,
    city: r.city,
    rating: r.rating,
    comment: r.comment,
    date: r.date,
    verified: r.verified,
    isVisible: r.isVisible,
  }));
}
export type AdminReview = Awaited<ReturnType<typeof listAdminReviews>>[number];

/** FAQ lists by scope ("home" or a section slug). */
export async function listFaqsByScope() {
  const rows = await db.select().from(faqs).orderBy(asc(faqs.sortOrder));
  const out: Record<string, { q: string; a: string }[]> = {};
  for (const f of rows) (out[f.scope] ??= []).push({ q: f.q, a: f.a });
  return out;
}

export async function listSectionNames() {
  return db.select({ slug: domains.slug, name: domains.name }).from(domains).orderBy(asc(domains.sortOrder));
}

export async function listAdminSupportTopics() {
  return db.select().from(supportTopics).orderBy(asc(supportTopics.sortOrder));
}

export async function listAdminBlogPosts() {
  return db
    .select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      category: blogPosts.category,
      date: blogPosts.date,
      productSlug: blogPosts.productSlug,
      isPublished: blogPosts.isPublished,
    })
    .from(blogPosts)
    .orderBy(desc(blogPosts.date));
}

export async function getAdminBlogPost(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return undefined;
  const [p] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  return p;
}

export async function listAdminLegalPages() {
  return db.select({ slug: legalPages.slug, title: legalPages.title, updated: legalPages.updated }).from(legalPages).orderBy(asc(legalPages.slug));
}

export async function getAdminLegalPage(slug: string) {
  const [p] = await db.select().from(legalPages).where(eq(legalPages.slug, slug)).limit(1);
  return p;
}

export async function getAdminSettings() {
  const [row] = await db.select().from(settings).where(eq(settings.key, "site")).limit(1);
  return mergeSettings(row?.value);
}

/** Small numbers for the Content overview page. */
export async function contentCounts() {
  const [f, t, b, l] = await Promise.all([
    db.select({ scope: faqs.scope }).from(faqs),
    db.select({ id: supportTopics.id }).from(supportTopics),
    db.select({ p: blogPosts.isPublished }).from(blogPosts),
    db.select({ s: legalPages.slug }).from(legalPages),
  ]);
  return {
    homeFaq: f.filter((x) => x.scope === "home").length,
    sectionFaq: f.filter((x) => x.scope !== "home").length,
    topics: t.length,
    posts: b.length,
    published: b.filter((x) => x.p).length,
    legal: l.length,
  };
}
