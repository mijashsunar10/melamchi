import { LogOut } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CustomerDashboard } from "@/components/account/customer-dashboard";
import { customerLogoutAction } from "@/server/auth/customer-actions";
import { getCurrentUser } from "@/server/auth/dal";
import { listMyOrders } from "@/server/shop/orders";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  const orders = await listMyOrders(user.id);
  return (
    <CustomerDashboard
      user={user}
      orders={orders}
      action={
        <form action={customerLogoutAction}>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted">
            <LogOut className="size-4" /> Log out
          </button>
        </form>
      }
    />
  );
}

async function EsewaNotice({ searchParams }: { searchParams: Promise<{ esewa?: string }> }) {
  const { esewa } = await searchParams;
  if (esewa === "paid")
    return <p className="mb-4 rounded-xl bg-success/15 px-4 py-3 text-sm font-semibold text-success">eSewa payment received. Your order is being processed.</p>;
  if (esewa === "failed")
    return <p className="mb-4 rounded-xl bg-danger/15 px-4 py-3 text-sm font-semibold text-danger">eSewa payment was not completed — please try again. If money was taken from your eSewa, don't pay again: we check with eSewa automatically and your order will show up within 10 minutes.</p>;
  return null;
}

export default function AccountPage({ searchParams }: { searchParams: Promise<{ esewa?: string }> }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Suspense>
        <EsewaNotice searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<div className="skeleton h-40 rounded-3xl" />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
