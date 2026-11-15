import { ChevronRight, Clock, Lightbulb } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPostDate, PostCard } from "@/components/blog/post-card";
import { SectionHeading } from "@/components/home/section-heading";
import { Cover } from "@/components/product/cover";
import { ProductCard } from "@/components/product/product-card";
import { getProduct, getProducts } from "@/lib/catalog";
import { getBlogPost, getBlogPosts } from "@/lib/content";
import type { BlogBlock } from "@/types/content";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt, openGraph: { type: "article", title: post.title, description: post.excerpt } };
}

function Block({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "h2":
      return <h2 className="mt-4 font-display text-2xl font-extrabold italic">{block.text}</h2>;
    case "steps":
      return (
        <ol className="flex flex-col gap-3">
          {block.items.map((item, i) => (
            <li key={item} className="flex gap-4 rounded-xl border border-border bg-surface p-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
              <span className="pt-0.5 text-[15px] text-foreground">{item}</span>
            </li>
          ))}
        </ol>
      );
    case "tip":
      return (
        <p className="flex gap-3 rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-[15px] text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
          <Lightbulb className="mt-0.5 size-5 shrink-0" />
          <span>{block.text}</span>
        </p>
      );
    default:
      return <p>{block.text}</p>;
  }
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const [product, posts, products] = await Promise.all([getProduct(post.productSlug), getBlogPosts(), getProducts()]);
  const productBySlug = new Map(products.map((p) => [p.slug, p]));
  const more = posts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="flex flex-col gap-16 pb-20 sm:gap-20 sm:pb-28">
      <article className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6 sm:pt-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="size-4" />
          <Link href="/blog" className="hover:text-foreground">
            Guides
          </Link>
          <ChevronRight className="size-4" />
          <span className="truncate text-foreground" aria-current="page">
            {post.title}
          </span>
        </nav>

        <header className="mt-6">
          <div className="flex items-center gap-3 text-xs">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary dark:bg-primary/20">{post.category}</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="size-3.5" /> {post.readMinutes} min read · {formatPostDate(post.date)}
            </span>
          </div>
          <h1 className="mt-4 font-display text-3xl leading-tight font-black italic sm:text-5xl">{post.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
        </header>

        {product && (
          <div className="mt-8 overflow-hidden rounded-3xl shadow-card-hover">
            <Cover product={product} size="lg" eager className="aspect-[16/8] w-full" />
          </div>
        )}

        <div className="mt-10 flex flex-col gap-5 text-[16px] leading-relaxed text-muted-foreground">
          {post.body.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>

        {product && (
          <aside className="mt-12 rounded-3xl border border-border bg-surface-2/60 p-5 sm:p-6">
            <p className="mb-4 text-xs font-bold tracking-[0.18em] text-accent uppercase">Buy it on TOPX</p>
            <div className="max-w-xs">
              <ProductCard product={product} />
            </div>
          </aside>
        )}
      </article>

      {more.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="Keep reading" title="More guides" href="/blog" linkLabel="All guides" className="mb-8" />
          <div className="grid gap-5 md:grid-cols-3">
            {more.map((p) => (
              <PostCard key={p.slug} post={p} product={productBySlug.get(p.productSlug)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
