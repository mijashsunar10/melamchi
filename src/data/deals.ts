import type { Deal } from "@/types/catalog";

// Deal end times are relative to "now" so the countdowns always run in the demo.
const inHours = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString();

export const deals: Deal[] = [
  { productSlug: "free-fire-diamonds", planId: "610-diamonds", discountPercent: 12, endsAt: inHours(6), label: "Flash Sale" },
  { productSlug: "chatgpt-plus", planId: "1-month", discountPercent: 10, endsAt: inHours(20) },
  { productSlug: "pubg-mobile-uc", planId: "660-uc", discountPercent: 8, endsAt: inHours(10), label: "Weekend Deal" },
  { productSlug: "netflix-premium", planId: "1-screen-1-month", discountPercent: 15, endsAt: inHours(30) },
  { productSlug: "windows-11-pro", planId: "lifetime-1-pc", discountPercent: 26, endsAt: inHours(48), label: "Best Price" },
  { productSlug: "google-play-gift-card", planId: "10", discountPercent: 5, endsAt: inHours(14) },
  { productSlug: "canva-pro", planId: "12-months", discountPercent: 20, endsAt: inHours(36) },
  { productSlug: "spotify-premium", planId: "12-months", discountPercent: 16, endsAt: inHours(24) },
];
