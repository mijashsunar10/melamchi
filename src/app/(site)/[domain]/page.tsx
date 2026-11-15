import { ArrowRight, ChevronRight, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DomainCatalog } from "@/components/domain/domain-catalog";
import { DomainTiles } from "@/components/home/domain-tiles";
import { SectionHeading } from "@/components/home/section-heading";
import { Icon } from "@/components/icon";
import { ProductCard } from "@/components/product/product-card";
import { Accordion } from "@/components/ui/accordion";
import { buttonClasses } from "@/components/ui/button";
import { getDomain, getDomains, getProducts, startingPrice } from "@/lib/catalog";
import { getDomainFaq } from "@/lib/content";
import { formatNPR } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import type { DomainSlug } from "@/types/catalog";

/** Section pages built here. Support has its own page. */
const SHOP_DOMAINS = ["ai-tools", "gaming", "gift-cards", "software", "digital-products"] as const satisfies DomainSlug[];

const isShopDomain = (slug: string): slug is (typeof SHOP_DOMAINS)[number] =>
  (SHOP_DOMAINS as readonly string[]).includes(slug);

export function generateStaticParams() {
  return SHOP_DOMAINS.map((domain) => ({ domain }));
}

export async function generateMetadata({ params }: PageProps<"/[domain]">): Promise<Metadata> {
  const { domain: slug } = await params;
  const domain = isShopDomain(slug) ? await getDomain(slug) : undefined;
  if (!domain) return {};
  return {
    title: `${domain.name} in Nepal`,
    description: domain.description,
    openGraph: { title: `${domain.name} in Nepal · ${siteConfig.name}`, description: domain.description },
  };
}

export default async function DomainPage({ params }: PageProps<"/[domain]">) {
  const { domain: slug } = await params;
  if (!isShopDomain(slug)) notFound();

  const [domain, products, allDomains, faq] = await Promise.all([
    getDomain(slug),
    getProducts({ domain: slug }),
    getDomains(),
    getDomainFaq(slug),
  ]);
  if (!domain) notFound();

  const prices = products.map(startingPrice).filter((p): p is number => p !== null);
  const fromPrice = prices.length ? Math.min(...prices) : null;
  const others = allDomains.filter((d) => d.slug !== slug);
  // default sort is "most popular" → those 4 are the first row; load their images immediately
  const firstRow = new Set([...products].sort((a, b) => b.sold - a.sold).slice(0, 4).map((p) => p.slug));

  return (
    <div className="flex flex-col gap-16 pb-20 sm:gap-20 sm:pb-28">
      <section className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
        {/* Compact page header — products start right away */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="size-4" />
          <span className="text-foreground" aria-current="page">
            {domain.name}
          </span>
        </nav>
        <div className="mt-4 mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${domain.gradient} text-white shadow-md`}>
            <Icon name={domain.icon} className="size-6" />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-3xl leading-tight font-black italic sm:text-4xl">{domain.name}</h1>
            <p className="text-sm text-muted-foreground">
              {products.length} products
              {fromPrice !== null && (
                <>
                  {" "}· from <span className="font-semibold text-accent">{formatNPR(fromPrice)}</span>
                </>
              )}
              {" "}· {domain.tagline}
            </p>
          </div>
        </div>
        <DomainCatalog
          categories={domain.categories.map((c) => ({ slug: c.slug, name: c.name, icon: <Icon name={c.icon} /> }))}
          items={products.map((p) => ({
            slug: p.slug,
            category: p.category,
            price: startingPrice(p),
            rating: p.rating,
            sold: p.sold,
            card: <ProductCard product={p} eager={firstRow.has(p.slug)} />,
          }))}
        />
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-8">
          <SectionHeading eyebrow="FAQ" title={`${domain.shortName === "AI" ? "AI tools" : domain.name} — questions`} />
          <Accordion items={faq} name="domain-faq" />
        </div>
        <aside className="flex flex-col justify-between gap-6 self-start rounded-3xl border border-border bg-surface p-7 shadow-card dark:border-transparent dark:bg-brand-navy dark:text-white">
          <div>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-white/10 dark:text-white">
              <MessageCircle className="size-6" />
            </span>
            <h3 className="mt-5 font-display text-2xl font-black italic">Not sure what to pick?</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground dark:text-white/70">
              Tell us what you need on WhatsApp and we&apos;ll recommend the right plan — usually within minutes.
            </p>
          </div>
          <a href={siteConfig.contact.whatsapp} className={`${buttonClasses({ variant: "cta", pill: true })} self-start`}>
            Ask on WhatsApp <ArrowRight />
          </a>
        </aside>
      </section>

      <div className="flex flex-col gap-8">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="Keep exploring" title="Other categories" />
        </div>
        <DomainTiles domains={others} overlap={false} />
      </div>
    </div>
  );
}
