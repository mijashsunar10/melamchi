// Data-access layer for site content. Same rule as catalog.ts: components never import
// src/data directly. Everything here comes from PostgreSQL (edited in the admin panel),
// cached — see src/server/content/source.ts.

import { notFound } from "next/navigation";
import { setWhatsappNumber, whatsappLink } from "@/lib/site";
import { loadContent } from "@/server/content/source";
import type { DomainSlug, FAQ } from "@/types/catalog";
import type { BlogPost, LegalPage, SiteSettings, SiteStats, SupportTopic } from "@/types/content";

/** Contact details, social links, stats and payment methods from the admin Settings page. */
export async function getSiteSettings(): Promise<SiteSettings> {
  const { settings } = await loadContent();
  setWhatsappNumber(settings.contact.whatsappNumber); // so whatsappLink() uses the saved number
  return settings;
}

export async function getSiteStats(): Promise<SiteStats> {
  return (await getSiteSettings()).stats;
}

export async function getHomeFaq(): Promise<FAQ[]> {
  return (await loadContent()).homeFaq;
}

export async function getSupportTopics(): Promise<SupportTopic[]> {
  return (await loadContent()).supportTopics;
}

export async function getLegalPage(slug: LegalPage["slug"]): Promise<LegalPage> {
  const page = (await loadContent()).legalPages.find((p) => p.slug === slug);
  if (!page) notFound(); // not in the database yet → run `npm run db:seed`
  return page;
}

export async function getLegalPages(): Promise<Pick<LegalPage, "slug" | "title">[]> {
  return (await loadContent()).legalPages.map(({ slug, title }) => ({ slug, title }));
}

/** FAQ shown on a section page. */
export async function getDomainFaq(slug: DomainSlug): Promise<FAQ[]> {
  return (await loadContent()).domainFaq[slug] ?? [];
}

/** Published blog posts, newest first. */
export async function getBlogPosts(): Promise<BlogPost[]> {
  return (await loadContent()).blogPosts;
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  return (await loadContent()).blogPosts.find((p) => p.slug === slug);
}

/** Contact details + a ready WhatsApp link, and social links — for server components. */
export async function getContact() {
  const { contact, social } = await getSiteSettings();
  return { contact: { ...contact, whatsapp: whatsappLink(undefined, contact.whatsappNumber) }, social };
}
