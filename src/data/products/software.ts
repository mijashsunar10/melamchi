import { accountEmailField } from "../fields";
import { plan, product } from "./helpers";

export const software = [
  product({
    slug: "windows-11-pro", name: "Windows 11 Pro", brand: "Microsoft", domain: "software", category: "windows-office",
    deliveryType: "LICENSE", initials: "W", color: "#0078D4",
    shortDescription: "Genuine lifetime retail key for one PC, with activation guide.",
    rating: 4.9, reviewCount: 430, sold: 5200, tags: ["bestseller", "official"], region: "Global",
    plans: [plan("Lifetime · 1 PC", 1850, { originalPrice: 2500, popular: true }), plan("Lifetime · 2 PCs", 3500)],
  }),
  product({
    slug: "office-2021-pro-plus", name: "Office 2021 Pro Plus", brand: "Microsoft", domain: "software", category: "windows-office",
    deliveryType: "LICENSE", initials: "O", color: "#D83B01",
    shortDescription: "Word, Excel, PowerPoint, Outlook — lifetime licence.",
    reviewCount: 260, sold: 2800, region: "Global",
    plans: [plan("Lifetime · 1 PC", 2450, { popular: true })],
  }),
  product({
    slug: "microsoft-365", name: "Microsoft 365", brand: "Microsoft", domain: "software", category: "windows-office",
    deliveryType: "ACCOUNT", initials: "365", color: "#EA3E23",
    shortDescription: "Office apps + 1 TB OneDrive, on your own Microsoft account.",
    reviewCount: 140, sold: 1100, region: "Global", tags: ["hot"],
    fields: [accountEmailField("Microsoft")],
    plans: [plan("Personal · 12 Months", 6200), plan("Family · 12 Months", 8400, { popular: true })],
  }),
  product({
    slug: "kaspersky-premium", name: "Kaspersky Premium", brand: "Kaspersky", domain: "software", category: "security-vpn",
    deliveryType: "LICENSE", initials: "K", color: "#00A88E",
    shortDescription: "Antivirus, privacy and identity protection.",
    reviewCount: 90, sold: 760, region: "South Asia",
    plans: [plan("1 Device · 1 Year", 1450, { popular: true }), plan("3 Devices · 1 Year", 2900)],
  }),
  product({
    slug: "nordvpn", name: "NordVPN", brand: "Nord Security", domain: "software", category: "security-vpn",
    deliveryType: "ACCOUNT", initials: "N", color: "#4687FF",
    shortDescription: "Fast, private VPN on up to 10 devices.",
    reviewCount: 75, sold: 520, region: "Global",
    plans: [plan("1 Month", 1650), plan("12 Months", 8900, { originalPrice: 19800, popular: true })],
  }),
  product({
    slug: "adobe-creative-cloud", name: "Adobe Creative Cloud", brand: "Adobe", domain: "software", category: "creative",
    deliveryType: "ACCOUNT", initials: "Cc", color: "#DA1F26",
    shortDescription: "Photoshop, Illustrator, Premiere Pro and 20+ apps.",
    reviewCount: 110, sold: 840, region: "Global", tags: ["hot"],
    fields: [accountEmailField("Adobe")],
    plans: [plan("All Apps · 1 Month", 3900), plan("All Apps · 12 Months", 39000, { popular: true })],
  }),
  product({
    slug: "canva-pro", name: "Canva Pro", brand: "Canva", domain: "software", category: "creative",
    deliveryType: "ACCOUNT", initials: "Ca", color: "#00C4CC",
    shortDescription: "Premium templates, Magic Studio AI and brand kits.",
    rating: 4.9, reviewCount: 620, sold: 7800, tags: ["bestseller"],
    fields: [accountEmailField("Canva")],
    plans: [plan("1 Month", 350), plan("6 Months", 1500), plan("12 Months", 2400, { popular: true })],
  }),
  product({
    slug: "capcut-pro", name: "CapCut Pro", brand: "CapCut", domain: "software", category: "creative",
    deliveryType: "ACCOUNT", initials: "CC", color: "#000000",
    shortDescription: "Pro video effects, AI tools and no watermark.",
    reviewCount: 210, sold: 2400, tags: ["new"],
    fields: [accountEmailField("CapCut")],
    plans: [plan("1 Month", 950, { popular: true }), plan("12 Months", 8500)],
  }),
  product({
    slug: "idm", name: "Internet Download Manager", brand: "Tonec", domain: "software", category: "utilities",
    deliveryType: "LICENSE", initials: "IDM", color: "#2E7D32",
    shortDescription: "Up to 5× faster downloads — lifetime licence.",
    reviewCount: 180, sold: 1900, region: "Global",
    plans: [plan("Lifetime · 1 PC", 1650, { popular: true })],
  }),
];
