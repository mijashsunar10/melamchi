"use client";

import { ArrowDown, ArrowUp, FolderPlus, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import { FormError, PrimaryButton, SecondaryButton, useActionResult } from "@/components/admin/form-bits";
import { IconPicker } from "@/components/admin/icon-picker";
import { Icon } from "@/components/icon";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/input";
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

// ---------------------------------------------------------------- section details

export interface SectionData {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  icon: IconName;
  highlights: string[];
}

export function SectionDetailsForm({ section }: { section: SectionData }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateSectionAction, {});
  useActionResult(state);
  const highlights = [...section.highlights, "", "", ""].slice(0, 3);

  return (
    <form action={action} className="flex flex-col gap-5 p-5" noValidate>
      <input type="hidden" name="slug" value={section.slug} />
      <FormError error={state.error} />

      <Field label="Section name" required help="Example: Gaming Top-up">
        {(id, d) => <Input id={id} aria-describedby={d} name="name" defaultValue={section.name} required />}
      </Field>
      <Field label="Short name" required help="A shorter name for phones and small menus. Example: Gaming">
        {(id, d) => <Input id={id} aria-describedby={d} name="shortName" defaultValue={section.shortName} required />}
      </Field>
      <Field label="One-line summary" required help="Shown under the section name. Example: Instant top-ups for your favourite games">
        {(id, d) => <Input id={id} aria-describedby={d} name="tagline" defaultValue={section.tagline} required />}
      </Field>
      <Field label="Description" required help="A few sentences telling customers what they can buy here.">
        {(id, d) => <Textarea id={id} aria-describedby={d} name="description" defaultValue={section.description} rows={3} required />}
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold">Selling points</legend>
        <p className="-mt-1 mb-1 text-xs text-muted-foreground">Up to 3 short points shown with a ✓. Leave a box empty to hide it.</p>
        {highlights.map((h, i) => (
          <Input key={i} name="highlights" defaultValue={h} placeholder={["e.g. Delivered in minutes", "e.g. Best prices in Nepal", "e.g. 24/7 support"][i]} aria-label={`Selling point ${i + 1}`} />
        ))}
      </fieldset>

      <div>
        <p className="mb-2 text-sm font-semibold">Icon</p>
        <IconPicker defaultValue={section.icon} />
      </div>

      <div className="flex justify-end border-t border-border pt-5">
        <PrimaryButton pending={pending} className="w-full sm:w-auto">
          Save changes
        </PrimaryButton>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------- categories

export interface CategoryData {
  id: string;
  name: string;
  icon: IconName;
  productCount: number;
}

const productsText = (n: number) => (n === 0 ? "No products yet" : `${n} ${n === 1 ? "product" : "products"}`);

/** Name + icon form, used for both adding and renaming a category. */
function CategoryForm({
  action,
  pending,
  error,
  hidden,
  defaults,
  submitLabel,
  onCancel,
}: {
  action: (fd: FormData) => void;
  pending: boolean;
  error?: string;
  hidden: Record<string, string>;
  defaults?: { name: string; icon: IconName };
  submitLabel: string;
  onCancel: () => void;
}) {
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <FormError error={error} />
      <Field label="Category name" required help="Example: Mobile Games">
        {(id, d) => <Input id={id} aria-describedby={d} name="name" defaultValue={defaults?.name} required autoFocus />}
      </Field>
      <div>
        <p className="mb-2 text-sm font-semibold">Pick an icon</p>
        <IconPicker defaultValue={defaults?.icon ?? "Package"} />
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
        <PrimaryButton pending={pending}>{submitLabel}</PrimaryButton>
      </div>
    </form>
  );
}

function AddCategoryDialog({ domainSlug, sectionName, onClose }: { domainSlug: string; sectionName: string; onClose: () => void }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createCategoryAction, {});
  useActionResult(state, onClose);
  return (
    <Dialog open onClose={onClose} title="Add a category" description={`It will appear in ${sectionName}.`}>
      <CategoryForm action={action} pending={pending} error={state.error} hidden={{ domainSlug }} submitLabel="Add category" onCancel={onClose} />
    </Dialog>
  );
}

export function AddCategoryButton({ domainSlug, sectionName }: { domainSlug: string; sectionName: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary-hover"
      >
        <Plus className="size-4" /> Add category
      </button>
      {open && <AddCategoryDialog domainSlug={domainSlug} sectionName={sectionName} onClose={() => setOpen(false)} />}
    </>
  );
}

function RenameDialog({ category, onClose }: { category: CategoryData; onClose: () => void }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateCategoryAction, {});
  useActionResult(state, onClose);
  return (
    <Dialog open onClose={onClose} title={`Change “${category.name}”`}>
      <CategoryForm
        action={action}
        pending={pending}
        error={state.error}
        hidden={{ id: category.id }}
        defaults={{ name: category.name, icon: category.icon }}
        submitLabel="Save changes"
        onCancel={onClose}
      />
    </Dialog>
  );
}

function DeleteDialog({ category, sectionName, onClose }: { category: CategoryData; sectionName: string; onClose: () => void }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const n = category.productCount;
  return (
    <Dialog open onClose={onClose} title={`Delete “${category.name}”?`}>
      <div className="flex flex-col gap-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {n === 0 ? (
            "This category has no products, so nothing else will change."
          ) : (
            <>
              Don’t worry, <strong className="text-foreground">no products will be deleted</strong>. The {n} {n === 1 ? "product" : "products"} in it
              will stay in {sectionName}, just without a category.
            </>
          )}
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await deleteCategoryAction(category.id);
                if (r.error) toast({ type: "error", title: r.error });
                else {
                  toast({ type: "success", title: r.message ?? "Deleted." });
                  onClose();
                }
              })
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-danger px-5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            Yes, delete
          </button>
        </div>
      </div>
    </Dialog>
  );
}

function CategoryRow({ category, sectionName, first, last }: { category: CategoryData; sectionName: string; first: boolean; last: boolean }) {
  const toast = useToast();
  const [moving, start] = useTransition();
  const [dialog, setDialog] = useState<"rename" | "delete" | null>(null);

  const move = (direction: "up" | "down") =>
    start(async () => {
      const r = await moveCategoryAction(category.id, direction);
      if (r.error) toast({ type: "error", title: r.error });
    });

  const arrow = "flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-25";
  const action = "inline-flex h-9 items-center gap-1.5 rounded-lg border border-input px-3 text-sm font-semibold transition-colors";

  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap sm:px-5">
      <div className="flex flex-col" aria-label="Change order">
        <button type="button" title="Move up" aria-label="Move up" className={arrow} disabled={first || moving} onClick={() => move("up")}>
          <ArrowUp className="size-4" />
        </button>
        <button type="button" title="Move down" aria-label="Move down" className={arrow} disabled={last || moving} onClick={() => move("down")}>
          <ArrowDown className="size-4" />
        </button>
      </div>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
        {moving ? <Loader2 className="size-5 animate-spin" /> : <Icon name={category.icon} className="size-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold" data-category-name>
          {category.name}
        </p>
        <p className="text-sm text-muted-foreground">{productsText(category.productCount)}</p>
      </div>
      <div className="flex w-full gap-2 sm:w-auto">
        <button type="button" onClick={() => setDialog("rename")} className={`${action} flex-1 justify-center hover:bg-muted sm:flex-none`}>
          <Pencil className="size-4" /> Rename
        </button>
        <button
          type="button"
          onClick={() => setDialog("delete")}
          className={`${action} flex-1 justify-center text-danger hover:border-danger/40 hover:bg-danger/10 sm:flex-none`}
        >
          <Trash2 className="size-4" /> Delete
        </button>
      </div>

      {dialog === "rename" && <RenameDialog category={category} onClose={() => setDialog(null)} />}
      {dialog === "delete" && <DeleteDialog category={category} sectionName={sectionName} onClose={() => setDialog(null)} />}
    </li>
  );
}

export function CategoryList({ categories, sectionName }: { categories: CategoryData[]; sectionName: string }) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
        <FolderPlus className="size-10 text-muted-foreground/60" />
        <p className="font-semibold">No categories yet</p>
        <p className="max-w-xs text-sm text-muted-foreground">Click “Add category” to create the first one, for example “Mobile Games”.</p>
      </div>
    );
  }
  return (
    <ul className="divide-y divide-border" data-category-list>
      {categories.map((c, i) => (
        <CategoryRow key={c.id} category={c} sectionName={sectionName} first={i === 0} last={i === categories.length - 1} />
      ))}
    </ul>
  );
}
