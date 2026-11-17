import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireStaff } from "@/server/auth/dal";
import { countUserSessions } from "@/server/admin/users";
import { ChangePasswordForm, SignOutOthersButton } from "./account-forms";

export const metadata = { title: "My account" };

async function AccountDetails() {
  const me = await requireStaff();
  const sessions = await countUserSessions(me.id);
  const others = Math.max(0, sessions - 1);

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <h2 className="font-bold">Profile</h2>
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
          <dt className="text-muted-foreground">Name</dt>
          <dd className="font-semibold">{me.name}</dd>
          <dt className="text-muted-foreground">Email</dt>
          <dd className="font-semibold">{me.email}</dd>
          <dt className="text-muted-foreground">Role</dt>
          <dd className="font-semibold capitalize">{me.role}</dd>
        </dl>
        <div className="mt-6 border-t border-border pt-5">
          <h3 className="font-semibold">Devices</h3>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            Signed in on {sessions} device{sessions === 1 ? "" : "s"}
            {others > 0 ? ` (${others} other than this one)` : " (only this one)"}.
          </p>
          <SignOutOthersButton otherSessions={others} />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <h2 className="mb-4 font-bold">Change password</h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}

export default function AccountPage() {
  return (
    <>
      <AdminPageHeader title="My account" description="Your profile, password and signed-in devices." />
      <Suspense fallback={<div className="skeleton h-72 rounded-2xl" />}>
        <AccountDetails />
      </Suspense>
    </>
  );
}
