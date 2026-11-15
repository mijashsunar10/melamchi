import Image from "next/image";
import { formatCountPlus } from "@/lib/format";
import { images } from "@/lib/images";
import type { SiteStats } from "@/types/content";

export function StatsBand({ stats: s }: { stats: SiteStats }) {
  const stats = [
    { value: formatCountPlus(s.ordersDelivered), label: "Orders delivered" },
    { value: `${s.avgDeliverySeconds} sec`, label: "Average top-up" },
    { value: `${s.rating.toFixed(1)} / 5`, label: "Customer rating" },
    { value: "24/7", label: "Human support" },
  ];
  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
      <div className="relative isolate overflow-hidden rounded-3xl px-6 py-14 text-foreground ring-1 ring-border sm:px-12 sm:py-20 dark:text-white dark:ring-0">
        {/* daytime Himalaya in light mode, night sky in dark mode */}
        <Image
          src={images.himalayaDay}
          alt="Snow-capped Himalayan peak under a blue sky"
          placeholder="blur"
          sizes="(min-width: 1280px) 1232px, 100vw"
          className="absolute inset-0 -z-20 size-full object-cover object-[center_60%] dark:hidden"
        />
        <Image
          src={images.himalayaNight}
          alt="The Himalayas under a starry night sky"
          placeholder="blur"
          sizes="(min-width: 1280px) 1232px, 100vw"
          className="absolute inset-0 -z-20 hidden size-full object-cover object-[center_70%] dark:block"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white via-white/85 to-white/0 dark:from-brand-navy-deep/95 dark:via-brand-navy-deep/70 dark:to-brand-navy-deep/10" />

        <div className="grid items-end gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase dark:text-brand-orange-400">Why TOPX</p>
            <h2 className="mt-3 font-display text-3xl leading-tight font-black italic sm:text-5xl">
              Nepal&apos;s Digital
              <br />
              Powerhouse
            </h2>
            <p className="mt-5 max-w-sm text-muted-foreground dark:text-white/65">Built in Nepal, for Nepal — by Melamchi Tech.</p>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4 lg:grid-cols-2 dark:gap-x-8 dark:gap-y-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="rounded-xl border-l-2 border-accent/80 bg-white/80 py-3 pr-3 pl-4 shadow-sm backdrop-blur-md dark:rounded-none dark:bg-transparent dark:py-0 dark:pr-0 dark:shadow-none dark:backdrop-blur-none">
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-3xl font-black whitespace-nowrap italic sm:text-4xl">{value}</dd>
                <dd className="mt-1 text-sm text-muted-foreground dark:text-white/60">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
