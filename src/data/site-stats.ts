import type { SiteStats } from "@/types/content";

// SAMPLE numbers for design — the backend should calculate these from real orders & reviews.
export const siteStats: SiteStats = {
  ordersDelivered: 50000,
  avgDeliverySeconds: 12,
  rating: 4.9,
  reviewCount: 5200,
};
