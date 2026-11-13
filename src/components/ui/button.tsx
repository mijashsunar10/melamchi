import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 select-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:size-[1.15em] [&_svg]:shrink-0";

const variants = {
  /** Blue — standard actions */
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm",
  /** Orange gradient — the main call to action ("Explore Now", "Buy now") */
  cta: "bg-cta-gradient text-accent-foreground shadow-glow-orange hover:-translate-y-0.5 hover:brightness-110",
  /** Plain orange */
  accent: "bg-accent text-accent-foreground hover:bg-accent-hover",
  outline: "border border-input bg-surface text-foreground hover:bg-muted",
  soft: "bg-primary/10 text-primary hover:bg-primary/15 dark:bg-primary/20 dark:hover:bg-primary/30",
  ghost: "text-foreground hover:bg-muted",
  /** For dark/hero backgrounds */
  glass: "border border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20",
  link: "text-primary underline-offset-4 hover:underline px-0! h-auto!",
  danger: "bg-danger text-white hover:brightness-110",
} as const;

const sizes = {
  sm: "h-9 rounded-md px-3 text-sm",
  md: "h-11 rounded-lg px-5 text-sm",
  lg: "h-13 rounded-xl px-7 text-base",
  icon: "size-10 rounded-full",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
  fullWidth?: boolean;
}

export function buttonClasses({ variant = "primary", size = "md", pill, fullWidth }: StyleProps = {}) {
  return cn(base, variants[variant], sizes[size], pill && "rounded-full", fullWidth && "w-full");
}

function Spinner() {
  return <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />;
}

export function Button({
  variant,
  size,
  pill,
  fullWidth,
  loading,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ComponentProps<"button"> & StyleProps & { loading?: boolean }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonClasses({ variant, size, pill, fullWidth }), className)}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

/** A Next.js <Link> that looks like a button. */
export function ButtonLink({
  variant,
  size,
  pill,
  fullWidth,
  className,
  ...props
}: ComponentProps<typeof Link> & StyleProps) {
  return <Link className={cn(buttonClasses({ variant, size, pill, fullWidth }), className)} {...props} />;
}
