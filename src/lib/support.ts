// Support requests — the ONE place the contact form submits to.
// NOW: opens WhatsApp with the message and emails a copy (src/lib/notify.ts). BACKEND: POST /api/support → { ticketId }.

import { emailCopy } from "@/lib/notify";
import { whatsappLink } from "@/lib/site";

export interface SupportRequest {
  name: string;
  phone: string;
  topic: string;
  orderNumber?: string;
  message: string;
}

export type SupportResult = { ok: true; redirectUrl: string; ticketId?: string } | { ok: false; error: string };

export function validateSupportRequest(req: SupportRequest): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!req.name.trim()) errors.name = "Please enter your name.";
  if (!/^[+\d][\d\s-]{6,}$/.test(req.phone.trim())) errors.phone = "Enter a valid phone / WhatsApp number.";
  if (!req.topic) errors.topic = "Choose a topic.";
  if (req.message.trim().length < 10) errors.message = "Tell us a bit more (at least 10 characters).";
  return errors;
}

export async function submitSupportRequest(req: SupportRequest): Promise<SupportResult> {
  const errors = validateSupportRequest(req);
  if (Object.keys(errors).length) return { ok: false, error: Object.values(errors)[0] };
  const text = [
    "Hi TOPX Nepal, I need help:",
    "",
    `• Name: ${req.name.trim()}`,
    `• Phone: ${req.phone.trim()}`,
    `• Topic: ${req.topic}`,
    ...(req.orderNumber?.trim() ? [`• Order: ${req.orderNumber.trim()}`] : []),
    "",
    req.message.trim(),
  ].join("\n");
  emailCopy(`Support request — ${req.topic} — ${req.name.trim()}`, text);
  return { ok: true, redirectUrl: whatsappLink(text) };
}
