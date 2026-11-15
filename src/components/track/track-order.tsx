"use client";

import { CheckCircle2, Circle, Loader2, MessageCircle, PackageSearch, XCircle } from "lucide-react";
import { useState } from "react";
import { Field, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { formatNPR } from "@/lib/format";
import { ORDER_REF, type OrderStatus, type OrderTracking, trackOrder } from "@/lib/orders";
import { whatsappLink } from "@/lib/site";

const STEPS: { status: OrderStatus; label: string; text: string }[] = [
  { status: "received", label: "Order received", text: "We have your order details." },
  { status: "paid", label: "Payment confirmed", text: "Your payment was verified." },
  { status: "processing", label: "Processing", text: "We're delivering it now." },
  { status: "delivered", label: "Delivered", text: "Done! Check your game or inbox." },
];

/** Status timeline — shown when the backend returns real order data. */
export function OrderTimeline({ order }: { order: OrderTracking }) {
  const failed = order.status === "failed" || order.status === "refunded";
  const reached = new Set(order.history.map((h) => h.status));
  const at = (s: OrderStatus) => order.history.find((h) => h.status === s)?.at;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Order {order.orderId}</p>
          <p className="mt-1 font-bold">
            {order.productName} · {order.packageName}
          </p>
        </div>
        <p className="font-display text-xl font-black text-accent">{formatNPR(order.total)}</p>
      </div>
      <ol className="mt-6 flex flex-col gap-5">
        {STEPS.map((s) => {
          const done = reached.has(s.status);
          return (
            <li key={s.status} className="flex gap-3">
              {done ? <CheckCircle2 className="size-6 shrink-0 text-success" /> : <Circle className="size-6 shrink-0 text-border" />}
              <div>
                <p className={cn("font-semibold", !done && "text-muted-foreground")}>{s.label}</p>
                <p className="text-sm text-muted-foreground">{done && at(s.status) ? new Date(at(s.status)!).toLocaleString("en-GB") : s.text}</p>
              </div>
            </li>
          );
        })}
        {failed && (
          <li className="flex gap-3">
            <XCircle className="size-6 shrink-0 text-danger" />
            <div>
              <p className="font-semibold text-danger">{order.status === "refunded" ? "Refunded" : "Could not be delivered"}</p>
              <p className="text-sm text-muted-foreground">Our team will contact you — or message us on WhatsApp.</p>
            </div>
          </li>
        )}
      </ol>
    </div>
  );
}

/** Order lookup form. Uses trackOrder() from src/lib/orders.ts (backend swap point). */
export function TrackOrder() {
  const toast = useToast();
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderTracking | null>(null);
  const [notFound, setNotFound] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const id = orderId.trim().toUpperCase();
    if (!ORDER_REF.test(id)) {
      setError("Enter your order ref, e.g. TX-8K2F9Q");
      return;
    }
    setLoading(true);
    setNotFound(false);
    const result = await trackOrder(id, phone.trim() || undefined);
    setLoading(false);
    if (result.found) {
      setOrder(result.order);
      return;
    }
    setOrder(null);
    if (result.reason === "not-found") {
      setNotFound(true);
      return;
    }
    // No order database yet: ask the team on WhatsApp
    window.open(whatsappLink(`Hi TOPX Nepal! Please check the status of my order ${id}.`), "_blank", "noopener,noreferrer");
    toast({ type: "info", title: "Opening WhatsApp…", description: "Our team will reply with your order status in minutes." });
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={submit} noValidate className="rounded-3xl border border-border bg-surface p-6 shadow-card sm:p-8">
        <div className="grid gap-4 sm:grid-cols-[1.2fr_1fr]">
          <Field label="Order ref" required error={error || undefined} help={error ? undefined : "Shown when you placed the order, e.g. TX-8K2F9Q"}>
            {(id, d, inv) => (
              <Input
                id={id}
                aria-describedby={d}
                aria-invalid={inv}
                value={orderId}
                onChange={(e) => {
                  setOrderId(e.target.value.toUpperCase());
                  setError("");
                }}
                placeholder="TX-XXXXXX"
                autoCapitalize="characters"
                icon={<PackageSearch />}
              />
            )}
          </Field>
          <Field label="WhatsApp / phone (optional)">
            {(id, d) => <Input id={id} aria-describedby={d} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98XXXXXXXX" />}
          </Field>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60 sm:w-auto"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <PackageSearch className="size-4" />}
          Track order
        </button>
      </form>

      {order && <OrderTimeline order={order} />}
      {notFound && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm">We couldn&apos;t find that order. Check the ref, or ask us on WhatsApp.</p>
          <a href={whatsappLink(`Hi TOPX Nepal, I can't find my order ${orderId}.`)} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-bold text-white">
            <MessageCircle className="size-4" /> Ask us
          </a>
        </div>
      )}
    </div>
  );
}

