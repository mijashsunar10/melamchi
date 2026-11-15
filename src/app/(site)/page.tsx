import { TrendingUp } from "lucide-react";
import { DomainTiles } from "@/components/home/domain-tiles";
import { FaqCta } from "@/components/home/faq-cta";
import { FlashDeals } from "@/components/home/flash-deals";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { ProductShowcase } from "@/components/home/product-showcase";
import { Reviews } from "@/components/home/reviews";
import { SectionHeading } from "@/components/home/section-heading";
import { StatsBand } from "@/components/home/stats-band";
import { Icon } from "@/components/icon";
import { ProductCard } from "@/components/product/product-card";
import { getBestSellers, getDeals, getDomains, getProducts, getReviews } from "@/lib/catalog";
import { getHomeFaq, getSiteStats } from "@/lib/content";
import type { Product } from "@/types/catalog";

function Grid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  );
}

export default async function HomePage() {
  const [domains, products, bestSellers, deals, reviews, stats, faqs] = await Promise.all([
    getDomains(),
    getProducts(),
    getBestSellers(8),
    getDeals(),
    getReviews(),
    getSiteStats(),
    getHomeFaq(),
  ]);

  const tabs = [
    { value: "trending", label: "Trending", icon: <TrendingUp />, href: "/products", content: <Grid products={bestSellers} /> },
    ...domains
      .filter((d) => d.slug !== "support")
      .map((d) => ({
        value: d.slug,
        label: d.name,
        icon: <Icon name={d.icon} />,
        href: `/${d.slug}`,
        content: <Grid products={products.filter((p) => p.domain === d.slug).slice(0, 8)} />,
      })),
  ];

  return (
    <div className="flex flex-col gap-20 pb-20 sm:gap-28 sm:pb-28">
      <div>
        <Hero stats={stats} />
        <DomainTiles domains={domains} />
      </div>

      <FlashDeals deals={deals} />

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Shop by category"
          title="Popular right now"
          className="mb-8"
        />
        <ProductShowcase tabs={tabs} />
      </section>

      <HowItWorks />
      <StatsBand stats={stats} />
      <Reviews reviews={reviews} products={products} stats={stats} />
      <FaqCta faqs={faqs} />
    </div>
  );
}
