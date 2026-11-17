import { LogOut } from "lucide-react";
import { logoutAction } from "@/server/auth/actions";
import type { SessionUser } from "@/server/auth/session";

/** Signed-in user + sign out, in the admin top bar. */
export function UserMenu({ user }: { user: SessionUser }) {
  const initials = user.name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-2 border-l border-border pl-2 sm:pl-3">
      <span className="flex size-9 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white">{initials}</span>
      <span className="hidden leading-tight md:block">
        <span className="block text-sm font-semibold">{user.name}</span>
        <span className="block text-[11px] text-muted-foreground capitalize">{user.role}</span>
      </span>
      <form action={logoutAction}>
        <button type="submit" aria-label="Sign out" title="Sign out" className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-danger">
          <LogOut className="size-[18px]" />
        </button>
      </form>
    </div>
  );
}

export function UserMenuSkeleton() {
  return <span className="skeleton ml-2 size-9 rounded-full" />;
}
