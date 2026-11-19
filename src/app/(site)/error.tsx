"use client";

import { Button, ButtonLink } from "@/components/ui/button";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <p className="font-display text-5xl font-black text-accent italic">Oops!</p>
      <h1 className="mt-4 font-display text-2xl font-black">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">Please try again. If it keeps happening, contact us on WhatsApp.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="outline">
          Go home
        </ButtonLink>
      </div>
    </div>
  );
}
