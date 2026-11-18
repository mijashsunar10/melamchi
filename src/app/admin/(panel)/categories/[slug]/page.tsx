import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Icon } from "@/components/icon";
import { requireRole } from "@/server/auth/dal";
import { getSectionWithCategories } from "@/server/admin/catalog";
import { AddCategoryButton, CategoryList, SectionDetailsForm } from "./section-editors";

export const metadata = { title: "Manage section" };

async function SectionManager({ params }: { params: Promise<{ slug: string }> }) {
  await requireRole(["admin"]);
  const { slug } = await params;
  const s = await getSectionWithCategories(slug);
  if (!s) notFound();

  return (
    <>
      <header className="mb-6 flex flex-wrap items-center gap-4">
        <span className={`flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${s.gradient} text-white shadow-md`}>
          <Icon name={s.icon} className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{s.name}</h1>
          <p className="text-sm text-muted-foreground">
            {s.productCount} {s.productCount === 1 ? "product" : "products"} in this section
          </p>
        </div>
        <Link
          href={`/${s.slug}`}
          target="_blank"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-input bg-surface px-4 text-sm font-semibold hover:bg-muted sm:w-auto"
        >
          See it on the website <ExternalLink className="size-4" />
        </Link>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.1fr]">
        <section id="categories" className="rounded-2xl border border-border bg-surface shadow-card lg:order-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
            <div>
              <h2 className="text-lg font-bold">Categories</h2>
              <p className="text-sm text-muted-foreground">Customers use these to filter products in {s.shortName}.</p>
            </div>
            <AddCategoryButton domainSlug={s.slug} sectionName={s.name} />
          </div>
          <CategoryList
            sectionName={s.name}
            categories={s.categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon, productCount: c.productCount }))}
          />
        </section>

        <section id="details" className="rounded-2xl border border-border bg-surface shadow-card lg:order-1">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-bold">Section details</h2>
            <p className="text-sm text-muted-foreground">The name and text shown at the top of this section on your website.</p>
          </div>
          <SectionDetailsForm
            section={{
              slug: s.slug,
              name: s.name,
              shortName: s.shortName,
              tagline: s.tagline,
              description: s.description,
              icon: s.icon,
              highlights: s.highlights,
            }}
          />
        </section>
      </div>
    </>
  );
}

export default function SectionPage({ params }: PageProps<"/admin/categories/[slug]">) {
  return (
    <>
      <Link href="/admin/categories" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All sections
      </Link>
      <Suspense
        fallback={
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="skeleton h-[32rem] rounded-2xl" />
            <div className="skeleton h-80 rounded-2xl" />
          </div>
        }
      >
        <SectionManager params={params} />
      </Suspense>
    </>
  );
}
