import { BadgePercent, Building2, ChevronRight, Gamepad2, Headset, Laptop, Receipt, Store, Truck, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/home/section-heading";
import { ResellerForm } from "@/components/reseller/reseller-form";
import { getDomains } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Business & reseller program",
  description:
    "Wholesale prices on game top-ups, gift cards, software licences and subscriptions for shops, cyber cafés, gaming centres and companies in Nepal.",
};

const benefits = [
  { icon: BadgePercent, title: "Wholesale prices", text: "Better margins on top-ups, gift cards and licences." },
  { icon: Truck, title: "Priority delivery", text: "Your orders go to the front of the queue." },
  { icon: Headset, title: "Dedicated manager", text: "One person to call for every order and question." },
  { icon: Receipt, title: "Bills & bulk orders", text: "Proper invoices and bulk licences for companies." },
];

const audiences = [
  { icon: Store, label: "Mobile & gaming shops" },
  { icon: Gamepad2, label: "Gaming centres" },
  { icon: Laptop, label: "IT & computer shops" },
  { icon: Users, label: "Cyber cafés" },
  { icon: Building2, label: "Companies & offices" },
];

const steps = [
  { title: "Apply", text: "Fill in the short form below." },
  { title: "Quick call", text: "Our team calls you within 2 working hours." },
  { title: "Get your rates", text: "Receive your wholesale price list." },
  { title: "Start selling", text: "Order any time on WhatsApp — delivered instantly." },
];

export default async function ResellerPage() {
  const domains = await getDomains();
  const categories = domains.filter((d) => d.slug !== "support").map((d) => d.name);

  return (
    <div className="flex flex-col gap-16 pb-20 sm:gap-20 sm:pb-28">
      <section className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="size-4" />
          <span className="text-foreground" aria-current="page">
            Business & resellers
          </span>
        </nav>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-md">
            <Building2 className="size-6" />
          </span>
          <div>
            <h1 className="font-display text-3xl leading-tight font-black italic sm:text-4xl">Grow your business with TOPX</h1>
            <p className="text-sm text-muted-foreground">Wholesale prices for shops, gaming centres and companies across Nepal.</p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: I, title, text }) => (
            <div key={title} className="rounded-2xl border border-border bg-surface p-5 shadow-card">
              <span className="flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent dark:bg-accent/20">
                <I className="size-5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-extrabold italic">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>

        {/* Who it's for */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-semibold text-muted-foreground">Perfect for:</span>
          {audiences.map(({ icon: I, label }) => (
            <span key={label} className="flex items-center gap-2 rounded-full bg-surface px-3.5 py-2 text-sm font-medium ring-1 ring-border">
              <I className="size-4 text-primary" /> {label}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="How it works" title="Start in 4 steps" className="mb-8" />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-border bg-surface p-5 shadow-card">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
              <h3 className="mt-3 font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Application form */}
      <section id="apply" className="mx-auto w-full max-w-4xl scroll-mt-32 px-4 sm:px-6">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-card sm:p-10">
          <h2 className="font-display text-2xl font-black italic sm:text-3xl">Apply to become a partner</h2>
          <p className="mt-1 mb-8 text-sm text-muted-foreground">Free to join. No minimum order to get started.</p>
          <ResellerForm categories={categories} />
        </div>
      </section>
    </div>
  );
}
