import { CheckCircle2, Clock, LogOut, Package, ShoppingBag, User } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { OrderStatusBadge } from "@/components/account/order-status";
import { formatNPR } from "@/lib/format";
import { customerLogoutAction } from "@/server/auth/customer-actions";
import { getCurrentUser } from "@/server/auth/dal";
import { listMyOrders } from "@/server/shop/orders";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

const fmtDate = (d: Date) =>
  d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kathmandu" });

async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  const orders = await listMyOrders(user.id);
  const active = orders.filter((o) => o.status === "pending" || o.status === "processing");
  const delivered = orders.filter((o) => o.status === "delivered");
  const spent = delivered.reduce((s, o) => s + o.total, 0);

  const stats = [
    { icon: <ShoppingBag />, label: "Total orders", value: orders.length },
    { icon: <Clock />, label: "In progress", value: active.length },
    { icon: <CheckCircle2 />, label: "Delivered", value: delivered.length },
    { icon: <Package />, label: "Total spent", value: formatNPR(spent) },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-6 shadow-card">
        <div className="flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <User className="size-7" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-black">Namaste, {user.name.split(" ")[0]}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <form action={customerLogoutAction}>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted">
            <LogOut className="size-4" /> Log out
          </button>
        </form>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface p-4 shadow-card">
            <span className="text-primary [&_svg]:size-5">{s.icon}</span>
            <p className="mt-2 font-display text-2xl font-black">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <h2 className="text-lg font-bold">My orders</h2>
        {orders.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-muted-foreground">You haven&apos;t ordered anything yet.</p>
            <Link href="/gaming" className="mt-4 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
              Shop top-ups
            </Link>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col divide-y divide-border">
            {orders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="font-semibold">
                    <Link href={`/product/${o.productSlug}`} className="hover:text-primary">
                      {o.productName}
                    </Link>{" "}
                    · {o.planName}
                    {o.quantity > 1 && ` × ${o.quantity}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.id} · {fmtDate(o.createdAt)}
                    {Object.entries(o.details)
                      .filter(([, v]) => v)
                      .map(([k, v]) => ` · ${k}: ${v}`)
                      .join("")}
                  </p>
                  {o.adminNote && <p className="mt-1 text-sm text-foreground/80">Note: {o.adminNote}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display font-black text-accent">{formatNPR(o.total)}</span>
                  <OrderStatusBadge status={o.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Suspense fallback={<div className="skeleton h-40 rounded-3xl" />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
