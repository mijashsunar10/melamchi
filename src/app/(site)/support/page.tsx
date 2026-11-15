import { ArrowRight, Building2, ChevronRight, Clock, Headset, Mail, MessageCircle, PackageSearch, Phone, RotateCcw } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/home/section-heading";
import { Icon } from "@/components/icon";
import { ProductCard } from "@/components/product/product-card";
import { ContactForm } from "@/components/support/contact-form";
import { HelpCenter } from "@/components/support/help-center";
import { getProducts } from "@/lib/catalog";
import { getSupportTopics } from "@/lib/content";
import { images } from "@/lib/images";
import { siteConfig, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Support & Help Center",
  description:
    "Get help with orders, payments, game top-ups, gift cards, subscriptions and software. Chat with TOPX Nepal on WhatsApp 24/7.",
};

export default async function SupportPage() {
  const [topics, services] = await Promise.all([getSupportTopics(), getProducts({ domain: "support" })]);
  const { contact } = siteConfig;

  const channels = [
    {
      icon: MessageCircle,
      title: "WhatsApp",
      text: "Fastest — replies in minutes",
      action: "Start chat",
      href: whatsappLink("Hi TOPX Nepal, I need help with "),
      tone: "bg-[#25D366] text-white",
      external: true,
    },
    {
      icon: Phone,
      title: "Call us",
      text: contact.phone,
      action: "Call now",
      href: `tel:${contact.phone.replace(/\s/g, "")}`,
      tone: "bg-primary/10 text-primary dark:bg-primary/20",
    },
    {
      icon: Mail,
      title: "Email",
      text: contact.email,
      action: "Send email",
      href: `mailto:${contact.email}`,
      tone: "bg-accent/10 text-accent dark:bg-accent/20",
    },
  ];

  return (
    <div className="flex flex-col gap-16 pb-20 sm:gap-20 sm:pb-28">
      {/* Compact header */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="size-4" />
          <span className="text-foreground" aria-current="page">
            Support
          </span>
        </nav>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-brand-blue-600 text-white shadow-md">
            <Headset className="size-6" />
          </span>
          <div>
            <h1 className="font-display text-3xl leading-tight font-black italic sm:text-4xl">How can we help?</h1>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="size-4 text-success" /> Real people, 24/7 · most replies in minutes
            </p>
          </div>
        </div>

        {/* Contact channels */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {channels.map(({ icon: I, title, text, action, href, tone, external }) => (
            <a
              key={title}
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
            >
              <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                <I className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{title}</span>
                <span className="block truncate text-sm text-muted-foreground">{text}</span>
              </span>
              <span className="hidden items-center gap-1 text-sm font-semibold text-primary sm:flex">
                {action} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Help center */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Help center" title="Find an answer" className="mb-6" />
        <HelpCenter
          topics={topics.map((t) => ({ slug: t.slug, name: t.name, icon: <Icon name={t.icon} />, faqs: t.faqs }))}
        />
      </section>

      {/* Expert services */}
      {services.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Expert services"
            title="We'll do it for you"
            description="Installation, remote fixes and business orders — handled by our team."
            className="mb-8"
          />
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {services.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Message form + quick links */}
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <h2 className="font-display text-2xl font-black italic">Send us a message</h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">Tell us what happened and we&apos;ll get back to you fast.</p>
          <ContactForm topics={[...topics.map((t) => t.name), "Something else"]} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative isolate flex min-h-[240px] flex-col justify-end overflow-hidden rounded-3xl p-6 text-white">
            <Image
              src={images.supportAgent}
              alt="TOPX support agent wearing a headset"
              placeholder="blur"
              sizes="(min-width: 1024px) 420px, 100vw"
              className="absolute inset-0 -z-20 size-full object-cover object-[70%_30%]"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-navy-deep via-brand-navy-deep/60 to-transparent" />
            <p className="text-lg font-bold">Our team is online now</p>
            <p className="text-sm text-white/75">Average reply time: under 5 minutes</p>
          </div>
          {[
            { icon: PackageSearch, title: "Track an order", text: "Check status with your order number", href: "/track" },
            { icon: RotateCcw, title: "Refund policy", text: "When and how refunds work", href: "/refund-policy" },
            { icon: Building2, title: "Business & resellers", text: "Bulk and wholesale pricing", href: "/reseller" },
          ].map(({ icon: I, title, text, href }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary/35"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
                <I className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{title}</span>
                <span className="block text-xs text-muted-foreground">{text}</span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
