import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import type { Domain } from "@/types/catalog";
import { SectionHeading } from "./section-heading";

/** The non-gaming sections (AI tools, gift cards, software…), kept small at the bottom of the gaming-first home page. */
export function MoreFromTopx({ domains }: { domains: Domain[] }) {
  if (!domains.length) return null;
  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
      <SectionHeading eyebrow="Beyond gaming" title="More from TOPX" description="Gift cards, AI tools, software and subscriptions — paid in rupees too." className="mb-6" />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {domains.map((d) => (
          <li key={d.slug}>
            <Link
              href={`/${d.slug}`}
              className="group flex h-full items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover"
            >
              <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${d.gradient} text-white`}>
                <Icon name={d.icon} className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{d.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{d.tagline}</span>
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
