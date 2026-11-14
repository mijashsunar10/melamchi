import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import logo from "../../../public/brand/topx-logo.png";

/** Official TOPX Nepal logo. */
export function Logo({ className, priority = true }: { className?: string; priority?: boolean }) {
  return (
    <Link href="/" aria-label="TOPX Nepal — home" className={cn("flex shrink-0 items-center", className)}>
      <Image
        src={logo}
        alt="TOPX Nepal — Gaming Topup, AI Tools & Subscription, Giftcard"
        priority={priority}
        sizes="200px"
        className="h-12 w-auto sm:h-14"
      />
    </Link>
  );
}
