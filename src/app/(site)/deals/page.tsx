import { ArrowRight, BadgePercent, ChevronRight, Clock, Flame, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/home/section-heading";
import { Cover } from "@/components/product/cover";
import { productGridClass } from "@/components/product/grid";
import { ProductCard } from "@/components/product/product-card";
import { Countdown } from "@/components/ui/countdown";
import { getBestSellers, getDeals } from "@/lib/catalog";
import { formatNPR } from "@/lib/format";
import { getContact } from "@/lib/content";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Today's deals",
  description: "Limited-time discounts on game top-ups, AI tools, gift cards, software and streaming in Nepal.",
};

export default async function DealsPage() {
  const [deals, bestSellers, { contact }] = await Promise.all([getDeals(), getBestSellers(10), getContact()]);
  const sorted = [...deals].sort((a, b) => b.discountPercent - a.discountPercent);
  const soonest = [...deals].sort((a, b) => a.endsAt.localeCompare(b.endsAt))[0];
  const dealSlugs = new Set(deals.map((d) => d.productSlug));
  const more = bestSellers.filter((p) => !dealSlugs.has(p.slug)).slice(0, 5);

  return (
    <div className="flex flex-col gap-16 pb-20 sm:gap-20 sm:pb-28">
      <section className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="size-4" />
          <span className="text-foreground" aria-current="page">
            Deals
          </span>
        </nav>

        <div className="mt-4 mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cta-gradient text-white shadow-md">
              <Flame className="size-6" />
            </span>
            <div>
              <h1 className="font-display text-3xl leading-tight font-black italic sm:text-4xl">Today&apos;s deals</h1>
              <p className="text-sm text-muted-foreground">
                {deals.length} limited-time offers · up to{" "}
                <span className="font-semibold text-accent">{sorted[0]?.discountPercent ?? 0}% off</span>
              </p>
            </div>
          </div>
          {soonest && (
            <div className="flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-semibold shadow-card ring-1 ring-border">
              <Clock className="size-4 text-accent" /> Next deal ends in <Countdown endsAt={soonest.endsAt} />
            </div>
          )}
        </div>

        {sorted.length ? (
          <div className={productGridClass}>
            {sorted.map((d, i) => (
              <Link
                key={`${d.productSlug}-${d.planId}`}
                href={`/product/${d.product.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-card-hover"
              >
                <div className="m-2 overflow-hidden rounded-xl">
                  <Cover product={d.product} eager={i < 4} className="aspect-square w-full transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col gap-3 px-3 pt-1 pb-3 sm:px-4 sm:pb-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-md bg-accent px-2 py-0.5 text-sm font-bold text-white">-{d.discountPercent}%</span>
                    {d.label && <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold">{d.label}</span>}
                  </div>
                  <div>
                    <h2 className="truncate font-sans text-[15px] font-bold">{d.product.name}</h2>
                    <p className="text-sm text-muted-foreground">{d.plan.name}</p>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-x-2 whitespace-nowrap">
                    <span className="font-display text-lg font-black text-accent sm:text-2xl">{formatNPR(d.dealPrice)}</span>
                    <span className="text-xs text-muted-foreground line-through sm:text-sm">{formatNPR(d.plan.price)}</span>
                  </div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-success">
                    <BadgePercent className="size-4" /> You save {formatNPR(d.plan.price - d.dealPrice)}
                  </p>
                  <div className="mt-auto flex flex-col gap-3 border-t border-dashed border-border pt-3">
                    <span className="flex flex-wrap items-center gap-1.5 text-xs whitespace-nowrap text-muted-foreground">
                      Ends in <Countdown endsAt={d.endsAt} />
                    </span>
                    <span className="flex h-9 items-center justify-center gap-1 rounded-lg bg-primary text-sm font-bold text-primary-foreground transition-colors group-hover:bg-accent">
                      Grab deal <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border py-16 text-center">
            <Flame className="size-10 text-muted-foreground" />
            <p className="font-semibold">No deals running right now</p>
            <p className="text-sm text-muted-foreground">New offers drop every week — check back soon.</p>
          </div>
        )}
      </section>

      {/* Deal alerts */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-border bg-surface p-6 shadow-card sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="font-display text-2xl font-black italic">Never miss a deal</h2>
            <p className="mt-1 text-sm text-muted-foreground">Message us on WhatsApp and we&apos;ll send you new offers as soon as they go live.</p>
          </div>
          <a
            href={whatsappLink("Hi TOPX Nepal! Please send me new deals and offers.", contact.whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-[#25D366] px-6 text-sm font-bold text-white transition-colors hover:bg-[#1fb857]"
          >
            <MessageCircle className="size-5" /> Get deal alerts
          </a>
        </div>
      </section>

      {more.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="Popular right now" title="Best sellers" href="/products" linkLabel="See all" className="mb-8" />
          <div className={productGridClass}>
            {more.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
