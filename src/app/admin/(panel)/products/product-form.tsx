"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Save,
  Star,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useId, useMemo, useState, useTransition } from "react";
import { FormError } from "@/components/admin/form-bits";
import { Cover } from "@/components/product/cover";
import { Field, Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { discountPercent, formatNPR } from "@/lib/format";
import { duplicateProductAction, saveProductAction } from "@/server/admin/product-actions";
import { DELIVERY_TYPES, type PlanInput, PRODUCT_TAGS, type ProductInput, slugify } from "@/server/admin/product-types";
import type { DeliveryType, FAQ, OrderField, ProductTag } from "@/types/catalog";
import { DeleteProductDialog } from "./product-list";
import { ANSWER_TYPES, BRAND_COLORS, QUESTION_PRESETS, TYPE_DEFAULTS } from "./templates";

// ---------------------------------------------------------------- state shapes

let uidCounter = 0;
const uid = () => `u${++uidCounter}`;

interface PlanState {
  uid: string;
  key: string;
  name: string;
  price: string;
  originalPrice: string;
  bonus: string;
  validity: string;
  inStock: boolean;
  popular: boolean;
}
type FieldState = OrderField & { uid: string; optionsText: string };
type StepState = { uid: string; text: string };
type FaqState = FAQ & { uid: string };

export interface ProductFormData {
  id?: string;
  slug: string;
  name: string;
  brand: string;
  domainSlug: string;
  categoryId: string | null;
  deliveryType: DeliveryType;
  shortDescription: string;
  description: string;
  region: string;
  deliveryTime: string;
  color: string;
  initials: string;
  image: string | null;
  tags: ProductTag[];
  isActive: boolean;
  plans: PlanInput[];
  fields: OrderField[];
  howTo: string[];
  faq: FAQ[];
}

const toPlanState = (p: PlanInput): PlanState => ({
  uid: uid(),
  ...p,
  price: String(p.price),
  originalPrice: p.originalPrice == null ? "" : String(p.originalPrice),
});
const toFieldState = (f: OrderField): FieldState => ({ ...f, uid: uid(), optionsText: (f.options ?? []).join("\n") });
const emptyPlan = (): PlanState => ({ uid: uid(), key: "", name: "", price: "", originalPrice: "", bonus: "", validity: "", inStock: true, popular: false });

function move<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

const toNumber = (s: string) => {
  const n = Number(s.replace(/[,\s]/g, "").replace(/^rs\.?/i, ""));
  return Number.isFinite(n) ? Math.round(n) : NaN;
};

// ---------------------------------------------------------------- small UI bits

function Card({ id, title, description, action, children }: { id?: string; title: string; description?: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-border bg-surface shadow-card">
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

function Toggle({ checked, onChange, label, help }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; help?: ReactNode }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input id={id} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
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

function RowTools({ index, count, onMove, onRemove, removeLabel }: { index: number; count: number; onMove: (d: -1 | 1) => void; onRemove: () => void; removeLabel: string }) {
  const btn = "flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-25";
  return (
    <div className="flex items-center gap-0.5">
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

function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
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

const selectCls =
  "h-11 w-full rounded-lg border border-input bg-surface px-3.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20";

// ---------------------------------------------------------------- the form

type FormProps = {
  initial: ProductFormData;
  sections: { slug: string; name: string; categories: { id: string; name: string }[] }[];
  canDelete: boolean;
};

/**
 * Add / edit a product. Next.js keeps the previous page alive (hidden) for fast back-navigation,
 * so after a product is created the "Add product" form is reset to empty for the next one.
 */
export function ProductForm(props: FormProps) {
  const [round, setRound] = useState(0);
  return <ProductFormInner key={round} {...props} onCreated={() => setRound((r) => r + 1)} />;
}

function ProductFormInner({ initial, sections, canDelete, onCreated }: FormProps & { onCreated: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const isNew = !initial.id;
  const [saving, startSave] = useTransition();
  const [copying, startCopy] = useTransition();
  const [error, setError] = useState<string>();
  const [confirmDelete, setConfirmDelete] = useState(false);

  // basics
  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [brand, setBrand] = useState(initial.brand);
  const [domainSlug, setDomainSlug] = useState(initial.domainSlug);
  const [categoryId, setCategoryId] = useState(initial.categoryId ?? "");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(initial.deliveryType);
  const [shortDescription, setShortDescription] = useState(initial.shortDescription);
  const [description, setDescription] = useState(initial.description);
  const [region, setRegion] = useState(initial.region);
  const [deliveryTime, setDeliveryTime] = useState(initial.deliveryTime);
  const [color, setColor] = useState(initial.color);
  const [initials, setInitials] = useState(initial.initials);
  const [tags, setTags] = useState<ProductTag[]>(initial.tags);
  const [isActive, setIsActive] = useState(initial.isActive);
  // lists
  const [plans, setPlans] = useState<PlanState[]>(() => (initial.plans.length ? initial.plans.map(toPlanState) : [emptyPlan()]));
  const [fields, setFields] = useState<FieldState[]>(() => initial.fields.map(toFieldState));
  const [steps, setSteps] = useState<StepState[]>(() => initial.howTo.map((text) => ({ uid: uid(), text })));
  const [faq, setFaq] = useState<FaqState[]>(() => initial.faq.map((f) => ({ ...f, uid: uid() })));
  const [touchedTemplate, setTouchedTemplate] = useState(!isNew);

  const section = sections.find((s) => s.slug === domainSlug);
  const effectiveSlug = slugTouched ? slugify(slug) : slugify(name);

  const payload = (): ProductInput => ({
    id: initial.id,
    slug: effectiveSlug,
    name: name.trim(),
    brand: brand.trim(),
    domainSlug,
    categoryId: categoryId || null,
    deliveryType,
    shortDescription: shortDescription.trim(),
    description: description.trim(),
    region: region.trim(),
    deliveryTime: deliveryTime.trim(),
    color,
    initials: initials.trim(),
    tags,
    isActive,
    plans: plans
      .filter((p) => p.name.trim() || p.price.trim())
      .map((p) => ({
        key: p.key,
        name: p.name.trim(),
        price: p.price.trim() === "" ? 0 : toNumber(p.price),
        originalPrice: p.originalPrice.trim() === "" ? null : toNumber(p.originalPrice),
        bonus: p.bonus.trim(),
        validity: p.validity.trim(),
        inStock: p.inStock,
        popular: p.popular,
      })),
    fields: fields.map(({ optionsText, ...f }) => ({
      ...f,
      label: f.label.trim(),
      options: f.type === "select" ? optionsText.split("\n").map((o) => o.trim()).filter(Boolean) : undefined,
    })),
    howTo: steps.map((s) => s.text.trim()).filter(Boolean),
    faq: faq.map(({ q, a }) => ({ q: q.trim(), a: a.trim() })).filter((f) => f.q || f.a),
  });

  // unsaved-changes guard
  const snapshot = useMemo(() => JSON.stringify(payload()), // eslint-disable-next-line react-hooks/exhaustive-deps
    [name, slug, slugTouched, brand, domainSlug, categoryId, deliveryType, shortDescription, description, region, deliveryTime, color, initials, tags, isActive, plans, fields, steps, faq]);
  const [saved, setSaved] = useState(snapshot);
  const dirty = snapshot !== saved;
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function chooseType(t: DeliveryType) {
    setDeliveryType(t);
    // a new product starts with sensible questions / steps / FAQ for its type, until the admin edits them
    if (!touchedTemplate) {
      const d = TYPE_DEFAULTS[t];
      setFields(d.fields.map(toFieldState));
      setSteps(d.howTo.map((text) => ({ uid: uid(), text })));
      setFaq(d.faq.map((f) => ({ ...f, uid: uid() })));
      setDeliveryTime(d.deliveryTime);
    }
  }
  const touch = () => setTouchedTemplate(true);

  function save() {
    setError(undefined);
    const data = payload();
    const bad = data.plans.findIndex((p) => Number.isNaN(p.price) || (p.originalPrice != null && Number.isNaN(p.originalPrice)));
    if (bad >= 0) {
      setError(`Package ${bad + 1}: prices must be numbers, e.g. 1450.`);
      return;
    }
    startSave(async () => {
      const r = await saveProductAction(data);
      if (r.error) {
        setError(r.error);
        toast({ type: "error", title: r.error });
        return;
      }
      toast({ type: "success", title: r.message ?? "Saved." });
      setSaved(JSON.stringify(data));
      if (isNew) {
        router.replace(`/admin/products/${r.id}`);
        onCreated();
      }
      else router.refresh();
    });
  }

  // live preview numbers
  const previewPrices = plans.map((p) => toNumber(p.price)).filter((n) => n > 0);
  const fromPrice = previewPrices.length ? Math.min(...previewPrices) : null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      noValidate
      className="pb-28"
      data-product-form
    >
      {/* header */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Cover product={{ slug: initial.slug, name: name || "New product", image: initial.image, color }} size="sm" className="size-14 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold tracking-tight">{isNew ? "Add a product" : name || "Untitled product"}</h1>
          <p className="text-sm text-muted-foreground">
            {isNew ? "Fill in the boxes below, then press Save." : isActive ? "Shown on the website" : "Hidden from the website"}
          </p>
        </div>
        {!isNew && (
          <div className="flex w-full gap-2 sm:w-auto">
            <a
              href={`/product/${initial.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-input bg-surface px-4 text-sm font-semibold hover:bg-muted sm:flex-none"
            >
              See it on the website <ExternalLink className="size-4" />
            </a>
          </div>
        )}
      </div>

      <FormError error={error} />

      <div className="mt-4 grid items-start gap-6 xl:grid-cols-[1fr_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* ---------------- basics */}
          <Card id="basics" title="Basic details" description="What the product is and where it appears in your store.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Product name" required help="Example: Free Fire Diamonds" className="sm:col-span-2">
                {(id, d) => <Input id={id} aria-describedby={d} value={name} onChange={(e) => setName(e.target.value)} autoFocus={isNew} name="name" />}
              </Field>
              <Field label="Brand" required help="Who makes it. Example: Garena, Netflix, Microsoft">
                {(id, d) => <Input id={id} aria-describedby={d} value={brand} onChange={(e) => setBrand(e.target.value)} name="brand" />}
              </Field>
              <Field label="Works in" help="Region, e.g. Nepal, Global, US">
                {(id, d) => <Input id={id} aria-describedby={d} value={region} onChange={(e) => setRegion(e.target.value)} name="region" />}
              </Field>
              <Field label="Section" required help="Which part of the store it belongs to.">
                {(id, d) => (
                  <select
                    id={id}
                    aria-describedby={d}
                    name="domainSlug"
                    className={selectCls}
                    value={domainSlug}
                    onChange={(e) => {
                      setDomainSlug(e.target.value);
                      setCategoryId("");
                    }}
                  >
                    {sections.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="Category" help={section?.categories.length ? "Helps customers filter." : "This section has no categories yet."}>
                {(id, d) => (
                  <select id={id} aria-describedby={d} name="categoryId" className={selectCls} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="">— No category —</option>
                    {section?.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <div className="sm:col-span-2">
                <p className="mb-2 text-sm font-semibold">
                  How is it delivered?<span className="ml-0.5 text-accent">*</span>
                </p>
                <div role="radiogroup" aria-label="How is it delivered?" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {DELIVERY_TYPES.map((t) => {
                    const on = deliveryType === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => chooseType(t.value)}
                        className={cn(
                          "flex flex-col items-start gap-0.5 rounded-xl border-2 p-3 text-left transition-colors",
                          on ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                        )}
                      >
                        <span className="flex w-full items-center justify-between text-sm font-bold">
                          {t.label}
                          {on && <Check className="size-4 text-primary" />}
                        </span>
                        <span className="text-xs text-muted-foreground">{t.help}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {isNew && (
                <Field
                  label="Web address"
                  help={
                    <>
                      The page will be <strong>/product/{effectiveSlug || "…"}</strong>. It can’t be changed later, so links keep working.
                    </>
                  }
                  className="sm:col-span-2"
                >
                  {(id, d) => (
                    <Input
                      id={id}
                      aria-describedby={d}
                      value={slugTouched ? slug : slugify(name)}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setSlug(e.target.value);
                      }}
                      name="slug"
                    />
                  )}
                </Field>
              )}
            </div>
          </Card>

          {/* ---------------- description */}
          <Card id="description" title="Description" description="What customers read about this product.">
            <div className="flex flex-col gap-5">
              <Field label="Short description" required help={`One sentence shown on product cards. ${shortDescription.length}/200`}>
                {(id, d) => (
                  <Textarea
                    id={id}
                    aria-describedby={d}
                    rows={2}
                    maxLength={200}
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    name="shortDescription"
                    className="min-h-0"
                  />
                )}
              </Field>
              <Field label="Full description" help="Shown on the product page. Leave empty to use the short description.">
                {(id, d) => <Textarea id={id} aria-describedby={d} rows={5} value={description} onChange={(e) => setDescription(e.target.value)} name="description" />}
              </Field>
            </div>
          </Card>

          {/* ---------------- packages */}
          <Card
            id="packages"
            title="Packages & prices"
            description="What the customer can choose, e.g. “100 Diamonds” for Rs 150. Prices are in rupees."
          >
            <ul className="flex flex-col gap-3" data-plan-list>
              {plans.map((p, i) => {
                const set = (patch: Partial<PlanState>) => setPlans((all) => all.map((x) => (x.uid === p.uid ? { ...x, ...patch } : x)));
                const off = discountPercent(toNumber(p.price), toNumber(p.originalPrice) || undefined);
                return (
                  <li key={p.uid} className={cn("rounded-xl border border-border p-4", !p.inStock && "bg-muted/40")} data-plan>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm font-bold">
                        <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">{i + 1}</span>
                        {p.name || "New package"}
                        {off && <span className="rounded bg-success/12 px-1.5 py-0.5 text-xs text-success">{off}% off</span>}
                      </span>
                      <RowTools
                        index={i}
                        count={plans.length}
                        onMove={(dir) => setPlans((all) => move(all, i, dir))}
                        onRemove={() => setPlans((all) => (all.length > 1 ? all.filter((x) => x.uid !== p.uid) : [emptyPlan()]))}
                        removeLabel="Remove package"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
                      <Field label="Package name" required>
                        {(id) => <Input id={id} value={p.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. 100 Diamonds" data-plan-name />}
                      </Field>
                      <Field label="Price (Rs)" required help="0 = ask for a quote">
                        {(id, d) => (
                          <Input id={id} aria-describedby={d} inputMode="numeric" value={p.price} onChange={(e) => set({ price: e.target.value })} placeholder="150" data-plan-price />
                        )}
                      </Field>
                      <Field label="Was (Rs)" help="Optional, shows a discount">
                        {(id, d) => (
                          <Input id={id} aria-describedby={d} inputMode="numeric" value={p.originalPrice} onChange={(e) => set({ originalPrice: e.target.value })} placeholder="—" />
                        )}
                      </Field>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <Field label="Bonus" help="Optional, e.g. +10 bonus">
                        {(id, d) => <Input id={id} aria-describedby={d} value={p.bonus} onChange={(e) => set({ bonus: e.target.value })} />}
                      </Field>
                      <Field label="Lasts for" help="Optional, e.g. 30 days, 1 year">
                        {(id, d) => <Input id={id} aria-describedby={d} value={p.validity} onChange={(e) => set({ validity: e.target.value })} />}
                      </Field>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
                      <Toggle checked={p.inStock} onChange={(v) => set({ inStock: v })} label={p.inStock ? "In stock" : "Out of stock"} />
                      <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                        <input type="checkbox" checked={p.popular} onChange={(e) => set({ popular: e.target.checked })} className="size-4 accent-[var(--color-primary)]" />
                        <Star className={cn("size-4", p.popular ? "fill-warning text-warning" : "text-muted-foreground")} /> Mark as popular
                      </label>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4">
              <AddButton onClick={() => setPlans((all) => [...all, emptyPlan()])}>Add package</AddButton>
            </div>
          </Card>

          {/* ---------------- order questions */}
          <Card
            id="questions"
            title="What we ask the customer"
            description="The boxes the customer fills in when ordering, e.g. their Player ID or email."
          >
            {fields.length === 0 && <p className="mb-4 text-sm text-muted-foreground">No questions — the customer just picks a package.</p>}
            <ul className="flex flex-col gap-3">
              {fields.map((f, i) => {
                const set = (patch: Partial<FieldState>) => {
                  touch();
                  setFields((all) => all.map((x) => (x.uid === f.uid ? { ...x, ...patch } : x)));
                };
                return (
                  <li key={f.uid} className="rounded-xl border border-border p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-sm font-bold">
                        Question {i + 1}
                        {f.label && <span className="font-normal text-muted-foreground"> · {f.label}</span>}
                      </span>
                      <RowTools
                        index={i}
                        count={fields.length}
                        onMove={(dir) => {
                          touch();
                          setFields((all) => move(all, i, dir));
                        }}
                        onRemove={() => {
                          touch();
                          setFields((all) => all.filter((x) => x.uid !== f.uid));
                        }}
                        removeLabel="Remove question"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Question" required>
                        {(id) => <Input id={id} value={f.label} onChange={(e) => set({ label: e.target.value })} placeholder="e.g. Player ID" />}
                      </Field>
                      <Field label="Type of answer">
                        {(id) => (
                          <select id={id} className={selectCls} value={f.type} onChange={(e) => set({ type: e.target.value as OrderField["type"] })}>
                            {ANSWER_TYPES.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </Field>
                      {f.type === "select" && (
                        <Field label="Choices" required help="One choice per line." className="sm:col-span-2">
                          {(id, d) => (
                            <Textarea id={id} aria-describedby={d} rows={3} value={f.optionsText} onChange={(e) => set({ optionsText: e.target.value })} placeholder={"Asia\nEurope\nAmerica"} />
                          )}
                        </Field>
                      )}
                      <Field label="Example answer" help="Grey hint inside the box">
                        {(id, d) => <Input id={id} aria-describedby={d} value={f.placeholder ?? ""} onChange={(e) => set({ placeholder: e.target.value })} placeholder="e.g. 5123456789" />}
                      </Field>
                      <Field label="Help text" help="Small text under the box">
                        {(id, d) => <Input id={id} aria-describedby={d} value={f.help ?? ""} onChange={(e) => set({ help: e.target.value })} placeholder="Where to find it" />}
                      </Field>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
                      <Toggle checked={f.required} onChange={(v) => set({ required: v })} label={f.required ? "Must be filled in" : "Optional"} />
                      {deliveryType === "TOPUP" && (
                        <Toggle checked={!!f.verifiable} onChange={(v) => set({ verifiable: v })} label="Show “Check name” button" help="For Player / User IDs" />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Quick add</p>
              <div className="flex flex-wrap gap-2">
                {QUESTION_PRESETS.map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => {
                      touch();
                      setFields((all) => [...all, toFieldState(q.field)]);
                    }}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 text-sm font-semibold hover:border-primary/40 hover:bg-primary/5"
                  >
                    <Plus className="size-3.5" /> {q.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    touch();
                    setFields((all) => [...all, toFieldState({ name: "", label: "", type: "text", required: true })]);
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border-2 border-dashed border-primary/40 px-3.5 text-sm font-bold text-primary hover:border-primary"
                >
                  <Plus className="size-3.5" /> My own question
                </button>
              </div>
            </div>
          </Card>

          {/* ---------------- steps */}
          <Card id="steps" title="How it works" description="Short steps shown on the product page, e.g. “Enter your Player ID”.">
            <ol className="flex flex-col gap-2">
              {steps.map((s, i) => (
                <li key={s.uid} className="flex items-center gap-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
                  <Input
                    value={s.text}
                    aria-label={`Step ${i + 1}`}
                    onChange={(e) => {
                      touch();
                      setSteps((all) => all.map((x) => (x.uid === s.uid ? { ...x, text: e.target.value } : x)));
                    }}
                  />
                  <RowTools
                    index={i}
                    count={steps.length}
                    onMove={(dir) => {
                      touch();
                      setSteps((all) => move(all, i, dir));
                    }}
                    onRemove={() => {
                      touch();
                      setSteps((all) => all.filter((x) => x.uid !== s.uid));
                    }}
                    removeLabel="Remove step"
                  />
                </li>
              ))}
            </ol>
            <div className="mt-4">
              <AddButton
                onClick={() => {
                  touch();
                  setSteps((all) => [...all, { uid: uid(), text: "" }]);
                }}
              >
                Add step
              </AddButton>
            </div>
          </Card>

          {/* ---------------- faq */}
          <Card id="faq" title="Questions & answers" description="Common questions customers ask about this product.">
            <ul className="flex flex-col gap-3">
              {faq.map((f, i) => {
                const set = (patch: Partial<FAQ>) => {
                  touch();
                  setFaq((all) => all.map((x) => (x.uid === f.uid ? { ...x, ...patch } : x)));
                };
                return (
                  <li key={f.uid} className="rounded-xl border border-border p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-sm font-bold">Q&amp;A {i + 1}</span>
                      <RowTools
                        index={i}
                        count={faq.length}
                        onMove={(dir) => {
                          touch();
                          setFaq((all) => move(all, i, dir));
                        }}
                        onRemove={() => {
                          touch();
                          setFaq((all) => all.filter((x) => x.uid !== f.uid));
                        }}
                        removeLabel="Remove question"
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <Input value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder="Question, e.g. How long does it take?" aria-label="Question" />
                      <Textarea value={f.a} onChange={(e) => set({ a: e.target.value })} rows={2} placeholder="Answer" aria-label="Answer" className="min-h-0" />
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4">
              <AddButton
                onClick={() => {
                  touch();
                  setFaq((all) => [...all, { uid: uid(), q: "", a: "" }]);
                }}
              >
                Add question &amp; answer
              </AddButton>
            </div>
          </Card>
        </div>

        {/* ---------------- side column */}
        <aside className="flex flex-col gap-6 xl:sticky xl:top-24">
          <section className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <h2 className="mb-4 font-bold">On the website</h2>
            <Toggle
              checked={isActive}
              onChange={setIsActive}
              label={
                <span className="inline-flex items-center gap-1.5">
                  {isActive ? <Eye className="size-4 text-success" /> : <EyeOff className="size-4" />}
                  {isActive ? "Shown to customers" : "Hidden"}
                </span>
              }
              help={isActive ? "Customers can see and order it." : "Only you can see it here. Nothing is deleted."}
            />
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <h2 className="mb-4 font-bold">Look</h2>
            <div className="overflow-hidden rounded-xl border border-border">
              <Cover product={{ slug: initial.slug, name: name || "New product", image: initial.image, color }} className="aspect-[4/3]" />
              <div className="p-3">
                <p className="truncate font-semibold">{name || "Product name"}</p>
                <p className="text-sm text-muted-foreground">{fromPrice ? `From ${formatNPR(fromPrice)}` : "Price on request"}</p>
              </div>
            </div>
            {initial.image ? (
              <p className="mt-3 text-xs text-muted-foreground">This product has its own picture.</p>
            ) : (
              <>
                <p className="mt-4 mb-2 text-sm font-semibold">Card colour</p>
                <div className="flex flex-wrap items-center gap-2">
                  {BRAND_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      aria-label={`Colour ${c}`}
                      className={cn("size-8 rounded-full border-2 transition-transform hover:scale-110", color.toLowerCase() === c.toLowerCase() ? "border-foreground" : "border-transparent")}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <label className="relative flex size-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border" title="Any colour">
                    <Plus className="pointer-events-none size-4" />
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Pick any colour" />
                  </label>
                </div>
              </>
            )}
            <Field label="Short label" help="2–5 letters used in small places, e.g. FF, PUBG" className="mt-4">
              {(id, d) => <Input id={id} aria-describedby={d} value={initials} maxLength={8} onChange={(e) => setInitials(e.target.value)} />}
            </Field>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <h2 className="mb-4 font-bold">Extra info</h2>
            <Field label="Delivery time" help="e.g. Instant, 5–30 min">
              {(id, d) => <Input id={id} aria-describedby={d} value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} />}
            </Field>
            <p className="mt-4 mb-2 text-sm font-semibold">Badges</p>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_TAGS.map((t) => {
                const on = tags.includes(t.value);
                return (
                  <button
                    key={t.value}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setTags((all) => (on ? all.filter((x) => x !== t.value) : [...all, t.value]))}
                    className={cn(
                      "inline-flex h-9 items-center gap-1 rounded-full border px-3 text-sm font-semibold transition-colors",
                      on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted",
                    )}
                  >
                    {t.label}
                    {on && <X className="size-3.5" />}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">The first badge shows on the product card.</p>
          </section>

          {!isNew && (
            <section className="rounded-2xl border border-border bg-surface p-5 shadow-card">
              <h2 className="mb-3 font-bold">More</h2>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={copying}
                  onClick={() =>
                    startCopy(async () => {
                      const r = await duplicateProductAction(initial.id!);
                      toast(r.ok ? { type: "success", title: r.message ?? "Copied." } : { type: "error", title: r.error ?? "Could not copy." });
                      if (r.ok) router.push(`/admin/products/${r.id}`);
                    })
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-input text-sm font-semibold hover:bg-muted disabled:opacity-60"
                >
                  {copying ? <Loader2 className="size-4 animate-spin" /> : <Copy className="size-4" />} Make a copy
                </button>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-danger/30 text-sm font-semibold text-danger hover:bg-danger/10"
                  >
                    <Trash2 className="size-4" /> Delete product
                  </button>
                )}
              </div>
            </section>
          )}
        </aside>
      </div>

      {/* sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur lg:left-[260px]">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/admin/products" className="inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
            <ArrowLeft className="size-4" /> <span className="hidden sm:inline">All products</span>
          </Link>
          <p className={cn("flex-1 text-right text-sm", dirty ? "font-semibold text-warning" : "text-muted-foreground")} aria-live="polite">
            {dirty ? "You have unsaved changes" : isNew ? "" : "All changes saved"}
          </p>
          <button
            type="submit"
            disabled={saving}
            data-save
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary-hover disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {isNew ? "Save product" : "Save changes"}
          </button>
        </div>
      </div>

      {confirmDelete && initial.id && (
        <DeleteProductDialog id={initial.id} name={initial.name} onClose={() => setConfirmDelete(false)} onDeleted={() => router.replace("/admin/products")} />
      )}
    </form>
  );
}
