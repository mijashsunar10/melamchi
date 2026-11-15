import { ChevronRight, CreditCard, Loader, PackageCheck, PackageSearch, ReceiptText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { TrackOrder } from "@/components/track/track-order";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Check the status of your TOPX Nepal order with your order reference.",
};

const statuses = [
  { icon: ReceiptText, label: "Received", text: "We got your order on WhatsApp." },
  { icon: CreditCard, label: "Paid", text: "Your payment is confirmed." },
  { icon: Loader, label: "Processing", text: "Your top-up, code or activation is on its way." },
  { icon: PackageCheck, label: "Delivered", text: "Done — check your game, inbox or account." },
];

export default function TrackPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-6 pb-20 sm:px-6 sm:pt-8 sm:pb-28">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground" aria-current="page">
          Track order
        </span>
      </nav>
      <div className="mt-4 mb-8 flex items-center gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
          <PackageSearch className="size-6" />
        </span>
        <div>
          <h1 className="font-display text-3xl leading-tight font-black italic sm:text-4xl">Track your order</h1>
          <p className="text-sm text-muted-foreground">Enter the order ref you received when you ordered.</p>
        </div>
      </div>

      <TrackOrder />

      <section className="mt-12">
        <h2 className="font-display text-xl font-extrabold italic">What the statuses mean</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statuses.map(({ icon: I, label, text }, i) => (
            <li key={label} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                <I className="size-5 text-primary" />
              </div>
              <p className="mt-3 font-semibold">{label}</p>
              <p className="text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-muted-foreground">
          Order taking longer than expected? See our{" "}
          <Link href="/refund-policy" className="font-semibold text-primary hover:underline">
            refund policy
          </Link>{" "}
          or{" "}
          <Link href="/support" className="font-semibold text-primary hover:underline">
            contact support
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
