import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireStaff } from "@/server/auth/dal";
import { getAdminBlogPost, listProductOptions } from "@/server/admin/content";
import { BlogEditor } from "../blog-editor";

export const metadata = { title: "Edit post" };

async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const [p, products] = await Promise.all([getAdminBlogPost(id), listProductOptions()]);
  if (!p) notFound();
  return (
    <BlogEditor
      key={`${p.id}-${p.updatedAt.getTime()}`}
      products={products.map((x) => ({ slug: x.slug, name: x.name }))}
      initial={{
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
        date: p.date,
        readMinutes: p.readMinutes,
        productSlug: p.productSlug,
        body: p.body,
        isPublished: p.isPublished,
      }}
    />
  );
}

export default function EditPostPage({ params }: PageProps<"/admin/content/blog/[id]">) {
  return (
    <Suspense fallback={<div className="skeleton h-[36rem] rounded-2xl" />}>
      <EditPost params={params} />
    </Suspense>
  );
}
