import type { FAQ, OrderField } from "@/types/catalog";

// Reusable order-form field presets per delivery type.

export const playerIdField = (help = "Open the game → tap your avatar → copy the ID."): OrderField => ({
  name: "playerId",
  label: "Player ID",
  type: "text",
  placeholder: "e.g. 5123456789",
  required: true,
  verifiable: true,
  help,
});

export const zoneIdField: OrderField = {
  name: "zoneId",
  label: "Zone / Server ID",
  type: "text",
  placeholder: "e.g. 2101",
  required: true,
  help: "The number in brackets next to your Player ID.",
};

export const userIdField = (app: string): OrderField => ({
  name: "userId",
  label: `${app} User ID`,
  type: "text",
  placeholder: "e.g. 18273645",
  required: true,
  verifiable: true,
  help: `Find it on your ${app} profile page.`,
});

export const deliveryEmailField: OrderField = {
  name: "email",
  label: "Email for delivery",
  type: "email",
  placeholder: "you@example.com",
  required: true,
  help: "We send your code / key here. It also shows on your order page.",
};

export const accountEmailField = (service: string): OrderField => ({
  name: "accountEmail",
  label: `${service} account email`,
  type: "email",
  placeholder: "you@example.com",
  required: true,
  help: `The email you use (or want to use) for ${service}.`,
});

export const notesField: OrderField = {
  name: "notes",
  label: "Notes (optional)",
  type: "textarea",
  placeholder: "Anything we should know?",
  required: false,
};

export const phoneField: OrderField = {
  name: "phone",
  label: "WhatsApp number",
  type: "tel",
  placeholder: "98XXXXXXXX",
  required: true,
};

// Reusable FAQ presets

export const topupFaq: FAQ[] = [
  { q: "How long does a top-up take?", a: "Most top-ups arrive within 10–60 seconds after payment. Rarely it can take up to 15 minutes." },
  { q: "What if I enter the wrong Player ID?", a: "Copy it from your in-game profile and double-check it before paying. Top-ups sent to a wrong ID can’t be reversed, so double-check it." },
  { q: "Is my account safe?", a: "Yes. We only need your Player ID — never your password." },
];

export const codeFaq: FAQ[] = [
  { q: "When do I get my code?", a: "Instantly after payment, on your order page and by email." },
  { q: "Which region is this card for?", a: "The region is shown on the product. Make sure it matches your account region." },
  { q: "Can I get a refund?", a: "Codes can’t be refunded once revealed. If a code doesn’t work, contact support and we’ll fix it." },
];

export const accountFaq: FAQ[] = [
  { q: "Is it activated on my own account?", a: "Yes — we activate the plan on your email/account. You keep full control." },
  { q: "How long does activation take?", a: "Usually 5–30 minutes during working hours, up to 2 hours at night." },
  { q: "What happens when it expires?", a: "We remind you 3 days before. Renew from your dashboard in one click." },
];

export const licenseFaq: FAQ[] = [
  { q: "Is the key genuine?", a: "Yes. All keys are genuine and come with an activation guide." },
  { q: "Can I reinstall later?", a: "Lifetime keys can be reused on the same device. Contact support if activation fails." },
  { q: "Do you help with installation?", a: "Yes — free setup help via WhatsApp or remote assistance." },
];
