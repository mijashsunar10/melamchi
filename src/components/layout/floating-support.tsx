"use client";

import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site";

export function FloatingSupport() {
  return <FloatingSupportView pathname={usePathname()} />;
}

/** Without reading the URL — the Suspense fallback / prerendered version. */
export function FloatingSupportView({ pathname }: { pathname: string }) {
  // Product pages have their own sticky WhatsApp order bar on phones
  const onProduct = pathname.startsWith("/product/");
  return (
    <a
      href={siteConfig.contact.whatsapp}
      aria-label="Chat with us on WhatsApp"
      className={`group fixed right-4 bottom-20 z-40 ${onProduct ? "hidden lg:flex" : "flex"} items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-white shadow-[0_10px_30px_-5px_rgba(37,211,102,0.6)] transition-transform hover:scale-105 lg:right-6 lg:bottom-6`}
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40 [animation-duration:2.5s]" />
      <svg viewBox="0 0 24 24" className="size-6 fill-white" aria-hidden>
        <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4ZM12 2a10 10 0 0 0-8.6 15l-1.4 5 5.1-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Z" />
      </svg>
      <span className="hidden pr-1 text-sm font-semibold lg:inline">Need help?</span>
    </a>
  );
}
