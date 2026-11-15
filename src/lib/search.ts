// Product search — pure functions shared by the search page and the data layer.
// BACKEND: these can stay as-is (search in the browser over the product list), or
// `searchProducts()` in catalog.ts can call GET /api/search?q=… using the same scoring.

import type { Domain, Product } from "@/types/catalog";

/** Short forms and common spellings people type → words found in product data. */
const ALIASES: Record<string, string> = {
  ff: "free fire",
  freefire: "free fire",
  dimond: "diamond",
  dimonds: "diamonds",
  uc: "pubg uc",
  pubgm: "pubg",
  bgmi: "pubg",
  mlbb: "mobile legends",
  ml: "mobile legends",
  cod: "call of duty",
  codm: "call of duty",
  gpt: "chatgpt",
  chatgpt: "chatgpt openai",
  openai: "chatgpt",
  gemini: "gemini google ai",
  yt: "youtube",
  netflx: "netflix",
  spotfy: "spotify",
  win: "windows",
  win11: "windows 11",
  ms: "microsoft",
  office: "office microsoft 365",
  antivirus: "kaspersky security",
  vpn: "nordvpn",
  psn: "playstation",
  ps: "playstation",
  itunes: "apple",
  "google play": "google play",
  playstore: "google play",
  steam: "steam",
  hotstar: "jiohotstar",
};

export interface SearchEntry {
  slug: string;
  domain: string;
  name: string;
  /** lower-cased text that is searched */
  text: string;
  sold: number;
  price: number | null;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Build the searchable entry for a product (done once, on the server). */
export function toSearchEntry(product: Product, domain: Domain | undefined, price: number | null): SearchEntry {
  const category = domain?.categories.find((c) => c.slug === product.category)?.name ?? "";
  const text = norm(
    [
      product.name,
      product.brand,
      domain?.name,
      category,
      product.region,
      product.tags.join(" "),
      product.plans.map((p) => p.name).join(" "),
      product.shortDescription,
    ].join(" "),
  );
  return { slug: product.slug, domain: product.domain, name: norm(product.name), text, sold: product.sold, price };
}

/** Expand a query with aliases and split into words. */
export function queryTokens(query: string): string[] {
  const q = norm(query);
  if (!q) return [];
  const expanded = ALIASES[q] ? `${q} ${ALIASES[q]}` : q;
  return [...new Set(expanded.split(" ").flatMap((w) => [w, ...(ALIASES[w]?.split(" ") ?? [])]))];
}

/**
 * Relevance score; 0 = no match.
 * Every word the user typed must match (directly or via an alias) somewhere in the product.
 */
export function scoreEntry(entry: SearchEntry, query: string): number {
  const q = norm(query);
  if (!q) return 1;
  const words = q.split(" ");
  let score = 0;
  for (const w of words) {
    const options = [w, ...(ALIASES[w]?.split(" ") ?? [])];
    const hit = options.some((o) => entry.text.includes(o));
    if (!hit) return 0;
    if (options.some((o) => entry.name.startsWith(o))) score += 40;
    else if (options.some((o) => new RegExp(`\\b${o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(entry.name))) score += 25;
    else if (options.some((o) => entry.name.includes(o))) score += 15;
    else score += 5;
  }
  if (ALIASES[q] && entry.name.includes(ALIASES[q].split(" ")[0])) score += 30;
  if (entry.name === q) score += 50;
  return score + Math.log10(entry.sold + 10); // popularity as a tie-breaker
}

export const POPULAR_SEARCHES = ["Free Fire", "PUBG UC", "ChatGPT", "Netflix", "Google Play", "Windows 11", "Canva", "Spotify"];
