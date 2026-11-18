import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { cn } from "@/lib/cn";
import { requireStaff } from "@/server/auth/dal";
import { listFaqsByScope, listSectionNames } from "@/server/admin/content";
import { FaqEditor } from "./faq-editor";

export const metadata = { title: "Questions & answers" };

async function Faq({ params }: { params: Promise<{ scope: string }> }) {
  await requireStaff();
  const { scope } = await params;
  const [all, sections] = await Promise.all([listFaqsByScope(), listSectionNames()]);
  const scopes = [{ slug: "home", name: "Home page" }, ...sections.filter((s) => s.slug !== "support")];
  const current = scopes.find((s) => s.slug === scope);
  if (!current) notFound();

  return (
    <>
      <nav aria-label="Which page" className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {scopes.map((s) => (
          <Link
            key={s.slug}
            href={`/admin/content/faq/${s.slug}`}
            aria-current={s.slug === scope ? "page" : undefined}
            className={cn(
              "inline-flex h-9 shrink-0 items-center rounded-full border px-4 text-sm font-semibold",
              s.slug === scope ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface hover:bg-muted",
            )}
          >
            {s.name}
          </Link>
        ))}
      </nav>
      <FaqEditor key={scope} scope={scope} pageName={current.name} pageHref={scope === "home" ? "/#faq" : `/${scope}`} initial={all[scope] ?? []} />
    </>
  );
}

export default function FaqPage({ params }: PageProps<"/admin/content/faq/[scope]">) {
  return (
    <>
      <AdminPageHeader title="Questions & answers" description="Choose a page, then add, change or reorder its questions. Press Save when done." />
      <Suspense fallback={<div className="skeleton h-96 rounded-2xl" />}>
        <Faq params={params} />
      </Suspense>
    </>
  );
}
