import { Suspense } from "react";
import { requireStaff } from "@/server/auth/dal";
import { listProductOptions } from "@/server/admin/content";
import { BlogEditor } from "../blog-editor";

export const metadata = { title: "Write a post" };

async function NewPost() {
  await requireStaff();
  const products = await listProductOptions();
  return (
    <BlogEditor
      products={products.map((p) => ({ slug: p.slug, name: p.name }))}
      initial={{ slug: "", title: "", excerpt: "", category: "", date: new Date().toISOString().slice(0, 10), readMinutes: 1, productSlug: "", body: [], isPublished: true }}
    />
  );
}

export default function NewPostPage() {
  return (
    <Suspense fallback={<div className="skeleton h-[36rem] rounded-2xl" />}>
      <NewPost />
    </Suspense>
  );
}
