import { BadgeCheck, Quote, Star } from "lucide-react";
import { formatCountPlus } from "@/lib/format";
import type { Product, Review } from "@/types/catalog";
import type { SiteStats } from "@/types/content";
import { SectionHeading } from "./section-heading";

function ReviewCard({ review, productName }: { review: Review; productName?: string }) {
  return (
    <figure className="flex w-[300px] shrink-0 flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card sm:w-[340px]">
      <div className="flex items-center justify-between">
        <div className="flex">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={`size-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-border"}`} />
          ))}
        </div>
        <Quote className="size-6 text-primary/15" />
      </div>
      <blockquote className="text-sm leading-relaxed">“{review.comment}”</blockquote>
      <figcaption className="mt-auto flex items-center gap-3 border-t border-border pt-4">
        <span className="flex size-10 items-center justify-center rounded-full bg-brand-gradient font-bold text-white">
          {review.name[0]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-sm font-semibold">
            {review.name}
            {review.verified && <BadgeCheck className="size-4 text-success" aria-label="Verified order" />}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {review.city} · {productName}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

export function Reviews({ reviews, products, stats }: { reviews: Review[]; products: Product[]; stats: SiteStats }) {
  const name = (slug: string) => products.find((p) => p.slug === slug)?.name;
  const loop = [...reviews, ...reviews];

  return (
    <section className="overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Verified reviews"
          title="Loved by gamers & creators"
          extra={
            <div className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 shadow-card ring-1 ring-border">
              <span className="font-display text-3xl font-black italic">{stats.rating.toFixed(1)}</span>
              <div>
                <div className="flex">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">from {formatCountPlus(stats.reviewCount)} verified orders</p>
              </div>
            </div>
          }
        />
      </div>
      <div className="group relative mt-10 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused]">
          {loop.map((r, i) => (
            <ReviewCard key={`${r.id}-${i}`} review={r} productName={name(r.productSlug)} />
          ))}
        </div>
      </div>
    </section>
  );
}
