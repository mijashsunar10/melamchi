import type { FAQ, IconName } from "./catalog";

// Site-wide content the backend / admin panel will manage.

export interface SiteStats {
  ordersDelivered: number; // e.g. 50000 → "50,000+"
  avgDeliverySeconds: number; // e.g. 12 → "12 sec"
  rating: number; // average review rating, 0–5
  reviewCount: number; // number of verified reviews
}

/** A help-center topic with its questions. */
export interface SupportTopic {
  slug: string;
  name: string;
  icon: IconName;
  faqs: FAQ[];
}

/** Refund / Privacy / Terms pages. */
export interface LegalSection {
  id: string;
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalPage {
  slug: "refund-policy" | "privacy-policy" | "terms";
  title: string;
  description: string;
  updated: string; // ISO date
  sections: LegalSection[];
}

/** A block of article content (kept simple so an admin editor / CMS can produce it). */
export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "steps"; items: string[] }
  | { type: "tip"; text: string };

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string; // ISO
  readMinutes: number;
  /** product shown as "Buy it here"; its cover photo is used as the article image */
  productSlug: string;
  body: BlogBlock[];
}
