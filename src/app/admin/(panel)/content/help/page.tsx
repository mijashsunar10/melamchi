import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireStaff } from "@/server/auth/dal";
import { listAdminSupportTopics } from "@/server/admin/content";
import { HelpTopicsEditor } from "./help-editor";

export const metadata = { title: "Help center" };

async function Topics() {
  await requireStaff();
  const topics = await listAdminSupportTopics();
  return <HelpTopicsEditor initial={topics.map((t) => ({ slug: t.slug, name: t.name, icon: t.icon, faqs: t.faqs }))} />;
}

export default function HelpPage() {
  return (
    <>
      <AdminPageHeader
        title="Help center"
        description="The topics customers can pick on the Support page, each with its own questions. The topics also appear in the contact form."
      />
      <Suspense fallback={<div className="skeleton h-96 rounded-2xl" />}>
        <Topics />
      </Suspense>
    </>
  );
}
