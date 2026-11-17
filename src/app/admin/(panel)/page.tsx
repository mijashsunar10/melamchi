import { ArrowRight, BadgePercent, Clock, Layers, MonitorSmartphone, Package, ShieldCheck, Users } from "lucide-react";
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

const roadmap = [
  { step: "B4", title: "Products & categories", text: "Add, edit and price products from here." },
  { step: "B5", title: "Deals & content", text: "Flash deals, reviews, FAQ, guides and site settings." },
  { step: "B6", title: "Orders", text: "Every website order saved here with status updates." },
  { step: "B7", title: "Payments", text: "eSewa, Khalti and Fonepay online payments." },
];

async function Overview() {
  const me = await requireStaff();
  const [stats, products, domains, deals] = await Promise.all([getDashboardStats(), getProducts(), getDomains(), getDeals()]);

  return (
    <>
      <AdminPageHeader title={`Namaste, ${me.name.split(" ")[0]}`} description="Here's what's happening in your store." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Products" value={products.length} hint={`in ${domains.length} sections · sample data until B4`} icon={<Package />} />
        <StatCard label="Active deals" value={deals.length} hint="shown on the home & deals pages" icon={<BadgePercent />} />
        <StatCard label="Team" value={stats.admins + stats.staff} hint={`${stats.admins} admin · ${stats.staff} staff`} icon={<Users />} />
        <StatCard label="Signed-in devices" value={stats.activeSessions} hint="active sessions right now" icon={<MonitorSmartphone />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <h2 className="flex items-center gap-2 font-bold">
            <Layers className="size-5 text-primary" /> Coming to this dashboard
          </h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2">
            {roadmap.map((r) => (
              <li key={r.step} className="rounded-xl border border-border bg-surface-2/60 p-4">
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-bold text-primary dark:bg-primary/20">{r.step}</span>
                <p className="mt-2 font-semibold">{r.title}</p>
                <p className="text-sm text-muted-foreground">{r.text}</p>
              </li>
            ))}
          </ol>
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
