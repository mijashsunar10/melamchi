const npr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** 1450 → "Rs 1,450" (Nepali/Indian digit grouping) */
export function formatNPR(amount: number): string {
  return `Rs ${npr.format(amount)}`;
}

/** 3200 → "3.2k" */
export function formatCompact(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, "")}k` : String(n);
}

export function discountPercent(price: number, originalPrice?: number): number | null {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

/** 50000 → "50,000+", 5200 → "5,200+" */
export function formatCountPlus(n: number): string {
  return `${npr.format(n)}+`;
}
