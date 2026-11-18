"use client";

import { BadgeCheck, Eye, EyeOff, Loader2, MessageSquareQuote, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { useDeferredValue, useMemo, useState, useTransition } from "react";
import { selectCls, Toggle } from "@/components/admin/editor-bits";
import { FormError, PrimaryButton, SecondaryButton } from "@/components/admin/form-bits";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import type { AdminReview } from "@/server/admin/content";
import { deleteReviewAction, saveReviewAction, setReviewVisibleAction } from "@/server/admin/content-actions";
import type { ContentResult } from "@/server/admin/content-types";

type ProductPick = { id: string; name: string; domainName: string };
type Filter = "all" | "shown" | "hidden";

function Stars({ value, size = "size-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn(size, i <= value ? "fill-warning text-warning" : "text-muted-foreground/40")} />
      ))}
    </span>
  );
}

export function ReviewsManager({ reviews, products }: { reviews: AdminReview[]; products: ProductPick[] }) {
  const [editing, setEditing] = useState<AdminReview | "new" | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const q = useDeferredValue(query.trim().toLowerCase());

  const shown = useMemo(
    () =>
      reviews.filter(
        (r) =>
          (filter === "all" || (filter === "shown" ? r.isVisible : !r.isVisible)) &&
          (!q || `${r.name} ${r.city} ${r.comment} ${r.productName}`.toLowerCase().includes(q)),
      ),
    [reviews, filter, q],
  );
  const counts = { all: reviews.length, shown: reviews.filter((r) => r.isVisible).length, hidden: reviews.filter((r) => !r.isVisible).length };
  const avg = counts.shown ? reviews.filter((r) => r.isVisible).reduce((s, r) => s + r.rating, 0) / counts.shown : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input type="search" icon={<Search />} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, product or text…" aria-label="Search reviews" />
        </div>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary-hover"
        >
          <Plus className="size-4" /> Add review
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Filter" className="flex gap-2 overflow-x-auto">
          {(
            [
              ["all", "All"],
              ["shown", "On website"],
              ["hidden", "Hidden"],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              role="tab"
              type="button"
              aria-selected={filter === v}
              onClick={() => setFilter(v)}
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold",
                filter === v ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface hover:bg-muted",
              )}
            >
              {label}
              <span className={cn("rounded-full px-1.5 text-xs", filter === v ? "bg-white/20" : "bg-muted")}>{counts[v]}</span>
            </button>
          ))}
        </div>
        {counts.shown > 0 && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Stars value={Math.round(avg)} /> {avg.toFixed(1)} average
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        {shown.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
            <MessageSquareQuote className="size-10 text-muted-foreground/60" />
            <p className="font-semibold">No reviews here</p>
          </div>
        ) : (
          <ul className="divide-y divide-border" data-review-list>
            {shown.map((r) => (
              <ReviewRow key={r.id} review={r} onEdit={() => setEditing(r)} />
            ))}
          </ul>
        )}
      </div>

      {editing && <ReviewDialog review={editing === "new" ? null : editing} products={products} onClose={() => setEditing(null)} />}
    </div>
  );
}

function ReviewRow({ review: r, onEdit }: { review: AdminReview; onEdit: () => void }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<ContentResult>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    start(async () => {
      const res = await fn();
      toast(res.ok ? { type: "success", title: res.message ?? "Done" } : { type: "error", title: res.error ?? "Something went wrong" });
    });
  };
  const btn = "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold";
  return (
    <li className={cn("flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:px-5", !r.isVisible && "bg-muted/30")} data-review={r.name}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Stars value={r.rating} />
          <span className="text-sm font-semibold">{r.productName}</span>
          {r.verified && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
              <BadgeCheck className="size-3.5" /> Verified
            </span>
          )}
        </div>
        <p className={cn("mt-1.5 text-sm leading-relaxed", !r.isVisible && "text-muted-foreground")}>“{r.comment}”</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {r.name}
          {r.city && `, ${r.city}`} · {new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => setReviewVisibleAction(r.id, !r.isVisible))}
          className={cn(btn, "flex-1 sm:w-32 sm:flex-none", r.isVisible ? "bg-success/12 text-success hover:bg-success/20" : "bg-muted text-muted-foreground hover:bg-muted/70")}
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : r.isVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          {r.isVisible ? "On website" : "Hidden"}
        </button>
        <button type="button" onClick={onEdit} className={cn(btn, "flex-1 border border-input hover:bg-muted sm:flex-none")}>
          <Pencil className="size-4" /> Edit
        </button>
        <button
          type="button"
          aria-label="Delete review"
          title="Delete"
          disabled={pending}
          onClick={() => run(() => deleteReviewAction(r.id), `Delete the review by ${r.name}? This can’t be undone. (To stop showing it, use “Hidden” instead.)`)}
          className={cn(btn, "px-2.5 text-danger hover:bg-danger/10")}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </li>
  );
}

function ReviewDialog({ review, products, onClose }: { review: AdminReview | null; products: ProductPick[]; onClose: () => void }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();
  const [productId, setProductId] = useState(review?.productId ?? "");
  const [name, setName] = useState(review?.name ?? "");
  const [city, setCity] = useState(review?.city ?? "");
  const [rating, setRating] = useState(review?.rating ?? 5);
  const [comment, setComment] = useState(review?.comment ?? "");
  const [date, setDate] = useState(() => review?.date ?? new Date().toISOString().slice(0, 10));
  const [verified, setVerified] = useState(review?.verified ?? true);
  const [isVisible, setIsVisible] = useState(review?.isVisible ?? true);
  const bySection = useMemo(() => Map.groupBy(products, (p) => p.domainName), [products]);

  return (
    <Dialog open onClose={onClose} title={review ? "Edit review" : "Add a review"}>
      <form
        noValidate
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          setError(undefined);
          start(async () => {
            const r = await saveReviewAction({ id: review?.id, productId, name, city, rating, comment, date, verified, isVisible });
            if (r.error) return setError(r.error);
            toast({ type: "success", title: r.message ?? "Saved." });
            onClose();
          });
        }}
      >
        <FormError error={error} />
        <Field label="Product" required>
          {(id) => (
            <select id={id} name="product" className={selectCls} value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="" disabled>
                Choose a product…
              </option>
              {[...bySection].map(([section, list]) => (
                <optgroup key={section} label={section}>
                  {list.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          )}
        </Field>
        <div>
          <p className="mb-1.5 text-sm font-semibold">
            Stars<span className="ml-0.5 text-accent">*</span>
          </p>
          <div role="radiogroup" aria-label="Stars" className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} type="button" role="radio" aria-checked={rating === i} aria-label={`${i} stars`} onClick={() => setRating(i)} className="rounded-lg p-1 hover:bg-muted">
                <Star className={cn("size-8", i <= rating ? "fill-warning text-warning" : "text-muted-foreground/40")} />
              </button>
            ))}
          </div>
        </div>
        <Field label="What the customer said" required>
          {(id) => <Textarea id={id} name="comment" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="e.g. Diamonds came in under 20 seconds!" />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Customer name" required help="First name + initial, e.g. Aarav S.">
            {(id, d) => <Input id={id} aria-describedby={d} name="name" value={name} onChange={(e) => setName(e.target.value)} />}
          </Field>
          <Field label="City" help="e.g. Pokhara">
            {(id, d) => <Input id={id} aria-describedby={d} name="city" value={city} onChange={(e) => setCity(e.target.value)} />}
          </Field>
          <Field label="Date" required>
            {(id) => <Input id={id} type="date" name="date" value={date} onChange={(e) => setDate(e.target.value)} />}
          </Field>
        </div>
        <div className="flex flex-col gap-3">
          <Toggle checked={verified} onChange={setVerified} label="Verified buyer" help="Shows a ✓ — only for real customers." />
          <Toggle checked={isVisible} onChange={setIsVisible} label={isVisible ? "Shown on the website" : "Hidden"} />
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton pending={pending}>{review ? "Save review" : "Add review"}</PrimaryButton>
        </div>
      </form>
    </Dialog>
  );
}
