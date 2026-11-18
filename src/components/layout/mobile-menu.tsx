"use client";

import { ChevronRight, House, Menu, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Dialog } from "@/components/ui/dialog";
import { useSiteSettings } from "@/components/site-settings";
import type { Domain } from "@/types/catalog";

export function MobileMenu({ domains }: { domains: Domain[] }) {
  const [open, setOpen] = useState(false);
  const { contact } = useSiteSettings();
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="-mr-1 inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-muted lg:hidden"
      >
        <Menu className="size-6" />
      </button>

      <Dialog open={open} onClose={close} side="right" title="Menu">
        <nav aria-label="Mobile" className="flex flex-col gap-1">
          <Link href="/" onClick={close} className="flex items-center gap-3 rounded-xl p-3 font-semibold hover:bg-muted">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <House className="size-5" />
            </span>
            <span className="flex-1">Home</span>
          </Link>
          {domains.map((d) => (
            <Link
              key={d.slug}
              href={`/${d.slug}`}
              onClick={close}
              className="flex items-center gap-3 rounded-xl p-3 font-semibold hover:bg-muted"
            >
              <span className={`flex size-9 items-center justify-center rounded-lg bg-gradient-to-br ${d.gradient} text-white`}>
                <Icon name={d.icon} className="size-5" />
              </span>
              <span className="flex-1">{d.name}</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          ))}

          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-muted p-3">
            <a
              href={contact.whatsapp}
              className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <MessageCircle className="size-4" /> Contact us
            </a>
            <ThemeToggle />
          </div>
        </nav>
      </Dialog>
    </>
  );
}
