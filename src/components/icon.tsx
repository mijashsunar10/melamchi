import {
  AppWindow, Bot, Building2, Cloud, Code, Cpu, CreditCard, FileText, Gamepad2, GraduationCap, Headset,
  Image as ImageIcon, LifeBuoy, type LucideProps, Mic, Monitor, Package, Palette, PenLine, Radio,
  ShieldCheck, ShoppingBag, Smartphone, Tv, Wrench, Gift,
} from "lucide-react";
import type { IconName } from "@/types/catalog";

const icons = {
  AppWindow, Bot, Building2, Cloud, Code, Cpu, CreditCard, FileText, Gamepad2, GraduationCap, Headset,
  Image: ImageIcon, LifeBuoy, Mic, Monitor, Package, Palette, PenLine, Radio, ShieldCheck, ShoppingBag,
  Smartphone, Tv, Wrench, Gift,
} satisfies Record<IconName, unknown>;

export function Icon({ name, ...props }: LucideProps & { name: IconName }) {
  const C = icons[name];
  return <C {...props} />;
}
