import { BookOpen, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/blog/post-card";
import { getProducts } from "@/lib/catalog";
import { getBlogPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Guides & news",
  description: "Step-by-step guides for game top-ups, gift cards, AI tools and software in Nepal.",
};

export default async function BlogPage() {
  const [posts, products] = await Promise.all([getBlogPosts(), getProducts()]);
  const productBySlug = new Map(products.map((p) => [p.slug, p]));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-20 sm:px-6 sm:pt-8 sm:pb-28">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground" aria-current="page">
          Guides
        </span>
      </nav>
      <div className="mt-4 mb-8 flex items-center gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
          <BookOpen className="size-6" />
        </span>
        <div>
          <h1 className="font-display text-3xl leading-tight font-black italic sm:text-4xl">Guides & news</h1>
          <p className="text-sm text-muted-foreground">Quick, step-by-step help for everything you buy on TOPX.</p>
        </div>
      </div>

      {posts.length ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <PostCard key={post.slug} post={post} product={productBySlug.get(post.productSlug)} featured={i === 0} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">Guides are coming soon.</p>
      )}
    </div>
  );
}
