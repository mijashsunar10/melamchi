"use client";

import { createContext, type ReactNode, useContext } from "react";
import { setWhatsappNumber, whatsappLink } from "@/lib/site";
import type { SiteContact, SiteSocial } from "@/types/content";

type Value = { contact: SiteContact & { whatsapp: string }; social: SiteSocial };
const Ctx = createContext<Value | null>(null);

/** Gives browser components the contact details from the admin Settings page. */
export function SiteSettingsProvider({ contact, social, children }: { contact: SiteContact; social: SiteSocial; children: ReactNode }) {
  setWhatsappNumber(contact.whatsappNumber); // whatsappLink() in forms (orders, support, reseller) uses it
  return <Ctx value={{ contact: { ...contact, whatsapp: whatsappLink(undefined, contact.whatsappNumber) }, social }}>{children}</Ctx>;
}

export function useSiteSettings(): Value {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSiteSettings() must be used inside <SiteSettingsProvider>");
  return v;
}
