import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { UserMenu } from "@/components/admin/user-menu";
import { Bell } from "lucide-react";
import Link from "next/link";
import { requireStaff } from "@/server/auth/dal";
import { countPendingOrders } from "@/server/shop/orders";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · TOPX" },
  robots: { index: false, follow: false },
};

/** Checks the session once for the whole panel, then renders the shell. */
async function SignedInShell({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  const pending = await countPendingOrders();
  return (
    <AdminShell role={user.role} userMenu={<UserMenu user={user} />}>
      {pending > 0 && (
        <Link
          href="/admin/orders?status=pending"
          className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-500/50 bg-amber-500/10 px-4 py-3 font-semibold text-amber-700 dark:text-amber-300"
        >
          <Bell className="size-5 animate-pulse" />
          {pending} new order{pending > 1 ? "s" : ""} waiting — customer paid by QR. Click to check →
        </Link>
      )}
      {children}
    </AdminShell>
  );
}

function ShellSkeleton() {
  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[260px_1fr]" aria-busy="true">
      <aside className="hidden flex-col gap-4 border-r border-border bg-surface p-5 lg:flex">
        <div className="skeleton h-9 w-36 rounded-lg" />
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="skeleton h-9 rounded-lg" />
        ))}
      </aside>
      <div>
        <div className="h-16 border-b border-border bg-surface" />
        <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <SignedInShell>{children}</SignedInShell>
    </Suspense>
  );
}
