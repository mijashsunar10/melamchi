"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { type SupportRequest, submitSupportRequest, validateSupportRequest } from "@/lib/support";

const empty: SupportRequest = { name: "", phone: "", topic: "", orderNumber: "", message: "" };

/** "Send us a message" form. Submits through src/lib/support.ts (backend swap point). */
export function ContactForm({ topics }: { topics: string[] }) {
  const toast = useToast();
  const [form, setForm] = useState<SupportRequest>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const set = (key: keyof SupportRequest, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateSupportRequest(form);
    setErrors(found);
    if (Object.keys(found).length) {
      toast({ type: "error", title: "Please check the form" });
      return;
    }
    setSending(true);
    const result = await submitSupportRequest(form);
    setSending(false);
    if (!result.ok) {
      toast({ type: "error", title: result.error });
      return;
    }
    window.open(result.redirectUrl, "_blank", "noopener,noreferrer");
    toast({ type: "success", title: "Opening WhatsApp…", description: "Send the message and our team will reply shortly." });
    setForm(empty);
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      <Field label="Your name" required error={errors.name || undefined}>
        {(id, d, invalid) => (
          <Input id={id} aria-describedby={d} aria-invalid={invalid} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Aarav Shrestha" />
        )}
      </Field>
      <Field label="WhatsApp / phone" required error={errors.phone || undefined}>
        {(id, d, invalid) => (
          <Input id={id} aria-describedby={d} aria-invalid={invalid} type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="98XXXXXXXX" />
        )}
      </Field>
      <Field label="Topic" required error={errors.topic || undefined}>
        {(id, d, invalid) => (
          <Select id={id} aria-describedby={d} aria-invalid={invalid} value={form.topic} onChange={(e) => set("topic", e.target.value)} placeholder="Choose a topic" options={topics} />
        )}
      </Field>
      <Field label="Order number (optional)">
        {(id, d) => (
          <Input id={id} aria-describedby={d} value={form.orderNumber} onChange={(e) => set("orderNumber", e.target.value)} placeholder="e.g. TX-20931" />
        )}
      </Field>
      <Field label="How can we help?" required error={errors.message || undefined} className="sm:col-span-2">
        {(id, d, invalid) => (
          <Textarea id={id} aria-describedby={d} aria-invalid={invalid} value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Describe the problem or question…" rows={4} />
        )}
      </Field>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">Your message opens in WhatsApp so you get a reply right there.</p>
        <button
          type="submit"
          disabled={sending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          <Send className="size-4" /> Send message
        </button>
      </div>
    </form>
  );
}
