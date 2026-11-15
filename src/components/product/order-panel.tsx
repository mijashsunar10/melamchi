"use client";

import { BadgeCheck, Loader2, Minus, Plus, Search, ShieldCheck } from "lucide-react";
import { useId, useState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { discountPercent, formatNPR } from "@/lib/format";
import { allowsQuantity, dealPrice, lookupPlayerName, MAX_QUANTITY, type OrderRequest, priceOrder, submitOrder, validateOrder } from "@/lib/orders";
import type { Deal, OrderField, Plan, Product } from "@/types/catalog";

function defaultPlan(plans: Plan[]) {
  return (plans.find((p) => p.popular && p.inStock) ?? plans.find((p) => p.inStock) ?? plans[0]).id;
}

function StepTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 text-base font-bold">
      <span className="flex size-7 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">{n}</span>
      {children}
    </h2>
  );
}

/** Product order form. All order logic lives in src/lib/orders.ts (backend swap point). */
export function OrderPanel({ product, deal = null }: { product: Product; deal?: Deal | null }) {
  const toast = useToast();
  const formId = useId();
  // a deal pre-selects its package
  const [planId, setPlanId] = useState(() => deal?.planId ?? defaultPlan(product.plans));
  const [qty, setQty] = useState(1);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [playerName, setPlayerName] = useState<string | null>(null);

  const { plan, unitPrice, onDeal, total, isQuote } = priceOrder(product, planId, qty, deal);
  const allowQty = allowsQuantity(product);

  const request = (): OrderRequest => ({
    productSlug: product.slug,
    planId,
    quantity: qty,
    details: values,
    playerName: playerName ?? undefined,
  });

  const setValue = (name: string, v: string) => {
    setValues((s) => ({ ...s, [name]: v }));
    setErrors((e) => ({ ...e, [name]: "" }));
    if (name === "playerId") setPlayerName(null);
  };

  async function checkName(field: OrderField) {
    setChecking(true);
    const name = await lookupPlayerName(product.slug, values[field.name]?.trim() ?? "");
    setChecking(false);
    if (name) setPlayerName(name);
    else setErrors((e) => ({ ...e, [field.name]: "Player not found — check the ID and try again." }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateOrder(product, request());
    setErrors(found);
    if (Object.keys(found).length) {
      toast({
        type: "error",
        title: found._plan ? found._plan : "Please fill in the required details",
      });
      return;
    }
    setSubmitting(true);
    const result = await submitOrder(product, request(), deal);
    setSubmitting(false);
    if (!result.ok) {
      toast({ type: "error", title: result.error });
      return;
    }
    window.open(result.redirectUrl, "_blank", "noopener,noreferrer");
    toast({
      type: "success",
      title: `Order ref ${result.orderId ?? ""} — opening WhatsApp…`,
      description: "Send the message and we'll confirm your order. Keep the ref to track it.",
      duration: 8000,
    });
  }

  return (
    <form id={formId} onSubmit={submit} noValidate className="flex flex-col gap-7">
      {/* 1. Package */}
      <section className="flex flex-col gap-4">
        <StepTitle n={1}>Select a package</StepTitle>
        <div role="radiogroup" aria-label="Packages" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {product.plans.map((p) => {
            const selected = p.id === planId;
            const isDeal = deal?.planId === p.id;
            const shownPrice = isDeal ? dealPrice(p.price, deal.discountPercent) : p.price;
            const was = isDeal ? p.price : p.originalPrice;
            const off = discountPercent(shownPrice, was);
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={!p.inStock}
                onClick={() => setPlanId(p.id)}
                className={cn(
                  "relative flex flex-col items-start gap-1 rounded-xl border-2 bg-surface p-3 text-left transition-all",
                  selected
                    ? "border-primary bg-primary/5 shadow-[0_8px_20px_-10px_rgba(29,63,191,0.6)] dark:bg-primary/15"
                    : "border-border hover:border-primary/40",
                  !p.inStock && "cursor-not-allowed opacity-50",
                )}
              >
                {isDeal ? (
                  <span className="absolute -top-2.5 right-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
                    Deal -{deal.discountPercent}%
                  </span>
                ) : (
                  p.popular &&
                  p.inStock && (
                    <span className="absolute -top-2.5 right-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                      Popular
                    </span>
                  )
                )}
                <span className="text-sm leading-tight font-semibold">{p.name}</span>
                {p.bonus && <span className="text-[11px] font-semibold text-success">{p.bonus}</span>}
                <span className="mt-auto flex flex-wrap items-baseline gap-x-1.5 pt-1">
                  <span className="font-display text-base font-extrabold text-accent">
                    {p.price === 0 ? "Quote" : formatNPR(shownPrice)}
                  </span>
                  {was && <span className="text-[11px] text-muted-foreground line-through">{formatNPR(was)}</span>}
                  {off && <span className="text-[10px] font-bold text-success">-{off}%</span>}
                </span>
                {!p.inStock && <span className="text-[11px] font-semibold text-danger">Out of stock</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Details */}
      {product.fields.length > 0 && (
        <section className="flex flex-col gap-4">
          <StepTitle n={2}>Your details</StepTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            {product.fields.map((f) => (
              <Field
                key={f.name}
                label={f.label}
                required={f.required}
                help={f.help}
                error={errors[f.name] || undefined}
                className={f.type === "textarea" ? "sm:col-span-2" : f.verifiable ? "sm:col-span-2" : undefined}
              >
                {(id, describedBy, invalid) =>
                  f.type === "select" ? (
                    <Select
                      id={id}
                      aria-describedby={describedBy}
                      aria-invalid={invalid}
                      value={values[f.name] ?? ""}
                      onChange={(e) => setValue(f.name, e.target.value)}
                      placeholder="Select…"
                      options={f.options ?? []}
                    />
                  ) : f.type === "textarea" ? (
                    <Textarea
                      id={id}
                      aria-describedby={describedBy}
                      aria-invalid={invalid}
                      placeholder={f.placeholder}
                      value={values[f.name] ?? ""}
                      onChange={(e) => setValue(f.name, e.target.value)}
                    />
                  ) : f.verifiable ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Input
                          id={id}
                          aria-describedby={describedBy}
                          aria-invalid={invalid}
                          inputMode="numeric"
                          placeholder={f.placeholder}
                          value={values[f.name] ?? ""}
                          onChange={(e) => setValue(f.name, e.target.value)}
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => checkName(f)}
                          disabled={checking}
                          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border border-input bg-surface px-4 text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-60"
                        >
                          {checking ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                          Check name
                        </button>
                      </div>
                      {playerName && (
                        <p className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm font-semibold text-success">
                          <BadgeCheck className="size-4" /> {playerName}
                        </p>
                      )}
                    </div>
                  ) : (
                    <Input
                      id={id}
                      aria-describedby={describedBy}
                      aria-invalid={invalid}
                      type={f.type === "email" ? "email" : f.type === "tel" ? "tel" : "text"}
                      placeholder={f.placeholder}
                      value={values[f.name] ?? ""}
                      onChange={(e) => setValue(f.name, e.target.value)}
                    />
                  )
                }
              </Field>
            ))}
          </div>
        </section>
      )}

      {/* 3. Summary */}
      <section className="flex flex-col gap-4">
        <StepTitle n={product.fields.length > 0 ? 3 : 2}>Review & order</StepTitle>
        <div className="rounded-2xl border border-border bg-surface-2/60 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate font-semibold">{plan.name}</p>
              <p className="text-sm text-muted-foreground">
                {isQuote ? (
                  "Price on request"
                ) : (
                  <>
                    {formatNPR(unitPrice)} each
                    {onDeal && <span className="ml-2 font-semibold text-accent">deal price</span>}
                  </>
                )}
              </p>
            </div>
            {allowQty && (
              <div className="flex items-center rounded-full border border-border bg-surface">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex size-9 items-center justify-center rounded-full hover:bg-muted disabled:opacity-40"
                  disabled={qty <= 1}
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite">
                  {qty}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => Math.min(MAX_QUANTITY, q + 1))}
                  className="flex size-9 items-center justify-center rounded-full hover:bg-muted disabled:opacity-40"
                  disabled={qty >= MAX_QUANTITY}
                >
                  <Plus className="size-4" />
                </button>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-end justify-between border-t border-dashed border-border pt-4">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-display text-3xl font-black text-accent">{isQuote ? "Get a quote" : formatNPR(total)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-13 items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-6 text-base font-bold text-white shadow-[0_12px_30px_-10px_rgba(37,211,102,0.7)] transition-all hover:-translate-y-0.5 hover:bg-[#1fb857]"
        >
          <svg viewBox="0 0 24 24" className="size-5 fill-white" aria-hidden>
            <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4ZM12 2a10 10 0 0 0-8.6 15l-1.4 5 5.1-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Z" />
          </svg>
          {isQuote ? "Request a quote on WhatsApp" : "Order on WhatsApp"}
        </button>
        <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-success" /> Pay with eSewa, Khalti, IME Pay or bank after we confirm
        </p>
      </section>

      {/* Mobile sticky order bar */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs text-muted-foreground">{plan.name}</p>
            <p className="font-display text-lg font-black text-accent">{isQuote ? "Quote" : formatNPR(total)}</p>
          </div>
          <button type="submit" form={formId} className="h-11 shrink-0 rounded-xl bg-[#25D366] px-5 text-sm font-bold text-white">
            Order now
          </button>
        </div>
      </div>
    </form>
  );
}
