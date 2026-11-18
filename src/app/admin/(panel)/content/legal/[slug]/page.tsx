import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireRole } from "@/server/auth/dal";
import { getAdminLegalPage } from "@/server/admin/content";
import { LegalEditor } from "./legal-editor";

export const metadata = { title: "Edit legal page" };

async function Editor({ params }: { params: Promise<{ slug: string }> }) {
  await requireRole(["admin"]);
  const { slug } = await params;
  const p = await getAdminLegalPage(slug);
  if (!p) notFound();
  return <LegalEditor key={p.updated + p.slug} initial={{ slug: p.slug, title: p.title, description: p.description, sections: p.sections }} updated={p.updated} />;
}

export default function LegalEditPage({ params }: PageProps<"/admin/content/legal/[slug]">) {
  return (
    <Suspense fallback={<div className="skeleton h-[36rem] rounded-2xl" />}>
      <Editor params={params} />
    </Suspense>
  );
}
