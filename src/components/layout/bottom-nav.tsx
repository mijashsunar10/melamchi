import { Flame, House, LayoutGrid, MessageCircle, Search } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

const items = [
  { href: "/", label: "Home", icon: House, active: true },
  { href: "/#categories", label: "Explore", icon: LayoutGrid },
  { href: "/products", label: "Search", icon: Search },
  { href: "/#deals", label: "Deals", icon: Flame },
  { href: siteConfig.contact.whatsapp, label: "Contact", icon: MessageCircle, external: true },
];

/** Phone-only bottom tab bar */
export function BottomNav() {
  return (
    <nav
      aria-label="Quick"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto grid h-16 max-w-md grid-cols-5">
        {items.map(({ href, label, icon: I, active, external }) => {
          const cls = `flex flex-col items-center justify-center gap-1 text-[11px] font-semibold ${active ? "text-primary" : "text-muted-foreground"}`;
          const inner = (
            <>
              <span className={`flex h-7 w-12 items-center justify-center rounded-full ${active ? "bg-primary/10" : ""}`}>
                <I className="size-5" />
              </span>
              {label}
            </>
          );
          return external ? (
            <a key={label} href={href} className={cls}>
              {inner}
            </a>
          ) : (
            <Link key={label} href={href} className={cls}>
              {inner}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
