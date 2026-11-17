import { LogOut, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { logoutAction } from "@/server/auth/actions";
import { requireStaff } from "@/server/auth/dal";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// B2: minimal protected page to prove authentication works.
// B3 replaces this with the full dashboard (sidebar, stats, orders…).

async function Welcome() {
  const user = await requireStaff(); // checks the session in the database
  return (
    <div className="rounded-3xl border border-border bg-surface p-8 shadow-card">
      <span className="flex size-12 items-center justify-center rounded-xl bg-success/10 text-success">
        <ShieldCheck className="size-6" />
      </span>
      <h1 className="mt-5 font-display text-3xl font-black italic">Welcome, {user.name}</h1>
      <p className="mt-1 text-muted-foreground">
        Signed in as <span className="font-semibold text-foreground">{user.email}</span> · role{" "}
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-sm font-semibold text-primary">{user.role}</span>
      </p>
      <p className="mt-6 text-sm text-muted-foreground">The admin dashboard is coming next (B3).</p>
      <form action={logoutAction} className="mt-6">
        <button
          type="submit"
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-input bg-surface px-5 text-sm font-semibold transition-colors hover:bg-muted"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </form>
    </div>
  );
}

export default function AdminHomePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16">
      <Suspense fallback={<div className="skeleton h-64 rounded-3xl" />}>
        <Welcome />
      </Suspense>
    </main>
  );
}
