import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/server/auth/dal";
import { AuthForm } from "./auth-form";

const clean = (n: unknown) => (typeof n === "string" && n.startsWith("/") && !n.startsWith("//") ? n : "/account");

async function Inner({ mode, searchParams }: { mode: "login" | "register"; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [sp, user] = await Promise.all([searchParams, getCurrentUser()]);
  const next = clean(sp.next);
  if (user) redirect(next);
  return <AuthForm mode={mode} next={next} />;
}

export function AuthPage({ mode, searchParams }: { mode: "login" | "register"; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12 sm:py-16">
      <div className="rounded-3xl border border-border bg-surface p-7 shadow-card-hover sm:p-9">
        <h1 className="font-display text-2xl font-black">{mode === "login" ? "Log in" : "Create your account"}</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          {mode === "login" ? "Log in to buy top-ups and see your orders." : "Register to buy top-ups and track every order."}
        </p>
        <Suspense fallback={<AuthForm mode={mode} />}>
          <Inner mode={mode} searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
