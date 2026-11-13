import Image from "next/image";
import Link from "next/link";

// Temporary placeholder — the real home page is built in Phase 3 (see WORKFLOW.md).
export default function Home() {
  return (
    <main className="bg-hero flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center text-white">
      <Image
        src="/brand/logo-full-dark.svg"
        alt="Melamchi Tech · TOPX Nepal"
        width={420}
        height={140}
        priority
        className="h-auto w-72 sm:w-[420px]"
      />
      <h1 className="text-3xl font-black italic sm:text-5xl">
        Everything Digital. <span className="text-gradient">One Place.</span>
      </h1>
      <p className="max-w-md text-brand-blue-200">
        AI Tools · Gaming Top-up · Gift Cards · Software & Apps · Digital Products · Support
      </p>
      <p className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-brand-blue-200">
        🚧 Site under construction
      </p>
      <Link
        href="/styleguide"
        className="rounded-full bg-cta-gradient px-6 py-3 font-semibold shadow-glow-orange transition-transform hover:-translate-y-0.5"
      >
        View design styleguide →
      </Link>
    </main>
  );
}
