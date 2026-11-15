import { ArrowUpRight, ChevronRight, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/support/contact-form";
import { getSupportTopics } from "@/lib/content";
import { siteConfig, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Contact TOPX Nepal on WhatsApp, phone or email. Real people, 24/7 — based in Kathmandu.",
};

const socials = [
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "youtube", label: "YouTube" },
] as const;

export default async function ContactPage() {
  const topics = await getSupportTopics();
  const { contact, social } = siteConfig;

  const cards = [
    {
      icon: MessageCircle,
      title: "WhatsApp",
      value: "Chat with us",
      note: "Fastest · 24/7",
      href: whatsappLink("Hi TOPX Nepal! "),
      external: true,
      tone: "bg-[#25D366] text-white",
    },
    {
      icon: Phone,
      title: "Phone",
      value: contact.phone,
      note: "Call or SMS",
      href: `tel:${contact.phone.replace(/\s/g, "")}`,
      tone: "bg-primary/10 text-primary dark:bg-primary/20",
    },
    {
      icon: Mail,
      title: "Email",
      value: contact.email,
      note: "Reply within a few hours",
      href: `mailto:${contact.email}`,
      tone: "bg-accent/10 text-accent dark:bg-accent/20",
    },
    {
      icon: MapPin,
      title: "Office",
      value: contact.address,
      note: "Get directions",
      href: contact.mapUrl,
      external: true,
      tone: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-20 sm:px-6 sm:pt-8 sm:pb-28">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground" aria-current="page">
          Contact
        </span>
      </nav>
      <h1 className="mt-4 font-display text-3xl leading-tight font-black italic sm:text-4xl">Contact us</h1>
      <p className="mt-1 text-sm text-muted-foreground">Questions, orders or business enquiries — we&apos;re here to help.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Ways to reach us */}
        <div className="flex flex-col gap-3">
          {cards.map(({ icon: I, title, value, note, href, external, tone }) => (
            <a
              key={title}
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover sm:p-5"
            >
              <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                <I className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</span>
                <span className="block truncate font-bold">{value}</span>
                <span className="block text-xs text-muted-foreground">{note}</span>
              </span>
              <ArrowUpRight className="size-5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
            </a>
          ))}

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <p className="flex items-center gap-2 font-bold">
              <Clock className="size-5 text-primary" /> Hours
            </p>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Online support</dt>
              <dd className="font-semibold text-success">24/7</dd>
              <dt className="text-muted-foreground">Office</dt>
              <dd className="font-semibold">{contact.officeHours}</dd>
            </dl>
          </div>

          <div className="flex flex-wrap gap-2">
            {socials.map(({ key, label }) => (
              <a
                key={key}
                href={social[key]}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-surface px-4 py-2 text-sm font-semibold ring-1 ring-border transition-colors hover:text-primary hover:ring-primary/30"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Message form */}
        <div className="self-start rounded-3xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <h2 className="font-display text-2xl font-black italic">Send us a message</h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">We usually reply within minutes on WhatsApp.</p>
          <ContactForm topics={[...topics.map((t) => t.name), "Business / reseller", "Something else"]} />
        </div>
      </div>
    </div>
  );
}
