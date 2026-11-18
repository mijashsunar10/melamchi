import { Zap } from "lucide-react";
import Link from "next/link";
import { Cover } from "@/components/product/cover";
import { startingPrice } from "@/lib/catalog";
import { formatNPR } from "@/lib/format";
import type { Product } from "@/types/catalog";

/** Popular games right under the hero: a clean picture, the name, the price and one "Top up" button. */
export function GameTiles({ games }: { games: Product[] }) {
  return (
    <section id="games" className="relative z-10 mx-auto -mt-24 w-full max-w-7xl scroll-mt-32 px-4 sm:-mt-32 sm:px-6">
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:gap-6 xl:grid-cols-6">
        {games.map((g, i) => {
          const from = startingPrice(g);
          return (
            <Link
              key={g.slug}
              href={`/product/${g.slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-surface p-2 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-card-hover sm:p-2.5"
            >
              <div className="overflow-hidden rounded-xl">
                <Cover product={g} showCaption={false} eager={i < 3} className="aspect-square w-full transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="flex flex-1 flex-col px-1 pt-2.5">
                <h3 className="line-clamp-1 text-sm font-bold sm:text-[15px]">{g.name}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {from ? (
                    <>
                      From <span className="font-bold text-accent">{formatNPR(from)}</span>
                    </>
                  ) : (
                    "Get a quote"
                  )}
                </p>
                <span className="mt-2.5 flex h-9 items-center justify-center gap-1.5 rounded-lg bg-accent text-sm font-bold text-white transition-colors group-hover:bg-primary">
                  <Zap className="size-4 fill-current" /> Top up now
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
