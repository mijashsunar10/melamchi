import {
  AppWindow, Bot, Building2, Cloud, Code, Cpu, CreditCard, FileText, Gamepad2, GraduationCap, Headset,
  Image as ImageIcon, LifeBuoy, type LucideProps, Mic, Monitor, Package, Palette, PenLine, Radio,
  ShieldCheck, ShoppingBag, Smartphone, Tv, Wrench, Gift, RotateCcw,
} from "lucide-react";
import type { IconName } from "@/types/catalog";

const icons = {
  AppWindow, Bot, Building2, Cloud, Code, Cpu, CreditCard, FileText, Gamepad2, GraduationCap, Headset,
  Image: ImageIcon, LifeBuoy, Mic, Monitor, Package, Palette, PenLine, Radio, ShieldCheck, ShoppingBag,
  Smartphone, Tv, Wrench, Gift, RotateCcw,
} satisfies Record<IconName, unknown>;

/** Every icon name the admin can pick for sections & categories. */
export const ICON_NAMES = Object.keys(icons) as IconName[];

/** Plain-language names shown in the admin icon picker. */
export const ICON_LABELS: Record<IconName, string> = {
  AppWindow: "App window",
  Bot: "Robot / AI",
  Building2: "Business",
  Cloud: "Cloud",
  Code: "Code",
  Cpu: "Chip / AI",
  CreditCard: "Card / payment",
  FileText: "Document",
  Gamepad2: "Game controller",
  GraduationCap: "Learning",
  Headset: "Support headset",
  Image: "Picture",
  LifeBuoy: "Help",
  Mic: "Microphone",
  Monitor: "Computer screen",
  Package: "Box",
  Palette: "Design",
  PenLine: "Writing",
  Radio: "Live / streaming",
  ShieldCheck: "Security",
  ShoppingBag: "Shopping bag",
  Smartphone: "Phone",
  Tv: "TV",
  Wrench: "Tools / setup",
  Gift: "Gift",
  RotateCcw: "Refund / return",
};

export function Icon({ name, ...props }: LucideProps & { name: IconName }) {
  const C = icons[name];
  return <C {...props} />;
}
