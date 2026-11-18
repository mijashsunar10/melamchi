import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireStaff } from "@/server/auth/dal";
import { listAdminReviews, listProductOptions } from "@/server/admin/content";
import { ReviewsManager } from "./reviews-manager";

export const metadata = { title: "Reviews" };

async function Reviews() {
  await requireStaff();
  const [reviews, products] = await Promise.all([listAdminReviews(), listProductOptions()]);
  return <ReviewsManager reviews={reviews} products={products.map((p) => ({ id: p.id, name: p.name, domainName: p.domainName }))} />;
}

export default function ReviewsPage() {
  return (
    <>
      <AdminPageHeader title="Reviews" description="What customers say. Shown reviews appear on the home page and on the product page." />
      <Suspense fallback={<div className="skeleton h-96 rounded-2xl" />}>
        <Reviews />
      </Suspense>
    </>
  );
}
