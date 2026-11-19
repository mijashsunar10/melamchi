import "server-only";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { UserRole } from "@/server/db/schema";
import { getSessionToken, type SessionUser, validateSessionToken } from "./session";

// Data Access Layer for auth: the ONLY place pages read "who is logged in".
// Proxy (src/proxy.ts) only does a fast cookie check; the real check is here.

/** Current user or null. Cached for the duration of one request. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = await getSessionToken();
  if (!token) return null;
  // the session check uses the current time → it must run per request, never while prerendering
  await connection();
  const result = await validateSessionToken(token);
  return result?.user ?? null;
});

/** Use in admin pages and actions: returns the user or redirects to the login page. */
export async function requireRole(roles: UserRole[] = ["admin"]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!roles.includes(user.role)) {
    // staff opening an admin-only page → back to the dashboard; anyone else → login
    redirect(user.role === "staff" ? "/admin" : "/admin/login?error=forbidden");
  }
  return user;
}

/** Admin panel access: admins and staff. */
export const requireStaff = () => requireRole(["admin", "staff"]);
