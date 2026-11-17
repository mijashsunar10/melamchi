"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole, requireStaff } from "@/server/auth/dal";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { getSessionToken, hashToken, invalidateAllSessions } from "@/server/auth/session";
import { db, schema } from "@/server/db";
import { countActiveAdmins } from "./users";

// Staff & account management. Every action checks the signed-in user's role first.

export interface ActionState {
  ok?: boolean;
  error?: string;
  message?: string;
}

const { users, sessions } = schema;
const password = z.string().min(10, "Password must be at least 10 characters.").max(200);

// ---------- Admin only: manage staff ----------

const createSchema = z.object({
  name: z.string().trim().min(2, "Enter a name.").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  role: z.enum(["admin", "staff"]),
  password,
});

export async function createStaffAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(["admin"]);
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { name, email, role, password: pw } = parsed.data;

  const [exists] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (exists) return { error: "An account with this email already exists." };

  await db.insert(users).values({ name, email, role, passwordHash: await hashPassword(pw) });
  revalidatePath("/admin/users");
  return { ok: true, message: `${role === "admin" ? "Admin" : "Staff"} account created for ${email}.` };
}

/** Guards shared by actions that change another account. */
async function guardTarget(targetId: string, { demotesAdmin }: { demotesAdmin: boolean }) {
  const me = await requireRole(["admin"]);
  if (targetId === me.id) return { me, error: "You can't do this to your own account here — use My account." };
  const [target] = await db.select().from(users).where(eq(users.id, targetId)).limit(1);
  if (!target) return { me, error: "Account not found." };
  if (demotesAdmin && target.role === "admin" && target.isActive && (await countActiveAdmins()) <= 1) {
    return { me, error: "There must be at least one active admin." };
  }
  return { me, target };
}

export async function setActiveAction(userId: string, active: boolean): Promise<ActionState> {
  const g = await guardTarget(userId, { demotesAdmin: !active });
  if (g.error) return { error: g.error };
  await db.update(users).set({ isActive: active, updatedAt: new Date() }).where(eq(users.id, userId));
  if (!active) await invalidateAllSessions(userId); // sign them out everywhere
  revalidatePath("/admin/users");
  return { ok: true, message: active ? "Account re-activated." : "Account deactivated and signed out." };
}

export async function setRoleAction(userId: string, role: "admin" | "staff"): Promise<ActionState> {
  const g = await guardTarget(userId, { demotesAdmin: role !== "admin" });
  if (g.error) return { error: g.error };
  await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));
  revalidatePath("/admin/users");
  return { ok: true, message: `Role changed to ${role}.` };
}

export async function resetPasswordAction(userId: string, newPassword: string): Promise<ActionState> {
  const g = await guardTarget(userId, { demotesAdmin: false });
  if (g.error) return { error: g.error };
  const parsed = password.safeParse(newPassword);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  await db.update(users).set({ passwordHash: await hashPassword(parsed.data), updatedAt: new Date() }).where(eq(users.id, userId));
  await invalidateAllSessions(userId);
  revalidatePath("/admin/users");
  return { ok: true, message: "Password reset. They have been signed out everywhere." };
}

export async function deleteUserAction(userId: string): Promise<ActionState> {
  const g = await guardTarget(userId, { demotesAdmin: true });
  if (g.error) return { error: g.error };
  await db.delete(users).where(eq(users.id, userId)); // sessions are removed by ON DELETE CASCADE
  revalidatePath("/admin/users");
  return { ok: true, message: "Account deleted." };
}

// ---------- Any signed-in admin/staff: own account ----------

const changeSchema = z
  .object({
    current: z.string().min(1, "Enter your current password."),
    next: password,
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { message: "New passwords don't match.", path: ["confirm"] })
  .refine((v) => v.next !== v.current, { message: "Choose a password different from the current one.", path: ["next"] });

export async function changeOwnPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const me = await requireStaff();
  const parsed = changeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const [row] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, me.id)).limit(1);
  if (!row || !(await verifyPassword(parsed.data.current, row.passwordHash))) {
    return { error: "Your current password is incorrect." };
  }
  await db.update(users).set({ passwordHash: await hashPassword(parsed.data.next), updatedAt: new Date() }).where(eq(users.id, me.id));
  await signOutOthers(me.id);
  return { ok: true, message: "Password changed. Other devices have been signed out." };
}

async function signOutOthers(userId: string) {
  const token = await getSessionToken();
  const currentId = token ? hashToken(token) : "";
  await db.delete(sessions).where(and(eq(sessions.userId, userId), ne(sessions.id, currentId)));
}

export async function signOutOtherDevicesAction(): Promise<ActionState> {
  const me = await requireStaff();
  await signOutOthers(me.id);
  revalidatePath("/admin/account");
  return { ok: true, message: "Signed out of all other devices." };
}
