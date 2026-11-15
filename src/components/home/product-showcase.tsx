import { ArrowRight, ArrowUpRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export interface ShowcaseLink {
  href: string;
  label: string;
  icon: ReactNode;
}

/**
 * "Popular right now": the Trending grid plus chips that jump to each section page.
 * Only one grid is rendered (instead of a hidden grid per tab) to keep the home page light.
 */
export function ProductShowcase({ links, children }: { links: ShowcaseLink[]; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Browse categories" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <span className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_8px_20px_-6px_rgba(29,63,191,0.6)] [&_svg]:size-4">
          <TrendingUp /> Trending
        </span>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="group flex shrink-0 items-center gap-2 rounded-full bg-surface px-4 py-2.5 text-sm font-semibold text-muted-foreground ring-1 ring-border transition-all hover:text-primary hover:ring-primary/30 [&_svg]:size-4"
          >
            {l.icon}
            {l.label}
            <ArrowUpRight className="opacity-50 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
          </Link>
        ))}
      </nav>

      <div className="animate-fade-up">{children}</div>

      <Link
        href="/products"
        className="mx-auto flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-bold text-primary shadow-card transition-all hover:border-primary/40 hover:shadow-card-hover"
      >
        See all products <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
