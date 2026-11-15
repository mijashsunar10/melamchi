"use client";

import { Check, Send } from "lucide-react";
import { useState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import {
  BUSINESS_TYPES,
  MONTHLY_VOLUMES,
  type ResellerApplication,
  submitResellerApplication,
  validateResellerApplication,
} from "@/lib/reseller";

const empty: ResellerApplication = {
  businessName: "",
  contactName: "",
  phone: "",
  city: "",
  businessType: "",
  monthlyVolume: "",
  interests: [],
  message: "",
};

/** Reseller application form. Submits through src/lib/reseller.ts (backend swap point). */
export function ResellerForm({ categories }: { categories: string[] }) {
  const toast = useToast();
  const [form, setForm] = useState<ResellerApplication>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const set = <K extends keyof ResellerApplication>(key: K, value: ResellerApplication[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const toggle = (c: string) =>
    set("interests", form.interests.includes(c) ? form.interests.filter((x) => x !== c) : [...form.interests, c]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateResellerApplication(form);
    setErrors(found);
    if (Object.keys(found).length) {
      toast({ type: "error", title: "Please complete the form" });
      return;
    }
    setSending(true);
    const result = await submitResellerApplication(form);
    setSending(false);
    if (!result.ok) {
      toast({ type: "error", title: result.error });
      return;
    }
    window.open(result.redirectUrl, "_blank", "noopener,noreferrer");
    toast({ type: "success", title: "Opening WhatsApp…", description: "Send the message — our business team will call you back." });
    setForm(empty);
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      <Field label="Business name" required error={errors.businessName || undefined}>
        {(id, d, inv) => <Input id={id} aria-describedby={d} aria-invalid={inv} value={form.businessName} onChange={(e) => set("businessName", e.target.value)} placeholder="e.g. Himalayan Mobile Store" />}
      </Field>
      <Field label="Your name" required error={errors.contactName || undefined}>
        {(id, d, inv) => <Input id={id} aria-describedby={d} aria-invalid={inv} value={form.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Full name" />}
      </Field>
      <Field label="WhatsApp / phone" required error={errors.phone || undefined}>
        {(id, d, inv) => <Input id={id} aria-describedby={d} aria-invalid={inv} type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="98XXXXXXXX" />}
      </Field>
      <Field label="City" required error={errors.city || undefined}>
        {(id, d, inv) => <Input id={id} aria-describedby={d} aria-invalid={inv} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Pokhara" />}
      </Field>
      <Field label="Business type" required error={errors.businessType || undefined}>
        {(id, d, inv) => <Select id={id} aria-describedby={d} aria-invalid={inv} value={form.businessType} onChange={(e) => set("businessType", e.target.value)} placeholder="Choose…" options={BUSINESS_TYPES} />}
      </Field>
      <Field label="Estimated monthly volume" required error={errors.monthlyVolume || undefined}>
        {(id, d, inv) => <Select id={id} aria-describedby={d} aria-invalid={inv} value={form.monthlyVolume} onChange={(e) => set("monthlyVolume", e.target.value)} placeholder="Choose…" options={MONTHLY_VOLUMES} />}
      </Field>

      <fieldset className="flex flex-col gap-2 sm:col-span-2">
        <legend className="mb-2 text-sm font-semibold">
          Interested in<span className="ml-0.5 text-accent">*</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const on = form.interests.includes(c);
            return (
              <button
                key={c}
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => toggle(c)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition-all",
                  on ? "bg-primary text-primary-foreground ring-primary" : "bg-surface text-muted-foreground ring-border hover:text-foreground",
                )}
              >
                {on && <Check className="size-4" />}
                {c}
              </button>
            );
          })}
        </div>
        {errors.interests && <p className="text-xs text-danger">{errors.interests}</p>}
      </fieldset>

      <Field label="Anything else? (optional)" className="sm:col-span-2">
        {(id, d) => <Textarea id={id} aria-describedby={d} value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Products you need, quantities, questions…" rows={3} />}
      </Field>

      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">We reply within 2 working hours.</p>
        <button
          type="submit"
          disabled={sending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-cta-gradient px-6 text-sm font-bold text-white shadow-glow-orange transition-all hover:-translate-y-0.5 disabled:opacity-60"
        >
          <Send className="size-4" /> Apply now
        </button>
      </div>
    </form>
  );
}
