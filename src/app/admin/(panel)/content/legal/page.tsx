import { ChevronRight, Scale } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireRole } from "@/server/auth/dal";
import { listAdminLegalPages } from "@/server/admin/content";

export const metadata = { title: "Legal pages" };

async function Pages() {
  await requireRole(["admin"]);
  const pages = await listAdminLegalPages();
  return (
    <ul className="grid gap-4 md:grid-cols-3">
      {pages.map((p) => (
        <li key={p.slug}>
          <Link
            href={`/admin/content/legal/${p.slug}`}
            className="group flex h-full items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20">
              <Scale className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{p.title}</span>
              <span className="block text-xs text-muted-foreground">
                Last updated {new Date(p.updated).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </span>
            <ChevronRight className="size-5 text-primary" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function LegalListPage() {
  return (
    <>
      <AdminPageHeader title="Legal pages" description="Have these checked by your company or a lawyer before launch. The “last updated” date changes automatically when you save." />
      <Suspense fallback={<div className="skeleton h-28 rounded-2xl" />}>
        <Pages />
      </Suspense>
    </>
  );
}
