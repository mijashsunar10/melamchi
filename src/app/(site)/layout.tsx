import { BottomNav } from "@/components/layout/bottom-nav";
import { FloatingSupport } from "@/components/layout/floating-support";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <Footer />
      <FloatingSupport />
      <BottomNav />
    </>
  );
}
