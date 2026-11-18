import type { FAQ } from "@/types/catalog";

/** Starter home page FAQ (gaming-first). Loaded into the database by `npm run db:seed`, then edited in Admin → Content. */

export const homeFaq: FAQ[] = [
  { q: "Is TOPX Nepal safe?", a: "Yes. We are run by Melamchi Tech in Kathmandu. We only ever need your Player ID — never your game password — and every order gets a receipt and 24/7 human support." },
  { q: "How fast will my top-up arrive?", a: "UC, diamonds and game credits usually arrive 10–60 seconds after payment. Gaming gift-card codes (Steam, PlayStation, Razer Gold) are sent instantly." },
  { q: "How do I find my Player ID?", a: "Open the game and tap your avatar or profile — the number under your name is your Player ID. For Mobile Legends you also need the Zone ID in brackets. Our blog has step-by-step guides for each game." },
  { q: "How can I pay?", a: "eSewa, Khalti, IME Pay, Fonepay QR or bank transfer — all in rupees, no international card needed." },
  { q: "What if I enter the wrong Player ID?", a: "Always tap “Check name” before paying: if the name shown is yours, the ID is right. Top-ups sent to a wrong ID can’t be reversed." },
  { q: "What if my top-up doesn’t arrive?", a: "Message us on WhatsApp with your order number. We fix it or refund you in full — usually the same day." },
];
