import type { Metadata } from "next";
import { ForgotForm } from "@/components/account/reset-forms";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12 sm:py-16">
      <div className="rounded-3xl border border-border bg-surface p-7 shadow-card-hover sm:p-9">
        <h1 className="font-display text-2xl font-black">Forgot password</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">Enter your email and we&apos;ll send you a link to set a new password.</p>
        <ForgotForm />
      </div>
    </div>
  );
}
