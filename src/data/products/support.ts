import type { OrderField } from "@/types/catalog";
import { notesField, phoneField } from "../fields";
import { plan, product } from "./helpers";

const deviceField: OrderField = {
  name: "device",
  label: "Device",
  type: "select",
  required: true,
  options: ["Windows PC / Laptop", "Mac", "Android phone", "iPhone", "Other"],
};

const issueField: OrderField = {
  name: "issue",
  label: "What do you need help with?",
  type: "textarea",
  placeholder: "Describe the problem or what you want installed…",
  required: true,
};

const serviceFields = [phoneField, deviceField, issueField];

export const support = [
  product({
    slug: "software-installation", name: "Software Installation & Setup", brand: "TOPX Support", domain: "support", category: "setup",
    deliveryType: "SERVICE", initials: "⚙", color: "#10B981",
    shortDescription: "We install and activate Windows, Office, antivirus or any software you bought.",
    rating: 4.9, reviewCount: 140, sold: 900,
    fields: serviceFields,
    plans: [plan("Single app", 300, { popular: true }), plan("Windows + Office full setup", 900)],
  }),
  product({
    slug: "remote-assistance", name: "Remote Assistance (AnyDesk)", brand: "TOPX Support", domain: "support", category: "remote-help",
    deliveryType: "SERVICE", initials: "RA", color: "#0EA5E9",
    shortDescription: "An expert connects to your PC remotely to fix errors, slowness or activation issues.",
    reviewCount: 95, sold: 610,
    fields: serviceFields,
    plans: [plan("30 minutes", 400, { popular: true }), plan("1 hour", 700)],
  }),
  product({
    slug: "account-recovery-help", name: "Game & App Account Help", brand: "TOPX Support", domain: "support", category: "remote-help",
    deliveryType: "SERVICE", initials: "AH", color: "#8B5CF6",
    shortDescription: "Help with game account linking, recovery steps and app subscription problems.",
    reviewCount: 48, sold: 300,
    fields: serviceFields,
    plans: [plan("Consultation", 250, { popular: true })],
  }),
  product({
    slug: "business-bulk-orders", name: "Business & Bulk Orders", brand: "TOPX Business", domain: "support", category: "business",
    deliveryType: "SERVICE", initials: "B2B", color: "#1D3FBF",
    shortDescription: "Bulk licences, team subscriptions and reseller pricing for companies and shops.",
    reviewCount: 20, sold: 85, tags: ["new"],
    deliveryTime: "Quote within 2 hours",
    fields: [
      { name: "company", label: "Company / shop name", type: "text", required: true },
      phoneField,
      { name: "requirement", label: "What do you need?", type: "textarea", placeholder: "e.g. 20× Microsoft 365 Business, 50× Free Fire weekly membership", required: true },
      notesField,
    ],
    plans: [plan("Request a quote", 0, { popular: true })],
  }),
];
