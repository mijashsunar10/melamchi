import { Suspense } from "react";
import { BottomNav, BottomNavView } from "@/components/layout/bottom-nav";
import { FloatingSupport, FloatingSupportView } from "@/components/layout/floating-support";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SiteSettingsProvider } from "@/components/site-settings";
import { getSiteSettings } from "@/lib/content";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  // contact details from the admin Settings page, for browser components (WhatsApp buttons, forms)
  const { contact, social } = await getSiteSettings();
  return (
    <SiteSettingsProvider contact={contact} social={social}>
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
    </SiteSettingsProvider>
  );
}
