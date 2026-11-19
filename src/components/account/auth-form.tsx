"use client";

import { Loader2, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { Field, Input } from "@/components/ui/input";
import { type CustomerAuthState, customerLoginAction, registerAction } from "@/server/auth/customer-actions";

export function AuthForm({ mode, next = "/account" }: { mode: "login" | "register"; next?: string }) {
  const [state, action, pending] = useActionState<CustomerAuthState, FormData>(
    mode === "login" ? customerLoginAction : registerAction,
    {},
  );
  const q = next !== "/account" ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="next" value={next} />
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
