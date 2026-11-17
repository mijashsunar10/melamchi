"use client";

import { Loader2, UserPlus } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { Field, Input, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { type ActionState, createStaffAction } from "@/server/admin/user-actions";

export function CreateUserForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(createStaffAction, {});
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && state.message) {
      toast({ type: "success", title: state.message });
      formRef.current?.reset();
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={action} className="grid gap-4 sm:grid-cols-2" noValidate>
      {state.error && (
        <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger sm:col-span-2">
          {state.error}
        </p>
      )}
      <Field label="Full name" required>
        {(id) => <Input id={id} name="name" required placeholder="e.g. Sujan K" autoComplete="off" />}
      </Field>
      <Field label="Email" required>
        {(id) => <Input id={id} name="email" type="email" required placeholder="name@topxnepal.com" autoComplete="off" />}
      </Field>
      <Field label="Role" required help="Staff: orders & support. Admin: everything, including team.">
        {(id, d) => <Select id={id} aria-describedby={d} name="role" defaultValue="staff" options={["staff", "admin"]} />}
      </Field>
      <Field label="Temporary password" required help="At least 10 characters. Share it privately; they can change it in My account.">
        {(id, d) => <Input id={id} aria-describedby={d} name="password" type="text" required minLength={10} autoComplete="new-password" />}
      </Field>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
          Add team member
        </button>
      </div>
    </form>
  );
}
