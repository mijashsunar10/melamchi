"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

/** Payment screenshot: small preview; click → full-screen view with a close button (Esc / click outside also close). */
export function ProofImage({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const src = `/admin/payment-proof/${id}`;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="mt-3 block w-fit cursor-zoom-in" title="Click to make bigger">
        {/* eslint-disable-next-line @next/next/no-img-element -- private, staff-only image */}
        <img src={src} alt="Payment screenshot" className="max-h-56 rounded-xl border border-border" loading="lazy" />
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Payment screenshot"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-full bg-white text-black shadow-lg hover:bg-white/90"
          >
            <X className="size-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element -- private, staff-only image */}
          <img
            src={src}
            alt="Payment screenshot"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90dvh] max-w-full rounded-xl object-contain"
          />
        </div>
      )}
    </>
  );
}
