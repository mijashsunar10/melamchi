import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { ProductCard } from "@/components/product/product-card";
import { SearchCatalog } from "@/components/search/search-catalog";
import { getDomains, getProducts, startingPrice } from "@/lib/catalog";
import { toSearchEntry } from "@/lib/search";

export const metadata: Metadata = {
  title: "Search all products",
  description: "Search game top-ups, gift cards, AI tools, software licences and digital subscriptions available in Nepal.",
};

export default async function ProductsPage() {
  const [products, domains] = await Promise.all([getProducts(), getDomains()]);
  const domainBySlug = new Map(domains.map((d) => [d.slug, d]));
  // the first row shown (most popular) loads its images immediately
  const firstRow = new Set([...products].sort((a, b) => b.sold - a.sold).slice(0, 4).map((p) => p.slug));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-20 sm:px-6 sm:pt-8 sm:pb-28">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground" aria-current="page">
          Search
        </span>
      </nav>
      <h1 className="mt-4 mb-6 font-display text-3xl leading-tight font-black italic sm:text-4xl">Find what you need</h1>

      <SearchCatalog
        domains={domains.map((d) => ({ slug: d.slug, name: d.name, icon: <Icon name={d.icon} /> }))}
        items={products.map((p) => ({
          ...toSearchEntry(p, domainBySlug.get(p.domain), startingPrice(p)),
          card: <ProductCard product={p} eager={firstRow.has(p.slug)} />,
        }))}
      />
    </div>
  );
}
