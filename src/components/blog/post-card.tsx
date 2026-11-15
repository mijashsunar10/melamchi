import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { Cover } from "@/components/product/cover";
import { cn } from "@/lib/cn";
import type { Product } from "@/types/catalog";
import type { BlogPost } from "@/types/content";

export const formatPostDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function PostCard({ post, product, featured = false }: { post: BlogPost; product?: Product; featured?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group flex overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-card-hover",
        featured ? "flex-col md:col-span-2 md:flex-row" : "flex-col",
      )}
    >
      {product && (
        <div className={cn("overflow-hidden", featured && "md:w-1/2")}>
          <Cover
            product={product}
            size={featured ? "lg" : "md"}
            eager={featured}
            className={cn("w-full transition-transform duration-500 group-hover:scale-105", featured ? "aspect-[16/10] md:h-full" : "aspect-[16/9]")}
          />
        </div>
      )}
      <div className={cn("flex flex-1 flex-col gap-3 p-5", featured && "md:justify-center md:p-8")}>
        <div className="flex items-center gap-3 text-xs">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary dark:bg-primary/20">{post.category}</span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="size-3.5" /> {post.readMinutes} min read
          </span>
        </div>
        <h2 className={cn("font-display leading-snug font-extrabold italic group-hover:text-primary", featured ? "text-2xl sm:text-3xl" : "text-lg")}>
          {post.title}
        </h2>
        <p className="text-sm text-muted-foreground">{post.excerpt}</p>
        <p className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
          {formatPostDate(post.date)}
          <span className="flex items-center gap-1 text-sm font-semibold text-primary">
            Read guide <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </p>
      </div>
    </Link>
  );
}
