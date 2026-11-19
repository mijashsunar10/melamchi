"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { checkEsewaAction } from "@/server/shop/order-actions";

// Asks eSewa about unpaid orders from the last 48h — for customers who paid but closed the tab before returning.
export function CheckEsewaButton() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const router = useRouter();
  return (
    <div className="mb-4 flex items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const n = await checkEsewaAction();
            setMsg(n ? `${n} missed payment(s) found and added.` : "No missed payments.");
            router.refresh();
          })
        }
        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
        Check eSewa for missed payments
      </button>
      {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
    </div>
  );
}
