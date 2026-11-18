import { CreditCard, MousePointerClick, PackageCheck, UserRoundPen } from "lucide-react";
import { SectionHeading } from "./section-heading";

const steps = [
  { icon: MousePointerClick, title: "Pick your game", text: "Choose the UC, diamonds or pack you want." },
  { icon: UserRoundPen, title: "Enter Player ID", text: "Tap “Check name” to be sure it’s you." },
  { icon: CreditCard, title: "Pay locally", text: "eSewa, Khalti, IME Pay or bank." },
  { icon: PackageCheck, title: "Game on", text: "Top-up lands in your account in seconds." },
];

export function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
      <SectionHeading center eyebrow="How it works" title="Top up in 4 easy steps" />
      <ol className="relative mt-12 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        <div aria-hidden className="absolute top-8 right-[12%] left-[12%] hidden h-px bg-[linear-gradient(90deg,var(--border)_50%,transparent_50%)] bg-[length:12px_1px] lg:block" />
        {steps.map(({ icon: I, title, text }, i) => (
          <li key={title} className="relative flex flex-col items-center gap-3 text-center">
            <div className="relative">
              <span className="flex size-16 items-center justify-center rounded-2xl border border-border bg-surface text-primary shadow-card">
                <I className="size-7" strokeWidth={1.75} />
              </span>
              <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-white ring-4 ring-background">
                {i + 1}
              </span>
            </div>
            <h3 className="mt-1 font-display text-base font-extrabold italic sm:text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
