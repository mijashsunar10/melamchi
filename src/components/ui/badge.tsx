import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const variants = {
  default: "bg-muted text-foreground",
  primary: "bg-primary/10 text-primary dark:bg-primary/25 dark:text-brand-blue-200",
  accent: "bg-accent/12 text-accent dark:bg-accent/20",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-amber-700 dark:text-warning",
  danger: "bg-danger/12 text-danger",
  outline: "border border-border text-muted-foreground",
  solid: "bg-accent text-accent-foreground",
  /** for dark/hero backgrounds */
  glass: "border border-white/15 bg-white/10 text-white backdrop-blur",
} as const;

export type BadgeVariant = keyof typeof variants;

export function Badge({
  variant = "default",
  className,
  ...props
}: ComponentProps<"span"> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap [&_svg]:size-3.5",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

/** Product tag → badge style + label */
export const tagBadge = {
  hot: { variant: "solid", label: "Hot" },
  new: { variant: "primary", label: "New" },
  bestseller: { variant: "warning", label: "Best seller" },
  official: { variant: "success", label: "Official" },
  limited: { variant: "danger", label: "Limited" },
} as const satisfies Record<string, { variant: BadgeVariant; label: string }>;
