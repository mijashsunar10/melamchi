"use client";

import { KeyRound, Loader2, MoreHorizontal, Power, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  type ActionState,
  deleteUserAction,
  resetPasswordAction,
  setActiveAction,
  setRoleAction,
} from "@/server/admin/user-actions";

interface Props {
  user: { id: string; name: string; email: string; role: "admin" | "staff" | "customer"; isActive: boolean };
  isMe: boolean;
}

export function UserRowActions({ user, isMe }: Props) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [menu, setMenu] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  if (isMe) return <span className="text-xs text-muted-foreground">You</span>;

  const run = (fn: () => Promise<ActionState>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setMenu(false);
    start(async () => {
      const r = await fn();
      toast(r.ok ? { type: "success", title: r.message ?? "Done" } : { type: "error", title: r.error ?? "Something went wrong" });
    });
  };

  const item = "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm hover:bg-muted";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenu((m) => !m)}
        aria-label={`Actions for ${user.name}`}
        aria-expanded={menu}
        disabled={pending}
        className="flex size-9 items-center justify-center rounded-lg hover:bg-muted disabled:opacity-50"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal className="size-5" />}
      </button>

      {menu && (
        <>
          <button type="button" aria-hidden tabIndex={-1} className="fixed inset-0 z-10 cursor-default" onClick={() => setMenu(false)} />
          <div role="menu" className="absolute top-full right-0 z-20 mt-1 w-56 rounded-xl border border-border bg-surface p-1.5 shadow-card-hover">
            <button role="menuitem" type="button" className={item} onClick={() => run(() => setActiveAction(user.id, !user.isActive))}>
              <Power className="size-4" /> {user.isActive ? "Deactivate" : "Re-activate"}
            </button>
            <button
              role="menuitem"
              type="button"
              className={item}
              onClick={() => run(() => setRoleAction(user.id, user.role === "admin" ? "staff" : "admin"))}
            >
              {user.role === "admin" ? <UserRound className="size-4" /> : <ShieldCheck className="size-4" />}
              Make {user.role === "admin" ? "staff" : "admin"}
            </button>
            <button
              role="menuitem"
              type="button"
              className={item}
              onClick={() => {
                setMenu(false);
                setNewPassword("");
                setResetOpen(true);
              }}
            >
              <KeyRound className="size-4" /> Reset password
            </button>
            <button
              role="menuitem"
              type="button"
              className={`${item} text-danger`}
              onClick={() => run(() => deleteUserAction(user.id), `Delete ${user.name} (${user.email})? This can't be undone.`)}
            >
              <Trash2 className="size-4" /> Delete
            </button>
          </div>
        </>
      )}

      <Dialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title={`Reset password — ${user.name}`}
        description="They will be signed out everywhere and need the new password to sign in."
        footer={
          <>
            <button type="button" className="h-10 rounded-lg px-4 text-sm font-semibold hover:bg-muted" onClick={() => setResetOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              disabled={newPassword.length < 10 || pending}
              className="h-10 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-50"
              onClick={() => {
                setResetOpen(false);
                run(() => resetPasswordAction(user.id, newPassword));
              }}
            >
              Reset password
            </button>
          </>
        }
      >
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          New password (min 10 characters)
          <Input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
        </label>
      </Dialog>
    </div>
  );
}
