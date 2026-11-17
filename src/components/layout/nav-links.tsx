"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export interface NavItem {
  href: string;
  short: string;
  full: string;
}

/** Desktop header links — highlights the current section (reads the URL; wrap in <Suspense>). */
export function NavLinks({ items }: { items: NavItem[] }) {
  return <NavLinksView items={items} pathname={usePathname()} />;
}

/** Same links without reading the URL — the Suspense fallback / prerendered version. */
export function NavLinksView({ items, pathname }: { items: NavItem[]; pathname: string }) {
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav aria-label="Main" className="ml-4 hidden flex-1 items-center gap-0.5 lg:flex xl:ml-6">
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors xl:text-[15px]",
              active
                ? "bg-primary px-4 text-primary-foreground shadow-sm xl:px-5"
                : "text-foreground/80 hover:bg-muted hover:text-primary",
            )}
          >
            <span className="xl:hidden">{item.short}</span>
            <span className="hidden xl:inline">{item.full}</span>
          </Link>
        );
      })}
    </nav>
  );
}
