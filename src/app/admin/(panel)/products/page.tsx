import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { getCurrentUser, requireStaff } from "@/server/auth/dal";
import { listAdminProducts, listSectionOptions } from "@/server/admin/products";
import { ProductList } from "./product-list";

export const metadata = { title: "Products" };

async function Products() {
  await requireStaff();
  const [rows, sections, me] = await Promise.all([listAdminProducts(), listSectionOptions(), getCurrentUser()]);
  return (
    <ProductList
      canDelete={me?.role === "admin"}
      sections={sections.map((s) => ({ slug: s.slug, name: s.name }))}
      products={rows.map((r) => ({ ...r, updatedAt: r.updatedAt.toISOString() }))}
    />
  );
}

export default function ProductsPage() {
  return (
    <>
      <AdminPageHeader
        title="Products"
        description="Everything you sell. Change prices and packages, hide a product, or add a new one."
        actions={
          <Link
            href="/admin/products/new"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary-hover sm:w-auto"
          >
            <Plus className="size-4" /> Add product
          </Link>
        }
      />
      <Suspense
        fallback={
          <div className="flex flex-col gap-4">
            <div className="skeleton h-12 rounded-xl" />
            <div className="skeleton h-[28rem] rounded-2xl" />
          </div>
        }
      >
        <Products />
      </Suspense>
    </>
  );
}
