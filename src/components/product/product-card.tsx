import { ArrowRight, Clock, Star, Zap } from "lucide-react";
import Link from "next/link";
import { Badge, tagBadge } from "@/components/ui/badge";
import { startingPrice } from "@/lib/catalog";
import { formatCompact, formatNPR } from "@/lib/format";
import type { Product } from "@/types/catalog";
import { Cover } from "./cover";

/** `eager`: load the image immediately — set for cards in the first visible row. */
export function ProductCard({ product, eager = false }: { product: Product; eager?: boolean }) {
  const from = startingPrice(product);
  const tag = product.tags[0];
  const instant = product.deliveryTime === "Instant";

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-card-hover"
    >
      {/* clean picture — nothing written on top of it */}
      <div className="m-2 overflow-hidden rounded-xl">
        <Cover product={product} eager={eager} className="aspect-square w-full transition-transform duration-500 group-hover:scale-105" />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-3 pt-1 pb-3 sm:px-4 sm:pb-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {tag && (
            <Badge variant={tagBadge[tag].variant} className="px-2 py-0 text-[11px]">
              {tagBadge[tag].label}
            </Badge>
          )}
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${instant ? "text-success" : "text-muted-foreground"}`}>
            {instant ? <Zap className="size-3 fill-current" /> : <Clock className="size-3" />}
            {product.deliveryTime}
          </span>
        </div>
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
