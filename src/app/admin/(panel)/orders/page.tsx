import { Bell } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { OrderStatusBadge } from "@/components/account/order-status";
import { AdminPageHeader } from "@/components/admin/page-header";
import { cn } from "@/lib/cn";
import { formatNPR } from "@/lib/format";
import { requireStaff } from "@/server/auth/dal";
import { listAllOrders, type OrderRow } from "@/server/shop/orders";
import { AutoRefresh } from "./auto-refresh";
import { CheckEsewaButton } from "./check-esewa";
import { OrderActions } from "./order-actions-ui";
import { ProofImage } from "./proof-image";

export const metadata = { title: "Orders" };

const TABS: { key?: OrderRow["status"]; label: string }[] = [
  { key: "processing", label: "Paid · processing" },
  { key: "delivered", label: "Delivered" },
  { key: "failed", label: "Failed" },
  { label: "All" },
];

const fmt = (d: Date) => d.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kathmandu" });

async function Orders({ searchParams }: { searchParams: PageProps<"/admin/orders">["searchParams"] }) {
  await requireStaff();
  const sp = await searchParams;
  const status = TABS.find((t) => t.key === sp.status)?.key ?? (sp.status === "all" ? undefined : "processing");
  const rows = await listAllOrders(status);

  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = (t.key ?? undefined) === status;
          return (
            <Link
              key={t.label}
              href={`/admin/orders?status=${t.key ?? "all"}`}
              className={cn("rounded-full border px-4 py-2 text-sm font-semibold", active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted")}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface p-10 text-center text-muted-foreground">No orders here.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map(({ order: o, customer }) => (
            <li key={o.id} className={cn("rounded-2xl border bg-surface p-4 shadow-card sm:p-5", !o.seenByAdmin ? "border-amber-500/60" : "border-border")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-bold">
                    {!o.seenByAdmin && <Bell className="size-4 text-amber-500" />}
                    {o.productName} · {o.planName}
                    {o.quantity > 1 && ` × ${o.quantity}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.id} · {fmt(o.createdAt)} · <Link href={`/admin/customers/${o.userId}`} className="font-semibold text-primary hover:underline">{customer.name}</Link> ({customer.email})
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm">
                    {Object.entries(o.details)
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <span key={k} className="rounded-lg bg-muted px-2.5 py-1 font-mono">
                          {k}: <strong>{v}</strong>
                        </span>
                      ))}
                    {o.paymentRef && <span className="rounded-lg bg-amber-500/10 px-2.5 py-1">Payment ref: <strong>{o.paymentRef}</strong></span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-xl font-black text-accent">{formatNPR(o.total)}</span>
                  <OrderStatusBadge status={o.status} />
                </div>
              </div>
              {o.paymentProofId && <ProofImage id={o.paymentProofId} />}
              <div className="mt-3 border-t border-border pt-3">
                <OrderActions id={o.id} status={o.status} note={o.adminNote} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  return (
    <>
      <AdminPageHeader title="Orders" description="Orders appear here once eSewa confirms payment. Add the top-up (or check auto top-up), then press Delivered. Failed = auto top-up error: top up by hand or refund." />
      <CheckEsewaButton />
      <AutoRefresh />
      <Suspense fallback={<div className="skeleton h-40 rounded-2xl" />}>
        <Orders searchParams={searchParams} />
      </Suspense>
    </>
  );
}
