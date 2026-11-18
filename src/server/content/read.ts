// Reads all store content (deals, reviews, FAQ, help topics, blog, legal pages, settings) from PostgreSQL.
// No Next.js imports here: used by the cached loader (source.ts) and by scripts/export-catalog.ts.

import { and, asc, desc, eq, gt } from "drizzle-orm";
import { defaultSiteSettings } from "@/lib/site";
import { db, schema } from "@/server/db";
import type { Deal, FAQ, Review } from "@/types/catalog";
import type { BlogPost, LegalPage, SiteSettings, SupportTopic } from "@/types/content";

export interface Content {
  /** active deals only (not ended, product on the website) */
  deals: Deal[];
  /** visible reviews only, newest first */
  reviews: Review[];
  homeFaq: FAQ[];
  /** section slug → FAQ */
  domainFaq: Record<string, FAQ[]>;
  supportTopics: SupportTopic[];
  /** published posts only, newest first */
  blogPosts: BlogPost[];
  legalPages: LegalPage[];
  settings: SiteSettings;
  /** ISO time of the next deal to end (so the cache can refresh then) */
  nextDealEnd: string | null;
}

/** Saved settings merged over the starting values, so newly added fields always have a value. */
export function mergeSettings(saved: Partial<SiteSettings> | undefined): SiteSettings {
  const d = defaultSiteSettings();
  if (!saved) return d;
  const savedMethods = new Map((saved.paymentMethods ?? []).map((m) => [m.id, m]));
  return {
    contact: { ...d.contact, ...saved.contact },
    social: { ...d.social, ...saved.social },
    stats: { ...d.stats, ...saved.stats },
    paymentMethods: d.paymentMethods.map((m) => ({ ...m, ...savedMethods.get(m.id) })),
  };
}

export async function readContent(now = new Date()): Promise<Content> {
  const { deals, reviews, products, faqs, supportTopics, blogPosts, legalPages, settings } = schema;
  const [dealRows, reviewRows, faqRows, topicRows, postRows, legalRows, settingRows] = await Promise.all([
    db
      .select({ d: deals, productSlug: products.slug })
      .from(deals)
      .innerJoin(products, eq(products.id, deals.productId))
      .where(and(gt(deals.endsAt, now), eq(products.isActive, true)))
      .orderBy(asc(deals.endsAt)),
    db
      .select({ r: reviews, productSlug: products.slug })
      .from(reviews)
      .innerJoin(products, eq(products.id, reviews.productId))
      .where(eq(reviews.isVisible, true))
      .orderBy(desc(reviews.date), desc(reviews.createdAt)),
    db.select().from(faqs).orderBy(asc(faqs.sortOrder)),
    db.select().from(supportTopics).orderBy(asc(supportTopics.sortOrder)),
    db.select().from(blogPosts).where(eq(blogPosts.isPublished, true)).orderBy(desc(blogPosts.date)),
    db.select().from(legalPages),
    db.select().from(settings).where(eq(settings.key, "site")).limit(1),
  ]);

  const domainFaq: Record<string, FAQ[]> = {};
  for (const f of faqRows) if (f.scope !== "home") (domainFaq[f.scope] ??= []).push({ q: f.q, a: f.a });

  return {
    deals: dealRows.map(({ d, productSlug }) => ({
      productSlug,
      planId: d.planSlug,
      discountPercent: d.discountPercent,
      endsAt: d.endsAt.toISOString(),
      ...(d.label && { label: d.label }),
    })),
    reviews: reviewRows.map(({ r, productSlug }) => ({
      id: r.id,
      productSlug,
      name: r.name,
      city: r.city,
      rating: r.rating,
      comment: r.comment,
      date: r.date,
      verified: r.verified,
    })),
    homeFaq: faqRows.filter((f) => f.scope === "home").map((f) => ({ q: f.q, a: f.a })),
    domainFaq,
    supportTopics: topicRows.map((t) => ({ slug: t.slug, name: t.name, icon: t.icon, faqs: t.faqs })),
    blogPosts: postRows.map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      category: p.category,
      date: p.date,
      readMinutes: p.readMinutes,
      productSlug: p.productSlug,
      body: p.body,
    })),
    legalPages: legalRows.map((l) => ({
      slug: l.slug as LegalPage["slug"],
      title: l.title,
      description: l.description,
      updated: l.updated,
      sections: l.sections,
    })),
    settings: mergeSettings(settingRows[0]?.value),
    nextDealEnd: dealRows[0]?.d.endsAt.toISOString() ?? null,
  };
}
