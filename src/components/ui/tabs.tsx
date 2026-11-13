"use client";

import { type KeyboardEvent, type ReactNode, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface TabItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
}

/** Accessible tabs (arrow keys move between tabs). variant "pill" for category chips. */
export function Tabs({
  items,
  defaultValue,
  variant = "underline",
  className,
  onChange,
}: {
  items: TabItem[];
  defaultValue?: string;
  variant?: "underline" | "pill";
  className?: string;
  onChange?: (value: string) => void;
}) {
  const [active, setActive] = useState(defaultValue ?? items[0]?.value);
  const id = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function select(value: string) {
    setActive(value);
    onChange?.(value);
  }

  function onKeyDown(e: KeyboardEvent, index: number) {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + items.length) % items.length;
    tabRefs.current[next]?.focus();
    select(items[next].value);
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        role="tablist"
        className={cn(
          "no-scrollbar flex gap-1 overflow-x-auto",
          variant === "underline" && "border-b border-border",
        )}
      >
        {items.map((item, i) => {
          const selected = item.value === active;
          return (
            <button
              key={item.value}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              type="button"
              id={`${id}-tab-${item.value}`}
              aria-selected={selected}
              aria-controls={`${id}-panel-${item.value}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(item.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "shrink-0 text-sm font-semibold whitespace-nowrap transition-colors",
                variant === "underline" &&
                  "-mb-px border-b-2 px-4 py-2.5 " +
                    (selected ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"),
                variant === "pill" &&
                  "rounded-full px-4 py-2 " +
                    (selected ? "bg-primary text-primary-foreground shadow-sm" : "bg-surface text-muted-foreground ring-1 ring-border hover:text-foreground"),
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.value}
          role="tabpanel"
          id={`${id}-panel-${item.value}`}
          aria-labelledby={`${id}-tab-${item.value}`}
          hidden={item.value !== active}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
