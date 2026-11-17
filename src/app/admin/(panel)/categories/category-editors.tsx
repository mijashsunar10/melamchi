"use client";

import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useActionState, useEffect, useState, useTransition } from "react";
import { Icon, ICON_NAMES } from "@/components/icon";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  createCategoryAction,
  deleteCategoryAction,
  moveCategoryAction,
  updateCategoryAction,
  updateSectionAction,
} from "@/server/admin/catalog-actions";
import type { ActionState } from "@/server/admin/user-actions";
import type { IconName } from "@/types/catalog";

/** Toast + close on success for a useActionState form. */
function useResult(state: ActionState, onSuccess?: () => void) {
  const toast = useToast();
  useEffect(() => {
    if (state.ok && state.message) {
      toast({ type: "success", title: state.message });
      onSuccess?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
}

function ErrorBox({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
      {error}
    </p>
  );
}

function IconPicker({ name, defaultValue }: { name: string; defaultValue: IconName }) {
  const [value, setValue] = useState<IconName>(defaultValue);
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
        <Icon name={value} className="size-5" />
      </span>
      <Select name={name} value={value} onChange={(e) => setValue(e.target.value as IconName)} options={ICON_NAMES} className="flex-1" />
    </div>
  );
}

function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

// ---------------------------------------------------------------- section

export interface SectionData {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  icon: IconName;
  highlights: string[];
}

export function EditSectionButton({ section }: { section: SectionData }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionState, FormData>(updateSectionAction, {});
  useResult(state, () => setOpen(false));
  const highlights = [...section.highlights, "", "", ""].slice(0, 3);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-input px-3 text-sm font-semibold hover:bg-muted">
        <Pencil className="size-4" /> Edit section
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={`Edit “${section.name}”`} description={`Page link: /${section.slug} (fixed)`}>
        <form action={action} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="slug" value={section.slug} />
          <ErrorBox error={state.error} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" required>
              {(id) => <Input id={id} name="name" defaultValue={section.name} required />}
            </Field>
            <Field label="Short name" required help="Used in tight spaces.">
              {(id, d) => <Input id={id} aria-describedby={d} name="shortName" defaultValue={section.shortName} required />}
            </Field>
          </div>
          <Field label="Tagline" required>
            {(id) => <Input id={id} name="tagline" defaultValue={section.tagline} required />}
          </Field>
          <Field label="Description" required>
            {(id) => <Textarea id={id} name="description" defaultValue={section.description} rows={3} required />}
          </Field>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-semibold">Highlights (shown with ✓ on the section page)</legend>
            {highlights.map((h, i) => (
              <Input key={i} name="highlights" defaultValue={h} placeholder={`Highlight ${i + 1}`} />
            ))}
          </fieldset>
          <Field label="Icon" required>
            {() => <IconPicker name="icon" defaultValue={section.icon} />}
          </Field>
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button type="button" onClick={() => setOpen(false)} className="h-10 rounded-lg px-4 text-sm font-semibold hover:bg-muted">
              Cancel
            </button>
            <SubmitButton pending={pending}>Save section</SubmitButton>
          </div>
        </form>
      </Dialog>
    </>
  );
}

// ---------------------------------------------------------------- categories

export function AddCategoryForm({ domainSlug }: { domainSlug: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createCategoryAction, {});
  const [key, setKey] = useState(0);
  useResult(state, () => setKey((k) => k + 1)); // reset the form

  return (
    <form key={key} action={action} className="flex flex-col gap-3 border-t border-border p-4 sm:p-5" noValidate>
      <input type="hidden" name="domainSlug" value={domainSlug} />
      <ErrorBox error={state.error} />
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field label="New category">
          {(id) => <Input id={id} name="name" placeholder="e.g. Battle Royale" />}
        </Field>
        <Field label="Icon">{() => <IconPicker name="icon" defaultValue="Package" />}</Field>
        <SubmitButton pending={pending}>
          <Plus className="size-4" /> Add
        </SubmitButton>
      </div>
    </form>
  );
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  icon: IconName;
  productCount: number;
}

export function CategoryRow({ category, first, last, domainSlug }: { category: CategoryData; first: boolean; last: boolean; domainSlug: string }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [state, action, saving] = useActionState<ActionState, FormData>(updateCategoryAction, {});
  useResult(state, () => setEditOpen(false));

  const run = (fn: () => Promise<ActionState>) =>
    start(async () => {
      const r = await fn();
      if (r.error) toast({ type: "error", title: r.error });
      else if (r.message) toast({ type: "success", title: r.message });
    });

  const iconBtn = "flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30";

  return (
    <li className="flex items-center gap-3 px-4 py-3 sm:px-5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon name={category.icon} className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{category.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          /{domainSlug}?category={category.slug} · {category.productCount} product{category.productCount === 1 ? "" : "s"}
        </p>
      </div>
      {pending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
      <div className="flex items-center gap-0.5">
        <button type="button" aria-label="Move up" className={iconBtn} disabled={first || pending} onClick={() => run(() => moveCategoryAction(category.id, "up"))}>
          <ArrowUp className="size-4" />
        </button>
        <button type="button" aria-label="Move down" className={iconBtn} disabled={last || pending} onClick={() => run(() => moveCategoryAction(category.id, "down"))}>
          <ArrowDown className="size-4" />
        </button>
        <button type="button" aria-label={`Edit ${category.name}`} className={iconBtn} onClick={() => setEditOpen(true)}>
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          aria-label={`Delete ${category.name}`}
          className={`${iconBtn} hover:text-danger`}
          disabled={pending}
          onClick={() => {
            const note = category.productCount
              ? `\n\n${category.productCount} product(s) in it will stay in the section without a category.`
              : "";
            if (window.confirm(`Delete category “${category.name}”?${note}`)) run(() => deleteCategoryAction(category.id));
          }}
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title={`Edit “${category.name}”`}>
        <form action={action} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="id" value={category.id} />
          <ErrorBox error={state.error} />
          <Field label="Name" required>
            {(id) => <Input id={id} name="name" defaultValue={category.name} required />}
          </Field>
          <Field label="Link name" help="Used in the page address. Letters, numbers and dashes.">
            {(id, d) => <Input id={id} aria-describedby={d} name="slug" defaultValue={category.slug} />}
          </Field>
          <Field label="Icon">{() => <IconPicker name="icon" defaultValue={category.icon} />}</Field>
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button type="button" onClick={() => setEditOpen(false)} className="h-10 rounded-lg px-4 text-sm font-semibold hover:bg-muted">
              Cancel
            </button>
            <SubmitButton pending={saving}>Save</SubmitButton>
          </div>
        </form>
      </Dialog>
    </li>
  );
}
