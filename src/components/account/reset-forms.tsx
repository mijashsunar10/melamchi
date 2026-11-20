"use client";

import { Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { Field, Input } from "@/components/ui/input";
import { forgotPasswordAction, type ResetState, resetPasswordAction } from "@/server/auth/customer-actions";

const btn = "mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60";
const Err = ({ msg }: { msg?: string }) =>
  msg ? <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">{msg}</p> : null;

export function ForgotForm() {
  const [state, action, pending] = useActionState<ResetState, FormData>(forgotPasswordAction, {});
  if (state.sent)
    return (
      <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium">
        If an account exists for that email, we&apos;ve sent a reset link. Check your inbox (and spam). The link works for 1 hour.
      </p>
    );
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <Err msg={state.error} />
      <Field label="Email">{(id) => <Input id={id} name="email" type="email" autoComplete="email" placeholder="you@gmail.com" icon={<Mail />} />}</Field>
      <button type="submit" disabled={pending} className={btn}>
        {pending && <Loader2 className="size-4 animate-spin" />} Send reset link
      </button>
      <Link href="/login" className="text-center text-sm font-semibold text-primary hover:underline">Back to log in</Link>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ResetState, FormData>(resetPasswordAction, {});
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="token" value={token} />
      <Err msg={state.error} />
      <Field label="New password" help="At least 8 characters.">
        {(id) => <Input id={id} name="password" type="password" autoComplete="new-password" placeholder="••••••••" icon={<Lock />} />}
      </Field>
      <Field label="Confirm new password">
        {(id) => <Input id={id} name="confirm" type="password" autoComplete="new-password" placeholder="••••••••" icon={<Lock />} />}
      </Field>
      <button type="submit" disabled={pending} className={btn}>
        {pending && <Loader2 className="size-4 animate-spin" />} Set new password
      </button>
    </form>
  );
}
