"use client";

import { ExternalLink, Heading2, Lightbulb, ListOrdered, Pilcrow, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useMemo, useState, useTransition } from "react";
import { Card, move, RowTools, SaveBar, selectCls, Toggle, uid, useDirty } from "@/components/admin/editor-bits";
import { FormError } from "@/components/admin/form-bits";
import { Field, Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { saveBlogPostAction } from "@/server/admin/content-actions";
import type { BlogPostInput } from "@/server/admin/content-types";
import { slugify } from "@/server/admin/product-types";
import type { BlogBlock } from "@/types/content";

type BlockState =
  | { uid: string; type: "p" | "h2" | "tip"; text: string }
  | { uid: string; type: "steps"; stepsText: string };

const BLOCKS: { type: BlockState["type"]; label: string; icon: ReactNode; help: string }[] = [
  { type: "p", label: "Paragraph", icon: <Pilcrow className="size-4" />, help: "Normal text." },
  { type: "h2", label: "Heading", icon: <Heading2 className="size-4" />, help: "A title for the next part." },
  { type: "steps", label: "Steps", icon: <ListOrdered className="size-4" />, help: "A numbered list — one step per line." },
  { type: "tip", label: "Tip box", icon: <Lightbulb className="size-4" />, help: "A highlighted tip or warning." },
];
const blockMeta = (t: BlockState["type"]) => BLOCKS.find((b) => b.type === t)!;

const toState = (b: BlogBlock): BlockState => (b.type === "steps" ? { uid: uid(), type: "steps", stepsText: b.items.join("\n") } : { uid: uid(), type: b.type, text: b.text });
const toBlock = (b: BlockState): BlogBlock | null => {
  if (b.type === "steps") {
    const items = b.stepsText.split("\n").map((s) => s.trim()).filter(Boolean);
    return items.length ? { type: "steps", items } : null;
  }
  return b.text.trim() ? { type: b.type, text: b.text.trim() } : null;
};

const CATEGORIES = ["Gaming", "AI Tools", "Gift Cards", "Software", "Streaming", "Tips"];

type Props = { initial: BlogPostInput; products: { slug: string; name: string }[] };

/** Next.js keeps the previous page alive (hidden), so the "Write a post" form resets itself after a post is created. */
export function BlogEditor(props: Props) {
  const [round, setRound] = useState(0);
  return <BlogEditorInner key={round} {...props} onCreated={() => setRound((r) => r + 1)} />;
}

function BlogEditorInner({ initial, products, onCreated }: Props & { onCreated: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const isNew = !initial.id;
  const [saving, start] = useTransition();
  const [error, setError] = useState<string>();

  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [category, setCategory] = useState(initial.category);
  const [date, setDate] = useState(initial.date);
  const [productSlug, setProductSlug] = useState(initial.productSlug);
  const [isPublished, setIsPublished] = useState(initial.isPublished);
  const [blocks, setBlocks] = useState<BlockState[]>(() => (initial.body.length ? initial.body.map(toState) : [{ uid: uid(), type: "p", text: "" }]));

  const body = blocks.map(toBlock).filter((b): b is BlogBlock => b !== null);
  const words = useMemo(() => JSON.stringify(body).split(/\s+/).length, [body]);
  const readMinutes = Math.max(1, Math.round(words / 200));
  const effectiveSlug = slugTouched ? slugify(slug) : slugify(title);

  const payload = (): BlogPostInput => ({
    id: initial.id,
    slug: effectiveSlug,
    title: title.trim(),
    excerpt: excerpt.trim(),
    category: category.trim(),
    date,
    readMinutes,
    productSlug,
    body,
    isPublished,
  });
  const { dirty, markSaved } = useDirty(JSON.stringify(payload()));
  const setBlock = (u: string, patch: Partial<BlockState>) => setBlocks((all) => all.map((b) => (b.uid === u ? ({ ...b, ...patch } as BlockState) : b)));

  return (
    <form
      noValidate
      className="pb-28"
      data-blog-form
      onSubmit={(e) => {
        e.preventDefault();
        setError(undefined);
        const data = payload();
        start(async () => {
          const r = await saveBlogPostAction(data);
          if (r.error) {
            setError(r.error);
            return toast({ type: "error", title: r.error });
          }
          toast({ type: "success", title: r.message ?? "Saved." });
          markSaved(JSON.stringify(data));
          if (isNew) {
            router.replace(`/admin/content/blog/${r.id}`);
            onCreated();
          }
        });
      }}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isNew ? "Write a post" : title || "Untitled post"}</h1>
          <p className="text-sm text-muted-foreground">
            {isPublished ? "Published" : "Draft — not on the website"} · about {readMinutes} min read
          </p>
        </div>
        {!isNew && (
          <a href={`/blog/${initial.slug}`} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl border border-input bg-surface px-4 text-sm font-semibold hover:bg-muted">
            See it on the website <ExternalLink className="size-4" />
          </a>
        )}
      </div>
      <FormError error={error} />

      <div className="mt-4 grid items-start gap-6 xl:grid-cols-[1fr_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card title="Title & summary">
            <div className="flex flex-col gap-5">
              <Field label="Title" required help="Example: How to find your Free Fire Player ID">
                {(id, d) => <Input id={id} aria-describedby={d} name="title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus={isNew} />}
              </Field>
              <Field label="Summary" required help="One or two sentences shown on the blog list and in Google.">
                {(id, d) => <Textarea id={id} aria-describedby={d} name="excerpt" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="min-h-0" />}
              </Field>
              {isNew && (
                <Field label="Web address" help={<>The page will be <strong>/blog/{effectiveSlug || "…"}</strong>. It can’t be changed later.</>}>
                  {(id, d) => (
                    <Input
                      id={id}
                      aria-describedby={d}
                      value={slugTouched ? slug : slugify(title)}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setSlug(e.target.value);
                      }}
                    />
                  )}
                </Field>
              )}
            </div>
          </Card>

          <Card title="Article" description="Build the article from blocks. Use ↑↓ to change the order.">
            <ol className="flex flex-col gap-3" data-block-list>
              {blocks.map((b, i) => {
                const meta = blockMeta(b.type);
                return (
                  <li key={b.uid} className="rounded-xl border border-border p-4" data-block={b.type}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2 text-sm font-bold">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">{meta.icon}</span>
                        {meta.label}
                        <span className="font-normal text-muted-foreground">· {meta.help}</span>
                      </span>
                      <RowTools index={i} count={blocks.length} onMove={(d) => setBlocks((all) => move(all, i, d))} onRemove={() => setBlocks((all) => all.filter((x) => x.uid !== b.uid))} removeLabel="Remove block" />
                    </div>
                    {b.type === "steps" ? (
                      <Textarea rows={4} value={b.stepsText} onChange={(e) => setBlock(b.uid, { stepsText: e.target.value })} placeholder={"Open the game.\nTap your avatar.\nCopy the ID."} aria-label="Steps, one per line" />
                    ) : b.type === "h2" ? (
                      <Input value={b.text} onChange={(e) => setBlock(b.uid, { text: e.target.value })} placeholder="e.g. Find it in the game" aria-label="Heading" />
                    ) : (
                      <Textarea rows={b.type === "p" ? 4 : 2} value={b.text} onChange={(e) => setBlock(b.uid, { text: e.target.value })} aria-label={meta.label} />
                    )}
                  </li>
                );
              })}
            </ol>
            <div className="mt-4 flex flex-wrap gap-2">
              {BLOCKS.map((m) => (
                <button
                  key={m.type}
                  type="button"
                  onClick={() => setBlocks((all) => [...all, m.type === "steps" ? { uid: uid(), type: "steps", stepsText: "" } : { uid: uid(), type: m.type as "p", text: "" }])}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border-2 border-dashed border-primary/40 px-4 text-sm font-bold text-primary hover:border-primary hover:bg-primary/5"
                >
                  <Plus className="size-4" /> {m.label}
                </button>
              ))}
            </div>
          </Card>
        </div>

        <aside className="flex flex-col gap-6 xl:sticky xl:top-24">
          <section className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <h2 className="mb-4 font-bold">On the website</h2>
            <Toggle checked={isPublished} onChange={setIsPublished} label={isPublished ? "Published" : "Draft"} help={isPublished ? "Anyone can read it." : "Only you can see it here."} />
          </section>
          <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card">
            <h2 className="font-bold">Details</h2>
            <Field label="Product" required help="Shown as “Buy it here”. Its picture is used for the article.">
              {(id, d) => (
                <select id={id} aria-describedby={d} name="productSlug" className={selectCls} value={productSlug} onChange={(e) => setProductSlug(e.target.value)}>
                  <option value="" disabled>
                    Choose a product…
                  </option>
                  {products.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Category" required>
              {(id) => (
                <>
                  <Input id={id} name="category" value={category} onChange={(e) => setCategory(e.target.value)} list={`${id}-l`} placeholder="e.g. Gaming" />
                  <datalist id={`${id}-l`}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </>
              )}
            </Field>
            <Field label="Date" required>
              {(id) => <Input id={id} type="date" name="date" value={date} onChange={(e) => setDate(e.target.value)} />}
            </Field>
          </section>
        </aside>
      </div>
      <SaveBar backHref="/admin/content/blog" backLabel="All posts" dirty={dirty} saving={saving} label={isNew ? "Save post" : "Save changes"} savedText={isNew ? "" : "All changes saved"} />
    </form>
  );
}
