import { Suspense } from "react";
import { BottomNav, BottomNavView } from "@/components/layout/bottom-nav";
import { FloatingSupport, FloatingSupportView } from "@/components/layout/floating-support";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <Footer />
      {/* these read the URL → inside Suspense so pages can be re-generated after admin edits */}
      <Suspense fallback={<FloatingSupportView pathname="" />}>
        <FloatingSupport />
      </Suspense>
      <Suspense fallback={<BottomNavView pathname="" />}>
        <BottomNav />
      </Suspense>
    </>
  );
}
