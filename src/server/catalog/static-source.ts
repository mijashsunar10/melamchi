// Catalog source for the static cPanel build only (see next.config.ts → resolveAlias).
// `npm run build:cpanel` first saves the database catalog to catalog-snapshot.json,
// then the static pages are built from that file (no database or server on the host).

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Domain, Product } from "@/types/catalog";

export const CATALOG_TAG = "catalog";

export interface Catalog {
  domains: Domain[];
  products: Product[];
}

let cached: Catalog | null = null;

export async function loadCatalog(): Promise<Catalog> {
  cached ??= JSON.parse(readFileSync(join(process.cwd(), "src", "server", "catalog", "catalog-snapshot.json"), "utf8")) as Catalog;
  return cached;
}
