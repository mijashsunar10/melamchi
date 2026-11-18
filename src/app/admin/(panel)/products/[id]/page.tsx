import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser, requireStaff } from "@/server/auth/dal";
import { getAdminProduct, listSectionOptions } from "@/server/admin/products";
import type { ProductTag } from "@/types/catalog";
import { ProductForm } from "../product-form";

export const metadata = { title: "Edit product" };

async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const [p, sections, me] = await Promise.all([getAdminProduct(id), listSectionOptions(), getCurrentUser()]);
  if (!p) notFound();
  return (
    <ProductForm
      // a fresh form after saving / switching products
      key={`${p.id}-${p.updatedAt.getTime()}`}
      canDelete={me?.role === "admin"}
      sections={sections}
      initial={{
        id: p.id,
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        domainSlug: p.domainSlug,
        categoryId: p.categoryId,
        deliveryType: p.deliveryType,
        shortDescription: p.shortDescription,
        description: p.description === p.shortDescription ? "" : p.description,
        region: p.region,
        deliveryTime: p.deliveryTime,
        color: p.color,
        initials: p.initials,
        image: p.imageUrl,
        tags: p.tags as ProductTag[],
        isActive: p.isActive,
        plans: p.plans.map((pl) => ({
          key: pl.slug,
          name: pl.name,
          price: pl.price,
          originalPrice: pl.originalPrice,
          bonus: pl.bonus ?? "",
          validity: pl.validity ?? "",
          inStock: pl.inStock,
          popular: pl.popular,
        })),
        fields: p.fields,
        howTo: p.howTo,
        faq: p.faq,
      }}
    />
  );
}

export default function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  return (
    <Suspense fallback={<div className="skeleton h-[40rem] rounded-2xl" />}>
      <EditProduct params={params} />
    </Suspense>
  );
}
