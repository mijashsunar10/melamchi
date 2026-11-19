"use client";

import {
  BadgePercent,
  Contact,
  FileText,
  FolderTree,
  LayoutDashboard,
  type LucideIcon,
  Package,
  Settings,
  ShoppingCart,
  Star,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type Role = "admin" | "staff" | "customer" | null;

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** step that will build it — shown as "Soon" until then */
  soon?: string;
  adminOnly?: boolean;
}

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Store",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { href: "/admin/customers", label: "Customers", icon: Contact },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Sections & categories", icon: FolderTree, adminOnly: true },
      { href: "/admin/deals", label: "Deals", icon: BadgePercent },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
      { href: "/admin/content", label: "Content", icon: FileText },
    ],
  },
  {
    title: "Team",
    items: [
      { href: "/admin/users", label: "Staff & users", icon: Users, adminOnly: true },
      { href: "/admin/account", label: "My account", icon: UserCog },
      { href: "/admin/settings", label: "Settings", icon: Settings, adminOnly: true },
    ],
  },
];

/** Sidebar navigation. Items for later steps are shown disabled with a "Soon" tag. */
export function AdminNav({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <nav aria-label="Admin" className="flex flex-col gap-6">
      {groups.map((g) => {
        const items = g.items.filter((i) => !i.adminOnly || role === "admin");
        if (!items.length) return null;
        return (
          <div key={g.title}>
            <p className="mb-2 px-3 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">{g.title}</p>
            <ul className="flex flex-col gap-0.5">
              {items.map(({ href, label, icon: I, soon }) => {
                const active = !soon && isActive(href);
                const cls = cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/80 hover:bg-muted hover:text-foreground",
                  soon && "pointer-events-none opacity-50",
                );
                return (
                  <li key={href}>
                    {soon ? (
                      <span className={cls} aria-disabled="true">
                        <I className="size-[18px]" />
                        <span className="flex-1">{label}</span>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold">Soon</span>
                      </span>
                    ) : (
                      <Link href={href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={cls}>
                        <I className="size-[18px]" />
                        {label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
