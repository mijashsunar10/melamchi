// Static image imports → Next.js gives us sizes + blur placeholders automatically.
import domainAi from "../../public/images/domain-ai.jpg";
import domainDigital from "../../public/images/domain-digital.jpg";
import domainGaming from "../../public/images/domain-gaming.jpg";
import domainGiftCards from "../../public/images/domain-gift-cards.jpg";
import domainSoftware from "../../public/images/domain-software.jpg";
import domainSupport from "../../public/images/domain-support.jpg";
import heroGamer from "../../public/images/hero-gamer.jpg";
import himalayaDay from "../../public/images/himalaya-day.jpg";
import himalayaNight from "../../public/images/himalaya-night.jpg";
import supportAgent from "../../public/images/support-agent.jpg";
import type { DomainSlug } from "@/types/catalog";

export const images = { heroGamer, himalayaDay, himalayaNight, supportAgent };

export const domainImages: Record<DomainSlug, typeof heroGamer> = {
  "ai-tools": domainAi,
  gaming: domainGaming,
  "gift-cards": domainGiftCards,
  software: domainSoftware,
  "digital-products": domainDigital,
  support: domainSupport,
};
