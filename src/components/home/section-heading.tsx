import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "View all",
  center,
  className,
  extra,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  href?: string;
  linkLabel?: string;
  center?: boolean;
  className?: string;
  extra?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", center && "flex-col items-center text-center", className)}>
      <div className={cn("flex min-w-0 flex-col gap-2", center && "items-center")}>
        {eyebrow && <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">{eyebrow}</p>}
        <h2 className="font-display text-[1.7rem] leading-tight font-black text-balance italic sm:text-4xl">{title}</h2>
        {description && <p className="max-w-2xl text-muted-foreground">{description}</p>}
      </div>
      {extra}
      {href && (
        <Link href={href} className="group flex items-center gap-1.5 text-sm font-bold text-primary">
          {linkLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
