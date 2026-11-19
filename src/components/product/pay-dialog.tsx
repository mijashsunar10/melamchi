"use client";

import { CheckCircle2, Download, Hourglass, ImageUp, Loader2, QrCode, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatNPR } from "@/lib/format";
import type { OrderRequest } from "@/lib/orders";
import { placeOrderAction, startEsewaAction } from "@/server/shop/order-actions";

const QR_SRC = "/qr/pay-qr.jpeg";
const TIME_LIMIT = 10 * 60; // seconds

/** Scan-to-pay popup. "I have paid" saves the order → it appears in the admin Orders page as a new order. */
export function PayDialog({
  open,
  onClose,
  amount,
  request,
  esewa,
}: {
  open: boolean;
  onClose: () => void;
  amount: number;
  request: OrderRequest;
  /** show "Pay with eSewa" (automatic payment check) */
  esewa?: boolean;
}) {
  const [left, setLeft] = useState(TIME_LIMIT);
  const [ref, setRef] = useState("");
  const [shot, setShot] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [open]);

  async function paid() {
    if (!shot) return setError("Please upload your payment screenshot.");
    setBusy(true);
    setError("");
    const fd = new FormData();
    fd.append("screenshot", shot);
    const r = await placeOrderAction(request, ref, fd);
    setBusy(false);
    if (r.ok) setOrderId(r.orderId);
    else if (r.needLogin) router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    else setError(r.error);
  }

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
    form.submit();
  }

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <Dialog open={open} onClose={onClose} className="max-w-md">
      <div className="flex flex-col items-center gap-4 overflow-y-auto p-6 text-center">
        {orderId ? (
          <>
            <CheckCircle2 className="size-16 text-success" />
            <h2 className="font-display text-2xl font-black">Order received!</h2>
            <p className="text-sm text-muted-foreground">
              Order <strong className="text-foreground">{orderId}</strong> is waiting for confirmation. We check your payment and add it
              to your account shortly.
            </p>
            <Link href="/account" className="inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground">
              View my orders
            </Link>
          </>
        ) : (
          <>
            {esewa && (
              <>
                <button
                  type="button"
                  onClick={payEsewa}
                  disabled={busy}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#60bb46] text-base font-bold text-white hover:brightness-95 disabled:opacity-60"
                >
                  {busy && <Loader2 className="size-5 animate-spin" />}
                  Pay {formatNPR(amount)} with eSewa
                </button>
                <p className="-mt-2 text-xs text-muted-foreground">Instant — no screenshot needed</p>
                <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">or scan QR</p>
              </>
            )}
            <p className="flex items-center gap-1.5 text-xs font-bold tracking-widest text-accent uppercase">
              <QrCode className="size-4" /> Fonepay
            </p>
            <h2 className="-mt-2 font-display text-2xl font-black">Scan To Pay</h2>
            <div className="rounded-2xl bg-white p-3">
              <Image src={QR_SRC} alt="Payment QR code" width={260} height={260} className="size-60 object-contain" unoptimized />
            </div>
            <a href={QR_SRC} download="topx-pay-qr.jpeg" className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-semibold text-accent">
              <Download className="size-3.5" /> Download QR
            </a>
            <p className="text-xs text-muted-foreground">eSewa · Khalti · IME Pay · Mobile banking</p>
            <p className="text-lg font-semibold">
              Amount: <span className="font-display font-black text-accent">{formatNPR(amount)}</span>
            </p>
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-600 dark:text-amber-400">
              <Hourglass className="size-4" /> Time remaining <strong>{mm}:{ss}</strong>
            </p>
            {left === 0 ? (
              <p className="text-sm font-semibold text-danger">Time is up. Close and press Buy Now again.</p>
            ) : (
              <>
                <label className="flex w-full cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 px-4 py-4 text-sm hover:border-primary">
                  <ImageUp className="size-6 text-primary" />
                  <span className="font-semibold">{shot ? shot.name : "Upload payment screenshot *"}</span>
                  <span className="text-xs text-muted-foreground">{shot ? "Tap to change" : "JPG or PNG, max 5 MB"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      if (f && f.size > 5 * 1024 * 1024) return setError("Screenshot is too big (max 5 MB).");
                      setError("");
                      setShot(f);
                    }}
                  />
                </label>
                <Input
                  value={ref}
                  onChange={(e) => setRef(e.target.value)}
                  placeholder="Transaction ID / payer name (optional)"
                  className="text-center"
                />
                {error && <p className="text-sm font-semibold text-danger">{error}</p>}
                <button
                  type="button"
                  onClick={paid}
                  disabled={busy}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
                >
                  {busy ? <Loader2 className="size-5 animate-spin" /> : <ShieldCheck className="size-5" />}
                  I have paid
                </button>
                <p className="text-xs text-muted-foreground">Pay exactly {formatNPR(amount)}, upload the screenshot, then press &quot;I have paid&quot;.</p>
              </>
            )}
          </>
        )}
      </div>
    </Dialog>
  );
}
