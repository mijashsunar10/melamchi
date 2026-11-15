// Site-wide content the backend / admin panel will manage.

export interface SiteStats {
  ordersDelivered: number; // e.g. 50000 → "50,000+"
  avgDeliverySeconds: number; // e.g. 12 → "12 sec"
  rating: number; // average review rating, 0–5
  reviewCount: number; // number of verified reviews
}
