import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CustomerDashboard } from "@/components/account/customer-dashboard";
import { requireStaff } from "@/server/auth/dal";
import { getCustomer } from "@/server/admin/users";
import { listMyOrders } from "@/server/shop/orders";

export const metadata = { title: "Customer" };

const fmt = (d: Date | null) =>
  d ? d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kathmandu" }) : "Never";

async function Customer({ params }: { params: PageProps<"/admin/customers/[id]">["params"] }) {
  await requireStaff();
  const { id } = await params;
  const user = await getCustomer(id);
  if (!user) notFound();
  const orders = await listMyOrders(user.id);
  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        Joined {fmt(user.createdAt)} · Last sign-in {fmt(user.lastLoginAt)}
        {!user.isActive && " · Deactivated"}
      </p>
      <CustomerDashboard user={user} orders={orders} title={user.name} />
    </>
  );
}

export default function CustomerPage({ params }: PageProps<"/admin/customers/[id]">) {
  return (
    <>
      <Link href="/admin/customers" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All customers
      </Link>
      <Suspense fallback={<div className="skeleton h-48 rounded-3xl" />}>
        <Customer params={params} />
      </Suspense>
    </>
  );
}
