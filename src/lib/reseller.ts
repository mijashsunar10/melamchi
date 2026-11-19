// Business / reseller applications — the ONE place the reseller form submits to.
// NOW: opens WhatsApp with the application. BACKEND: POST /api/reseller-applications → { applicationId }.

import { emailCopy } from "@/lib/notify";
import { whatsappLink } from "@/lib/site";

export interface ResellerApplication {
  businessName: string;
  contactName: string;
  phone: string;
  city: string;
  businessType: string;
  monthlyVolume: string;
  interests: string[]; // domain names, e.g. ["Gaming Top-up", "Software & Apps"]
  message?: string;
}

export type ResellerResult = { ok: true; redirectUrl: string; applicationId?: string } | { ok: false; error: string };

export const BUSINESS_TYPES = ["Mobile / gaming shop", "Cyber café", "Gaming centre", "IT / computer shop", "Company / office", "Online seller", "Other"];
export const MONTHLY_VOLUMES = ["Under Rs 50,000", "Rs 50,000 – 2 lakh", "Rs 2 – 5 lakh", "Above Rs 5 lakh"];

export function validateResellerApplication(a: ResellerApplication): Record<string, string> {
  const e: Record<string, string> = {};
  if (!a.businessName.trim()) e.businessName = "Enter your business name.";
  if (!a.contactName.trim()) e.contactName = "Enter your name.";
  if (!/^[+\d][\d\s-]{6,}$/.test(a.phone.trim())) e.phone = "Enter a valid phone / WhatsApp number.";
  if (!a.city.trim()) e.city = "Enter your city.";
  if (!a.businessType) e.businessType = "Choose your business type.";
  if (!a.monthlyVolume) e.monthlyVolume = "Choose an estimated monthly volume.";
  if (a.interests.length === 0) e.interests = "Choose at least one category.";
  return e;
}

export async function submitResellerApplication(a: ResellerApplication): Promise<ResellerResult> {
  const errors = validateResellerApplication(a);
  if (Object.keys(errors).length) return { ok: false, error: Object.values(errors)[0] };
  const text = [
    "Hi TOPX Nepal! I'd like to become a reseller / business partner.",
    "",
    `• Business: ${a.businessName.trim()}`,
    `• Name: ${a.contactName.trim()}`,
    `• Phone: ${a.phone.trim()}`,
    `• City: ${a.city.trim()}`,
    `• Type: ${a.businessType}`,
    `• Monthly volume: ${a.monthlyVolume}`,
    `• Interested in: ${a.interests.join(", ")}`,
    ...(a.message?.trim() ? ["", a.message.trim()] : []),
  ].join("\n");
  emailCopy(`Reseller application — ${a.businessName.trim()}`, text);
  return { ok: true, redirectUrl: whatsappLink(text) };
}
