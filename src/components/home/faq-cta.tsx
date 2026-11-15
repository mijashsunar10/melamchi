import { ArrowRight, Building2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Accordion } from "@/components/ui/accordion";
import { buttonClasses } from "@/components/ui/button";
import { images } from "@/lib/images";
import { siteConfig } from "@/lib/site";
import type { FAQ } from "@/types/catalog";
import { SectionHeading } from "./section-heading";


export function FaqCta({ faqs }: { faqs: FAQ[] }) {
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="flex flex-col gap-8">
        <SectionHeading eyebrow="FAQ" title="Questions? Answers." href="/support" linkLabel="Help center" />
        <Accordion items={faqs} name="home-faq" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative isolate flex min-h-[300px] flex-col justify-end overflow-hidden rounded-3xl p-7 text-white">
          <Image
            src={images.supportAgent}
            alt="TOPX support agent wearing a headset"
            placeholder="blur"
            sizes="(min-width: 1024px) 500px, 100vw"
            className="absolute inset-0 -z-20 size-full object-cover object-[70%_30%]"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-navy-deep via-brand-navy-deep/70 to-brand-navy-deep/0" />
          <h3 className="font-display text-2xl font-black italic">Talk to a real person</h3>
          <p className="mt-2 max-w-xs text-sm text-white/75">WhatsApp us any time — we reply in minutes.</p>
          <a
            href={siteConfig.contact.whatsapp}
            className={`${buttonClasses({ variant: "cta", pill: true })} mt-5 self-start`}
          >
            Chat on WhatsApp <ArrowRight />
          </a>
        </div>

        <div className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-5 shadow-card">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="size-5" />
          </span>
          <div className="flex-1">
            <h3 className="font-display font-extrabold italic">Business or reseller?</h3>
            <p className="text-sm text-muted-foreground">Bulk and reseller pricing.</p>
          </div>
          <Link href="/reseller" className={buttonClasses({ variant: "soft", size: "sm", pill: true })}>
            Apply
          </Link>
        </div>
      </div>
    </section>
  );
}
