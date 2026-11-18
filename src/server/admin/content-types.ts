// Shapes shared by the content editors (client) and their server actions. No server code here.

import type { FAQ, IconName } from "@/types/catalog";
import type { BlogBlock, LegalSection, SiteSettings } from "@/types/content";

export type ContentResult = { ok?: boolean; error?: string; message?: string; id?: string };

export interface DealInput {
  id?: string;
  productId: string;
  planSlug: string;
  discountPercent: number;
  /** ISO time */
  endsAt: string;
  label: string;
}

export interface ReviewInput {
  id?: string;
  productId: string;
  name: string;
  city: string;
  rating: number;
  comment: string;
  /** YYYY-MM-DD */
  date: string;
  verified: boolean;
  isVisible: boolean;
}

export interface SupportTopicInput {
  /** existing topic slug, empty for a new topic */
  slug: string;
  name: string;
  icon: IconName;
  faqs: FAQ[];
}

export interface BlogPostInput {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readMinutes: number;
  productSlug: string;
  body: BlogBlock[];
  isPublished: boolean;
}

export interface LegalPageInput {
  slug: string;
  title: string;
  description: string;
  sections: LegalSection[];
}

export type SettingsInput = SiteSettings;

/** "home" or a section slug */
export type FaqScope = string;
