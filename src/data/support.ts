import type { SupportTopic } from "@/types/content";

/** Help-center topics (later editable from the admin panel). */
export const supportTopics: SupportTopic[] = [
  {
    slug: "orders",
    name: "Orders & delivery",
    icon: "Package",
    faqs: [
      { q: "How do I place an order?", a: "Open a product, choose a package, fill in your details and tap “Order on WhatsApp”. We confirm the price and payment method, then deliver." },
      { q: "How long does delivery take?", a: "Game top-ups and gift-card codes usually arrive within 10–60 seconds after payment. Subscriptions and AI tools take 5–30 minutes. Software keys are instant." },
      { q: "I paid but haven't received my order.", a: "Most delays are under 15 minutes. If it has been longer, message us on WhatsApp with your payment screenshot and we'll fix it right away." },
      { q: "Can I order for someone else?", a: "Yes — just enter their Player ID or account email instead of yours." },
    ],
  },
  {
    slug: "payments",
    name: "Payments",
    icon: "CreditCard",
    faqs: [
      { q: "Which payment methods do you accept?", a: "eSewa, Khalti, IME Pay, Fonepay QR (works with any mobile banking app) and direct bank transfer." },
      { q: "Is it safe to pay?", a: "Yes. You pay directly to our verified business account and receive a receipt for every order." },
      { q: "Do you charge extra fees?", a: "No. The price you see is the price you pay." },
    ],
  },
  {
    slug: "top-ups",
    name: "Game top-ups",
    icon: "Gamepad2",
    faqs: [
      { q: "Where do I find my Player ID?", a: "Open the game, tap your avatar or profile — the numeric ID is usually shown under your name. For Mobile Legends you also need the Zone ID in brackets." },
      { q: "I entered the wrong Player ID.", a: "Top-ups sent to a wrong ID can't be reversed by the game, so always double-check your ID before ordering. Contact us immediately and we'll try to help." },
      { q: "Do you need my game password?", a: "Never. We only need your Player ID." },
    ],
  },
  {
    slug: "gift-cards",
    name: "Gift cards & codes",
    icon: "Gift",
    faqs: [
      { q: "How do I redeem a gift card code?", a: "Open the store (Google Play, App Store, Steam, PlayStation…), choose “Redeem code” and paste the code. A step-by-step guide is on every product page." },
      { q: "My code says “invalid”.", a: "Check the card region matches your account region. If it still fails, send us a screenshot — every code is checked and replaced if faulty." },
    ],
  },
  {
    slug: "subscriptions",
    name: "Subscriptions & AI tools",
    icon: "Bot",
    faqs: [
      { q: "Is the subscription on my own account?", a: "Yes. We activate ChatGPT, Claude, Netflix, Spotify and others on your own email/account — you keep full control." },
      { q: "What happens when it expires?", a: "We remind you before expiry. Renew by ordering the same product again." },
    ],
  },
  {
    slug: "software",
    name: "Software & licences",
    icon: "AppWindow",
    faqs: [
      { q: "Are the licence keys genuine?", a: "Yes, all keys are genuine retail or volume licences with an activation guide." },
      { q: "Can you install it for me?", a: "Yes — book “Software Installation & Setup” or “Remote Assistance” below and an expert will do it for you." },
    ],
  },
  {
    slug: "refunds",
    name: "Refunds",
    icon: "RotateCcw",
    faqs: [
      { q: "When can I get a refund?", a: "If we can't deliver your order, you get a full refund — usually the same day. Codes and keys that have already been delivered and work can't be refunded." },
      { q: "How is the refund sent?", a: "To the same eSewa, Khalti, IME Pay or bank account you paid from." },
    ],
  },
];
