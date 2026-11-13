"use client";

import { ChevronDown, Menu, MessageCircle, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Dialog } from "@/components/ui/dialog";
import { siteConfig } from "@/lib/site";
import type { Domain } from "@/types/catalog";

export function MobileMenu({ domains }: { domains: Domain[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="-ml-1 inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-muted lg:hidden"
      >
        <Menu className="size-6" />
      </button>

      <Dialog open={open} onClose={close} side="left" title="Menu">
        <div className="flex flex-col gap-2">
          <Link href="/login" onClick={close} className="mb-2 flex items-center gap-3 rounded-xl bg-primary p-3 font-semibold text-primary-foreground">
            <span className="flex size-9 items-center justify-center rounded-full bg-white/15">
              <UserRound className="size-5" />
            </span>
            Login / Register
          </Link>

          {domains.map((d) => (
            <details key={d.slug} name="mobile-domains" className="group rounded-xl border border-border">
              <summary className="flex cursor-pointer list-none items-center gap-3 p-3 font-semibold [&::-webkit-details-marker]:hidden">
                <span className={`flex size-9 items-center justify-center rounded-lg bg-gradient-to-br ${d.gradient} text-white`}>
                  <Icon name={d.icon} className="size-5" />
                </span>
                <span className="flex-1">{d.name}</span>
                <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="flex flex-col gap-0.5 px-3 pb-3">
                <Link href={`/${d.slug}`} onClick={close} className="rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-muted">
                  All {d.name}
                </Link>
                {d.categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/${d.slug}?category=${c.slug}`}
                    onClick={close}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                  >
                    <Icon name={c.icon} className="size-4 text-muted-foreground" />
                    {c.name}
                  </Link>
                ))}
              </div>
            </details>
          ))}

          <div className="mt-3 flex items-center justify-between rounded-xl bg-muted p-3">
            <a href={siteConfig.contact.whatsapp} className="flex items-center gap-2 text-sm font-semibold text-success">
              <MessageCircle className="size-5" /> WhatsApp support
            </a>
            <ThemeToggle />
          </div>
        </div>
      </Dialog>
    </>
  );
}
