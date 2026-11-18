"use client";

// Building blocks shared by the admin editors (products, deals, content, settings).

import { ArrowDown, ArrowLeft, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useId, useState } from "react";
import { Input, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import type { FAQ } from "@/types/catalog";

let uidCounter = 0;
/** Short unique id for list items in editor state (React keys). */
export const uid = () => `u${++uidCounter}`;

/** Move item i one place up (-1) or down (1). */
export function move<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export const selectCls =
  "h-11 w-full rounded-lg border border-input bg-surface px-3.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20";

export function Card({
  id,
  title,
  description,
  action,
  children,
  className,
}: {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 rounded-2xl border border-border bg-surface shadow-card", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  help,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  help?: ReactNode;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn("flex cursor-pointer items-start gap-3", disabled && "pointer-events-none opacity-60")}>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input id={id} type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full bg-muted-foreground/30 transition-colors peer-checked:bg-success peer-focus-visible:ring-3 peer-focus-visible:ring-ring/30" />
        <span className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        {help && <span className="block text-xs text-muted-foreground">{help}</span>}
      </span>
    </label>
  );
}

export function RowTools({
  index,
  count,
  onMove,
  onRemove,
  removeLabel,
}: {
  index: number;
  count: number;
  onMove: (d: -1 | 1) => void;
  onRemove: () => void;
  removeLabel: string;
}) {
  const btn = "flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-25";
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button type="button" className={btn} title="Move up" aria-label="Move up" disabled={index === 0} onClick={() => onMove(-1)}>
        <ArrowUp className="size-4" />
      </button>
      <button type="button" className={btn} title="Move down" aria-label="Move down" disabled={index === count - 1} onClick={() => onMove(1)}>
        <ArrowDown className="size-4" />
      </button>
      <button type="button" className={cn(btn, "hover:bg-danger/10 hover:text-danger")} title={removeLabel} aria-label={removeLabel} onClick={onRemove}>
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

export function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center gap-2 rounded-xl border-2 border-dashed border-primary/40 px-4 text-sm font-bold text-primary hover:border-primary hover:bg-primary/5"
    >
      <Plus className="size-4" /> {children}
    </button>
  );
}

/**
 * Tracks unsaved changes: compares the current state snapshot with the last saved one
 * and asks before the browser tab is closed while there are unsaved changes.
 */
export function useDirty(snapshot: string) {
  const [saved, setSaved] = useState(snapshot);
  const dirty = snapshot !== saved;
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  return { dirty, markSaved: (s = snapshot) => setSaved(s) };
}

/** Sticky bar at the bottom of an editor page: back link, unsaved note, Save button (type=submit). */
export function SaveBar({
  backHref,
  backLabel,
  dirty,
  saving,
  label = "Save changes",
  savedText = "All changes saved",
}: {
  backHref: string;
  backLabel: string;
  dirty: boolean;
  saving: boolean;
  label?: string;
  savedText?: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur lg:left-[260px]">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link href={backHref} className="inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
          <ArrowLeft className="size-4" /> <span className="hidden sm:inline">{backLabel}</span>
        </Link>
        <p className={cn("flex-1 text-right text-sm", dirty ? "font-semibold text-warning" : "text-muted-foreground")} aria-live="polite">
          {dirty ? "You have unsaved changes" : savedText}
        </p>
        <button
          type="submit"
          disabled={saving}
          data-save
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary-hover disabled:opacity-60"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {label}
        </button>
      </div>
    </div>
  );
}

export type QA = FAQ & { uid: string };
export const toQA = (list: FAQ[]): QA[] => list.map((f) => ({ ...f, uid: uid() }));
export const fromQA = (list: QA[]): FAQ[] => list.map(({ q, a }) => ({ q: q.trim(), a: a.trim() })).filter((f) => f.q || f.a);

/** Editable list of questions & answers (add, edit, reorder, remove). */
export function QAList({ items, onChange, addLabel = "Add question & answer" }: { items: QA[]; onChange: (next: QA[]) => void; addLabel?: string }) {
  return (
    <>
      {items.length === 0 && <p className="mb-4 text-sm text-muted-foreground">No questions yet.</p>}
      <ul className="flex flex-col gap-3" data-qa-list>
        {items.map((f, i) => {
          const set = (patch: Partial<FAQ>) => onChange(items.map((x) => (x.uid === f.uid ? { ...x, ...patch } : x)));
          return (
            <li key={f.uid} className="rounded-xl border border-border p-4" data-qa>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-sm font-bold">Question {i + 1}</span>
                <RowTools
                  index={i}
                  count={items.length}
                  onMove={(dir) => onChange(move(items, i, dir))}
                  onRemove={() => onChange(items.filter((x) => x.uid !== f.uid))}
                  removeLabel="Remove question"
                />
              </div>
              <div className="flex flex-col gap-3">
                <Input value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder="Question, e.g. How long does delivery take?" aria-label="Question" data-q />
                <Textarea value={f.a} onChange={(e) => set({ a: e.target.value })} rows={2} placeholder="Answer" aria-label="Answer" className="min-h-0" data-a />
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-4">
        <AddButton onClick={() => onChange([...items, { uid: uid(), q: "", a: "" }])}>{addLabel}</AddButton>
      </div>
    </>
  );
}
