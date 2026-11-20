"use client";

import { Loader2, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { Field, Input } from "@/components/ui/input";
import { type CustomerAuthState, customerLoginAction, registerAction } from "@/server/auth/customer-actions";

const GOOGLE_ERRORS: Record<string, string> = {
  google: "Google sign-in didn't work. Please try again.",
  "google-off": "Google sign-in is not set up yet. Please use email and password.",
  "google-staff": "This is a team account. Please log in at /admin/login.",
  "google-blocked": "This account is deactivated. Please contact us.",
};

export function AuthForm({ mode, next = "/account", error }: { mode: "login" | "register"; next?: string; error?: string }) {
  const [state, action, pending] = useActionState<CustomerAuthState, FormData>(
    mode === "login" ? customerLoginAction : registerAction,
    { error: error ? GOOGLE_ERRORS[error] : undefined },
  );
  const q = next !== "/account" ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <a
        href={`/auth/google?next=${encodeURIComponent(next)}`}
        className="inline-flex h-12 items-center justify-center gap-3 rounded-xl border border-border bg-surface text-sm font-bold hover:bg-muted"
      >
        <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </svg>
        Continue with Google
      </a>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or with email <span className="h-px flex-1 bg-border" />
      </div>
      {state.error && (
        <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {state.error}
        </p>
      )}
      {mode === "register" && (
        <Field label="Full name">
          {(id) => <Input id={id} name="name" autoComplete="name" defaultValue={state.name} placeholder="Your name" icon={<User />} />}
        </Field>
      )}
      <Field label="Email">
        {(id) => (
          <Input id={id} name="email" type="email" autoComplete="email" defaultValue={state.email} placeholder="you@gmail.com" icon={<Mail />} />
        )}
      </Field>
      {mode === "login" && (
        <Link href="/forgot-password" className="-mb-3 self-end text-xs font-semibold text-primary hover:underline">
          Forgot password?
        </Link>
      )}
      <Field label="Password" help={mode === "register" ? "At least 8 characters." : undefined}>
        {(id) => (
          <Input
            id={id}
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder="••••••••"
            icon={<Lock />}
          />
        )}
      </Field>
      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        {mode === "login" ? "Log in" : "Create account"}
      </button>
      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href={`/register${q}`} className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href={`/login${q}`} className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
