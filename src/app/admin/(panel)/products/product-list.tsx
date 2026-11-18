"use client";

import { Copy, Eye, EyeOff, Loader2, MoreHorizontal, PackageSearch, Pencil, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState, useTransition } from "react";
import { SecondaryButton } from "@/components/admin/form-bits";
import { Cover } from "@/components/product/cover";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { formatNPR } from "@/lib/format";
import { deleteProductAction, duplicateProductAction, setProductVisibleAction } from "@/server/admin/product-actions";
import type { ProductActionResult } from "@/server/admin/product-types";

export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  brand: string;
  image: string | null;
  color: string;
  domainSlug: string;
  domainName: string;
  categoryName: string | null;
  isActive: boolean;
  planCount: number;
  outOfStock: number;
  minPrice: number | null;
  maxPrice: number | null;
}

type Status = "all" | "visible" | "hidden" | "stock";

const priceText = (p: ProductRow) =>
  p.minPrice == null ? "Price on request" : p.minPrice === p.maxPrice ? formatNPR(p.minPrice) : `${formatNPR(p.minPrice)} – ${formatNPR(p.maxPrice!)}`;

export function ProductList({
  products,
  sections,
  canDelete,
}: {
  products: ProductRow[];
  sections: { slug: string; name: string }[];
  canDelete: boolean;
}) {
  const [query, setQuery] = useState("");
  const q = useDeferredValue(query.trim().toLowerCase());
  const [section, setSection] = useState("all");
  const [status, setStatus] = useState<Status>("all");

  const shown = useMemo(
    () =>
      products.filter(
        (p) =>
          (section === "all" || p.domainSlug === section) &&
          (status === "all" ||
            (status === "visible" && p.isActive) ||
            (status === "hidden" && !p.isActive) ||
            (status === "stock" && p.outOfStock > 0)) &&
          (!q || `${p.name} ${p.brand} ${p.categoryName ?? ""}`.toLowerCase().includes(q)),
      ),
    [products, section, status, q],
  );

  const counts = {
    all: products.length,
    visible: products.filter((p) => p.isActive).length,
    hidden: products.filter((p) => !p.isActive).length,
    stock: products.filter((p) => p.outOfStock > 0).length,
  };
  const statusTabs: { value: Status; label: string }[] = [
    { value: "all", label: "All" },
    { value: "visible", label: "On website" },
    { value: "hidden", label: "Hidden" },
    { value: "stock", label: "Out of stock" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1">
          <Input
            type="search"
            icon={<Search />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or brand…"
            aria-label="Search products"
          />
        </div>
        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          aria-label="Section"
          className="h-11 rounded-lg border border-input bg-surface px-3.5 text-sm font-medium outline-none focus:border-ring focus:ring-3 focus:ring-ring/20 lg:w-56"
        >
          <option value="all">All sections</option>
          {sections.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div role="tablist" aria-label="Filter" className="flex gap-2 overflow-x-auto pb-1">
        {statusTabs.map((t) => (
          <button
            key={t.value}
            role="tab"
            type="button"
            aria-selected={status === t.value}
            onClick={() => setStatus(t.value)}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
              status === t.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface hover:bg-muted",
            )}
          >
            {t.label}
            <span className={cn("rounded-full px-1.5 text-xs", status === t.value ? "bg-white/20" : "bg-muted")}>{counts[t.value]}</span>
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        {shown.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
            <PackageSearch className="size-10 text-muted-foreground/60" />
            <p className="font-semibold">No products found</p>
            <p className="text-sm text-muted-foreground">Try another word or clear the filters.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border" data-product-list>
            {shown.map((p) => (
              <ProductRowItem key={p.id} product={p} canDelete={canDelete} />
            ))}
          </ul>
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Showing {shown.length} of {products.length} products
      </p>
    </div>
  );
}

function ProductRowItem({ product: p, canDelete }: { product: ProductRow; canDelete: boolean }) {
  const toast = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [menu, setMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const run = (fn: () => Promise<ProductActionResult>, after?: (r: ProductActionResult) => void) => {
    setMenu(false);
    start(async () => {
      const r = await fn();
      toast(r.ok ? { type: "success", title: r.message ?? "Done" } : { type: "error", title: r.error ?? "Something went wrong" });
      if (r.ok) after?.(r);
    });
  };

  const item = "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm hover:bg-muted";

  return (
    <li className={cn("flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3.5 sm:flex-nowrap sm:px-5", !p.isActive && "bg-muted/30")} data-product={p.slug}>
      <Link href={`/admin/products/${p.id}`} className="flex min-w-0 flex-1 items-center gap-4">
        <Cover product={p} size="sm" className={cn("size-14 shrink-0 rounded-xl", !p.isActive && "opacity-50 grayscale")} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate font-semibold">{p.name}</span>
          </span>
          <span className="block truncate text-sm text-muted-foreground">
            {p.domainName}
            {p.categoryName && ` · ${p.categoryName}`}
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="font-semibold text-foreground">{priceText(p)}</span>
            <span className="text-muted-foreground">
              {p.planCount} {p.planCount === 1 ? "package" : "packages"}
            </span>
            {p.outOfStock > 0 && (
              <span className="rounded bg-warning/15 px-1.5 py-0.5 font-semibold text-amber-700 dark:text-warning">
                {p.outOfStock === p.planCount ? "Out of stock" : `${p.outOfStock} out of stock`}
              </span>
            )}
          </span>
        </span>
      </Link>

      <div className="flex w-full items-center gap-2 sm:w-auto">
        <button
          type="button"
          onClick={() => run(() => setProductVisibleAction(p.id, !p.isActive))}
          disabled={pending}
          title={p.isActive ? "Click to hide from the website" : "Click to show on the website"}
          className={cn(
            "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors sm:w-36 sm:flex-none",
            p.isActive ? "bg-success/12 text-success hover:bg-success/20" : "bg-muted text-muted-foreground hover:bg-muted/70",
          )}
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : p.isActive ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          {p.isActive ? "On website" : "Hidden"}
        </button>
        <Link
          href={`/admin/products/${p.id}`}
          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-input px-3 text-sm font-semibold hover:bg-muted sm:flex-none"
        >
          <Pencil className="size-4" /> Edit
        </Link>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenu((m) => !m)}
            aria-label={`More actions for ${p.name}`}
            aria-expanded={menu}
            className="flex size-9 items-center justify-center rounded-lg hover:bg-muted"
          >
            <MoreHorizontal className="size-5" />
          </button>
          {menu && (
            <>
              <button type="button" aria-hidden tabIndex={-1} className="fixed inset-0 z-10 cursor-default" onClick={() => setMenu(false)} />
              <div role="menu" className="absolute top-full right-0 z-20 mt-1 w-52 rounded-xl border border-border bg-surface p-1.5 shadow-card-hover">
                <a role="menuitem" href={`/product/${p.slug}`} target="_blank" rel="noreferrer" className={item} onClick={() => setMenu(false)}>
                  <Eye className="size-4" /> See on website
                </a>
                <button role="menuitem" type="button" className={item} onClick={() => run(() => duplicateProductAction(p.id), (r) => router.push(`/admin/products/${r.id}`))}>
                  <Copy className="size-4" /> Make a copy
                </button>
                {canDelete && (
                  <button
                    role="menuitem"
                    type="button"
                    className={cn(item, "text-danger hover:bg-danger/10")}
                    onClick={() => {
                      setMenu(false);
                      setConfirmDelete(true);
                    }}
                  >
                    <Trash2 className="size-4" /> Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {confirmDelete && <DeleteProductDialog name={p.name} id={p.id} onClose={() => setConfirmDelete(false)} />}
    </li>
  );
}

export function DeleteProductDialog({ id, name, onClose, onDeleted }: { id: string; name: string; onClose: () => void; onDeleted?: () => void }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  return (
    <Dialog open onClose={onClose} title={`Delete “${name}”?`}>
      <div className="flex flex-col gap-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          The product and all its packages will be <strong className="text-foreground">removed for good</strong>. If you only want to stop selling it for
          now, choose <strong className="text-foreground">Hide</strong> instead — you can show it again any time.
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await deleteProductAction(id);
                if (r.error) toast({ type: "error", title: r.error });
                else {
                  toast({ type: "success", title: r.message ?? "Deleted." });
                  onClose();
                  onDeleted?.();
                }
              })
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-danger px-5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            Yes, delete
          </button>
        </div>
      </div>
    </Dialog>
  );
}
