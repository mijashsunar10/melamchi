import { Flame } from "lucide-react";
import Link from "next/link";
import { Cover } from "@/components/product/cover";
import { Countdown } from "@/components/ui/countdown";
import type { DealWithProduct } from "@/lib/catalog";
import { formatNPR } from "@/lib/format";
import { SectionHeading } from "./section-heading";

export function FlashDeals({ deals }: { deals: DealWithProduct[] }) {
  const soonest = [...deals].sort((a, b) => a.endsAt.localeCompare(b.endsAt))[0];

  return (
    <section id="deals" className="mx-auto w-full max-w-7xl scroll-mt-32 px-4 sm:px-6">
      <div>
        <SectionHeading
          eyebrow={
            <span className="flex items-center gap-1.5">
              <Flame className="size-4" /> Flash deals
            </span>
          }
          title="Hot deals, ending soon"
          extra={
            soonest && (
              <div className="flex items-center gap-2 rounded-full bg-surface px-3 py-2 text-sm font-semibold shadow-card ring-1 ring-border">
                Ends in <Countdown endsAt={soonest.endsAt} />
              </div>
            )
          }
          href="/deals"
        />

        <div className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory gap-5 lg:gap-6 overflow-x-auto scroll-px-4 px-4 pt-1 pb-4 sm:-mx-6 sm:scroll-px-6 sm:px-6">
          {deals.map((d) => (
            <Link
              key={`${d.productSlug}-${d.planId}`}
              href={`/product/${d.product.slug}`}
              className="group relative flex w-[200px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover sm:w-[220px]"
            >
              <div className="m-2 overflow-hidden rounded-xl">
                <Cover product={d.product} className="aspect-square w-full transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="flex flex-1 flex-col gap-2 px-4 pt-1 pb-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-accent px-1.5 py-0.5 text-xs font-bold text-white">-{d.discountPercent}%</span>
                  {d.label && <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold">{d.label}</span>}
                </div>
                <div>
                  <h3 className="truncate font-sans text-sm font-bold">{d.product.name}</h3>
                  <p className="text-xs text-muted-foreground">{d.plan.name}</p>
                </div>
                <div className="mt-auto flex items-baseline gap-2 pt-1">
                  <span className="font-display text-xl font-black text-accent">{formatNPR(d.dealPrice)}</span>
                  <span className="text-xs text-muted-foreground line-through">{formatNPR(d.plan.price)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
