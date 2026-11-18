import { Gamepad2, Gift, Search } from "lucide-react";
import { FaqCta } from "@/components/home/faq-cta";
import { FlashDeals } from "@/components/home/flash-deals";
import { GameTiles } from "@/components/home/game-tiles";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { MoreFromTopx } from "@/components/home/more-from-topx";
import { ProductShowcase } from "@/components/home/product-showcase";
import { Reviews } from "@/components/home/reviews";
import { SectionHeading } from "@/components/home/section-heading";
import { StatsBand } from "@/components/home/stats-band";
import { productGridClass } from "@/components/product/grid";
import { ProductCard } from "@/components/product/product-card";
import { getDeals, getDomains, getGamingProducts, getProducts, getReviews, isGamingProduct } from "@/lib/catalog";
import { getHomeFaq, getSiteStats } from "@/lib/content";

// Gaming-first home page: game top-ups and gaming cards everywhere; the other sections are in "More from TOPX".

export default async function HomePage() {
  const [domains, products, games, allDeals, allReviews, stats, faqs] = await Promise.all([
    getDomains(),
    getProducts(),
    getGamingProducts(),
    getDeals(),
    getReviews(),
    getSiteStats(),
    getHomeFaq(),
  ]);

  // big circle: PUBG; around it: the other best-selling games (only ones with a picture are used)
  const heroGames = games.filter((g) => g.category !== "live-apps").sort((a, b) => Number(b.slug === "pubg-mobile-uc") - Number(a.slug === "pubg-mobile-uc"));
  const deals = allDeals.filter((d) => isGamingProduct(d.product));
  const gamingSlugs = new Set(games.map((g) => g.slug));
  const gamingReviews = allReviews.filter((r) => gamingSlugs.has(r.productSlug));
  // gaming reviews only; if there are none yet, show the others rather than an empty strip
  const reviews = gamingReviews.length ? gamingReviews : allReviews;

  const links = [
    { href: "/gaming", label: "Game top-ups", icon: <Gamepad2 /> },
    { href: "/gift-cards", label: "Gaming gift cards", icon: <Gift /> },
    { href: "/products", label: "Search all games", icon: <Search /> },
  ];

  return (
    <div className="flex flex-col gap-20 pb-20 sm:gap-28 sm:pb-28">
      <div>
        <Hero stats={stats} games={heroGames} />
        <GameTiles games={games.slice(0, 6)} />
      </div>

      {deals.length > 0 && <FlashDeals deals={deals} />}

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Trending top-ups" title="What gamers are buying" className="mb-8" />
        <ProductShowcase links={links}>
          <div className={productGridClass}>
            {games.slice(0, 10).map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </ProductShowcase>
      </section>

      <HowItWorks />
      <StatsBand stats={stats} />
      <Reviews reviews={reviews} products={products} stats={stats} />
      <MoreFromTopx domains={domains.filter((d) => d.slug !== "gaming")} />
      <FaqCta faqs={faqs} />
    </div>
  );
}
