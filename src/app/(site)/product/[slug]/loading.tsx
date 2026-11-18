import { ProductCardSkeleton, Skeleton } from "@/components/ui/skeleton";

/** Shown instantly while a product page loads. */
export default function Loading() {
  return (
    <div className="flex flex-col gap-16 pb-20" aria-busy="true" aria-label="Loading">
      <section className="bg-surface-2 dark:bg-brand-navy-deep">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 pt-8 pb-20 sm:px-6 sm:pt-10">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-6 size-14 rounded-2xl" />
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-5 w-full max-w-lg" />
          <Skeleton className="h-5 w-2/3 max-w-md" />
        </div>
      </section>
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-3 px-4 sm:gap-5 sm:px-6 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 10 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
