import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetForm } from "@/components/account/reset-forms";

export const metadata: Metadata = { title: "Set new password", robots: { index: false } };

async function Inner({ searchParams }: { searchParams: PageProps<"/reset-password">["searchParams"] }) {
  const { token } = await searchParams;
  return <ResetForm token={typeof token === "string" ? token : ""} />;
}

export default function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12 sm:py-16">
      <div className="rounded-3xl border border-border bg-surface p-7 shadow-card-hover sm:p-9">
        <h1 className="font-display text-2xl font-black">Set a new password</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">Choose a new password for your account.</p>
        <Suspense>
          <Inner searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
