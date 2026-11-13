"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

type Side = "center" | "right" | "left" | "bottom";

const panel: Record<Side, string> = {
  center: "m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl",
  right: "ml-auto mr-0 h-dvh max-h-dvh w-full max-w-md rounded-none sm:rounded-l-2xl",
  left: "mr-auto ml-0 h-dvh max-h-dvh w-[85%] max-w-sm rounded-none rounded-r-2xl",
  bottom: "mb-0 mt-auto w-full max-w-none rounded-t-2xl max-h-[85dvh]",
};

const enter: Record<Side, string> = {
  center: "open:animate-[dialog-in_.2s_ease-out]",
  right: "open:animate-[sheet-right_.25s_ease-out]",
  left: "open:animate-[sheet-left_.25s_ease-out]",
  bottom: "open:animate-[sheet-up_.25s_ease-out]",
};

/**
 * Modal (side="center") or sheet/drawer (left / right / bottom).
 * Built on native <dialog>: focus trap, Esc to close and backdrop for free.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  side = "center",
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  side?: Side;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // lock page scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // click on backdrop
      }}
      className={cn(
        "flex-col overflow-hidden border border-border bg-surface p-0 text-foreground shadow-card-hover open:flex",
        "backdrop:bg-brand-navy-deep/60 backdrop:backdrop-blur-sm",
        panel[side],
        enter[side],
        className,
      )}
    >
      {(title || description) && (
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="flex flex-col gap-1">
            {title && <h2 className="text-lg font-extrabold italic">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-m-1 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-5">{children}</div>
      {footer && <div className="flex justify-end gap-3 border-t border-border p-4">{footer}</div>}
    </dialog>
  );
}
