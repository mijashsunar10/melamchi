"use client";

import { ExternalLink, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Dialog } from "@/components/ui/dialog";
import logo from "../../../public/brand/topx-logo.png";
import { AdminNav } from "./admin-nav";

type Role = "admin" | "staff" | "customer" | null;

/** Admin layout: fixed sidebar on desktop, slide-out menu on phones, top bar. */
export function AdminShell({ role, userMenu, children }: { role: Role; userMenu: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const brand = (
    <Link href="/admin" className="flex items-center gap-2" onClick={() => setOpen(false)}>
      <Image src={logo} alt="TOPX Nepal" loading="eager" sizes="120px" className="h-9 w-auto" />
      <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-primary uppercase dark:bg-primary/20">
        Admin
      </span>
    </Link>
  );

  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[260px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 overflow-y-auto border-r border-border bg-surface px-4 py-5 lg:flex">
        {brand}
        <AdminNav role={role} />
      </aside>

      {/* Mobile menu */}
      <Dialog open={open} onClose={() => setOpen(false)} side="left" title="Admin menu">
        <AdminNav role={role} onNavigate={() => setOpen(false)} />
      </Dialog>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open admin menu"
            className="-ml-1 flex size-10 items-center justify-center rounded-lg hover:bg-muted lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <div className="lg:hidden">{brand}</div>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground sm:flex"
            >
              View store <ExternalLink className="size-3.5" />
            </Link>
            <ThemeToggle className="border-transparent bg-transparent" />
            {userMenu}
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
