// Data-access layer for site content (stats, FAQ). Same rule as catalog.ts:
// components never import from src/data directly — swap these bodies for
// API / database calls when the backend is ready.

import { blogPosts } from "@/data/blog";
import { homeFaq } from "@/data/faq";
import { accountFaq, codeFaq, licenseFaq, topupFaq } from "@/data/fields";
import { legalPages } from "@/data/legal";
import { siteStats } from "@/data/site-stats";
import { supportTopics } from "@/data/support";
import type { DomainSlug, FAQ } from "@/types/catalog";
import type { BlogPost, LegalPage, SiteStats, SupportTopic } from "@/types/content";

export async function getSiteStats(): Promise<SiteStats> {
  return siteStats;
}

export async function getHomeFaq(): Promise<FAQ[]> {
  return homeFaq;
}

export async function getSupportTopics(): Promise<SupportTopic[]> {
  return supportTopics;
}

export async function getLegalPage(slug: LegalPage["slug"]): Promise<LegalPage> {
  const page = legalPages.find((p) => p.slug === slug);
  if (!page) throw new Error(`Unknown legal page: ${slug}`);
  return page;
}

export async function getLegalPages(): Promise<Pick<LegalPage, "slug" | "title">[]> {
  return legalPages.map(({ slug, title }) => ({ slug, title }));
}

/** FAQ shown on a section page (later editable per section in the admin panel). */
export async function getDomainFaq(slug: DomainSlug): Promise<FAQ[]> {
  const bySlug: Partial<Record<DomainSlug, FAQ[]>> = {
    "ai-tools": accountFaq,
    gaming: topupFaq,
    "gift-cards": codeFaq,
    software: licenseFaq,
    "digital-products": accountFaq,
  };
  return bySlug[slug] ?? [];
}

/** Blog posts, newest first. */
export async function getBlogPosts(): Promise<BlogPost[]> {
  return [...blogPosts].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  return blogPosts.find((p) => p.slug === slug);
}
