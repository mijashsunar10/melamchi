"use client";

import { BadgePercent, CalendarClock, Loader2, MoreHorizontal, Pencil, Plus, Square, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { selectCls } from "@/components/admin/editor-bits";
import { FormError, PrimaryButton, SecondaryButton } from "@/components/admin/form-bits";
import { Cover } from "@/components/product/cover";
import { Countdown } from "@/components/ui/countdown";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { formatNPR } from "@/lib/format";
import { dealPrice } from "@/lib/orders";
import type { AdminDeal, ProductOption } from "@/server/admin/content";
import { deleteDealAction, endDealAction, saveDealAction } from "@/server/admin/content-actions";
import type { ContentResult } from "@/server/admin/content-types";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Date → value for <input type="datetime-local"> (local time) */
const toLocalInput = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const QUICK_ENDS = [
  { label: "6 hours", ms: 6 * 3_600_000 },
  { label: "1 day", ms: 86_400_000 },
  { label: "3 days", ms: 3 * 86_400_000 },
  { label: "1 week", ms: 7 * 86_400_000 },
];
const LABELS = ["Flash Sale", "Weekend Deal", "Best Price", "Festival Offer"];

export function DealsManager({ deals, products }: { deals: AdminDeal[]; products: ProductOption[] }) {
  const [editing, setEditing] = useState<AdminDeal | "new" | null>(null);
  const running = deals.filter((d) => !d.ended).sort((a, b) => a.endsAt.localeCompare(b.endsAt));
  const ended = deals.filter((d) => d.ended);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{running.length}</strong> running now · {ended.length} ended
        </p>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary-hover sm:w-auto"
        >
          <Plus className="size-4" /> Add deal
        </button>
      </div>

      <section className="rounded-2xl border border-border bg-surface shadow-card">
        <h2 className="border-b border-border p-5 text-lg font-bold">Running now</h2>
        {running.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <BadgePercent className="size-10 text-muted-foreground/60" />
            <p className="font-semibold">No deals running</p>
            <p className="text-sm text-muted-foreground">Click “Add deal” to put a package on sale.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border" data-deal-list="running">
            {running.map((d) => (
              <DealRow key={d.id} deal={d} running onEdit={() => setEditing(d)} />
            ))}
          </ul>
        )}
      </section>

      {ended.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface shadow-card">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-bold">Ended</h2>
            <p className="text-sm text-muted-foreground">Not shown on the website. Click “Run again” to restart one with a new end time.</p>
          </div>
          <ul className="divide-y divide-border" data-deal-list="ended">
            {ended.map((d) => (
              <DealRow key={d.id} deal={d} running={false} onEdit={() => setEditing(d)} />
            ))}
          </ul>
        </section>
      )}

      {editing && <DealDialog deal={editing === "new" ? null : editing} products={products} onClose={() => setEditing(null)} />}
    </div>
  );
}

function DealRow({ deal: d, running, onEdit }: { deal: AdminDeal; running: boolean; onEdit: () => void }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [menu, setMenu] = useState(false);
  const run = (fn: () => Promise<ContentResult>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setMenu(false);
    start(async () => {
      const r = await fn();
      toast(r.ok ? { type: "success", title: r.message ?? "Done" } : { type: "error", title: r.error ?? "Something went wrong" });
    });
  };
  const item = "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm hover:bg-muted";

  return (
    <li className={cn("flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 sm:flex-nowrap sm:px-5", !running && "opacity-70")} data-deal={d.productSlug}>
      <Cover product={{ slug: d.productSlug, name: d.productName, image: d.image, color: d.color }} size="sm" className="size-14 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 font-semibold">
          <span className="truncate">{d.productName}</span>
          <span className="rounded-full bg-accent/12 px-2 py-0.5 text-xs font-bold text-accent">{d.discountPercent}% off</span>
          {d.label && <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">{d.label}</span>}
        </p>
        <p className="text-sm text-muted-foreground">
          {d.planName ?? <span className="text-danger">Package was removed</span>}
          {d.planPrice != null && d.planPrice > 0 && (
            <>
              {" · "}
              <span className="line-through">{formatNPR(d.planPrice)}</span>{" "}
              <strong className="text-foreground">{formatNPR(dealPrice(d.planPrice, d.discountPercent))}</strong>
            </>
          )}
          {!d.productActive && <span className="ml-2 text-warning">(product is hidden)</span>}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {running ? (
            <>
              Ends in <Countdown endsAt={d.endsAt} /> <span>· {fmtDate(d.endsAt)}</span>
            </>
          ) : (
            <>Ended {fmtDate(d.endsAt)}</>
          )}
        </p>
      </div>
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-input px-3 text-sm font-semibold hover:bg-muted sm:flex-none"
        >
          {running ? <Pencil className="size-4" /> : <CalendarClock className="size-4" />} {running ? "Edit" : "Run again"}
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenu((m) => !m)}
            aria-label={`More actions for the ${d.productName} deal`}
            aria-expanded={menu}
            disabled={pending}
            className="flex size-9 items-center justify-center rounded-lg hover:bg-muted"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal className="size-5" />}
          </button>
          {menu && (
            <>
              <button type="button" aria-hidden tabIndex={-1} className="fixed inset-0 z-10 cursor-default" onClick={() => setMenu(false)} />
              <div role="menu" className="absolute top-full right-0 z-20 mt-1 w-48 rounded-xl border border-border bg-surface p-1.5 shadow-card-hover">
                {running && (
                  <button role="menuitem" type="button" className={item} onClick={() => run(() => endDealAction(d.id))}>
                    <Square className="size-4" /> End now
                  </button>
                )}
                <button
                  role="menuitem"
                  type="button"
                  className={cn(item, "text-danger hover:bg-danger/10")}
                  onClick={() => run(() => deleteDealAction(d.id), `Delete the ${d.productName} deal?`)}
                >
                  <Trash2 className="size-4" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </li>
  );
}

function DealDialog({ deal, products, onClose }: { deal: AdminDeal | null; products: ProductOption[]; onClose: () => void }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();
  const ended = deal?.ended ?? false;

  const [productId, setProductId] = useState(deal?.productId ?? "");
  const [planSlug, setPlanSlug] = useState(deal?.planSlug ?? "");
  const [percent, setPercent] = useState(String(deal?.discountPercent ?? 10));
  const [endsAt, setEndsAt] = useState(() => toLocalInput(deal && !ended ? new Date(deal.endsAt) : new Date(Date.now() + 86_400_000)));
  const [label, setLabel] = useState(deal?.label ?? "");

  const bySection = useMemo(() => Map.groupBy(products, (p) => p.domainName), [products]);
  const product = products.find((p) => p.id === productId);
  const plan = product?.plans.find((p) => p.slug === planSlug);
  const pct = Number(percent);

  const submit = () => {
    setError(undefined);
    const when = new Date(endsAt);
    if (Number.isNaN(when.getTime())) return setError("Choose when the deal ends.");
    start(async () => {
      const r = await saveDealAction({ id: deal?.id, productId, planSlug, discountPercent: pct, endsAt: when.toISOString(), label: label.trim() });
      if (r.error) return setError(r.error);
      toast({ type: "success", title: r.message ?? "Saved." });
      onClose();
    });
  };

  return (
    <Dialog open onClose={onClose} title={deal ? (ended ? "Run this deal again" : "Edit deal") : "Add a deal"} description="The discount applies to one package of one product.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        noValidate
        className="flex flex-col gap-5"
      >
        <FormError error={error} />
        <Field label="Product" required>
          {(id) => (
            <select
              id={id}
              name="product"
              className={selectCls}
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                setPlanSlug(products.find((p) => p.id === e.target.value)?.plans[0]?.slug ?? "");
              }}
            >
              <option value="" disabled>
                Choose a product…
              </option>
              {[...bySection].map(([section, list]) => (
                <optgroup key={section} label={section}>
                  {list.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                      {!p.isActive ? " (hidden)" : ""}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          )}
        </Field>
        <Field label="Package" required>
          {(id) => (
            <select id={id} name="plan" className={selectCls} value={planSlug} onChange={(e) => setPlanSlug(e.target.value)} disabled={!product}>
              {!product && <option value="">Choose a product first</option>}
              {product?.plans.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name} — {p.price > 0 ? formatNPR(p.price) : "price on request"}
                </option>
              ))}
            </select>
          )}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Discount (%)" required help="Between 1 and 90">
            {(id, d) => <Input id={id} aria-describedby={d} name="percent" inputMode="numeric" value={percent} onChange={(e) => setPercent(e.target.value)} />}
          </Field>
          <div className="flex flex-col justify-end rounded-xl bg-muted/60 p-3 text-sm">
            <span className="text-muted-foreground">Customer pays</span>
            {plan && plan.price > 0 && pct > 0 && pct <= 90 ? (
              <span>
                <span className="text-muted-foreground line-through">{formatNPR(plan.price)}</span>{" "}
                <strong className="text-lg text-success">{formatNPR(dealPrice(plan.price, pct))}</strong>
              </span>
            ) : (
              <span className="font-semibold">—</span>
            )}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">
            Ends<span className="ml-0.5 text-accent">*</span>
          </p>
          <div className="mb-2 flex flex-wrap gap-2">
            {QUICK_ENDS.map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => setEndsAt(toLocalInput(new Date(Date.now() + q.ms)))}
                className="inline-flex h-9 items-center rounded-full border border-border px-3.5 text-sm font-semibold hover:border-primary/40 hover:bg-primary/5"
              >
                In {q.label}
              </button>
            ))}
          </div>
          <Input type="datetime-local" name="endsAt" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} aria-label="Ends at" />
        </div>
        <Field label="Label" help="Optional, shown on the deal card">
          {(id, d) => (
            <>
              <Input id={id} aria-describedby={d} name="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Flash Sale" list={`${id}-list`} />
              <datalist id={`${id}-list`}>
                {LABELS.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
            </>
          )}
        </Field>
        <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton pending={pending}>{deal && !ended ? "Save deal" : "Start deal"}</PrimaryButton>
        </div>
      </form>
    </Dialog>
  );
}
