import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Icon } from "@/components/icon";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireRole } from "@/server/auth/dal";
import { listSectionsWithCategories } from "@/server/admin/catalog";

export const metadata = { title: "Sections & categories" };

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

async function SectionCards() {
  await requireRole(["admin"]);
  const sections = await listSectionsWithCategories();

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {sections.map((s) => (
        <li key={s.slug}>
          <Link
            href={`/admin/categories/${s.slug}`}
            className="group flex h-full items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
          >
            <span className={`flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${s.gradient} text-white shadow-md`}>
              <Icon name={s.icon} className="size-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-bold">{s.name}</span>
              <span className="sr-only">Manage</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                {plural(s.categories.length, "category", "categories")} · {plural(s.productCount, "product", "products")}
              </span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function CategoriesPage() {
  return (
    <>
      <AdminPageHeader
        title="Sections & categories"
        description="Your store has 6 sections. Click a section to change its details or to add, rename and remove its categories."
      />
      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        }
      >
        <SectionCards />
      </Suspense>
    </>
  );
}
