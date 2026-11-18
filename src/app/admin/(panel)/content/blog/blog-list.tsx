"use client";

import { Eye, EyeOff, Loader2, Newspaper, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { deleteBlogPostAction, setBlogPublishedAction } from "@/server/admin/content-actions";
import type { ContentResult } from "@/server/admin/content-types";

type Post = { id: string; slug: string; title: string; category: string; date: string; isPublished: boolean };

export function BlogList({ posts }: { posts: Post[] }) {
  if (!posts.length)
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface px-5 py-16 text-center shadow-card">
        <Newspaper className="size-10 text-muted-foreground/60" />
        <p className="font-semibold">No posts yet</p>
        <p className="text-sm text-muted-foreground">Click “Write a post” to create the first guide.</p>
      </div>
    );
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-card" data-post-list>
      {posts.map((p) => (
        <PostRow key={p.id} post={p} />
      ))}
    </ul>
  );
}

function PostRow({ post: p }: { post: Post }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<ContentResult>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    start(async () => {
      const r = await fn();
      toast(r.ok ? { type: "success", title: r.message ?? "Done" } : { type: "error", title: r.error ?? "Something went wrong" });
    });
  };
  const btn = "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold";
  return (
    <li className={cn("flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5", !p.isPublished && "bg-muted/30")} data-post={p.slug}>
      <Link href={`/admin/content/blog/${p.id}`} className="min-w-0 flex-1">
        <p className="truncate font-semibold">{p.title}</p>
        <p className="text-sm text-muted-foreground">
          {p.category} · {new Date(p.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </Link>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => setBlogPublishedAction(p.id, !p.isPublished))}
          title={p.isPublished ? "Click to hide (make it a draft)" : "Click to publish"}
          className={cn(btn, "flex-1 sm:w-32 sm:flex-none", p.isPublished ? "bg-success/12 text-success hover:bg-success/20" : "bg-muted text-muted-foreground hover:bg-muted/70")}
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : p.isPublished ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          {p.isPublished ? "Published" : "Draft"}
        </button>
        <Link href={`/admin/content/blog/${p.id}`} className={cn(btn, "flex-1 border border-input hover:bg-muted sm:flex-none")}>
          <Pencil className="size-4" /> Edit
        </Link>
        <button
          type="button"
          aria-label={`Delete ${p.title}`}
          title="Delete"
          disabled={pending}
          onClick={() => run(() => deleteBlogPostAction(p.id), `Delete “${p.title}” for good? (To only hide it, click “Published” to make it a draft.)`)}
          className={cn(btn, "px-2.5 text-danger hover:bg-danger/10")}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </li>
  );
}
