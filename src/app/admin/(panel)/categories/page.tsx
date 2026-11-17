import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Icon } from "@/components/icon";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireRole } from "@/server/auth/dal";
import { listSectionsWithCategories } from "@/server/admin/catalog";
import { AddCategoryForm, CategoryRow, EditSectionButton } from "./category-editors";

export const metadata = { title: "Sections & categories" };

async function Sections() {
  await requireRole(["admin"]);
  const sections = await listSectionsWithCategories();

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {sections.map((s) => (
        <section key={s.slug} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <header className="flex flex-wrap items-start gap-4 border-b border-border p-4 sm:p-5">
            <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} text-white`}>
              <Icon name={s.icon} className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold">{s.name}</h2>
              <p className="text-sm text-muted-foreground">{s.tagline}</p>
              <Link href={`/${s.slug}`} target="_blank" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                /{s.slug} · {s.productCount} products <ExternalLink className="size-3" />
              </Link>
            </div>
            <EditSectionButton
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
          </header>

          <ul className="flex-1 divide-y divide-border">
            {s.categories.map((c, i) => (
              <CategoryRow
                key={c.id}
                domainSlug={s.slug}
                first={i === 0}
                last={i === s.categories.length - 1}
                category={{ id: c.id, name: c.name, slug: c.slug, icon: c.icon, productCount: c.productCount }}
              />
            ))}
            {s.categories.length === 0 && <li className="px-5 py-4 text-sm text-muted-foreground">No categories yet.</li>}
          </ul>
          <AddCategoryForm domainSlug={s.slug} />
        </section>
      ))}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <>
      <AdminPageHeader
        title="Sections & categories"
        description="The 6 store sections and the categories inside them. Changes appear on the website immediately."
      />
      <Suspense fallback={<div className="grid gap-6 xl:grid-cols-2">{Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-80 rounded-2xl" />)}</div>}>
        <Sections />
      </Suspense>
    </>
  );
}
