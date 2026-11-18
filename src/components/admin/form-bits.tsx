"use client";

import { Loader2 } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";

type Result = { ok?: boolean; error?: string; message?: string };

/** Shows a success toast (and runs `onSuccess`) when a server action succeeds. */
export function useActionResult(state: Result, onSuccess?: () => void) {
  const toast = useToast();
  const cb = useRef(onSuccess);
  useEffect(() => {
    cb.current = onSuccess;
  });
  useEffect(() => {
    if (state.ok && state.message) {
      toast({ type: "success", title: state.message });
      cb.current?.();
    }
  }, [state, toast]);
}

export function FormError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
      {error}
    </p>
  );
}

export function PrimaryButton({
  pending,
  children,
  className,
  ...props
}: { pending?: boolean; children: ReactNode } & React.ComponentProps<"button">) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className, ...props }: { children: ReactNode } & React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-input bg-surface px-5 text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
