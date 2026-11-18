import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { Cover } from "@/components/product/cover";
import { startingPrice } from "@/lib/catalog";
import { formatNPR } from "@/lib/format";
import type { Product } from "@/types/catalog";

/** Popular games right under the hero — one tap to the top-up page. */
export function GameTiles({ games }: { games: Product[] }) {
  return (
    <section id="games" className="relative z-10 mx-auto -mt-24 w-full max-w-7xl scroll-mt-32 px-4 sm:-mt-32 sm:px-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
        {games.map((g, i) => {
          const from = startingPrice(g);
          return (
            <Link
              key={g.slug}
              href={`/product/${g.slug}`}
              className="group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl bg-brand-navy p-4 text-white shadow-card ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover sm:p-5 dark:ring-white/10"
            >
              <Cover product={g} showCaption={false} eager={i < 3} className="absolute inset-0 -z-10 size-full transition-transform duration-700 ease-out group-hover:scale-110" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-navy-deep via-brand-navy-deep/40 to-transparent" />
              {g.deliveryTime === "Instant" && (
                <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-[11px] font-semibold backdrop-blur sm:top-4 sm:left-4">
                  <Zap className="size-3 fill-amber-300 text-amber-300" /> Instant
                </span>
              )}
              <h3 className="font-display text-base leading-tight font-extrabold italic sm:text-lg">{g.name}</h3>
              <p className="mt-1 flex items-center justify-between gap-2 text-xs text-white/75 sm:text-[13px]">
                <span>{from ? `From ${formatNPR(from)}` : "Get a quote"}</span>
                <span className="flex items-center gap-0.5 font-semibold text-white">
                  Top up <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
