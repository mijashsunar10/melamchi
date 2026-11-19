import type { MetadataRoute } from "next";
import { getDomains, getProducts } from "@/lib/catalog";
import { getBlogPosts } from "@/lib/content";
import { siteConfig as site } from "@/lib/site";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [domains, products, posts] = await Promise.all([getDomains(), getProducts(), getBlogPosts()]);
  const pages = ["", "/products", "/deals", "/support", "/contact", "/about", "/reseller", "/blog", "/track", "/privacy-policy", "/terms", "/refund-policy"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}` })),
    ...domains.map((d) => ({ url: `${site.url}/${d.slug}` })),
    ...products.map((p) => ({ url: `${site.url}/product/${p.slug}` })),
    ...posts.map((b) => ({ url: `${site.url}/blog/${b.slug}` })),
  ];
}
