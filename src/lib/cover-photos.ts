// Background photos for product covers (Unsplash, free licence — see public/images/CREDITS.md).
import aiChip from "../../public/images/covers/ai-chip.jpg";
import aiNetwork from "../../public/images/covers/ai-network.jpg";
import aiParticles from "../../public/images/covers/ai-particles.jpg";
import cinemaAudience from "../../public/images/covers/cinema-audience.jpg";
import cinemaFront from "../../public/images/covers/cinema-front.jpg";
import cinemaSeats from "../../public/images/covers/cinema-seats.jpg";
import circuit from "../../public/images/covers/circuit.jpg";
import code from "../../public/images/covers/code.jpg";
import controllerNeon from "../../public/images/covers/controller-neon.jpg";
import designDesk from "../../public/images/covers/design-desk.jpg";
import drawingTablet from "../../public/images/covers/drawing-tablet.jpg";
import esports from "../../public/images/covers/esports.jpg";
import gamingRoom from "../../public/images/covers/gaming-room.jpg";
import giftBox from "../../public/images/covers/gift-box.jpg";
import headphones from "../../public/images/covers/headphones.jpg";
import headphonesDark from "../../public/images/covers/headphones-dark.jpg";
import laptopGlow from "../../public/images/covers/laptop-glow.jpg";
import laptopTyping from "../../public/images/covers/laptop-typing.jpg";
import padlock from "../../public/images/covers/padlock.jpg";
import pcFps from "../../public/images/covers/pc-fps.jpg";
import phoneApps from "../../public/images/covers/phone-apps.jpg";
import phoneGame1 from "../../public/images/covers/phone-game-1.jpg";
import phoneGame2 from "../../public/images/covers/phone-game-2.jpg";
import phonePlayer from "../../public/images/covers/phone-player.jpg";
import phonePubg from "../../public/images/covers/phone-pubg.jpg";
import phoneShooter from "../../public/images/covers/phone-shooter.jpg";
import domainGaming from "../../public/images/domain-gaming.jpg";
import domainSoftware from "../../public/images/domain-software.jpg";
import supportAgent from "../../public/images/support-agent.jpg";

/** Product slug → background photo */
export const coverPhotos: Record<string, typeof aiChip> = {
  "chatgpt-plus": aiNetwork,
  "claude-pro": aiParticles,
  "gemini-advanced": aiChip,
  "perplexity-pro": circuit,
  "midjourney": designDesk,
  "elevenlabs": headphones,
  "grammarly-premium": laptopTyping,
  "github-copilot": code,
  "pubg-mobile-uc": phonePubg,
  "free-fire-diamonds": phoneGame1,
  "mobile-legends": phoneGame2,
  "cod-mobile-cp": phoneShooter,
  "genshin-impact": phonePlayer,
  "valorant-points": pcFps,
  "steam-wallet": esports,
  "tango-coins": phoneApps,
  "bigo-live-diamonds": phonePlayer,
  "google-play-gift-card": phoneApps,
  "apple-gift-card": giftBox,
  "playstation-gift-card": controllerNeon,
  "xbox-gift-card": domainGaming,
  "razer-gold": gamingRoom,
  "amazon-gift-card": giftBox,
  "netflix-gift-card": cinemaSeats,
  "spotify-gift-card": headphonesDark,
  "windows-11-pro": laptopGlow,
  "office-2021-pro-plus": laptopTyping,
  "microsoft-365": domainSoftware,
  "kaspersky-premium": padlock,
  "nordvpn": circuit,
  "adobe-creative-cloud": designDesk,
  "canva-pro": drawingTablet,
  "capcut-pro": designDesk,
  "idm": code,
  "netflix-premium": cinemaSeats,
  "spotify-premium": headphonesDark,
  "youtube-premium": cinemaAudience,
  "prime-video": cinemaFront,
  "disney-plus-hotstar": cinemaAudience,
  "coursera-plus": laptopTyping,
  "linkedin-premium": laptopTyping,
  "google-one": phoneApps,
  "resume-cv-templates": drawingTablet,
  "software-installation": domainSoftware,
  "remote-assistance": code,
  "account-recovery-help": phoneApps,
  "business-bulk-orders": supportAgent,
};
