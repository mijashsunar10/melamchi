"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { cn } from "@/lib/cn";

export interface ShowcaseTab {
  value: string;
  label: string;
  icon: ReactNode;
  href: string;
  /** pre-rendered product cards (server components) */
  content: ReactNode;
}

/** Category chips that switch the product grid below them. */
export function ProductShowcase({ tabs }: { tabs: ShowcaseTab[] }) {
  const [active, setActive] = useState(tabs[0]?.value);
  const current = tabs.find((t) => t.value === active) ?? tabs[0];

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {tabs.map((t) => {
          const selected = t.value === current.value;
          return (
            <button
              key={t.value}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => setActive(t.value)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all [&_svg]:size-4",
                selected
                  ? "bg-primary text-primary-foreground shadow-[0_8px_20px_-6px_rgba(29,63,191,0.6)]"
                  : "bg-surface text-muted-foreground ring-1 ring-border hover:text-foreground hover:ring-primary/30",
              )}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      {tabs.map((t) => (
        <div key={t.value} role="tabpanel" hidden={t.value !== current.value} className="animate-fade-up">
          {t.content}
        </div>
      ))}

      <Link
        href={current.href}
        className="mx-auto flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-bold text-primary shadow-card transition-all hover:border-primary/40 hover:shadow-card-hover"
      >
        See all {current.label} <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
