import { cn } from "@/lib/cn";

const styles = {
  pending: ["Waiting for confirmation", "bg-amber-500/15 text-amber-600 dark:text-amber-400"],
  processing: ["Processing", "bg-primary/15 text-primary"],
  delivered: ["Delivered", "bg-success/15 text-success"],
  failed: ["Failed", "bg-danger/15 text-danger"],
  refunded: ["Refunded", "bg-muted text-muted-foreground"],
} as const;

export function OrderStatusBadge({ status }: { status: keyof typeof styles }) {
  const [label, cls] = styles[status];
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap", cls)}>{label}</span>;
}
