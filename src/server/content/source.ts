import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { type Content, readContent } from "./read";

// Store content from PostgreSQL, cached by Next.js (same idea as src/server/catalog/source.ts).
// Admin changes call `updateTag(CONTENT_TAG)` so the website updates immediately.
// `npm run db:seed` can't clear the cache: new starter content shows within the cache life.
// The cache also refreshes by itself when the next deal ends, so ended deals disappear.

export const CONTENT_TAG = "content";
export type { Content };

export async function loadContent(): Promise<Content> {
  "use cache";
  cacheTag(CONTENT_TAG);
  const content = await readContent();
  const untilDealEnds = content.nextDealEnd ? Math.ceil((Date.parse(content.nextDealEnd) - Date.now()) / 1000) : Infinity;
  const revalidate = Math.max(60, Math.min(3600, untilDealEnds));
  cacheLife({ stale: 60, revalidate, expire: Math.max(revalidate * 2, 86400) });
  return content;
}
