import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { getDomains, getPaymentMethods } from "@/lib/catalog";
import { siteConfig } from "@/lib/site";
import { Logo } from "./logo";

const company = [
  { href: "/about", label: "About us" },
  { href: "/blog", label: "Blog & guides" },
  { href: "/reseller", label: "Become a reseller" },
  { href: "/contact", label: "Contact" },
];
const help = [
  { href: "/track", label: "Track your order" },
  { href: "/support", label: "Help center" },
  { href: "/refund-policy", label: "Refund policy" },
  { href: "/privacy-policy", label: "Privacy policy" },
  { href: "/terms", label: "Terms & conditions" },
];

function SocialIcon({ label, href, path }: { label: string; href: string; path: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-accent hover:text-foreground dark:hover:text-white dark:bg-white/10 dark:text-white"
    >
      <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
        <path d={path} />
      </svg>
    </a>
  );
}

export async function Footer() {
  const [domains, payments] = await Promise.all([getDomains(), getPaymentMethods()]);

  return (
    <footer className="relative overflow-hidden border-t border-border bg-surface text-muted-foreground dark:border-transparent dark:bg-brand-navy-deep dark:text-white/70">
      <div className="pointer-events-none absolute -top-40 right-0 size-[500px] rounded-full bg-brand-blue-500/10 blur-3xl dark:bg-brand-blue-600/20" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pt-16 pb-10 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-5">
          <Logo priority={false} className="[&_img]:h-16 sm:[&_img]:h-[72px]" />
          <p className="max-w-xs text-sm leading-relaxed">
            <span className="font-semibold text-foreground dark:text-white">{siteConfig.tagline}</span> {siteConfig.positioning} — AI tools,
            game top-ups, gift cards, software and digital subscriptions with local payment and 24/7 support.
          </p>
          <div className="flex gap-2">
            <SocialIcon label="Facebook" href={siteConfig.social.facebook} path="M14 8h3V4h-3c-2.8 0-4 1.7-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.3-.6.6-.6Z" />
            <SocialIcon label="Instagram" href={siteConfig.social.instagram} path="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4ZM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4ZM12 2c-2.7 0-3 0-4.1.1C4.3 2.3 2.3 4.3 2.1 7.9 2 9 2 9.3 2 12s0 3 .1 4.1c.2 3.6 2.2 5.6 5.8 5.8 1.1.1 1.4.1 4.1.1s3 0 4.1-.1c3.6-.2 5.6-2.2 5.8-5.8.1-1.1.1-1.4.1-4.1s0-3-.1-4.1c-.2-3.6-2.2-5.6-5.8-5.8C15 2 14.7 2 12 2Z" />
            <SocialIcon label="TikTok" href={siteConfig.social.tiktok} path="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.8 5.8 0 1 0 4.9 5.7V9.1a7.4 7.4 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6Z" />
            <SocialIcon label="YouTube" href={siteConfig.social.youtube} path="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-display text-sm font-extrabold tracking-wide text-foreground uppercase italic dark:text-white">Shop</h3>
          <ul className="flex flex-col gap-2.5 text-sm">
            {domains.map((d) => (
              <li key={d.slug}>
                <Link href={`/${d.slug}`} className="transition-colors hover:text-foreground dark:hover:text-white">
                  {d.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-display text-sm font-extrabold tracking-wide text-foreground uppercase italic dark:text-white">Company & Help</h3>
          <ul className="flex flex-col gap-2.5 text-sm">
            {[...company, ...help].slice(0, 7).map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-foreground dark:hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-display text-sm font-extrabold tracking-wide text-foreground uppercase italic dark:text-white">Contact</h3>
          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex items-center gap-2.5">
              <MessageCircle className="size-4 text-success" />
              <a href={siteConfig.contact.whatsapp} className="hover:text-foreground dark:hover:text-white">WhatsApp 24/7</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 text-brand-sky" /> {siteConfig.contact.phone}
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 text-brand-sky" />
              <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-foreground dark:hover:text-white">{siteConfig.contact.email}</a>
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin className="size-4 text-brand-orange-400" /> {siteConfig.contact.address}
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-border dark:border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="mr-1 text-xs">We accept</span>
            {payments.map((p) => (
              <span key={p.id} className="rounded-md bg-white px-2.5 py-1 text-[11px] font-extrabold" style={{ color: p.color }}>
                {p.name}
              </span>
            ))}
          </div>
          <p className="text-center text-xs">
            © 2026 {siteConfig.name} · A product of <span className="font-semibold text-foreground dark:text-white">{siteConfig.company}</span> · Made in Nepal
          </p>
        </div>
      </div>
    </footer>
  );
}
