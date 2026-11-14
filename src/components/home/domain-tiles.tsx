import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { domainImages } from "@/lib/images";
import type { Domain } from "@/types/catalog";

export function DomainTiles({ domains, overlap = true }: { domains: Domain[]; overlap?: boolean }) {
  return (
    <section
      id={overlap ? "categories" : undefined}
      className={`relative z-10 mx-auto w-full max-w-7xl scroll-mt-32 px-4 sm:px-6 ${overlap ? "-mt-24 sm:-mt-32" : ""}`}
    >
      <div className={`grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 ${domains.length >= 6 ? "xl:grid-cols-6" : "xl:grid-cols-5"}`}>
        {domains.map((d) => (
          <Link
            key={d.slug}
            href={`/${d.slug}`}
            className="group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl bg-brand-navy p-4 text-white shadow-card ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover sm:p-5 dark:ring-white/10"
          >
            <Image
              src={domainImages[d.slug]}
              alt=""
              placeholder="blur"
              sizes="(min-width: 1280px) 200px, (min-width: 768px) 33vw, 50vw"
              className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-navy-deep via-brand-navy-deep/55 to-brand-navy-deep/0" />

            <span className="absolute top-4 left-4 flex size-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-md sm:top-5 sm:left-5">
              <Icon name={d.icon} className="size-5" />
            </span>
            <ArrowUpRight className="absolute top-4 right-4 size-5 text-white/70 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white sm:top-5 sm:right-5" />

            <h3 className="font-display text-base leading-tight font-extrabold italic sm:text-lg">{d.name}</h3>
            <p className="mt-1 text-xs text-white/70 sm:text-[13px]">{d.tagline}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
