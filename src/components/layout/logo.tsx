import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

/** MT mark + TOPX NEPAL wordmark. `onDark` forces the white version (hero/footer). */
export function Logo({ onDark, className }: { onDark?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label="TOPX Nepal — home" className={cn("group flex shrink-0 items-center gap-2.5", className)}>
      {onDark ? (
        <Image src="/brand/logo-mt-dark.svg" alt="" width={44} height={44} className="size-10 sm:size-11" />
      ) : (
        <>
          <Image src="/brand/logo-mt.svg" alt="" width={44} height={44} className="size-10 sm:size-11 dark:hidden" />
          <Image src="/brand/logo-mt-dark.svg" alt="" width={44} height={44} className="hidden size-10 sm:size-11 dark:block" />
        </>
      )}
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[1.6rem] font-black italic tracking-tight",
            onDark ? "text-white" : "text-primary dark:text-white",
          )}
        >
          TOP<span className="text-accent">X</span>
        </span>
        <span
          className={cn(
            "-mt-0.5 pl-1 font-display text-[0.6rem] font-extrabold italic tracking-[0.5em]",
            onDark ? "text-white/90" : "text-primary dark:text-white/90",
          )}
        >
          NEPAL
        </span>
      </span>
    </Link>
  );
}
