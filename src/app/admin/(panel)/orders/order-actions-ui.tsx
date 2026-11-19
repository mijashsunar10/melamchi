"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteOrderAction, setOrderStatusAction } from "@/server/shop/order-actions";

type Status = "unpaid" | "pending" | "processing" | "delivered" | "failed" | "refunded";

export function OrderActions({ id, status, note }: { id: string; status: Status; note: string | null }) {
  const [value, setValue] = useState<Status>(status);
  const [text, setText] = useState(note ?? "");
  const [pending, start] = useTransition();
  const router = useRouter();
  const save = (s: Status) =>
    start(async () => {
      setValue(s);
      if (s !== "unpaid") await setOrderStatusAction(id, s, text);
      router.refresh();
    });

  return (
    <div className="flex flex-col gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Note for customer (optional)"
        className="h-9 rounded-lg border border-input bg-surface px-3 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        <button disabled={pending} onClick={() => save("delivered")} className="rounded-lg bg-success px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">
          ✓ Delivered
        </button>
        <button disabled={pending} onClick={() => save("processing")} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground disabled:opacity-60">
          Processing
        </button>
        <button disabled={pending} onClick={() => save("failed")} className="rounded-lg bg-danger px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">
          Not paid / failed
        </button>
        <select
          value={value}
          disabled={pending}
          onChange={(e) => save(e.target.value as Status)}
          className="h-8 rounded-lg border border-input bg-surface px-2 text-xs"
        >
          {["pending", "processing", "delivered", "failed", "refunded"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        {(value === "delivered" || value === "failed" || value === "refunded") && (
          <button
            disabled={pending}
            onClick={() => {
              if (!confirm(`Delete order ${id}? This cannot be undone.`)) return;
              start(async () => {
                const r = await deleteOrderAction(id);
                if (!r.ok) alert(r.error);
                router.refresh();
              });
            }}
            className="ml-auto inline-flex items-center gap-1 rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-bold text-danger hover:bg-danger/10 disabled:opacity-60"
          >
            <Trash2 className="size-3.5" /> Delete
          </button>
        )}
        {pending && <Loader2 className="size-4 animate-spin" />}
      </div>
    </div>
  );
}
