// Central brand + contact config.
// Contact details come from environment variables (see .env.example) so they can
// be changed per environment without touching code. Defaults are placeholders.

// NOTE: each variable must be written out literally (process.env.NEXT_PUBLIC_…)
// so Next.js can inline it into browser code.

/** WhatsApp number in international format, digits only, e.g. 9779812345678 */
const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "97798XXXXXXXX";

export const siteConfig = {
  name: "TOPX NEPAL",
  company: "Melamchi Tech",
  tagline: "Everything Digital. One Place.",
  positioning: "Nepal's Digital Powerhouse",
  description:
    "Buy AI tools, gaming top-ups, gift cards, software licences and digital subscriptions in Nepal. Instant delivery, secure local payments and 24/7 support.",
  // TODO: replace with the real domain
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en_NP",
  keywords: [
    "TOPX Nepal",
    "Melamchi Tech",
    "game top up Nepal",
    "PUBG UC Nepal",
    "Free Fire diamond Nepal",
    "gift card Nepal",
    "ChatGPT Plus Nepal",
    "AI tools Nepal",
    "software licence Nepal",
    "Netflix Nepal",
    "digital products Nepal",
  ],
  contact: {
    email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@topxnepal.com",
    phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+977 98XXXXXXXX",
    whatsappNumber,
    whatsapp: `https://wa.me/${whatsappNumber}`,
    address: process.env.NEXT_PUBLIC_ADDRESS || "Kathmandu, Nepal",
  },
  social: {
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "#",
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#",
    tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL || "#",
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || "#",
  },
} as const;

/** WhatsApp chat link, optionally with a pre-filled message. */
export function whatsappLink(message?: string) {
  return message ? `${siteConfig.contact.whatsapp}?text=${encodeURIComponent(message)}` : siteConfig.contact.whatsapp;
}
