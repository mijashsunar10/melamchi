import { ChevronRight, FileText, MessageCircle } from "lucide-react";
import Link from "next/link";
import type { LegalPage } from "@/types/content";
import { cn } from "@/lib/cn";
import { siteConfig, whatsappLink } from "@/lib/site";

/** Shared layout for Refund / Privacy / Terms. */
export function LegalPageView({
  page,
  others,
}: {
  page: LegalPage;
  others: Pick<LegalPage, "slug" | "title">[];
}) {
  const updated = new Date(page.updated).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-20 sm:px-6 sm:pt-8 sm:pb-28">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground" aria-current="page">
          {page.title}
        </span>
      </nav>

      <div className="mt-4 flex items-center gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
          <FileText className="size-6" />
        </span>
        <div>
          <h1 className="font-display text-3xl leading-tight font-black italic sm:text-4xl">{page.title}</h1>
          <p className="text-sm text-muted-foreground">Last updated {updated}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
        {/* Table of contents */}
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <p className="mb-3 text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">On this page</p>
          <ol className="flex flex-col gap-1 border-l border-border text-sm">
            {page.sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
                  {i + 1}. {s.heading}
                </a>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-col gap-1 text-sm">
            {others
              .filter((o) => o.slug !== page.slug)
              .map((o) => (
                <Link key={o.slug} href={`/${o.slug}`} className="flex items-center gap-1 font-semibold text-primary hover:underline">
                  {o.title} <ChevronRight className="size-4" />
                </Link>
              ))}
          </div>
        </aside>

        {/* Content */}
        <article className="flex max-w-3xl flex-col gap-10">
          {page.sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-32">
              <h2 className="flex items-baseline gap-3 font-display text-xl font-extrabold italic sm:text-2xl">
                <span className="text-sm font-bold text-accent tabular-nums not-italic">{String(i + 1).padStart(2, "0")}</span>
                {s.heading}
              </h2>
              <div className="mt-3 flex flex-col gap-3 text-[15px] leading-relaxed text-muted-foreground">
                {s.paragraphs?.map((p) => <p key={p}>{p}</p>)}
                {s.bullets && (
                  <ul className={cn("flex flex-col gap-2", i === 0 && page.slug === "refund-policy" && "rounded-2xl border border-border bg-surface p-5 shadow-card")}>
                    {s.bullets.map((b) => (
                      <li key={b} className="flex gap-3">
                        <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}

          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-surface p-6 shadow-card sm:flex-row sm:items-center">
            <div>
              <p className="font-bold">Questions about this policy?</p>
              <p className="text-sm text-muted-foreground">
                {siteConfig.company} · {siteConfig.contact.address} ·{" "}
                <a href={`mailto:${siteConfig.contact.email}`} className="text-primary hover:underline">
                  {siteConfig.contact.email}
                </a>
              </p>
            </div>
            <a
              href={whatsappLink(`Hi TOPX Nepal, I have a question about your ${page.title.toLowerCase()}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white"
            >
              <MessageCircle className="size-4" /> Ask us
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}
