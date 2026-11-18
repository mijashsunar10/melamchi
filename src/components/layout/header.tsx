import { Mail, MessageCircle, Search, Zap } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getDomains } from "@/lib/catalog";
import { getContact } from "@/lib/content";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { NavLinks, NavLinksView } from "./nav-links";

function TopBar({ contact }: { contact: { whatsapp: string; email: string } }) {
  return (
    <div className="border-b border-border bg-surface-2 text-[12px] text-muted-foreground dark:border-transparent dark:bg-brand-navy dark:text-white/80">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <p className="flex min-w-0 items-center gap-2 truncate">
          <Zap className="size-3.5 shrink-0 fill-amber-400 text-amber-400 dark:fill-amber-300 dark:text-amber-300" />
          <span className="truncate">
            <strong className="font-semibold text-foreground dark:text-white">Instant delivery</strong> on top-ups & gift cards ·
            <span className="font-nepali"> १०–६० सेकेन्डमा डेलिभरी</span>
          </span>
        </p>
        <div className="hidden shrink-0 items-center gap-5 md:flex">
          <a href={contact.whatsapp} className="flex items-center gap-1.5 transition-colors hover:text-foreground dark:hover:text-white">
            <MessageCircle className="size-3.5" /> WhatsApp 24/7
          </a>
          <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 transition-colors hover:text-foreground dark:hover:text-white">
            <Mail className="size-3.5" /> {contact.email}
          </a>
        </div>
      </div>
    </div>
  );
}

/** Full label on wide screens, short label on smaller laptops */
const navLabel = (slug: string, name: string) => {
  const short = slug === "gaming" ? "Gaming" : slug === "software" ? "Software" : slug === "digital-products" ? "Digital" : name;
  const full = slug === "gaming" ? "Gaming" : name;
  return { short, full };
};

export async function Header() {
  const [domains, { contact }] = await Promise.all([getDomains(), getContact()]);
  const navItems = [
    { href: "/", short: "Home", full: "Home" },
    ...domains.map((d) => ({ href: `/${d.slug}`, ...navLabel(d.slug, d.name) })),
  ];

  return (
    <header className="sticky top-0 z-50">
      <TopBar contact={contact} />
      <div className="border-b border-border bg-surface/85 backdrop-blur-xl supports-[backdrop-filter]:bg-surface/75">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:h-[72px] sm:px-6">
          <Logo />

          {/* reads the URL for the active highlight → must sit inside Suspense (Next 16 / Cache Components) */}
          <Suspense fallback={<NavLinksView items={navItems} pathname="" />}>
            <NavLinks items={navItems} />
          </Suspense>

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
            <a
              href={contact.whatsapp}
              className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-primary-foreground transition-colors hover:bg-primary-hover sm:inline-flex xl:text-[15px]"
            >
              <MessageCircle className="size-4" />
              <span className="lg:hidden xl:inline">Contact us</span>
              <span className="hidden lg:inline xl:hidden">Contact</span>
            </a>
            {/* phones & tablets: menu button on the right */}
            <MobileMenu domains={domains} />
          </div>
        </div>
      </div>
    </header>
  );
}
