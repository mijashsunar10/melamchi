import { ProductCardSkeleton, Skeleton } from "@/components/ui/skeleton";

/** Shown instantly while a section page loads. */
export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-6 pb-20 sm:px-6 sm:pt-8" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-4 w-40" />
      <div className="flex items-center gap-4">
        <Skeleton className="size-11 rounded-xl" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
        {Array.from({ length: 10 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
