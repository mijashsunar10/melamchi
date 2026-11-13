import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Native <details> accordion — works without JavaScript, great for FAQs. */
export function Accordion({
  items,
  className,
  name,
}: {
  items: { q: ReactNode; a: ReactNode }[];
  className?: string;
  /** give a name to allow only one open item at a time */
  name?: string;
}) {
  return (
    <div className={cn("flex flex-col divide-y divide-border rounded-xl border border-border bg-surface", className)}>
      {items.map((item, i) => (
        <details key={i} name={name} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
            {item.q}
            <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</div>
        </details>
      ))}
    </div>
  );
}
