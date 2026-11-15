import { ArrowRight, BadgeCheck, ChevronRight, Headset, MapPin, ShieldCheck, Zap } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DomainTiles } from "@/components/home/domain-tiles";
import { SectionHeading } from "@/components/home/section-heading";
import { buttonClasses } from "@/components/ui/button";
import { getDomains } from "@/lib/catalog";
import { getSiteStats } from "@/lib/content";
import { formatCountPlus } from "@/lib/format";
import { images } from "@/lib/images";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About us",
  description: `${siteConfig.name} by ${siteConfig.company} — Nepal's one place for AI tools, game top-ups, gift cards, software and digital subscriptions.`,
};

const values = [
  { icon: Zap, title: "Instant", text: "Most orders are delivered in seconds, not days." },
  { icon: BadgeCheck, title: "Genuine", text: "Official top-ups, codes and licences only." },
  { icon: ShieldCheck, title: "Local & safe", text: "Pay in rupees with eSewa, Khalti, IME Pay or bank." },
  { icon: Headset, title: "Human support", text: "Real people on WhatsApp, day and night." },
];

export default async function AboutPage() {
  const [stats, domains] = await Promise.all([getSiteStats(), getDomains()]);

  const numbers = [
    { value: formatCountPlus(stats.ordersDelivered), label: "Orders delivered" },
    { value: `${stats.rating.toFixed(1)} / 5`, label: "Customer rating" },
    { value: `${stats.avgDeliverySeconds} sec`, label: "Average top-up" },
    { value: "24/7", label: "Support" },
  ];

  return (
    <div className="flex flex-col gap-16 pb-20 sm:gap-24 sm:pb-28">
      {/* Intro */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="size-4" />
          <span className="text-foreground" aria-current="page">
            About us
          </span>
        </nav>

        <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">About {siteConfig.name}</p>
            <h1 className="mt-3 font-display text-4xl leading-tight font-black italic sm:text-5xl">
              Everything digital, <span className="text-primary">one place.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {siteConfig.name} is a product of <span className="font-semibold text-foreground">{siteConfig.company}</span>.
              We make it simple for people in Nepal to buy game top-ups, AI tools, gift cards, software and
              subscriptions — paid in rupees, delivered in seconds, with real people to help.
            </p>
            <p className="mt-4 flex items-center gap-2 text-sm font-semibold">
              <MapPin className="size-4 text-accent" /> {siteConfig.contact.address}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className={buttonClasses({ variant: "cta", size: "lg", pill: true })}>
                Start shopping <ArrowRight />
              </Link>
              <Link href="/contact" className={buttonClasses({ variant: "outline", size: "lg", pill: true })}>
                Contact us
              </Link>
            </div>
          </div>

          <div className="relative isolate overflow-hidden rounded-3xl shadow-card-hover">
            <Image
              src={images.himalayaDay}
              alt="Snow-capped Himalayan peak under a blue sky"
              placeholder="blur"
              loading="eager"
              sizes="(min-width: 1024px) 560px, 100vw"
              className="aspect-[4/3] w-full object-cover object-[center_60%]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-navy-deep/85 to-transparent p-6 pt-20 text-white">
              <p className="font-display text-2xl font-black italic">{siteConfig.positioning}</p>
              <p className="text-sm text-white/75">Built in Nepal, for Nepal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {numbers.map(({ value, label }) => (
            <div key={label} className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
              <dd className="font-display text-3xl font-black italic sm:text-4xl">{value}</dd>
              <dt className="mt-1 text-sm text-muted-foreground">{label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* Values */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="What we stand for" title="Why customers choose us" className="mb-8" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: I, title, text }) => (
            <div key={title} className="rounded-2xl border border-border bg-surface p-6 shadow-card">
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
                <I className="size-6" />
              </span>
              <h3 className="mt-4 font-display text-lg font-extrabold italic">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What we offer */}
      <div className="flex flex-col gap-8">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="What we offer" title="Six categories, one store" />
        </div>
        <DomainTiles domains={domains} overlap={false} />
      </div>
    </div>
  );
}
