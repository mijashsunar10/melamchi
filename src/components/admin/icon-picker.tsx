"use client";

import { useState } from "react";
import { Icon, ICON_LABELS, ICON_NAMES } from "@/components/icon";
import { cn } from "@/lib/cn";
import type { IconName } from "@/types/catalog";

/** Click-a-picture icon chooser. Submits the chosen icon as a hidden form field. */
export function IconPicker({
  name = "icon",
  defaultValue = "Package",
  onChange,
}: {
  name?: string;
  defaultValue?: IconName;
  /** optional: also report the choice (for editors that keep their own state) */
  onChange?: (icon: IconName) => void;
}) {
  const [value, setValue] = useState<IconName>(defaultValue);

  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <div role="radiogroup" aria-label="Icon" className="grid grid-cols-6 gap-2 sm:grid-cols-9">
        {ICON_NAMES.map((n) => {
          const selected = n === value;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={ICON_LABELS[n]}
              title={ICON_LABELS[n]}
              onClick={() => {
                setValue(n);
                onChange?.(n);
              }}
              className={cn(
                "flex aspect-square items-center justify-center rounded-xl border-2 transition-all",
                selected
                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                  : "border-transparent bg-muted text-foreground/70 hover:border-primary/40 hover:text-foreground",
              )}
            >
              <Icon name={n} className="size-5" />
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Selected: <span className="font-semibold text-foreground">{ICON_LABELS[value]}</span>
      </p>
    </div>
  );
}
