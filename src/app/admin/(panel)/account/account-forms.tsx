"use client";

import { KeyRound, Loader2, MonitorX } from "lucide-react";
import { useActionState, useEffect, useRef, useTransition } from "react";
import { Field, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { type ActionState, changeOwnPasswordAction, signOutOtherDevicesAction } from "@/server/admin/user-actions";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(changeOwnPasswordAction, {});
  const toast = useToast();
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && state.message) {
      toast({ type: "success", title: state.message });
      ref.current?.reset();
    }
  }, [state, toast]);

  return (
    <form ref={ref} action={action} className="flex max-w-md flex-col gap-4" noValidate>
      {state.error && (
        <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {state.error}
        </p>
      )}
      <Field label="Current password" required>
        {(id) => <Input id={id} name="current" type="password" autoComplete="current-password" required />}
      </Field>
      <Field label="New password" required help="At least 10 characters.">
        {(id, d) => <Input id={id} aria-describedby={d} name="next" type="password" autoComplete="new-password" required minLength={10} />}
      </Field>
      <Field label="Repeat new password" required>
        {(id) => <Input id={id} name="confirm" type="password" autoComplete="new-password" required />}
      </Field>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-fit items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
        Change password
      </button>
    </form>
  );
}

export function SignOutOthersButton({ otherSessions }: { otherSessions: number }) {
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <button
      type="button"
      disabled={pending || otherSessions === 0}
      onClick={() =>
        start(async () => {
          const r = await signOutOtherDevicesAction();
          toast(r.ok ? { type: "success", title: r.message ?? "Done" } : { type: "error", title: r.error ?? "Failed" });
        })
      }
      className="inline-flex h-11 items-center gap-2 rounded-xl border border-input bg-surface px-5 text-sm font-semibold hover:bg-muted disabled:opacity-50"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <MonitorX className="size-4" />}
      Sign out other devices
    </button>
  );
}
