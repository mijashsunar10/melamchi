// Central brand + contact config. Values marked TODO are waiting on the CEO.
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
    // TODO: real contact details from the CEO
    email: "support@topxnepal.com",
    phone: "+977 98XXXXXXXX",
    whatsapp: "https://wa.me/97798XXXXXXXX",
    address: "Kathmandu, Nepal",
  },
  social: {
    // TODO: real social links
    facebook: "#",
    instagram: "#",
    tiktok: "#",
    youtube: "#",
  },
} as const;
