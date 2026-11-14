import { ProductCardSkeleton, Skeleton } from "@/components/ui/skeleton";

/** Shown instantly while a section page loads. */
export default function Loading() {
  return (
    <div className="flex flex-col gap-16 pb-20" aria-busy="true" aria-label="Loading">
      <section className="bg-brand-navy-deep">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 pt-8 pb-20 sm:px-6 sm:pt-10">
          <Skeleton className="h-4 w-32 bg-white/10 [background-image:none]" />
          <Skeleton className="mt-6 size-14 rounded-2xl bg-white/10 [background-image:none]" />
          <Skeleton className="h-12 w-72 bg-white/10 [background-image:none]" />
          <Skeleton className="h-5 w-full max-w-lg bg-white/10 [background-image:none]" />
          <Skeleton className="h-5 w-2/3 max-w-md bg-white/10 [background-image:none]" />
        </div>
      </section>
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-3 px-4 sm:gap-5 sm:px-6 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
