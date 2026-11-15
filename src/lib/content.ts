// Data-access layer for site content (stats, FAQ). Same rule as catalog.ts:
// components never import from src/data directly — swap these bodies for
// API / database calls when the backend is ready.

import { homeFaq } from "@/data/faq";
import { siteStats } from "@/data/site-stats";
import { supportTopics } from "@/data/support";
import type { FAQ } from "@/types/catalog";
import type { SiteStats, SupportTopic } from "@/types/content";

export async function getSiteStats(): Promise<SiteStats> {
  return siteStats;
}

export async function getHomeFaq(): Promise<FAQ[]> {
  return homeFaq;
}

export async function getSupportTopics(): Promise<SupportTopic[]> {
  return supportTopics;
}
