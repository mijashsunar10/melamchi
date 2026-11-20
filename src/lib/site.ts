// Central brand + contact config.
// Contact details and social links are edited in the admin panel (Settings) and read with
// getSiteSettings() (server) or useSiteSettings() (browser). The environment variables below
// (see .env.example) are only the starting values used before Settings is saved the first time.

// NOTE: each variable must be written out literally (process.env.NEXT_PUBLIC_…)
// so Next.js can inline it into browser code.

import { paymentMethods } from "@/data/payments";
import { siteStats } from "@/data/site-stats";
import type { SiteSettings } from "@/types/content";

/** WhatsApp number in international format, digits only, e.g. 9779812345678 */
const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9779844602730";

export const siteConfig = {
  name: "TOPX NEPAL",
  company: "Melamchi Tech",
  tagline: "Game Top-ups in Seconds",
  positioning: "Nepal's Gaming Top-up Store",
  description:
    "Top up PUBG UC, Free Fire diamonds, Mobile Legends, Valorant, Steam and more in Nepal — paid with eSewa or Khalti, delivered to your Player ID in seconds. Also gaming gift cards, AI tools and software.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.topxnepal.com",
  locale: "en_NP",
  keywords: [
    "TOPX Nepal",
    "Melamchi Tech",
    "game top up Nepal",
    "PUBG UC Nepal",
    "Free Fire diamond Nepal",
    "Mobile Legends diamond Nepal",
    "Valorant points Nepal",
    "Steam wallet Nepal",
    "gaming gift card Nepal",
    "gift card Nepal",
    "ChatGPT Plus Nepal",
    "AI tools Nepal",
    "software licence Nepal",
    "Netflix Nepal",
    "digital products Nepal",
  ],
  contact: {
    email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "mijashsunar1@gmail.com",
    phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+977 9844602730",
    whatsappNumber,
    whatsapp: `https://wa.me/${whatsappNumber}`,
    address: process.env.NEXT_PUBLIC_ADDRESS || "Kathmandu, Nepal",
    /** Google Maps link for "Get directions" */
    mapUrl: process.env.NEXT_PUBLIC_MAP_URL || "https://maps.google.com/?q=Kathmandu,Nepal",
    /** Office hours (online support is 24/7) */
    officeHours: process.env.NEXT_PUBLIC_OFFICE_HOURS || "Sun–Fri, 10:00 AM – 6:00 PM",
  },
  social: {
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://www.facebook.com/share/1LrubhTUX7/",
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#",
    tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL || "#",
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || "#",
  },
} as const;

/** Starting values for the admin Settings page (from .env and the starter data). */
export function defaultSiteSettings(): SiteSettings {
  const c = siteConfig.contact;
  return {
    contact: { whatsappNumber: c.whatsappNumber, email: c.email, phone: c.phone, address: c.address, mapUrl: c.mapUrl, officeHours: c.officeHours },
    social: { ...siteConfig.social },
    stats: { ...siteStats },
    paymentMethods: paymentMethods.map((m) => ({ ...m, enabled: true })),
  };
}

// The WhatsApp number from Settings. Set on the server by getSiteSettings() callers and in the
// browser by <SiteSettingsProvider>, so whatsappLink() works everywhere without extra arguments.
let currentWhatsapp = whatsappNumber;
export function setWhatsappNumber(n: string) {
  if (n) currentWhatsapp = n.replace(/\D/g, "");
}

/** WhatsApp chat link, optionally with a pre-filled message. */
export function whatsappLink(message?: string, number = currentWhatsapp) {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
