import type { Metadata } from "next";
import { LegalPageView } from "@/components/legal/legal-page";
import { getLegalPage, getLegalPages } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage("refund-policy");
  return { title: page.title, description: page.description };
}

export default async function Page() {
  const [page, others] = await Promise.all([getLegalPage("refund-policy"), getLegalPages()]);
  return <LegalPageView page={page} others={others} />;
}
