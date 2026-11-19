"use client";

import { Loader2, Lock, ShieldCheck, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { formatNPR } from "@/lib/format";
import type { OrderRequest } from "@/lib/orders";
import { whatsappLink } from "@/lib/site";
import { startEsewaAction } from "@/server/shop/order-actions";

/** Checkout popup: order summary → "Pay with eSewa" (payment is checked automatically, no screenshot). */
export function PayDialog({
  open,
  onClose,
  amount,
  request,
  esewa,
  productName,
  planName,
  lines,
}: {
  open: boolean;
  onClose: () => void;
  amount: number;
  request: OrderRequest;
  /** eSewa keys are set on the server */
  esewa: boolean;
  productName: string;
  planName: string;
  /** customer's details with their labels, e.g. ["Player ID", "123456"] */
  lines: [string, string][];
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  /** Save the order, then send the customer to eSewa with an auto-submitted form. */
  async function payEsewa() {
    setBusy(true);
    setError("");
    const r = await startEsewaAction(request);
    if (!r.ok) {
      setBusy(false);
      if (r.needLogin) router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      else setError(r.error);
      return;
    }
    const form = document.createElement("form");
    form.method = "POST";
    form.action = r.url;
    for (const [k, v] of Object.entries(r.fields)) {
      const i = document.createElement("input");
      i.type = "hidden";
      i.name = k;
      i.value = v;
      form.appendChild(i);
    }
    document.body.appendChild(form);
    form.submit(); // busy stays on while the browser leaves for eSewa
  }


  return (
    <Dialog open={open} onClose={onClose} className="max-w-md">
      <div className="flex flex-col gap-5 overflow-y-auto p-6">
        <div className="text-center">
          <p className="text-xs font-bold tracking-widest text-accent uppercase">Checkout</p>
          <h2 className="font-display text-2xl font-black">Confirm &amp; pay</h2>
        </div>

        <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm">
          <p className="font-bold">{productName}</p>
          <p className="text-muted-foreground">
            {planName}
            {request.quantity > 1 && ` × ${request.quantity}`}
          </p>
          {lines.length > 0 && (
            <dl className="mt-3 space-y-1 border-t border-border pt-3">
              {lines.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="truncate font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="font-semibold">Total</span>
            <span className="font-display text-2xl font-black text-accent">{formatNPR(amount)}</span>
          </div>
        </div>

        {esewa ? (
          <>
            <button
              type="button"
              onClick={payEsewa}
              disabled={busy}
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#60bb46] text-lg font-black text-white shadow-card hover:brightness-95 disabled:opacity-70"
            >
              {busy ? (
                <>
                  <Loader2 className="size-5 animate-spin" /> Opening eSewa…
                </>
              ) : (
                <>Pay with eSewa</>
              )}
            </button>
            {error && <p className="text-center text-sm font-semibold text-danger">{error}</p>}
            <ul className="grid gap-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Lock className="size-4 text-success" /> You pay on eSewa&apos;s own secure page
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-success" /> Payment is confirmed automatically — no screenshot needed
              </li>
              <li className="flex items-center gap-2">
                <Zap className="size-4 text-success" /> Track your order anytime in My account
              </li>
            </ul>
          </>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Online payment is not available right now.{" "}
            <a href={whatsappLink(`Hi TOPX Nepal! I'd like to buy ${productName} — ${planName}.`)} className="font-semibold text-accent underline">
              Order on WhatsApp
            </a>
          </p>
        )}
      </div>
    </Dialog>
  );
}
