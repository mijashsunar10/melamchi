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

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Suspense fallback={<div className="skeleton h-40 rounded-3xl" />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
