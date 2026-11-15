import Image from "next/image";
import {
  siAnydesk, siApple, siClaude, siCoursera, siElevenlabs, siGithubcopilot, siGooglegemini, siGoogleplay, siGrammarly,
  siKaspersky, siNetflix, siNordvpn, siPerplexity, siPlaystation, siPubg, siRazer, siSpotify, siSteam, siValorant, siYoutube,
} from "simple-icons";
import { cn } from "@/lib/cn";
import { coverPhotos } from "@/lib/cover-photos";
import type { Product } from "@/types/catalog";

type Glyph = { path: string; viewBox?: string } | "windows" | "microsoft";

/** Product slug → brand logo (simple-icons) or a clean wordmark. */
const covers: Record<string, { glyph?: Glyph; text?: string; caption?: string }> = {
  "chatgpt-plus": { text: "ChatGPT", caption: "Plus" },
  "claude-pro": { glyph: siClaude, caption: "Claude Pro" },
  "gemini-advanced": { glyph: siGooglegemini, caption: "Google AI Pro" },
  "perplexity-pro": { glyph: siPerplexity, caption: "Perplexity Pro" },
  midjourney: { text: "Midjourney" },
  elevenlabs: { glyph: siElevenlabs, caption: "ElevenLabs" },
  "grammarly-premium": { glyph: siGrammarly, caption: "Grammarly Pro" },
  "github-copilot": { glyph: siGithubcopilot, caption: "GitHub Copilot" },
  "pubg-mobile-uc": { glyph: siPubg, caption: "Mobile UC" },
  "free-fire-diamonds": { text: "FREE FIRE", caption: "Diamonds" },
  "mobile-legends": { text: "MOBILE LEGENDS", caption: "Diamonds" },
  "cod-mobile-cp": { text: "CALL OF DUTY", caption: "Mobile CP" },
  "genshin-impact": { text: "GENSHIN", caption: "Genesis Crystals" },
  "valorant-points": { glyph: siValorant, caption: "Valorant Points" },
  "steam-wallet": { glyph: siSteam, caption: "Wallet Code" },
  "tango-coins": { text: "tango", caption: "Coins" },
  "bigo-live-diamonds": { text: "BIGO LIVE", caption: "Diamonds" },
  "google-play-gift-card": { glyph: siGoogleplay, caption: "Gift Card" },
  "apple-gift-card": { glyph: siApple, caption: "Gift Card" },
  "playstation-gift-card": { glyph: siPlaystation, caption: "Store Card" },
  "xbox-gift-card": { text: "XBOX", caption: "Gift Card" },
  "razer-gold": { glyph: siRazer, caption: "Razer Gold" },
  "amazon-gift-card": { text: "amazon", caption: "Gift Card" },
  "netflix-gift-card": { glyph: siNetflix, caption: "Gift Card" },
  "spotify-gift-card": { glyph: siSpotify, caption: "Gift Card" },
  "windows-11-pro": { glyph: "windows", caption: "Windows 11 Pro" },
  "office-2021-pro-plus": { glyph: "microsoft", caption: "Office 2021" },
  "microsoft-365": { glyph: "microsoft", caption: "Microsoft 365" },
  "kaspersky-premium": { glyph: siKaspersky, caption: "Premium" },
  nordvpn: { glyph: siNordvpn, caption: "NordVPN" },
  "adobe-creative-cloud": { text: "Adobe", caption: "Creative Cloud" },
  "canva-pro": { text: "Canva", caption: "Pro" },
  "capcut-pro": { text: "CapCut", caption: "Pro" },
  idm: { text: "IDM", caption: "Lifetime" },
  "netflix-premium": { glyph: siNetflix, caption: "Premium" },
  "spotify-premium": { glyph: siSpotify, caption: "Premium" },
  "youtube-premium": { glyph: siYoutube, caption: "Premium" },
  "prime-video": { text: "prime video" },
  "disney-plus-hotstar": { text: "JioHotstar" },
  "coursera-plus": { glyph: siCoursera, caption: "Coursera Plus" },
  "linkedin-premium": { text: "LinkedIn", caption: "Premium" },
  "google-one": { text: "Google One", caption: "Storage" },
  "resume-cv-templates": { text: "CV PACK", caption: "50+ templates" },
  "remote-assistance": { glyph: siAnydesk, caption: "Remote help" },
};

function GlyphSvg({ glyph, className }: { glyph: Glyph; className?: string }) {
  if (glyph === "windows" || glyph === "microsoft") {
    const fills = glyph === "windows" ? ["#fff", "#fff", "#fff", "#fff"] : ["#F25022", "#7FBA00", "#00A4EF", "#FFB900"];
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <rect x="1" y="1" width="10.5" height="10.5" fill={fills[0]} />
        <rect x="12.5" y="1" width="10.5" height="10.5" fill={fills[1]} />
        <rect x="1" y="12.5" width="10.5" height="10.5" fill={fills[2]} />
        <rect x="12.5" y="12.5" width="10.5" height="10.5" fill={fills[3]} />
      </svg>
    );
  }
  return (
    <svg viewBox={glyph.viewBox ?? "0 0 24 24"} className={className} aria-hidden>
      <path d={glyph.path} fill="#fff" />
    </svg>
  );
}

/**
 * Product artwork in a gift-card style: brand colour, logo (or wordmark) and a small caption.
 * Uses the real product image when one exists.
 */
export function Cover({
  product,
  className,
  size = "md",
  showCaption = true,
  eager = false,
}: {
  product: Pick<Product, "slug" | "name" | "image" | "color">;
  className?: string;
  size?: "sm" | "md" | "lg";
  showCaption?: boolean;
  /** load immediately (use for images visible on first screen) */
  eager?: boolean;
}) {
  if (product.image) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image src={product.image} alt={product.name} fill className="object-cover" sizes="320px" />
      </div>
    );
  }

  const c = covers[product.slug] ?? { text: product.name };
  const glyphSize = { sm: "size-6", md: "size-[30%]", lg: "size-[34%]" }[size];
  const textSize = { sm: "text-[9px]", md: "text-[clamp(0.85rem,2.2vw,1.35rem)]", lg: "text-3xl" }[size];

  const photo = coverPhotos[product.slug];

  return (
    <div
      aria-hidden
      className={cn("relative isolate flex flex-col items-center justify-center overflow-hidden text-white", className)}
      style={{ backgroundColor: product.color }}
    >
      {photo ? (
        <>
          {/* real photo, tinted with the brand colour */}
          {/* no blur placeholder: the brand colour behind it already fills the card while loading */}
          <Image
            src={photo}
            alt=""
            loading={eager ? "eager" : "lazy"}
            sizes={size === "sm" ? "48px" : "(min-width: 1024px) 300px, 50vw"}
            className="absolute inset-0 -z-20 size-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div
            className="absolute inset-0 -z-10"
            style={{
              background: `linear-gradient(155deg, ${product.color}f0 0%, ${product.color}a6 48%, ${product.color}e6 100%)`,
            }}
          />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(90%_70%_at_50%_45%,transparent_30%,rgba(0,0,0,0.35))]" />
        </>
      ) : (
        <>
          {/* soft light from top-left + subtle depth */}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0)_45%,rgba(0,0,0,0.18))]" />
          {c.glyph && size !== "sm" && (
            <GlyphSvg glyph={c.glyph} className="absolute -right-[12%] -bottom-[18%] -z-10 size-[70%] opacity-[0.08]" />
          )}
        </>
      )}

      {c.glyph ? (
        <GlyphSvg glyph={c.glyph} className={cn(glyphSize, "drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]")} />
      ) : (
        <span
          className={cn(
            "px-2 text-center leading-none font-extrabold tracking-tight drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)]",
            textSize,
          )}
        >
          {c.text}
        </span>
      )}

      {showCaption && size !== "sm" && c.caption && (
        <span className="mt-2 text-[11px] font-semibold tracking-wide text-white/85 uppercase drop-shadow">{c.caption}</span>
      )}
    </div>
  );
}
