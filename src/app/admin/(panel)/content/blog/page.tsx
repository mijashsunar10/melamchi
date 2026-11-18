import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireStaff } from "@/server/auth/dal";
import { listAdminBlogPosts } from "@/server/admin/content";
import { BlogList } from "./blog-list";

export const metadata = { title: "Blog & guides" };

async function Posts() {
  await requireStaff();
  return <BlogList posts={await listAdminBlogPosts()} />;
}

export default function BlogAdminPage() {
  return (
    <>
      <AdminPageHeader
        title="Blog & guides"
        description="Short how-to guides (e.g. “How to find your Free Fire ID”). They help customers and bring visitors from Google."
        actions={
          <Link
            href="/admin/content/blog/new"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary-hover sm:w-auto"
          >
            <Plus className="size-4" /> Write a post
          </Link>
        }
      />
      <Suspense fallback={<div className="skeleton h-96 rounded-2xl" />}>
        <Posts />
      </Suspense>
    </>
  );
}
