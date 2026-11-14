import type { Domain } from "@/types/catalog";

export const domains: Domain[] = [
  {
    slug: "ai-tools",
    name: "AI Tools",
    shortName: "AI",
    tagline: "Premium AI, paid in rupees",
    description:
      "ChatGPT, Claude, Gemini, Midjourney and more — activated on your own account with local payment.",
    icon: "Cpu",
    gradient: "from-violet-500 to-brand-blue-600",
    highlights: ["Activated on your own account", "Pay with eSewa, Khalti or bank", "Ready in 5–30 minutes"],
    categories: [
      { slug: "chat-assistants", name: "Chat Assistants", icon: "Bot" },
      { slug: "image-video", name: "Image & Video", icon: "Image" },
      { slug: "voice-audio", name: "Voice & Audio", icon: "Mic" },
      { slug: "writing", name: "Writing", icon: "PenLine" },
      { slug: "coding", name: "Coding", icon: "Code" },
    ],
  },
  {
    slug: "gaming",
    name: "Gaming Top-up",
    shortName: "Gaming",
    tagline: "Diamonds, UC & coins in seconds",
    description:
      "Instant top-ups for PUBG, Free Fire, Mobile Legends, Valorant and live-stream apps — just enter your Player ID.",
    icon: "Gamepad2",
    gradient: "from-brand-orange-500 to-rose-600",
    highlights: ["Delivered to your Player ID", "No password needed", "Most top-ups in under a minute"],
    categories: [
      { slug: "mobile-games", name: "Mobile Games", icon: "Smartphone" },
      { slug: "pc-console", name: "PC & Console", icon: "Monitor" },
      { slug: "live-apps", name: "Live-stream Coins", icon: "Radio" },
    ],
  },
  {
    slug: "gift-cards",
    name: "Gift Cards",
    shortName: "Gift Cards",
    tagline: "Codes delivered to your inbox",
    description:
      "Google Play, Apple, Steam, PlayStation, Xbox, Amazon and more — the code arrives instantly after payment.",
    icon: "Gift",
    gradient: "from-amber-400 to-brand-orange-500",
    highlights: ["Code shown right after payment", "US & global regions", "Works with any account"],
    categories: [
      { slug: "app-stores", name: "App Stores", icon: "Smartphone" },
      { slug: "gaming-cards", name: "Gaming Cards", icon: "Gamepad2" },
      { slug: "shopping", name: "Shopping & Entertainment", icon: "CreditCard" },
    ],
  },
  {
    slug: "software",
    name: "Software & Apps",
    shortName: "Software",
    tagline: "Genuine licences, lifetime support",
    description:
      "Windows, Office, antivirus, VPN, Adobe and creative apps — genuine keys with step-by-step activation help.",
    icon: "AppWindow",
    gradient: "from-sky-500 to-brand-blue-600",
    highlights: ["Genuine retail licences", "Step-by-step activation guide", "Free setup help"],
    categories: [
      { slug: "windows-office", name: "Windows & Office", icon: "AppWindow" },
      { slug: "security-vpn", name: "Security & VPN", icon: "ShieldCheck" },
      { slug: "creative", name: "Design & Creative", icon: "Palette" },
      { slug: "utilities", name: "Utilities", icon: "Wrench" },
    ],
  },
  {
    slug: "digital-products",
    name: "Digital Products",
    shortName: "Digital",
    tagline: "Streaming, learning & cloud",
    description:
      "Netflix, Spotify, YouTube Premium, online courses, cloud storage and more — all in one place.",
    icon: "ShoppingBag",
    gradient: "from-fuchsia-500 to-brand-orange-500",
    highlights: ["On your own account", "Renewal reminders", "Cancel any time"],
    categories: [
      { slug: "streaming", name: "Streaming", icon: "Tv" },
      { slug: "learning", name: "Learning", icon: "GraduationCap" },
      { slug: "cloud", name: "Cloud Storage", icon: "Cloud" },
      { slug: "templates", name: "Templates & eBooks", icon: "FileText" },
    ],
  },
  {
    slug: "support",
    name: "Support",
    shortName: "Support",
    tagline: "Real people, 24/7",
    description:
      "Order help, installation & setup, remote assistance and business orders — we're here around the clock.",
    icon: "Headset",
    gradient: "from-emerald-500 to-brand-blue-600",
    highlights: ["Real people, 24/7", "WhatsApp, phone & remote", "Most replies in minutes"],
    categories: [
      { slug: "setup", name: "Setup & Installation", icon: "Wrench" },
      { slug: "remote-help", name: "Remote Assistance", icon: "LifeBuoy" },
      { slug: "business", name: "Business & Bulk", icon: "Building2" },
    ],
  },
];
