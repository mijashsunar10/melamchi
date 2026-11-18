import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireRole } from "@/server/auth/dal";
import { getAdminSettings } from "@/server/admin/content";
import { SettingsForm } from "./settings-form";

export const metadata = { title: "Settings" };

async function Settings() {
  await requireRole(["admin"]);
  return <SettingsForm initial={await getAdminSettings()} />;
}

export default function SettingsPage() {
  return (
    <>
      <AdminPageHeader title="Settings" description="Your contact details, social media links, the numbers shown on the website and the payment methods you accept." />
      <Suspense fallback={<div className="skeleton h-[36rem] rounded-2xl" />}>
        <Settings />
      </Suspense>
    </>
  );
}
