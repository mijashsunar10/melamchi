"use client";

import { ArrowDownUp, PackageSearch } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { productGridClass } from "@/components/product/grid";
import { cn } from "@/lib/cn";

export interface CatalogItem {
  slug: string;
  category: string;
  price: number | null;
  rating: number;
  sold: number;
  /** pre-rendered product card */
  card: ReactNode;
}

const sorts = {
  popular: { label: "Most popular", fn: (a: CatalogItem, b: CatalogItem) => b.sold - a.sold },
  priceAsc: { label: "Price: low to high", fn: (a: CatalogItem, b: CatalogItem) => (a.price ?? Infinity) - (b.price ?? Infinity) },
  priceDesc: { label: "Price: high to low", fn: (a: CatalogItem, b: CatalogItem) => (b.price ?? 0) - (a.price ?? 0) },
  rating: { label: "Top rated", fn: (a: CatalogItem, b: CatalogItem) => b.rating - a.rating },
} as const;

type SortKey = keyof typeof sorts;

/** Category chips + sort + product grid for a section page. */
export function DomainCatalog({
  categories,
  items,
}: {
  categories: { slug: string; name: string; icon: ReactNode }[];
  items: CatalogItem[];
}) {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortKey>("popular");

  const visible = useMemo(
    () => items.filter((i) => category === "all" || i.category === category).sort(sorts[sort].fn),
    [items, category, sort],
  );

  const count = (slug: string) => items.filter((i) => i.category === slug).length;
  const chips = [{ slug: "all", name: "All", icon: null }, ...categories.filter((c) => count(c.slug) > 0)];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Categories" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {chips.map((c) => {
            const selected = c.slug === category;
            return (
              <button
                key={c.slug}
                role="tab"
                type="button"
                aria-selected={selected}
                onClick={() => setCategory(c.slug)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all [&_svg]:size-4",
                  selected
                    ? "bg-primary text-primary-foreground shadow-[0_8px_20px_-6px_rgba(29,63,191,0.6)]"
                    : "bg-surface text-muted-foreground ring-1 ring-border hover:text-foreground hover:ring-primary/30",
                )}
              >
                {c.icon}
                {c.name}
                <span className={cn("text-xs", selected ? "text-white/70" : "text-muted-foreground/70")}>
                  {c.slug === "all" ? items.length : count(c.slug)}
                </span>
              </button>
            );
          })}
        </div>

        <label className="flex shrink-0 items-center gap-2 self-start rounded-full bg-surface py-1 pr-1 pl-4 text-sm ring-1 ring-border lg:self-auto">
          <ArrowDownUp className="size-4 text-muted-foreground" />
          <span className="sr-only">Sort by</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="cursor-pointer rounded-full bg-transparent py-1.5 pr-3 font-semibold outline-none"
          >
            {Object.entries(sorts).map(([key, s]) => (
              <option key={key} value={key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length ? (
        <div key={category} className={`animate-fade-up ${productGridClass}`}>
          {visible.map((i) => (
            <div key={i.slug} className="flex [&>*]:flex-1">
              {i.card}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <PackageSearch className="size-10" />
          <p>No products in this category yet.</p>
        </div>
      )}
    </div>
  );
}
