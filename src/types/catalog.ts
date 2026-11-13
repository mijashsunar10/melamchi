// Shared catalog types. The backend must return data in these shapes.

export type DomainSlug =
  | "ai-tools"
  | "gaming"
  | "gift-cards"
  | "software"
  | "digital-products"
  | "support";

/** How an order is fulfilled — decides the order form and the order page. */
export type DeliveryType =
  | "TOPUP" // direct top-up to a game/app account (Player ID)
  | "CODE" // voucher / gift-card code sent to the customer
  | "ACCOUNT" // subscription activated on the customer's email/account
  | "LICENSE" // licence key + download link
  | "SERVICE"; // a support/setup service request

/** lucide-react icon names used for domains and categories */
export type IconName =
  | "Cpu"
  | "Gamepad2"
  | "Gift"
  | "AppWindow"
  | "ShoppingBag"
  | "Headset"
  | "Bot"
  | "Image"
  | "Mic"
  | "PenLine"
  | "Code"
  | "Smartphone"
  | "Monitor"
  | "Radio"
  | "CreditCard"
  | "ShieldCheck"
  | "Palette"
  | "Wrench"
  | "Tv"
  | "GraduationCap"
  | "Cloud"
  | "FileText"
  | "LifeBuoy"
  | "Building2"
  | "Package";

export interface Category {
  slug: string;
  name: string;
  icon: IconName;
}

export interface Domain {
  slug: DomainSlug;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  icon: IconName;
  /** Tailwind gradient classes for tiles/banners */
  gradient: string;
  categories: Category[];
}

export interface Plan {
  id: string;
  name: string; // "60 UC", "1 Month", "Rs 1000 card"
  price: number; // NPR
  originalPrice?: number; // NPR, shows a strike-through + % off
  bonus?: string; // "+6 bonus UC"
  validity?: string; // "30 days"
  inStock: boolean;
  popular?: boolean;
}

export type FieldType = "text" | "email" | "tel" | "number" | "select" | "textarea";

/** A field the customer fills in on the product page */
export interface OrderField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required: boolean;
  help?: string;
  options?: string[];
  /** shows a "Check name" button next to the field (TOPUP) */
  verifiable?: boolean;
}

export type ProductTag = "hot" | "new" | "bestseller" | "official" | "limited";

export interface FAQ {
  q: string;
  a: string;
}

export interface Product {
  slug: string;
  name: string;
  brand: string;
  domain: DomainSlug;
  category: string; // Category.slug within the domain
  deliveryType: DeliveryType;
  /** product image path; null → generated brand tile (initials + color) */
  image: string | null;
  initials: string;
  /** brand color for the generated tile, e.g. "#10A37F" */
  color: string;
  shortDescription: string;
  description: string;
  region: string; // "Nepal", "Global", "US"
  deliveryTime: string; // "Instant", "5–30 min"
  rating: number; // 0–5
  reviewCount: number;
  sold: number;
  tags: ProductTag[];
  plans: Plan[];
  fields: OrderField[];
  /** steps shown in "How to redeem / activate" */
  howTo: string[];
  faq: FAQ[];
}

export interface Deal {
  productSlug: string;
  planId: string;
  discountPercent: number;
  endsAt: string; // ISO date
  label?: string;
}

export interface Review {
  id: string;
  productSlug: string;
  name: string;
  city: string;
  rating: number;
  comment: string;
  date: string; // ISO date
  verified: boolean;
}

export interface PaymentMethod {
  id: "esewa" | "khalti" | "imepay" | "fonepay" | "bank" | "wallet";
  name: string;
  description: string;
  color: string;
}
