"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setOrderStatusAction } from "@/server/shop/order-actions";

type Status = "pending" | "processing" | "delivered" | "failed" | "refunded";

export function OrderActions({ id, status, note }: { id: string; status: Status; note: string | null }) {
  const [value, setValue] = useState<Status>(status);
  const [text, setText] = useState(note ?? "");
  const [pending, start] = useTransition();
  const router = useRouter();
  const save = (s: Status) =>
    start(async () => {
      setValue(s);
      await setOrderStatusAction(id, s, text);
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
        {pending && <Loader2 className="size-4 animate-spin" />}
      </div>
    </div>
  );
}
