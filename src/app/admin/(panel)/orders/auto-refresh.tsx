"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Re-loads the list every 20 s so new orders show up without pressing refresh. */
export function AutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), 20_000);
    return () => clearInterval(t);
  }, [router]);
  return null;
}
