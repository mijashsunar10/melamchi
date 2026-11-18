import { Suspense } from "react";
import { getCurrentUser, requireStaff } from "@/server/auth/dal";
import { listSectionOptions } from "@/server/admin/products";
import { ProductForm } from "../product-form";
import { TYPE_DEFAULTS } from "../templates";

export const metadata = { title: "Add product" };

async function NewProduct() {
  await requireStaff();
  const [sections, me] = await Promise.all([listSectionOptions(), getCurrentUser()]);
  const d = TYPE_DEFAULTS.TOPUP;
  return (
    <ProductForm
      canDelete={me?.role === "admin"}
      sections={sections}
      initial={{
        slug: "",
        name: "",
        brand: "",
        domainSlug: sections[0]?.slug ?? "",
        categoryId: null,
        deliveryType: "TOPUP",
        shortDescription: "",
        description: "",
        region: "Nepal",
        deliveryTime: d.deliveryTime,
        color: "#1d3fbf",
        initials: "",
        image: null,
        tags: [],
        isActive: true,
        plans: [],
        fields: d.fields,
        howTo: d.howTo,
        faq: d.faq,
      }}
    />
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={<div className="skeleton h-[40rem] rounded-2xl" />}>
      <NewProduct />
    </Suspense>
  );
}
