import type { Product } from "@/types/catalog";
import { aiTools } from "./ai-tools";
import { digitalProducts } from "./digital-products";
import { gaming } from "./gaming";
import { giftCards } from "./gift-cards";
import { software } from "./software";
import { support } from "./support";

export const products: Product[] = [
  ...aiTools,
  ...gaming,
  ...giftCards,
  ...software,
  ...digitalProducts,
  ...support,
];
