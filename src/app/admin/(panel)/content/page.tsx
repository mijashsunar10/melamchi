import { ChevronRight, FileText, HelpCircle, LifeBuoy, Newspaper, Scale } from "lucide-react";
import Link from "next/link";
import { type ReactNode, Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireStaff } from "@/server/auth/dal";
import { contentCounts } from "@/server/admin/content";

export const metadata = { title: "Content" };

function Tile({ href, icon, title, text, note }: { href: string; icon: ReactNode; title: string; text: string; note: string }) {
  return (
    <li>
      <Link
        href={href}
        className="group flex h-full items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
      >
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20 [&_svg]:size-6">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-bold">{title}</span>
          <span className="block text-sm text-muted-foreground">{text}</span>
          <span className="mt-1 block text-xs font-semibold text-primary">{note}</span>
        </span>
        <ChevronRight className="size-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </li>
  );
}

async function Tiles() {
  const me = await requireStaff();
  const c = await contentCounts();
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      <Tile href="/admin/content/faq/home" icon={<HelpCircle />} title="Home page questions" text="The FAQ at the bottom of the home page." note={`${c.homeFaq} questions`} />
      <Tile
        href="/admin/content/faq/gaming"
        icon={<FileText />}
        title="Section questions"
        text="The FAQ on each section page (Gaming, Gift Cards…)."
        note={`${c.sectionFaq} questions in 6 sections`}
      />
      <Tile href="/admin/content/help" icon={<LifeBuoy />} title="Help center" text="Topics and answers on the Support page." note={`${c.topics} topics`} />
      <Tile href="/admin/content/blog" icon={<Newspaper />} title="Blog & guides" text="Write how-to guides that bring customers from Google." note={`${c.published} published · ${c.posts - c.published} drafts`} />
      {me.role === "admin" && (
        <Tile href="/admin/content/legal" icon={<Scale />} title="Legal pages" text="Refund policy, Privacy policy and Terms." note={`${c.legal} pages`} />
      )}
    </ul>
  );
}

export default function ContentPage() {
  return (
    <>
      <AdminPageHeader title="Content" description="The text on your website: questions & answers, help center, blog and policies." />
      <Suspense fallback={<div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>}>
        <Tiles />
      </Suspense>
    </>
  );
}
