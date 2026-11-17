"use client";

import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useActionState, useState } from "react";
import { Field, Input } from "@/components/ui/input";
import { type LoginState, loginAction } from "@/server/auth/actions";

/** `next`: where to go after login · `forbidden`: signed in without admin access */
export function LoginForm({ next = "/admin", forbidden = false }: { next?: string; forbidden?: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  const [show, setShow] = useState(false);
  const notice = forbidden ? "Your account doesn't have access to the admin panel." : null;

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="next" value={next} />

      {(state.error || notice) && (
        <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {state.error ?? notice}
        </p>
      )}

      <Field label="Email">
        {(id) => (
          <Input
            id={id}
            name="email"
            type="email"
            autoComplete="username"
            required
            defaultValue={state.email}
            placeholder="admin@topxnepal.com"
            icon={<Mail />}
          />
        )}
      </Field>

      <Field label="Password">
        {(id) => (
          <div className="relative">
            <Input
              id={id}
              name="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              icon={<Lock />}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        )}
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
