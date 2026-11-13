import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Styleguide · TOPX NEPAL",
  robots: { index: false },
};

const scales = {
  "brand-blue": [
    ["50", "bg-brand-blue-50"], ["100", "bg-brand-blue-100"], ["200", "bg-brand-blue-200"],
    ["300", "bg-brand-blue-300"], ["400", "bg-brand-blue-400"], ["500", "bg-brand-blue-500"],
    ["600", "bg-brand-blue-600"], ["700", "bg-brand-blue-700"], ["800", "bg-brand-blue-800"],
    ["900", "bg-brand-blue-900"], ["950", "bg-brand-blue-950"],
  ],
  "brand-orange": [
    ["50", "bg-brand-orange-50"], ["100", "bg-brand-orange-100"], ["200", "bg-brand-orange-200"],
    ["300", "bg-brand-orange-300"], ["400", "bg-brand-orange-400"], ["500", "bg-brand-orange-500"],
    ["600", "bg-brand-orange-600"], ["700", "bg-brand-orange-700"], ["800", "bg-brand-orange-800"],
    ["900", "bg-brand-orange-900"],
  ],
  other: [
    ["navy", "bg-brand-navy"], ["navy-deep", "bg-brand-navy-deep"],
    ["sky", "bg-brand-sky"], ["nepal-red", "bg-nepal-red"],
  ],
} as const;

const semantic = [
  ["background", "bg-background"], ["surface", "bg-surface"], ["surface-2", "bg-surface-2"],
  ["muted", "bg-muted"], ["border", "bg-border"], ["primary", "bg-primary"],
  ["accent", "bg-accent"], ["success", "bg-success"], ["warning", "bg-warning"],
  ["danger", "bg-danger"], ["info", "bg-info"],
] as const;

function Swatch({ name, cls }: { name: string; cls: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={`h-12 rounded-md border border-border ${cls}`} />
      <span className="text-xs text-muted-foreground">{name}</span>
    </div>
  );
}

function ThemePanel({ dark }: { dark?: boolean }) {
  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-background p-6 text-foreground">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {dark ? "Dark mode" : "Light mode"}
        </p>

        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
          {semantic.map(([n, c]) => <Swatch key={n} name={n} cls={c} />)}
        </div>

        <div className="rounded-xl bg-surface p-5 shadow-card transition-shadow hover:shadow-card-hover">
          <h3 className="text-lg font-extrabold italic">Card title</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Surface card with the brand shadow. Hover me.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Primary
            </span>
            <span className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-glow-orange">
              Accent CTA
            </span>
            <span className="rounded-md border border-input px-4 py-2 text-sm font-semibold">
              Outline
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-brand-gradient p-5">
          <div className="glass rounded-lg p-4">
            <p className="font-semibold">Glass tile</p>
            <p className="text-sm text-muted-foreground">Frosted surface on the brand gradient.</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-4 w-1/2 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function StyleguidePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-10 sm:px-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">Step 1.2</p>
        <h1 className="mt-2 text-3xl font-extrabold italic sm:text-4xl">
          TOPX NEPAL <span className="swoosh">design tokens</span>
        </h1>
      </header>

      {/* Hero preview */}
      <section className="bg-hero relative overflow-hidden rounded-2xl px-6 py-14 text-white sm:px-10">
        <div className="pointer-events-none absolute right-10 top-10 hidden size-24 sm:block animate-float rounded-2xl bg-brand-blue-500/30 shadow-glow-blue" />
        <h2 className="text-4xl font-black italic sm:text-6xl">
          TOPX <span className="text-gradient">NEPAL</span>
        </h2>
        <p className="mt-3 text-xl font-bold italic sm:text-2xl">
          Everything Digital. <span className="text-brand-sky">One Place.</span>
        </p>
        <span className="mt-8 inline-flex rounded-full bg-cta-gradient px-6 py-3 font-semibold shadow-glow-orange">
          Explore Now →
        </span>
      </section>

      {/* Brand scales */}
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-extrabold italic">Brand colors</h2>
        {Object.entries(scales).map(([name, items]) => (
          <div key={name}>
            <p className="mb-2 text-sm font-semibold">{name}</p>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-11">
              {items.map(([n, c]) => <Swatch key={n} name={n} cls={c} />)}
            </div>
          </div>
        ))}
      </section>

      {/* Radius */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-extrabold italic">Radius</h2>
        <div className="flex flex-wrap gap-4">
          {(["rounded-sm", "rounded-md", "rounded-lg", "rounded-xl", "rounded-2xl", "rounded-full"] as const).map((r) => (
            <div key={r} className="flex flex-col items-center gap-2">
              <div className={`size-16 bg-primary ${r}`} />
              <span className="text-xs text-muted-foreground">{r}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Light vs dark */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-extrabold italic">Semantic tokens</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <ThemePanel />
          <ThemePanel dark />
        </div>
      </section>
    </main>
  );
}
