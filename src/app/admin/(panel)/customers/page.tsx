import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { cn } from "@/lib/cn";
import { formatNPR } from "@/lib/format";
import { requireStaff } from "@/server/auth/dal";
import { listCustomers } from "@/server/admin/users";

export const metadata = { title: "Customers" };

const fmt = (d: Date | null) =>
  d ? d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kathmandu" }) : "Never";

async function CustomerTable() {
  await requireStaff();
  const rows = await listCustomers();
  if (rows.length === 0)
    return <p className="rounded-2xl border border-border bg-surface p-10 text-center text-muted-foreground">No customers have registered yet.</p>;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-surface-2/60 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Last sign-in</th>
              <th className="px-5 py-3">Orders</th>
              <th className="px-5 py-3">Spent</th>
              <th className="px-5 py-3">
                <span className="sr-only">Open</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((u) => (
              <tr key={u.id} className={cn("relative hover:bg-muted/50", !u.isActive && "opacity-60")}>
                <td className="px-5 py-3.5">
                  <Link href={`/admin/customers/${u.id}`} className="font-semibold after:absolute after:inset-0 hover:text-primary">
                    {u.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </td>
                <td className="px-5 py-3.5">
                  <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", u.online ? "text-success" : "text-muted-foreground")}>
                    <span className={cn("size-2 rounded-full", u.online ? "bg-success" : "bg-muted-foreground")} />
                    {!u.isActive ? "Deactivated" : u.online ? "Logged in" : "Logged out"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">{fmt(u.lastLoginAt)}</td>
                <td className="px-5 py-3.5 font-semibold">{u.orders}</td>
                <td className="px-5 py-3.5 font-semibold">{formatNPR(u.spent)}</td>
                <td className="px-5 py-3.5 text-right text-muted-foreground">
                  <ChevronRight className="ml-auto size-4" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <>
      <AdminPageHeader title="Customers" description="Everyone who made an account on the website. Click a customer to see their dashboard." />
      <Suspense fallback={<div className="skeleton h-48 rounded-2xl" />}>
        <CustomerTable />
      </Suspense>
    </>
  );
}
