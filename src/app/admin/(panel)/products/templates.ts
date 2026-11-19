// Ready-made order questions, steps and FAQ for the product editor (admin only).

import {
  accountEmailField,
  accountFaq,
  codeFaq,
  deliveryEmailField,
  licenseFaq,
  notesField,
  phoneField,
  playerIdField,
  topupFaq,
  zoneIdField,
} from "@/data/fields";
import type { DeliveryType, FAQ, OrderField } from "@/types/catalog";

export const QUESTION_PRESETS: { label: string; field: OrderField }[] = [
  { label: "Player ID", field: playerIdField() },
  { label: "Zone / Server ID", field: zoneIdField },
  { label: "Email for delivery", field: deliveryEmailField },
  { label: "Account email", field: accountEmailField("your") },
  { label: "WhatsApp number", field: phoneField },
  { label: "Notes", field: notesField },
];

export const TYPE_DEFAULTS: Record<DeliveryType, { fields: OrderField[]; howTo: string[]; faq: FAQ[]; deliveryTime: string }> = {
  TOPUP: {
    fields: [playerIdField()],
    faq: topupFaq,
    deliveryTime: "Instant",
    howTo: ["Enter your Player ID (copy it from your game profile).", "Choose a package and pay.", "Open the game — your top-up is already there."],
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
    fields: [phoneField],
    faq: [],
    deliveryTime: "Within 1 hour",
    howTo: ["Tell us what you need.", "We confirm the price and time on WhatsApp.", "An expert helps you remotely or in person."],
  },
};

export const ANSWER_TYPES: { value: OrderField["type"]; label: string }[] = [
  { value: "text", label: "Short text" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Phone number" },
  { value: "select", label: "Choose from a list" },
  { value: "textarea", label: "Long text" },
];

export const BRAND_COLORS = ["#1d3fbf", "#10A37F", "#F2A900", "#FF6B00", "#E50914", "#1DB954", "#7C3AED", "#DB2777", "#0EA5E9", "#2B2B2B"];
