import { BadgeCheck, ChevronRight, Clock, Globe, Star, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/home/section-heading";
import { Cover } from "@/components/product/cover";
import { OrderPanel } from "@/components/product/order-panel";
import { ProductCard } from "@/components/product/product-card";
import { Accordion } from "@/components/ui/accordion";
import { Tabs } from "@/components/ui/tabs";
import { getDomain, getProduct, getProducts, getRelatedProducts, getReviews } from "@/lib/catalog";
import { formatCompact } from "@/lib/format";
import { siteConfig } from "@/lib/site";

const deliveryLabel = {
  TOPUP: "Direct top-up to your account",
  CODE: "Code delivered instantly",
  ACCOUNT: "Activated on your account",
  LICENSE: "Genuine licence key",
  SERVICE: "Expert service",
} as const;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} in Nepal`,
    description: product.shortDescription,
    openGraph: { title: `${product.name} · ${siteConfig.name}`, description: product.shortDescription },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [domain, related, reviews] = await Promise.all([
    getDomain(product.domain),
    getRelatedProducts(product, 4),
    getReviews(product.slug),
  ]);

  const facts = [
    { icon: product.deliveryTime === "Instant" ? Zap : Clock, label: "Delivery", value: product.deliveryTime },
    { icon: Globe, label: "Region", value: product.region },
    { icon: BadgeCheck, label: "Type", value: deliveryLabel[product.deliveryType] },
  ];

  const tabs = [
    {
      value: "about",
      label: "About",
      content: (
        <div className="max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
          <p>{product.description}</p>
        </div>
      ),
    },
    {
      value: "how",
      label: product.deliveryType === "TOPUP" ? "How to top up" : product.deliveryType === "SERVICE" ? "How it works" : "How to redeem",
      content: (
        <ol className="flex max-w-3xl flex-col gap-3">
          {product.howTo.map((step, i) => (
            <li key={step} className="flex gap-4 rounded-xl border border-border bg-surface p-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <span className="pt-0.5 text-[15px]">{step}</span>
            </li>
          ))}
        </ol>
      ),
    },
    ...(product.faq.length
      ? [{ value: "faq", label: "FAQ", content: <Accordion items={product.faq} name="product-faq" className="max-w-3xl" /> }]
      : []),
    ...(reviews.length
      ? [
          {
            value: "reviews",
            label: `Reviews (${reviews.length})`,
            content: (
              <div className="grid max-w-3xl gap-3">
                {reviews.map((r) => (
                  <figure key={r.id} className="rounded-xl border border-border bg-surface p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} className={`size-4 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-border"}`} />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {r.name} · {r.city}
                      </span>
                    </div>
                    <blockquote className="mt-2 text-sm">{r.comment}</blockquote>
                  </figure>
                ))}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-16 pb-36 sm:gap-20 lg:pb-28">
      <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="size-4" />
          {domain && (
            <>
              <Link href={`/${domain.slug}`} className="hover:text-foreground">
                {domain.name}
              </Link>
              <ChevronRight className="size-4" />
            </>
          )}
          <span className="text-foreground" aria-current="page">
            {product.name}
          </span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          {/* Left: artwork + facts */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-32 lg:self-start">
            <div className="overflow-hidden rounded-3xl shadow-card-hover">
              <Cover product={product} size="lg" className="aspect-[4/3] w-full" />
            </div>
            <dl className="grid grid-cols-3 gap-2.5">
              {facts.map(({ icon: I, label, value }) => (
                <div key={label} className="rounded-xl border border-border bg-surface p-3">
                  <dt className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    <I className="size-3.5 text-primary" /> {label}
                  </dt>
                  <dd className="mt-1 text-sm leading-snug font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right: title + order panel */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-primary">{product.brand}</p>
              <h1 className="font-display text-3xl leading-tight font-black italic sm:text-4xl">{product.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
                  {product.reviewCount > 0 && <span>({formatCompact(product.reviewCount)} reviews)</span>}
                </span>
                <span>{formatCompact(product.sold)}+ sold</span>
              </div>
              <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">{product.shortDescription}</p>
            </div>

            <OrderPanel product={product} />
          </div>
        </div>
      </div>

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <Tabs items={tabs} />
      </section>

      {related.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="You may also like"
            title="Related products"
            href={domain ? `/${domain.slug}` : undefined}
            className="mb-8"
          />
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
