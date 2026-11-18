"use client";

import { useState, useTransition } from "react";
import { Card, SaveBar, Toggle, useDirty } from "@/components/admin/editor-bits";
import { FormError } from "@/components/admin/form-bits";
import { Field, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { saveSettingsAction } from "@/server/admin/content-actions";
import type { SiteSettings } from "@/types/content";

type Social = SiteSettings["social"];
const SOCIAL: { key: keyof Social; label: string; example: string }[] = [
  { key: "facebook", label: "Facebook page", example: "https://facebook.com/topxnepal" },
  { key: "instagram", label: "Instagram", example: "https://instagram.com/topxnepal" },
  { key: "tiktok", label: "TikTok", example: "https://tiktok.com/@topxnepal" },
  { key: "youtube", label: "YouTube", example: "https://youtube.com/@topxnepal" },
];

const num = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(/,/g, "")));

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const toast = useToast();
  const [saving, start] = useTransition();
  const [error, setError] = useState<string>();
  const [contact, setContact] = useState(initial.contact);
  const [social, setSocial] = useState<Social>(() => {
    const s = { ...initial.social };
    for (const k of Object.keys(s) as (keyof Social)[]) if (s[k] === "#") s[k] = "";
    return s;
  });
  const [stats, setStats] = useState(() => ({
    ordersDelivered: String(initial.stats.ordersDelivered),
    avgDeliverySeconds: String(initial.stats.avgDeliverySeconds),
    rating: String(initial.stats.rating),
    reviewCount: String(initial.stats.reviewCount),
  }));
  const [methods, setMethods] = useState(initial.paymentMethods);

  const payload = (): SiteSettings => ({
    contact: { ...contact, whatsappNumber: contact.whatsappNumber.replace(/\D/g, "") },
    social: Object.fromEntries(Object.entries(social).map(([k, v]) => [k, v.trim() || "#"])) as Social,
    stats: {
      ordersDelivered: num(stats.ordersDelivered),
      avgDeliverySeconds: num(stats.avgDeliverySeconds),
      rating: num(stats.rating),
      reviewCount: num(stats.reviewCount),
    },
    paymentMethods: methods,
  });
  const { dirty, markSaved } = useDirty(JSON.stringify(payload()));
  const c = (k: keyof typeof contact) => ({ value: contact[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setContact({ ...contact, [k]: e.target.value }) });
  const st = (k: keyof typeof stats) => ({ value: stats[k], inputMode: "decimal" as const, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setStats({ ...stats, [k]: e.target.value }) });

  return (
    <form
      noValidate
      className="pb-28"
      onSubmit={(e) => {
        e.preventDefault();
        setError(undefined);
        const data = payload();
        if (Object.values(data.stats).some(Number.isNaN)) return setError("Website numbers: fill in every box with a number.");
        start(async () => {
          const r = await saveSettingsAction(data);
          if (r.error) {
            setError(r.error);
            return toast({ type: "error", title: r.error });
          }
          toast({ type: "success", title: r.message ?? "Saved." });
          markSaved(JSON.stringify(data));
        });
      }}
    >
      <FormError error={error} />
      <div className="mt-4 grid items-start gap-6 xl:grid-cols-2">
        <Card id="contact" title="Contact details" description="Shown in the header, footer, contact page and every “WhatsApp” button.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="WhatsApp number" required help="977 + your 10-digit number, e.g. 9779812345678. Orders arrive here." className="sm:col-span-2">
              {(id, d) => <Input id={id} aria-describedby={d} name="whatsappNumber" inputMode="tel" {...c("whatsappNumber")} />}
            </Field>
            <Field label="Email" required>
              {(id) => <Input id={id} type="email" name="email" {...c("email")} />}
            </Field>
            <Field label="Phone" required help="As customers should see it, e.g. +977 9812345678">
              {(id, d) => <Input id={id} aria-describedby={d} name="phone" {...c("phone")} />}
            </Field>
            <Field label="Address" required className="sm:col-span-2">
              {(id) => <Input id={id} name="address" {...c("address")} />}
            </Field>
            <Field label="Office hours" help="e.g. Sun–Fri, 10:00 AM – 6:00 PM">
              {(id, d) => <Input id={id} aria-describedby={d} name="officeHours" {...c("officeHours")} />}
            </Field>
            <Field label="Google Maps link" help="For the “Get directions” button">
              {(id, d) => <Input id={id} aria-describedby={d} name="mapUrl" {...c("mapUrl")} />}
            </Field>
          </div>
        </Card>

        <Card id="social" title="Social media" description="Icons in the footer and on the contact page. Leave empty if you don’t have one.">
          <div className="flex flex-col gap-5">
            {SOCIAL.map((s) => (
              <Field key={s.key} label={s.label}>
                {(id) => <Input id={id} name={s.key} type="url" placeholder={s.example} value={social[s.key]} onChange={(e) => setSocial({ ...social, [s.key]: e.target.value })} />}
              </Field>
            ))}
          </div>
        </Card>

        <Card id="stats" title="Website numbers" description="The trust numbers on the home page and About page. Keep them honest.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Orders delivered" help="Shown as e.g. “50,000+”">
              {(id, d) => <Input id={id} aria-describedby={d} name="ordersDelivered" {...st("ordersDelivered")} />}
            </Field>
            <Field label="Average delivery (seconds)" help="e.g. 12 → “12 sec”">
              {(id, d) => <Input id={id} aria-describedby={d} name="avgDeliverySeconds" {...st("avgDeliverySeconds")} />}
            </Field>
            <Field label="Average rating" help="0 to 5, e.g. 4.9">
              {(id, d) => <Input id={id} aria-describedby={d} name="rating" {...st("rating")} />}
            </Field>
            <Field label="Number of reviews" help="e.g. 5200">
              {(id, d) => <Input id={id} aria-describedby={d} name="reviewCount" {...st("reviewCount")} />}
            </Field>
          </div>
        </Card>

        <Card id="payments" title="Payment methods" description="Shown in the footer. Switch off the ones you don’t accept.">
          <ul className="flex flex-col gap-3">
            {methods.map((m) => {
              const set = (patch: Partial<typeof m>) => setMethods((all) => all.map((x) => (x.id === m.id ? { ...x, ...patch } : x)));
              return (
                <li key={m.id} className="rounded-xl border border-border p-4" data-payment={m.id}>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="size-4 rounded-full" style={{ backgroundColor: m.color }} aria-hidden />
                    <span className="flex-1 font-semibold">{m.name}</span>
                    <Toggle checked={m.enabled} onChange={(v) => set({ enabled: v })} label={m.enabled ? "Shown" : "Off"} />
                  </div>
                  {m.enabled && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input value={m.name} onChange={(e) => set({ name: e.target.value })} aria-label={`${m.name} name`} />
                      <Input value={m.description} onChange={(e) => set({ description: e.target.value })} aria-label={`${m.name} description`} placeholder="Short description" />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
      <SaveBar backHref="/admin" backLabel="Dashboard" dirty={dirty} saving={saving} />
    </form>
  );
}
