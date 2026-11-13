import { plan, product } from "./helpers";

export const giftCards = [
  product({
    slug: "google-play-gift-card", name: "Google Play Gift Card", brand: "Google", domain: "gift-cards", category: "app-stores",
    deliveryType: "CODE", initials: "GP", color: "#01875F",
    shortDescription: "Buy apps, games, in-app items and subscriptions on Google Play.",
    rating: 4.9, reviewCount: 520, sold: 6100, tags: ["bestseller"], region: "US",
    plans: [plan("$5", 760), plan("$10", 1490, { popular: true }), plan("$25", 3700), plan("$50", 7350)],
  }),
  product({
    slug: "apple-gift-card", name: "Apple Gift Card (iTunes)", brand: "Apple", domain: "gift-cards", category: "app-stores",
    deliveryType: "CODE", initials: "A", color: "#111111",
    shortDescription: "For App Store, iCloud+, Apple Music and more.",
    rating: 4.8, reviewCount: 310, sold: 3300, region: "US",
    plans: [plan("$5", 770), plan("$10", 1510, { popular: true }), plan("$25", 3750), plan("$50", 7450)],
  }),
  product({
    slug: "playstation-gift-card", name: "PlayStation Store Card", brand: "Sony", domain: "gift-cards", category: "gaming-cards",
    deliveryType: "CODE", initials: "PS", color: "#0070D1",
    shortDescription: "Wallet funds for PS Store games, DLC and PS Plus.",
    reviewCount: 140, sold: 980, region: "US",
    plans: [plan("$10", 1520), plan("$25", 3780, { popular: true }), plan("$50", 7500)],
  }),
  product({
    slug: "xbox-gift-card", name: "Xbox Gift Card", brand: "Microsoft", domain: "gift-cards", category: "gaming-cards",
    deliveryType: "CODE", initials: "XB", color: "#107C10",
    shortDescription: "Games, add-ons and Game Pass on Xbox and PC.",
    reviewCount: 70, sold: 450, region: "US",
    plans: [plan("$10", 1520), plan("$25", 3780, { popular: true })],
  }),
  product({
    slug: "razer-gold", name: "Razer Gold", brand: "Razer", domain: "gift-cards", category: "gaming-cards",
    deliveryType: "CODE", initials: "RZ", color: "#44D62C",
    shortDescription: "Universal game credits accepted in 40,000+ games.",
    reviewCount: 95, sold: 700, region: "Global", tags: ["new"],
    plans: [plan("$5", 760), plan("$10", 1500, { popular: true }), plan("$20", 2980)],
  }),
  product({
    slug: "amazon-gift-card", name: "Amazon Gift Card", brand: "Amazon", domain: "gift-cards", category: "shopping",
    deliveryType: "CODE", initials: "a", color: "#FF9900",
    shortDescription: "Shop millions of items on Amazon.com.",
    reviewCount: 88, sold: 620, region: "US",
    plans: [plan("$10", 1520), plan("$25", 3780, { popular: true }), plan("$50", 7500)],
  }),
  product({
    slug: "netflix-gift-card", name: "Netflix Gift Card", brand: "Netflix", domain: "gift-cards", category: "shopping",
    deliveryType: "CODE", initials: "N", color: "#E50914",
    shortDescription: "Pay for Netflix without a card — add the balance to your account.",
    reviewCount: 160, sold: 1400, region: "US", tags: ["hot"],
    plans: [plan("$15", 2280, { popular: true }), plan("$25", 3780), plan("$50", 7500)],
  }),
  product({
    slug: "spotify-gift-card", name: "Spotify Gift Card", brand: "Spotify", domain: "gift-cards", category: "shopping",
    deliveryType: "CODE", initials: "S", color: "#1DB954",
    shortDescription: "Months of Spotify Premium as a code.",
    reviewCount: 60, sold: 380, region: "US",
    plans: [plan("$10", 1520, { popular: true }), plan("$30", 4500)],
  }),
];
