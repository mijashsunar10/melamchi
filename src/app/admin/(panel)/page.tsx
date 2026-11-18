import { ArrowRight, BadgePercent, Clock, HelpCircle, Layers, MonitorSmartphone, Newspaper, Package, Settings, ShieldCheck, Star, Users } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { AdminPageHeader, StatCard } from "@/components/admin/page-header";
import { getDeals, getDomains, getProducts } from "@/lib/catalog";
import { requireStaff } from "@/server/auth/dal";
import { getDashboardStats } from "@/server/admin/users";

export const metadata = { title: "Dashboard" };

const timeAgo = (d: Date) => {
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
};

const shortcuts = [
  { href: "/admin/products/new", icon: <Package />, title: "Add a product", text: "With packages, prices and a picture." },
  { href: "/admin/deals", icon: <BadgePercent />, title: "Start a deal", text: "Put a package on sale until a set time." },
  { href: "/admin/reviews", icon: <Star />, title: "Add a review", text: "Show what happy customers say." },
  { href: "/admin/content/blog/new", icon: <Newspaper />, title: "Write a guide", text: "How-to posts that bring visitors." },
  { href: "/admin/content", icon: <HelpCircle />, title: "Edit questions & answers", text: "Home page, sections and help center." },
  { href: "/admin/settings", icon: <Settings />, title: "Contact details", text: "WhatsApp number, email, social links.", adminOnly: true },
];

async function Overview() {
  const me = await requireStaff();
  const [stats, products, domains, deals] = await Promise.all([getDashboardStats(), getProducts(), getDomains(), getDeals()]);

  return (
    <>
      <AdminPageHeader title={`Namaste, ${me.name.split(" ")[0]}`} description="Here's what's happening in your store." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Products" value={products.length} hint={`on the website, in ${domains.length} sections`} icon={<Package />} />
        <StatCard label="Active deals" value={deals.length} hint="shown on the home & deals pages" icon={<BadgePercent />} />
        <StatCard label="Team" value={stats.admins + stats.staff} hint={`${stats.admins} admin · ${stats.staff} staff`} icon={<Users />} />
        <StatCard label="Signed-in devices" value={stats.activeSessions} hint="active sessions right now" icon={<MonitorSmartphone />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <h2 className="flex items-center gap-2 font-bold">
            <Layers className="size-5 text-primary" /> Quick actions
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {shortcuts
              .filter((x) => !x.adminOnly || me.role === "admin")
              .map((x) => (
                <li key={x.href}>
                  <Link
                    href={x.href}
                    className="flex h-full items-start gap-3 rounded-xl border border-border bg-surface-2/60 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20 [&_svg]:size-[18px]">{x.icon}</span>
                    <span>
                      <span className="block font-semibold">{x.title}</span>
                      <span className="block text-sm text-muted-foreground">{x.text}</span>
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold">
              <Clock className="size-5 text-primary" /> Recent sign-ins
            </h2>
            {me.role === "admin" && (
              <Link href="/admin/users" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                Team <ArrowRight className="size-4" />
              </Link>
            )}
          </div>
          <ul className="mt-4 flex flex-col divide-y divide-border">
            {stats.recentLogins.map((u) => (
              <li key={u.email} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{u.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{u.email}</span>
                </span>
                <span className="shrink-0 text-right text-xs text-muted-foreground">
                  <span className="mb-0.5 flex items-center justify-end gap-1 font-semibold text-foreground capitalize">
                    <ShieldCheck className="size-3.5 text-success" /> {u.role}
                  </span>
                  {u.lastLoginAt ? timeAgo(u.lastLoginAt) : "—"}
                </span>
              </li>
            ))}
            {stats.recentLogins.length === 0 && <li className="py-3 text-sm text-muted-foreground">No sign-ins yet.</li>}
          </ul>
        </section>
      </div>
    </>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      }
    >
      <Overview />
    </Suspense>
  );
}
