import { accountEmailField, notesField } from "../fields";
import { plan, product } from "./helpers";

// Sample prices (NPR) — the CEO confirms the final list.
export const aiTools = [
  product({
    slug: "chatgpt-plus", name: "ChatGPT Plus", brand: "OpenAI", domain: "ai-tools", category: "chat-assistants",
    deliveryType: "ACCOUNT", initials: "GPT", color: "#10A37F",
    shortDescription: "GPT-4-class models, image generation, voice and file uploads on your own account.",
    rating: 4.9, reviewCount: 412, sold: 3200, tags: ["bestseller", "hot"],
    fields: [accountEmailField("ChatGPT"), notesField],
    plans: [plan("1 Month", 3150, { originalPrice: 3500, popular: true }), plan("3 Months", 9200, { originalPrice: 10500 })],
  }),
  product({
    slug: "claude-pro", name: "Claude Pro", brand: "Anthropic", domain: "ai-tools", category: "chat-assistants",
    deliveryType: "ACCOUNT", initials: "C", color: "#D97757",
    shortDescription: "More usage, Projects and priority access to Claude's latest models.",
    rating: 4.9, reviewCount: 188, sold: 1150, tags: ["hot"],
    fields: [accountEmailField("Claude"), notesField],
    plans: [plan("1 Month", 3150, { popular: true }), plan("3 Months", 9300)],
  }),
  product({
    slug: "gemini-advanced", name: "Google AI Pro (Gemini)", brand: "Google", domain: "ai-tools", category: "chat-assistants",
    deliveryType: "ACCOUNT", initials: "G", color: "#4285F4",
    shortDescription: "Gemini's most capable models plus 2 TB Google One storage.",
    rating: 4.7, reviewCount: 96, sold: 640,
    fields: [accountEmailField("Google"), notesField],
    plans: [plan("1 Month", 2950, { popular: true }), plan("12 Months", 32500)],
  }),
  product({
    slug: "perplexity-pro", name: "Perplexity Pro", brand: "Perplexity", domain: "ai-tools", category: "chat-assistants",
    deliveryType: "ACCOUNT", initials: "P", color: "#20808D",
    shortDescription: "AI answer engine with Pro Search, file analysis and model choice.",
    rating: 4.7, reviewCount: 54, sold: 410, tags: ["new"],
    plans: [plan("1 Month", 2900), plan("12 Months", 29000, { originalPrice: 34800, popular: true })],
  }),
  product({
    slug: "midjourney", name: "Midjourney", brand: "Midjourney", domain: "ai-tools", category: "image-video",
    deliveryType: "ACCOUNT", initials: "MJ", color: "#0B0B0F",
    shortDescription: "Create stunning AI images and art from text prompts.",
    rating: 4.8, reviewCount: 77, sold: 520,
    plans: [plan("Basic · 1 Month", 1450), plan("Standard · 1 Month", 4300, { popular: true }), plan("Pro · 1 Month", 8600)],
  }),
  product({
    slug: "elevenlabs", name: "ElevenLabs", brand: "ElevenLabs", domain: "ai-tools", category: "voice-audio",
    deliveryType: "ACCOUNT", initials: "XI", color: "#111111",
    shortDescription: "Realistic AI voices, voice cloning and dubbing — including Hindi and Nepali-friendly voices.",
    rating: 4.6, reviewCount: 31, sold: 190,
    plans: [plan("Starter · 1 Month", 720), plan("Creator · 1 Month", 3150, { popular: true })],
  }),
  product({
    slug: "grammarly-premium", name: "Grammarly Pro", brand: "Grammarly", domain: "ai-tools", category: "writing",
    deliveryType: "ACCOUNT", initials: "G", color: "#15C39A",
    shortDescription: "Advanced grammar, tone and AI writing help everywhere you type.",
    rating: 4.7, reviewCount: 120, sold: 880,
    plans: [plan("1 Month", 1950), plan("12 Months", 12500, { originalPrice: 23400, popular: true })],
  }),
  product({
    slug: "github-copilot", name: "GitHub Copilot", brand: "GitHub", domain: "ai-tools", category: "coding",
    deliveryType: "ACCOUNT", initials: "GH", color: "#24292F",
    shortDescription: "AI pair programmer inside VS Code, JetBrains and the terminal.",
    rating: 4.8, reviewCount: 64, sold: 300,
    fields: [{ ...accountEmailField("GitHub"), label: "GitHub username or email" }, notesField],
    plans: [plan("Pro · 1 Month", 1450, { popular: true }), plan("Pro · 12 Months", 14400)],
  }),
];
