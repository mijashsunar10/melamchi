import { LogIn, User, UserPlus } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/server/auth/dal";

export function GuestButtons() {
  return (
    <>
      <Link href="/login" className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-semibold hover:bg-muted sm:px-3">
        <LogIn className="size-4" /> <span className="hidden sm:inline">Login</span>
      </Link>
      <Link
        href="/register"
        className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-2 text-sm font-bold text-white hover:opacity-90 sm:px-4"
      >
        <UserPlus className="size-4" /> <span className="hidden sm:inline">Register</span>
      </Link>
    </>
  );
}

/** Reads the session cookie → must sit inside Suspense (fallback: GuestButtons). */
export async function AccountButtons() {
  const user = await getCurrentUser();
  if (!user) return <GuestButtons />;
  const href = user.role === "customer" ? "/account" : "/admin";
  return (
    <Link href={href} className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover sm:px-4">
      <User className="size-4" /> <span className="hidden sm:inline">{user.role === "customer" ? "My account" : "Admin"}</span>
    </Link>
  );
}
