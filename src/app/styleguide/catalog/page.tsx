import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getDeals, getDomains, getProducts, startingPrice } from "@/lib/catalog";
import { formatNPR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Catalog data",
  robots: { index: false },
};

const deliveryLabel = {
  TOPUP: "Top-up (Player ID)",
  CODE: "Code delivery",
  ACCOUNT: "Account activation",
  LICENSE: "Licence key",
  SERVICE: "Service request",
} as const;

export default async function CatalogPreviewPage() {
  const [domains, products, deals] = await Promise.all([getDomains(), getProducts(), getDeals()]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <Link href="/styleguide" className="text-sm font-semibold text-primary hover:underline">
            ← Styleguide
          </Link>
          <h1 className="mt-2 text-3xl font-extrabold italic sm:text-4xl">
            Sample <span className="swoosh">catalog</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            {products.length} products · {domains.length} domains · {deals.length} deals — sample data until the CEO
            sends the final list.
          </p>
        </div>
        <ThemeToggle />
      </header>

      {domains.map((domain) => {
        const items = products.filter((p) => p.domain === domain.slug);
        return (
          <section key={domain.slug} className="flex flex-col gap-4">
            <div className={`rounded-xl bg-gradient-to-r ${domain.gradient} p-5 text-white`}>
              <h2 className="text-2xl font-black italic">{domain.name}</h2>
              <p className="text-sm text-white/85">{domain.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {domain.categories.map((c) => (
                  <span key={c.slug} className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => {
                const from = startingPrice(p);
                return (
                  <div key={p.slug} className="flex gap-3 rounded-xl border border-border bg-surface p-4 shadow-card">
                    <div
                      className="flex size-14 shrink-0 items-center justify-center rounded-lg font-display text-sm font-black text-white"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {deliveryLabel[p.deliveryType]} · {p.plans.length} plans · {p.region}
                      </p>
                      <p className="mt-1 text-sm font-bold text-accent">
                        {from ? `From ${formatNPR(from)}` : "Get a quote"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}
