import { CheckCircle2, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { formatNPR } from "@/lib/format";
import { domainImages } from "@/lib/images";
import type { Domain } from "@/types/catalog";

export function DomainHero({
  domain,
  productCount,
  fromPrice,
}: {
  domain: Domain;
  productCount: number;
  fromPrice: number | null;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-background text-foreground dark:bg-brand-navy-deep dark:text-white">
      <Image
        src={domainImages[domain.slug]}
        alt=""
        placeholder="blur"
        priority
        sizes="100vw"
        className="absolute inset-0 -z-20 size-full object-cover object-center dark:opacity-90"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/90 to-background/25 dark:from-brand-navy-deep dark:via-brand-navy-deep/85 dark:to-brand-navy-deep/30" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-background to-transparent dark:from-brand-navy-deep/60" />

      <div className="mx-auto max-w-7xl px-4 pt-8 pb-14 sm:px-6 sm:pt-10 sm:pb-20">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground dark:text-white/60">
          <Link href="/" className="transition-colors hover:text-foreground dark:hover:text-white">
            Home
          </Link>
          <ChevronRight className="size-4" />
          <span className="text-foreground dark:text-white" aria-current="page">
            {domain.name}
          </span>
        </nav>

        <div className="mt-8 flex max-w-2xl animate-fade-up flex-col gap-5">
          <span className={`flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${domain.gradient} text-white shadow-lg`}>
            <Icon name={domain.icon} className="size-7" />
          </span>
          <h1 className="font-display text-4xl leading-tight font-black italic sm:text-5xl lg:text-6xl">{domain.name}</h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg dark:text-white/70">{domain.description}</p>

          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground/80 dark:text-white/80">
            {domain.highlights.map((h) => (
              <li key={h} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-accent dark:text-brand-orange-400" /> {h}
              </li>
            ))}
          </ul>

          <div className="mt-2 flex flex-wrap gap-3">
            <span className="rounded-full border border-border bg-surface/80 px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur dark:border-white/15 dark:bg-white/10 dark:shadow-none">
              {productCount} products
            </span>
            {fromPrice !== null && (
              <span className="rounded-full border border-border bg-surface/80 px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur dark:border-white/15 dark:bg-white/10 dark:shadow-none">
                From <span className="text-accent dark:text-brand-orange-400">{formatNPR(fromPrice)}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
