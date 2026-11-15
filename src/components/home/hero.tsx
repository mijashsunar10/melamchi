import { ArrowRight, BadgeCheck, CheckCircle2, Flame, Headset, Lock, Search, ShieldCheck, Star, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { formatCountPlus } from "@/lib/format";
import { images } from "@/lib/images";
import type { SiteStats } from "@/types/content";
import { type SimpleIcon, siClaude, siNetflix, siPlaystation, siPubg, siSpotify, siSteam, siYoutube } from "simple-icons";

const trust = [
  { icon: ShieldCheck, label: "Secure payment" },
  { icon: Zap, label: "Instant delivery" },
  { icon: Headset, label: "24/7 support" },
];

function Mountains() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 220"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full sm:h-40"
    >
      <path
        className="fill-brand-blue-500/[0.06] dark:fill-[rgb(96_165_250_/_0.08)]"
        d="M0 170 120 110l70 40 110-95 90 80 60-35 120 100 140-150 80 70 60-40 150 120 120-90 110 60 90-50 120 90V220H0Z"
      />
      <path
        className="fill-brand-blue-500/[0.04] dark:fill-white/5"
        d="m0 200 160-60 90 45 130-90 110 85 80-40 160 70 120-60 120 55 140-95 130 80 100-35 100 45V220H0Z"
      />
      <path fill="var(--background)" d="M0 214c240-14 480-14 720-4s480 10 720-4V220H0Z" />
    </svg>
  );
}

/** Real brand logos orbiting the hero photo */
const orbit = [
  { icon: siNetflix, pos: "left-[47%] top-[-1%]", delay: "0s" },
  { icon: siPlaystation, pos: "right-[7%] top-[10%]", delay: "1.4s" },
  { icon: siSpotify, pos: "right-[-2%] top-[44%]", delay: "0.7s" },
  { icon: siSteam, pos: "right-[10%] bottom-[16%]", delay: "2.1s" },
  { icon: siPubg, pos: "left-[3%] top-[12%]", delay: "1s" },
  { icon: siClaude, pos: "left-[-3%] top-[44%]", delay: "2.6s" },
  { icon: siYoutube, pos: "left-[8%] bottom-[16%]", delay: "1.8s" },
];

function LogoTile({ icon, pos, delay }: { icon: SimpleIcon; pos: string; delay: string }) {
  return (
    <div
      className={`absolute z-20 flex size-14 animate-float items-center justify-center rounded-2xl border border-border bg-white shadow-[0_14px_30px_-12px_rgba(16,24,64,0.25)] dark:border-white/60 dark:bg-white/95 dark:shadow-[0_14px_30px_-10px_rgba(0,0,0,0.55)] xl:size-[60px] ${pos}`}
      style={{ animationDelay: delay }}
      title={icon.title}
    >
      <svg viewBox="0 0 24 24" className="size-7" aria-hidden>
        <path d={icon.path} fill={`#${icon.hex === "000000" ? "171a21" : icon.hex}`} />
      </svg>
    </div>
  );
}

function HeroVisual({ stats }: { stats: SiteStats }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[540px]">
      {/* glow */}
      <div className="absolute inset-[14%] rounded-full bg-brand-blue-500/20 blur-[80px] dark:bg-brand-blue-500/40" />

      {/* orbit rings */}
      <div className="absolute inset-[4%] rounded-full border border-primary/10 dark:border-white/[0.07]" />
      <div className="absolute inset-[11%] animate-[spin_70s_linear_infinite] rounded-full border border-dashed border-primary/25 dark:border-brand-sky/25">
        <span className="absolute top-1/2 -left-1 size-2 rounded-full bg-brand-sky shadow-[0_0_12px_3px_rgba(96,165,250,0.7)]" />
        <span className="absolute -top-1 left-1/2 size-1.5 rounded-full bg-accent shadow-[0_0_10px_3px_rgba(255,77,26,0.6)]" />
      </div>
      <div className="absolute inset-[15%] rounded-full border border-primary/10 dark:border-white/10" />

      {/* photo inside the circle */}
      <div className="absolute inset-[18%] overflow-hidden rounded-full shadow-[0_30px_70px_-25px_rgba(16,24,64,0.45)] ring-[6px] ring-white dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] dark:ring-white/[0.08]">
        <Image
          src={images.heroGamer}
          alt="Gamer playing at a neon-lit gaming setup"
          placeholder="blur"
          loading="eager"
          sizes="360px"
          className="size-full scale-110 object-cover object-[38%_45%]"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-navy-deep/60 via-transparent to-brand-blue-500/25" />
      </div>

      {/* brand logos */}
      {orbit.map((o) => (
        <LogoTile key={o.icon.slug} {...o} />
      ))}

      {/* rating chip */}
      <div className="absolute top-[24%] right-[16%] z-30 flex items-center gap-2 rounded-xl border border-border bg-white/95 px-3 py-2 text-brand-navy shadow-lg backdrop-blur-xl dark:border-white/15 dark:bg-brand-navy/75 dark:text-white dark:shadow-none">
        <span className="text-lg font-bold">{stats.rating.toFixed(1)}</span>
        <span className="leading-tight">
          <span className="flex">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
            ))}
          </span>
          <span className="text-[10px] text-muted-foreground dark:text-white/60">{formatCountPlus(stats.reviewCount)} reviews</span>
        </span>
      </div>

      {/* activation chip */}
      <div className="absolute top-[58%] left-[12%] z-30 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-brand-navy shadow-xl">
        <BadgeCheck className="size-4 text-primary" /> ChatGPT Plus activated
      </div>

      {/* order card */}
      <div className="absolute -bottom-[3%] left-1/2 z-30 w-[300px] -translate-x-1/2 rounded-2xl border border-border bg-white/95 p-4 text-brand-navy shadow-[0_24px_60px_-24px_rgba(16,24,64,0.35)] backdrop-blur-xl dark:border-white/15 dark:bg-brand-navy/75 dark:text-white dark:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase dark:text-white/55">Order #TX-20931</span>
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300">
            <CheckCircle2 className="size-3" /> Delivered
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#FF6B00] text-center text-[8px] leading-[1.05] font-extrabold text-white">
            FREE
            <br />
            FIRE
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">610 Diamonds</p>
            <p className="text-xs text-muted-foreground dark:text-white/55">Player · NepaliGamer99</p>
          </div>
          <p className="text-sm font-bold">Rs 760</p>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground dark:border-white/10 dark:text-white/65">
          <span className="flex items-center gap-1">
            <Zap className="size-3.5 fill-amber-300 text-amber-300" /> Delivered in {stats.avgDeliverySeconds} sec
          </span>
          <span className="flex items-center gap-1">
            <Lock className="size-3" /> eSewa
          </span>
        </div>
      </div>
    </div>
  );
}

export function Hero({ stats }: { stats: SiteStats }) {
  return (
    <section className="bg-hero-light relative isolate overflow-hidden text-brand-navy dark:bg-hero dark:text-white">
      {/* subtle grid texture */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(29,63,191,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(29,63,191,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] bg-[size:56px_56px]" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-12 pb-36 sm:px-6 sm:pt-16 sm:pb-48 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
        <div className="flex animate-fade-up flex-col items-start gap-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white px-3 py-1 text-xs font-medium text-brand-navy/80 shadow-sm backdrop-blur dark:border-white/12 dark:bg-white/[0.06] dark:text-white/80 dark:shadow-none">
            <span className="size-1.5 rounded-full bg-accent" />
            Nepal&apos;s Digital Powerhouse
          </span>

          <h1 className="font-display text-5xl leading-[0.95] font-black italic sm:text-6xl xl:text-7xl">
            TOP<span className="text-accent">X</span> <span className="text-gradient-strong pr-2 dark:text-gradient">NEPAL</span>
            <span className="mt-4 block text-2xl leading-tight font-extrabold sm:text-3xl xl:text-[2.35rem]">
              Everything Digital. <span className="swoosh whitespace-nowrap text-primary dark:text-brand-sky">One Place.</span>
            </span>
          </h1>

          <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg dark:text-white/65">
            AI tools, game top-ups, gift cards and software — paid in rupees, delivered in seconds.
          </p>

          {/* search */}
          <form action="/products" className="w-full max-w-lg">
            <div className="flex items-center gap-2 rounded-2xl bg-white p-1.5 shadow-[0_20px_50px_-20px_rgba(16,24,64,0.35)] ring-1 ring-border dark:bg-white/10 dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)] dark:ring-1 dark:ring-white/15">
              <Search className="ml-3 size-5 shrink-0 text-brand-navy/40 dark:text-white/50" />
              <input
                name="q"
                aria-label="Search products"
                placeholder="Search Free Fire, ChatGPT, Netflix…"
                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-brand-navy outline-none placeholder:text-brand-navy/40 dark:text-white dark:placeholder:text-white/45"
              />
              <button type="submit" className={buttonClasses({ variant: "cta", size: "md" })}>
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-wrap gap-3">
            <Link href="#categories" className={buttonClasses({ variant: "cta", size: "lg", pill: true })}>
              Explore Now <ArrowRight />
            </Link>
            <Link
              href="#deals"
              className={`${buttonClasses({ variant: "outline", size: "lg", pill: true })} dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20`}
            >
              <Flame className="text-accent" /> Today&apos;s Deals
            </Link>
          </div>

          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground dark:text-white/60">
            {trust.map(({ icon: I, label }) => (
              <li key={label} className="flex items-center gap-2">
                <I className="size-4 text-accent dark:text-brand-orange-400" /> {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden lg:block">
          <HeroVisual stats={stats} />
        </div>
      </div>

      <Mountains />
    </section>
  );
}
