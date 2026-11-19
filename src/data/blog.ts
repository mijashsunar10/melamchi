import type { BlogPost } from "@/types/content";

// Guides (later written in the admin panel). Steps reflect each app's current menus — re-check if an app changes.
export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-find-free-fire-player-id",
    title: "How to find your Free Fire Player ID",
    excerpt: "Your Player ID is all we need to top up diamonds. Here's where to find it in 10 seconds.",
    category: "Gaming",
    date: "2026-11-12",
    readMinutes: 2,
    productSlug: "free-fire-diamonds",
    body: [
      { type: "p", text: "To top up Free Fire diamonds you only need your Player ID — never your password. The ID is a number that is unique to your account." },
      { type: "h2", text: "Find it in the game" },
      {
        type: "steps",
        items: [
          "Open Free Fire and wait for the lobby to load.",
          "Tap your avatar / profile picture in the top-left corner.",
          "Your Player ID is the number shown under your nickname. Tap the copy icon next to it.",
          "Paste it into the Player ID box on the TOPX product page and double-check every digit.",
        ],
      },
      { type: "tip", text: "Always copy your ID instead of typing it, and double-check it before ordering — top-ups sent to a wrong ID can't be reversed." },
      { type: "h2", text: "Then order" },
      { type: "p", text: "Choose a diamond pack or membership, tap “Order on WhatsApp”, pay with eSewa, Khalti, IME Pay or bank, and the diamonds arrive in your account — usually within a minute." },
    ],
  },
  {
    slug: "how-to-buy-pubg-uc-in-nepal",
    title: "How to buy PUBG Mobile UC in Nepal",
    excerpt: "Get UC for Royale Pass and skins without an international card — paid in rupees.",
    category: "Gaming",
    date: "2026-11-10",
    readMinutes: 3,
    productSlug: "pubg-mobile-uc",
    body: [
      { type: "p", text: "Buying UC inside the game needs a card that works internationally. With TOPX you pay in rupees and the UC is sent straight to your Player ID." },
      { type: "h2", text: "Step by step" },
      {
        type: "steps",
        items: [
          "Open PUBG Mobile, tap your avatar in the top-left and copy your ID.",
          "On TOPX, open PUBG Mobile UC and choose a pack — bigger packs include more bonus UC.",
          "Paste your Player ID and double-check it's your account.",
          "Tap “Order on WhatsApp”, then pay with eSewa, Khalti, IME Pay or bank.",
          "Open the game — the UC shows in your balance.",
        ],
      },
      { type: "tip", text: "Royale Pass season about to start? Buy UC a day early — deliveries are fastest outside the rush." },
    ],
  },
  {
    slug: "how-to-pay-for-chatgpt-plus-in-nepal",
    title: "How to pay for ChatGPT Plus from Nepal",
    excerpt: "No international card? Get ChatGPT Plus activated on your own account and pay in rupees.",
    category: "AI tools",
    date: "2026-11-08",
    readMinutes: 3,
    productSlug: "chatgpt-plus",
    body: [
      { type: "p", text: "ChatGPT Plus is billed in US dollars, which many Nepali cards can't pay. TOPX activates the plan on your own account and you pay locally." },
      { type: "h2", text: "How it works" },
      {
        type: "steps",
        items: [
          "Create a free ChatGPT account with your email if you don't have one.",
          "On TOPX, open ChatGPT Plus and choose 1 or 3 months.",
          "Enter the email of your ChatGPT account and tap “Order on WhatsApp”.",
          "Pay with eSewa, Khalti, IME Pay or bank.",
          "We activate Plus on your account — usually within 5–30 minutes — and message you when it's done.",
        ],
      },
      { type: "tip", text: "The plan is on your own account, so your chats and settings stay yours. We never need your password." },
    ],
  },
  {
    slug: "how-to-redeem-google-play-gift-card",
    title: "How to redeem a Google Play gift card",
    excerpt: "Got a Google Play code from TOPX? Add it to your balance in under a minute.",
    category: "Gift cards",
    date: "2026-11-05",
    readMinutes: 2,
    productSlug: "google-play-gift-card",
    body: [
      { type: "p", text: "Your Google Play code is shown on your order and sent to you right after payment. Here's how to add it to your account." },
      { type: "h2", text: "On an Android phone" },
      {
        type: "steps",
        items: [
          "Open the Google Play Store app.",
          "Tap your profile icon in the top-right.",
          "Tap “Payments & subscriptions”, then “Redeem code”.",
          "Paste the code and tap “Redeem”. The balance is added instantly.",
        ],
      },
      { type: "tip", text: "Make sure the card region matches your Google account country (shown on the product page). If a code doesn't work, send us a screenshot — we'll fix it." },
    ],
  },
  {
    slug: "how-to-activate-windows-11-pro",
    title: "How to activate Windows 11 Pro with a product key",
    excerpt: "Bought a Windows 11 Pro key? Activate it from Settings in a few clicks.",
    category: "Software",
    date: "2026-11-02",
    readMinutes: 3,
    productSlug: "windows-11-pro",
    body: [
      { type: "p", text: "Your 25-character product key arrives right after payment. Make sure Windows 11 is installed and you're connected to the internet." },
      { type: "h2", text: "Activate in Settings" },
      {
        type: "steps",
        items: [
          "Open Start → Settings → System → Activation.",
          "Next to “Change product key”, click “Change”.",
          "Type or paste your key and click “Next”.",
          "Click “Activate”. Windows connects and confirms activation.",
        ],
      },
      { type: "tip", text: "Stuck or getting an error? Book “Software Installation & Setup” or message us — we can activate it for you remotely." },
    ],
  },
];
