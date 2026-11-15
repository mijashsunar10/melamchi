"use client";

import { ArrowDownUp, MessageCircle, Search, SearchX, X } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { POPULAR_SEARCHES, type SearchEntry, scoreEntry } from "@/lib/search";
import { whatsappLink } from "@/lib/site";

export interface SearchItem extends SearchEntry {
  /** pre-rendered product card */
  card: ReactNode;
}

const sorts = {
  relevance: "Best match",
  popular: "Most popular",
  priceAsc: "Price: low to high",
  priceDesc: "Price: high to low",
} as const;
type SortKey = keyof typeof sorts;

/** Reads ?q= and ?domain= from the URL (client only — keeps the page static & fast). */
function readParams() {
  const p = new URLSearchParams(window.location.search);
  return { q: p.get("q") ?? "", domain: p.get("domain") ?? "all" };
}

export function SearchCatalog({
  items,
  domains,
}: {
  items: SearchItem[];
  domains: { slug: string; name: string; icon: ReactNode }[];
}) {
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("all");
  const [sort, setSort] = useState<SortKey>("relevance");
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial state from the URL, and keep it in sync with back/forward
  useEffect(() => {
    const apply = () => {
      const { q, domain: d } = readParams();
      setQuery(q);
      setDomain(d);
      setReady(true);
    };
    apply();
    inputRef.current?.focus();
    window.addEventListener("popstate", apply);
    return () => window.removeEventListener("popstate", apply);
  }, []);

  // Write state back to the URL (shareable links), without a navigation
  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => {
      const p = new URLSearchParams();
      if (query.trim()) p.set("q", query.trim());
      if (domain !== "all") p.set("domain", domain);
      const next = `${window.location.pathname}${p.size ? `?${p}` : ""}`;
      if (next !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(null, "", next);
    }, 250);
    return () => clearTimeout(id);
  }, [query, domain, ready]);

  // "/" focuses search, Esc clears it
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const matched = useMemo(() => {
    return items
      .map((item) => ({ item, score: scoreEntry(item, query) }))
      .filter((r) => r.score > 0);
  }, [items, query]);

  const results = useMemo(() => {
    const list = matched.filter((r) => domain === "all" || r.item.domain === domain);
    const effectiveSort = sort === "relevance" && !query.trim() ? "popular" : sort;
    return list.sort((a, b) => {
      switch (effectiveSort) {
        case "popular":
          return b.item.sold - a.item.sold;
        case "priceAsc":
          return (a.item.price ?? Infinity) - (b.item.price ?? Infinity);
        case "priceDesc":
          return (b.item.price ?? 0) - (a.item.price ?? 0);
        default:
          return b.score - a.score;
      }
    });
  }, [matched, domain, sort, query]);

  const countFor = (slug: string) => matched.filter((r) => r.item.domain === slug).length;
  const q = query.trim();

  return (
    <div className="flex flex-col gap-6">
      {/* Search box */}
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          inputRef.current?.blur();
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setQuery("")}
          placeholder="Search games, gift cards, AI tools, software…"
          aria-label="Search products"
          autoComplete="off"
          enterKeyHint="search"
          className="h-14 w-full rounded-2xl border border-input bg-surface pr-14 pl-14 text-base shadow-card outline-none transition-colors focus:border-ring focus:ring-4 focus:ring-ring/15 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute top-1/2 right-4 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </form>

      {/* Popular searches */}
      {!q && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Popular:</span>
          {POPULAR_SEARCHES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQuery(s)}
              className="rounded-full bg-surface px-3 py-1.5 font-medium ring-1 ring-border transition-colors hover:text-primary hover:ring-primary/30"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Section filter + sort */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Filter by section" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {[{ slug: "all", name: "All", icon: null }, ...domains].map((d) => {
            const selected = d.slug === domain;
            const count = d.slug === "all" ? matched.length : countFor(d.slug);
            return (
              <button
                key={d.slug}
                role="tab"
                type="button"
                aria-selected={selected}
                onClick={() => setDomain(d.slug)}
                disabled={count === 0 && !selected}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-40 [&_svg]:size-4",
                  selected
                    ? "bg-primary text-primary-foreground shadow-[0_8px_20px_-6px_rgba(29,63,191,0.6)]"
                    : "bg-surface text-muted-foreground ring-1 ring-border hover:text-foreground hover:ring-primary/30",
                )}
              >
                {d.icon}
                {d.name}
                <span className={cn("text-xs", selected ? "text-white/70" : "text-muted-foreground/70")}>{ready ? count : "–"}</span>
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
            {Object.entries(sorts).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Results */}
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {ready &&
          (q
            ? `${results.length} result${results.length === 1 ? "" : "s"} for “${q}”`
            : `${results.length} products`)}
      </p>

      {!ready ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : results.length ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {results.map(({ item }) => (
            <div key={item.slug} className="flex [&>*]:flex-1">
              {item.card}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border px-6 py-14 text-center">
          <SearchX className="size-10 text-muted-foreground" />
          <div>
            <p className="text-lg font-bold">No results for “{q}”</p>
            <p className="mt-1 text-sm text-muted-foreground">Check the spelling, try a shorter word — or ask us, we may still have it.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {POPULAR_SEARCHES.slice(0, 5).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setQuery(s);
                  setDomain("all");
                }}
                className="rounded-full bg-surface px-3 py-1.5 text-sm font-medium ring-1 ring-border hover:text-primary"
              >
                {s}
              </button>
            ))}
          </div>
          <a
            href={whatsappLink(`Hi TOPX Nepal, do you have "${q}"?`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white"
          >
            <MessageCircle className="size-4" /> Ask us on WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
