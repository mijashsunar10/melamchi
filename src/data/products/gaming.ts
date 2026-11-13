import { playerIdField, userIdField, zoneIdField } from "../fields";
import { plan, product } from "./helpers";

export const gaming = [
  product({
    slug: "pubg-mobile-uc", name: "PUBG Mobile UC", brand: "Krafton", domain: "gaming", category: "mobile-games",
    deliveryType: "TOPUP", initials: "PUBG", color: "#F2A900",
    shortDescription: "Unknown Cash for Royale Pass, outfits and crates — delivered by Player ID.",
    rating: 4.9, reviewCount: 1240, sold: 18500, tags: ["bestseller", "official"], region: "Global",
    plans: [
      plan("60 UC", 145), plan("325 UC", 720, { bonus: "+25 bonus" }), plan("660 UC", 1430, { bonus: "+60 bonus", popular: true }),
      plan("1800 UC", 3550, { bonus: "+300 bonus" }), plan("3850 UC", 7100, { bonus: "+700 bonus" }), plan("8100 UC", 14200, { bonus: "+1950 bonus" }),
      plan("Prime Plus (1 Month)", 1150),
    ],
  }),
  product({
    slug: "free-fire-diamonds", name: "Free Fire Diamonds", brand: "Garena", domain: "gaming", category: "mobile-games",
    deliveryType: "TOPUP", initials: "FF", color: "#FF6B00",
    shortDescription: "Diamonds, weekly & monthly membership for Free Fire — instant via Player ID.",
    rating: 4.9, reviewCount: 2310, sold: 32100, tags: ["bestseller", "hot"],
    plans: [
      plan("25 Diamonds", 35), plan("50 Diamonds", 70), plan("115 Diamonds", 150), plan("240 Diamonds", 300),
      plan("610 Diamonds", 760, { popular: true }), plan("1240 Diamonds", 1520), plan("2530 Diamonds", 3050),
      plan("Weekly Membership", 230, { popular: true }), plan("Monthly Membership", 1100),
      plan("Level Up Pass", 190, { inStock: false }),
    ],
  }),
  product({
    slug: "mobile-legends", name: "Mobile Legends Diamonds", brand: "Moonton", domain: "gaming", category: "mobile-games",
    deliveryType: "TOPUP", initials: "MLBB", color: "#1E6FD9",
    shortDescription: "MLBB diamonds and Weekly Diamond Pass using Player ID + Zone ID.",
    rating: 4.8, reviewCount: 640, sold: 7400, tags: ["hot"],
    fields: [playerIdField(), zoneIdField],
    plans: [plan("86 Diamonds", 250), plan("172 Diamonds", 495), plan("257 Diamonds", 740, { popular: true }), plan("706 Diamonds", 1980), plan("Weekly Diamond Pass", 260)],
  }),
  product({
    slug: "cod-mobile-cp", name: "Call of Duty Mobile CP", brand: "Activision", domain: "gaming", category: "mobile-games",
    deliveryType: "TOPUP", initials: "COD", color: "#2B2B2B",
    shortDescription: "COD Points for Battle Pass and bundles.",
    reviewCount: 210, sold: 2300, region: "Global",
    fields: [playerIdField("Open COD Mobile → Profile → copy the UID.")],
    plans: [plan("80 CP", 160), plan("420 CP", 790, { popular: true }), plan("880 CP", 1580), plan("2400 CP", 3950)],
  }),
  product({
    slug: "genshin-impact", name: "Genshin Impact Genesis Crystals", brand: "HoYoverse", domain: "gaming", category: "mobile-games",
    deliveryType: "TOPUP", initials: "GI", color: "#4C6EF5",
    shortDescription: "Genesis Crystals and Blessing of the Welkin Moon.",
    reviewCount: 150, sold: 1300, region: "Asia",
    fields: [playerIdField("Paimon menu → bottom-left UID."), { ...zoneIdField, label: "Server", type: "select", options: ["Asia", "America", "Europe", "TW/HK/MO"], placeholder: undefined, help: undefined }],
    plans: [plan("60 Crystals", 145), plan("300+30 Crystals", 720), plan("980+110 Crystals", 2150, { popular: true }), plan("Welkin Moon", 720)],
  }),
  product({
    slug: "valorant-points", name: "Valorant Points", brand: "Riot Games", domain: "gaming", category: "pc-console",
    deliveryType: "CODE", initials: "VAL", color: "#FF4655",
    shortDescription: "VP codes for skins and Battle Pass — redeem in the Riot client.",
    reviewCount: 180, sold: 1600, region: "Asia Pacific", tags: ["hot"],
    plans: [plan("475 VP", 650), plan("1000 VP", 1300, { popular: true }), plan("2050 VP", 2600), plan("3650 VP", 4550)],
  }),
  product({
    slug: "steam-wallet", name: "Steam Wallet Code", brand: "Valve", domain: "gaming", category: "pc-console",
    deliveryType: "CODE", initials: "STM", color: "#1B2838",
    shortDescription: "Add funds to your Steam wallet for games, DLC and items.",
    reviewCount: 260, sold: 2100, region: "US",
    plans: [plan("$5", 760), plan("$10", 1500, { popular: true }), plan("$20", 2980), plan("$50", 7400)],
  }),
  product({
    slug: "tango-coins", name: "Tango Coins", brand: "Tango", domain: "gaming", category: "live-apps",
    deliveryType: "TOPUP", initials: "T", color: "#FF2D55",
    shortDescription: "Coins for gifting on Tango live streams.",
    reviewCount: 340, sold: 4200,
    fields: [userIdField("Tango")],
    plans: [plan("100 Coins", 165), plan("500 Coins", 800, { popular: true }), plan("1000 Coins", 1580), plan("5000 Coins", 7800)],
  }),
  product({
    slug: "bigo-live-diamonds", name: "Bigo Live Diamonds", brand: "Bigo", domain: "gaming", category: "live-apps",
    deliveryType: "TOPUP", initials: "B", color: "#00C2FF",
    shortDescription: "Diamonds for Bigo Live gifts and VIP.",
    reviewCount: 190, sold: 2600, tags: ["new"],
    fields: [userIdField("Bigo")],
    plans: [plan("42 Diamonds", 140), plan("210 Diamonds", 690, { popular: true }), plan("1050 Diamonds", 3400)],
  }),
];
