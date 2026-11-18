"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/** [days, hours, minutes, seconds] left — stops at 0 when the deal has ended */
function remaining(endsAt: number, now: number) {
  const s = Math.max(0, Math.floor((endsAt - now) / 1000));
  return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
}

/** [Nd] HH:MM:SS countdown. Renders "--" on the server to avoid hydration mismatch. */
export function Countdown({ endsAt, className }: { endsAt: string; className?: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const parts = now === null ? null : remaining(new Date(endsAt).getTime(), now);

  return (
    <span className={cn("inline-flex items-center gap-1 font-mono tabular-nums", className)} aria-label="Time left">
      {parts && parts[0] > 0 && (
        <span className="rounded-md bg-brand-navy px-1.5 py-0.5 text-xs font-bold text-white dark:bg-white/10">{parts[0]}d</span>
      )}
      {[1, 2, 3].map((i) => (
        <span key={i} className="inline-flex items-center gap-1">
          <span className="rounded-md bg-brand-navy px-1.5 py-0.5 text-xs font-bold text-white dark:bg-white/10">
            {parts ? String(parts[i]).padStart(2, "0") : "--"}
          </span>
          {i < 3 && <span className="text-xs font-bold text-muted-foreground">:</span>}
        </span>
      ))}
    </span>
  );
}
