// Content source for the static cPanel build only (see next.config.ts → resolveAlias).
// `npm run build:cpanel` first saves the database content to content-snapshot.json.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Content } from "./read";

export const CONTENT_TAG = "content";
export type { Content };

let cached: Content | null = null;

export async function loadContent(): Promise<Content> {
  cached ??= JSON.parse(readFileSync(join(process.cwd(), "src", "server", "content", "content-snapshot.json"), "utf8")) as Content;
  return cached;
}
