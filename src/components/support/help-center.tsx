"use client";

import { Search, SearchX } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import { cn } from "@/lib/cn";
import type { FAQ } from "@/types/catalog";

export interface HelpTopic {
  slug: string;
  name: string;
  icon: ReactNode;
  faqs: FAQ[];
}

/** Searchable FAQ grouped by topic. */
export function HelpCenter({ topics }: { topics: HelpTopic[] }) {
  const [topic, setTopic] = useState(topics[0]?.slug ?? "");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (q) {
      return topics.flatMap((t) =>
        t.faqs.filter((f) => `${f.q} ${f.a}`.toLowerCase().includes(q)).map((f) => ({ ...f, topic: t.name })),
      );
    }
    return (topics.find((t) => t.slug === topic)?.faqs ?? []).map((f) => ({ ...f, topic: "" }));
  }, [q, topic, topics]);

  return (
    <div className="flex flex-col gap-6">
      <label className="relative block max-w-xl">
        <span className="sr-only">Search help articles</span>
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search: payment, Player ID, refund…"
          className="h-12 w-full rounded-xl border border-input bg-surface pr-4 pl-12 text-sm shadow-card outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/20"
        />
      </label>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* topics */}
        <div role="tablist" aria-label="Help topics" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
          {topics.map((t) => {
            const selected = !q && t.slug === topic;
            return (
              <button
                key={t.slug}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  setTopic(t.slug);
                  setQuery("");
                }}
                className={cn(
                  "flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all [&_svg]:size-5",
                  selected
                    ? "bg-primary text-primary-foreground shadow-[0_8px_20px_-8px_rgba(29,63,191,0.6)]"
                    : "bg-surface text-foreground/80 ring-1 ring-border hover:text-primary hover:ring-primary/30",
                )}
              >
                {t.icon}
                <span className="flex-1 whitespace-nowrap">{t.name}</span>
                <span className={cn("hidden text-xs lg:inline", selected ? "text-white/70" : "text-muted-foreground")}>
                  {t.faqs.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* answers */}
        <div className="min-w-0">
          {q && (
            <p className="mb-3 text-sm text-muted-foreground">
              {results.length} result{results.length === 1 ? "" : "s"} for “{query.trim()}”
            </p>
          )}
          {results.length ? (
            <Accordion
              key={q || topic}
              name="help"
              className="animate-fade-up"
              items={results.map((r) => ({
                q: (
                  <span className="flex flex-col gap-0.5">
                    {r.topic && <span className="text-[11px] font-semibold tracking-wide text-primary uppercase">{r.topic}</span>}
                    {r.q}
                  </span>
                ),
                a: r.a,
              }))}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-14 text-center text-muted-foreground">
              <SearchX className="size-9" />
              <p>No answers found. Send us a message below — we reply in minutes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
