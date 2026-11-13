import type { DeliveryType, FAQ, OrderField, Plan, Product } from "@/types/catalog";
import {
  accountEmailField,
  accountFaq,
  codeFaq,
  deliveryEmailField,
  licenseFaq,
  playerIdField,
  topupFaq,
} from "../fields";

/** plan("60 UC", 150) or plan("1 Month", 2900, { originalPrice: 3200, popular: true }) */
export function plan(
  name: string,
  price: number,
  extra: Partial<Omit<Plan, "id" | "name" | "price">> = {},
): Plan {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return { id, name, price, inStock: true, ...extra };
}

const defaults: Record<DeliveryType, { fields: OrderField[]; faq: FAQ[]; deliveryTime: string; howTo: string[] }> = {
  TOPUP: {
    fields: [playerIdField()],
    faq: topupFaq,
    deliveryTime: "Instant",
    howTo: ["Enter your Player ID and tap “Check name”.", "Choose a package and pay.", "Open the game — your top-up is already there."],
  },
  CODE: {
    fields: [deliveryEmailField],
    faq: codeFaq,
    deliveryTime: "Instant",
    howTo: ["Choose a card value and pay.", "Copy the code from your order page or email.", "Redeem it in the store / app."],
  },
  ACCOUNT: {
    fields: [accountEmailField("your")],
    faq: accountFaq,
    deliveryTime: "5–30 min",
    howTo: ["Choose a plan and enter your account email.", "Pay securely.", "We activate it and notify you on WhatsApp/email."],
  },
  LICENSE: {
    fields: [deliveryEmailField],
    faq: licenseFaq,
    deliveryTime: "Instant",
    howTo: ["Choose a licence and pay.", "Get the key + download link on your order page.", "Follow the activation guide (or ask us for free setup help)."],
  },
  SERVICE: {
    fields: [],
    faq: [],
    deliveryTime: "Within 1 hour",
    howTo: ["Tell us what you need.", "We confirm the price and time on WhatsApp.", "An expert helps you remotely or in person."],
  },
};

type ProductInput = Omit<
  Product,
  "image" | "fields" | "faq" | "howTo" | "deliveryTime" | "region" | "rating" | "reviewCount" | "sold" | "tags" | "description"
> &
  Partial<Pick<Product, "image" | "fields" | "faq" | "howTo" | "deliveryTime" | "region" | "rating" | "reviewCount" | "sold" | "tags" | "description">>;

/** Fills sensible defaults from the delivery type. */
export function product(input: ProductInput): Product {
  const d = defaults[input.deliveryType];
  return {
    image: null,
    region: "Nepal",
    rating: 4.8,
    reviewCount: 0,
    sold: 0,
    tags: [],
    description: input.shortDescription,
    fields: d.fields,
    faq: d.faq,
    howTo: d.howTo,
    deliveryTime: d.deliveryTime,
    ...input,
  };
}
