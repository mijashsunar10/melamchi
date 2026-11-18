import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireStaff } from "@/server/auth/dal";
import { listAdminDeals, listProductOptions } from "@/server/admin/content";
import { DealsManager } from "./deals-manager";

export const metadata = { title: "Deals" };

async function Deals() {
  await requireStaff();
  const [deals, products] = await Promise.all([listAdminDeals(), listProductOptions()]);
  return <DealsManager deals={deals} products={products} />;
}

export default function DealsPage() {
  return (
    <>
      <AdminPageHeader
        title="Deals"
        description="Flash deals give a discount on one package until a time you choose. They show on the home page, the Deals page and the product."
      />
      <Suspense fallback={<div className="skeleton h-96 rounded-2xl" />}>
        <Deals />
      </Suspense>
    </>
  );
}
