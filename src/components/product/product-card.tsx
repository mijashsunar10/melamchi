import { ArrowRight, Clock, Star, Zap } from "lucide-react";
import Link from "next/link";
import { Badge, tagBadge } from "@/components/ui/badge";
import { startingPrice } from "@/lib/catalog";
import { formatCompact, formatNPR } from "@/lib/format";
import type { Product } from "@/types/catalog";
import { Cover } from "./cover";

export function ProductCard({ product }: { product: Product }) {
  const from = startingPrice(product);
  const tag = product.tags[0];
  const instant = product.deliveryTime === "Instant";

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-card-hover"
    >
      <div className="relative overflow-hidden">
        <Cover product={product} className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-105" />
        {tag && (
          <Badge className="absolute top-3 left-3 bg-white/95 text-brand-navy shadow-sm">
            {tagBadge[tag].label}
          </Badge>
        )}
        <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
          {instant ? <Zap className="size-3 text-amber-300" /> : <Clock className="size-3" />}
          {product.deliveryTime}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <h3 className="line-clamp-2 font-sans text-[15px] leading-snug font-bold">{product.name}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
          <span>· {formatCompact(product.sold)}+ sold</span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <p className="font-display text-base font-extrabold whitespace-nowrap text-accent sm:text-lg">
              {from ? formatNPR(from) : "Get a quote"}
            </p>
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors group-hover:bg-accent sm:h-9 sm:w-auto sm:rounded-lg sm:px-3 sm:text-xs sm:font-bold">
            <ArrowRight className="size-4 sm:hidden" />
            <span className="hidden sm:inline">{product.deliveryType === "SERVICE" ? "Book" : "Buy now"}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
