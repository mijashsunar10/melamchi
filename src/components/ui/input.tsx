import { ChevronDown } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full rounded-lg border border-input bg-surface px-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors outline-none focus:border-ring focus:ring-3 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-danger aria-invalid:focus:ring-danger/20";

export function Input({
  className,
  icon,
  ...props
}: ComponentProps<"input"> & { icon?: ReactNode }) {
  if (!icon) return <input className={cn(control, "h-11", className)} {...props} />;
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:size-4">
        {icon}
      </span>
      <input className={cn(control, "h-11 pl-10", className)} {...props} />
    </div>
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-24 py-3", className)} {...props} />;
}

export function Select({
  className,
  options,
  placeholder,
  ...props
}: ComponentProps<"select"> & { options: string[]; placeholder?: string }) {
  return (
    <div className="relative">
      <select className={cn(control, "h-11 appearance-none pr-10", className)} {...props}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("text-sm font-semibold text-foreground", className)} {...props} />;
}

/**
 * Label + control + help/error text, wired up for accessibility.
 * Usage: <Field label="Player ID" help="…">{(id, describedBy) => <Input id={id} aria-describedby={describedBy} />}</Field>
 */
export function Field({
  label,
  help,
  error,
  required,
  className,
  children,
}: {
  label: string;
  help?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: (id: string, describedBy: string | undefined, invalid: boolean) => ReactNode;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-0.5 text-accent">*</span>}
      </Label>
      {children(id, help || error ? hintId : undefined, Boolean(error))}
      {(error || help) && (
        <p id={hintId} className={cn("text-xs", error ? "text-danger" : "text-muted-foreground")}>
          {error ?? help}
        </p>
      )}
    </div>
  );
}
