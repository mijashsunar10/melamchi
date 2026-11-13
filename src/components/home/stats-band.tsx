import Image from "next/image";
import { images } from "@/lib/images";

const stats = [
  { value: "50,000+", label: "Orders delivered" },
  { value: "12 sec", label: "Average top-up" },
  { value: "4.9 / 5", label: "Customer rating" },
  { value: "24/7", label: "Human support" },
];

export function StatsBand() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
      <div className="relative isolate overflow-hidden rounded-3xl px-6 py-14 text-white sm:px-12 sm:py-20">
        <Image
          src={images.himalayaNight}
          alt="The Himalayas under a starry night sky"
          placeholder="blur"
          sizes="(min-width: 1280px) 1232px, 100vw"
          className="absolute inset-0 -z-20 size-full object-cover object-[center_70%]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-navy-deep/95 via-brand-navy-deep/70 to-brand-navy-deep/10" />

        <div className="grid items-end gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-brand-orange-400 uppercase">Why TOPX</p>
            <h2 className="mt-3 font-display text-3xl leading-tight font-black italic sm:text-5xl">
              Nepal&apos;s Digital
              <br />
              Powerhouse
            </h2>
            <p className="mt-5 max-w-sm text-white/65">Built in Nepal, for Nepal — by Melamchi Tech.</p>
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4 lg:grid-cols-2">
            {stats.map(({ value, label }) => (
              <div key={label} className="border-l-2 border-accent/80 pl-4">
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-3xl font-black whitespace-nowrap italic sm:text-4xl">{value}</dd>
                <dd className="mt-1 text-sm text-white/60">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
