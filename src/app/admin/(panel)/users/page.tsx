import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { cn } from "@/lib/cn";
import { requireRole } from "@/server/auth/dal";
import { listStaff } from "@/server/admin/users";
import { CreateUserForm } from "./create-user-form";
import { UserRowActions } from "./user-row-actions";

export const metadata = { title: "Staff & users" };

const fmt = (d: Date | null) =>
  d ? d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never";

async function TeamTable() {
  const me = await requireRole(["admin"]);
  const team = await listStaff();

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-surface-2/60 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Last sign-in</th>
              <th className="px-5 py-3 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {team.map((u) => (
              <tr key={u.id} className={cn(!u.isActive && "opacity-60")}>
                <td className="px-5 py-3.5">
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-xs font-semibold capitalize",
                      u.role === "admin" ? "bg-primary/10 text-primary dark:bg-primary/20" : "bg-muted text-foreground",
                    )}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", u.isActive ? "text-success" : "text-muted-foreground")}>
                    <span className={cn("size-2 rounded-full", u.isActive ? "bg-success" : "bg-muted-foreground")} />
                    {u.isActive ? "Active" : "Deactivated"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">{fmt(u.lastLoginAt)}</td>
                <td className="px-5 py-3.5 text-right">
                  <UserRowActions user={u} isMe={u.id === me.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <>
      <AdminPageHeader title="Staff & users" description="Who can sign in to this admin panel." />
      <div className="flex flex-col gap-6">
        <Suspense fallback={<div className="skeleton h-48 rounded-2xl" />}>
          <TeamTable />
        </Suspense>
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <h2 className="mb-4 font-bold">Add a team member</h2>
          <CreateUserForm />
        </section>
      </div>
    </>
  );
}
