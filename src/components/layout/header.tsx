import { ArrowRight, ChevronDown, Mail, MessageCircle, Search, ShoppingCart, UserRound, Zap } from "lucide-react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { Cover } from "@/components/product/cover";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getDomains, getProducts, startingPrice } from "@/lib/catalog";
import { formatNPR } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";

function TopBar() {
  return (
    <div className="bg-brand-navy text-[12px] text-white/80">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <p className="flex min-w-0 items-center gap-2 truncate">
          <Zap className="size-3.5 shrink-0 fill-amber-300 text-amber-300" />
          <span className="truncate">
            <strong className="font-semibold text-white">Instant delivery</strong> on top-ups & gift cards ·
            <span className="font-nepali"> १०–६० सेकेन्डमा डेलिभरी</span>
          </span>
        </p>
        <div className="hidden shrink-0 items-center gap-5 md:flex">
          <a href={siteConfig.contact.whatsapp} className="flex items-center gap-1.5 transition-colors hover:text-white">
            <MessageCircle className="size-3.5" /> WhatsApp 24/7
          </a>
          <a href={`mailto:${siteConfig.contact.email}`} className="flex items-center gap-1.5 transition-colors hover:text-white">
            <Mail className="size-3.5" /> {siteConfig.contact.email}
          </a>
        </div>
      </div>
    </div>
  );
}

export async function Header() {
  const [domains, products] = await Promise.all([getDomains(), getProducts()]);

  return (
    <header className="sticky top-0 z-50">
      <TopBar />
      <div className="border-b border-border bg-surface/85 backdrop-blur-xl supports-[backdrop-filter]:bg-surface/75">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:h-[72px] sm:px-6">
          <MobileMenu domains={domains} />
          <Logo />

          {/* Desktop navigation with mega menus */}
          <nav aria-label="Main" className="ml-4 hidden flex-1 items-center gap-0.5 lg:flex">
            <Link
              href="/"
              className="rounded-full bg-primary px-3.5 py-2 text-[13px] font-semibold text-primary-foreground shadow-sm"
            >
              Home
            </Link>
            {domains.map((domain, i) => {
              const featured = products.filter((p) => p.domain === domain.slug).slice(0, 3);
              const alignRight = i >= 3;
              return (
                <div key={domain.slug} className="group relative">
                  <Link
                    href={`/${domain.slug}`}
                    className="flex items-center gap-1 rounded-full px-2.5 py-2 text-[13px] font-semibold text-foreground/80 transition-colors group-focus-within:text-primary group-hover:bg-muted group-hover:text-primary xl:px-3"
                  >
                    {domain.slug === "gaming" ? "Gaming" : domain.shortName === "Digital" ? "Digital Products" : domain.name}
                    <ChevronDown className="size-3.5 transition-transform duration-200 group-hover:rotate-180" />
                  </Link>

                  <div
                    className={`invisible absolute top-full z-50 pt-3 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 ${alignRight ? "right-0" : "left-0"} translate-y-2`}
                  >
                    <div className="grid w-[620px] grid-cols-[1fr_1.15fr] overflow-hidden rounded-2xl border border-border bg-surface shadow-card-hover">
                      <div className="flex flex-col gap-1 p-4">
                        <div className={`mb-2 flex items-center gap-3 rounded-xl bg-gradient-to-br ${domain.gradient} p-3 text-white`}>
                          <Icon name={domain.icon} className="size-6" />
                          <div>
                            <p className="font-display text-sm font-extrabold italic">{domain.name}</p>
                            <p className="text-[11px] text-white/85">{domain.tagline}</p>
                          </div>
                        </div>
                        {domain.categories.map((c) => (
                          <Link
                            key={c.slug}
                            href={`/${domain.slug}?category=${c.slug}`}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-primary"
                          >
                            <Icon name={c.icon} className="size-4 text-muted-foreground" />
                            {c.name}
                          </Link>
                        ))}
                      </div>
                      <div className="flex flex-col gap-2 border-l border-border bg-surface-2/60 p-4">
                        <p className="px-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Popular</p>
                        {featured.map((p) => {
                          const from = startingPrice(p);
                          return (
                            <Link
                              key={p.slug}
                              href={`/product/${p.slug}`}
                              className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface"
                            >
                              <Cover product={p} size="sm" className="size-11 shrink-0 rounded-lg" />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">{p.name}</p>
                                <p className="text-xs font-bold text-accent">{from ? `From ${formatNPR(from)}` : "Get a quote"}</p>
                              </div>
                            </Link>
                          );
                        })}
                        <Link
                          href={`/${domain.slug}`}
                          className="mt-auto flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-surface"
                        >
                          View all {domain.name} <ArrowRight className="size-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/products"
              aria-label="Search"
              className="inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
            >
              <Search className="size-5" />
            </Link>
            <ThemeToggle className="hidden border-transparent bg-transparent sm:inline-flex" />
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
            >
              <ShoppingCart className="size-5" />
              <span className="absolute top-1 right-0.5 flex size-4.5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                0
              </span>
            </Link>
            <Link
              href="/login"
              className="hidden items-center gap-2 rounded-full bg-primary py-2 pr-4 pl-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover sm:inline-flex"
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-white/15">
                <UserRound className="size-4" />
              </span>
              Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
