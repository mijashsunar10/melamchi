import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/server/auth/dal";
import { db, schema } from "@/server/db";

// Customer payment screenshots — private: only admin/staff can open them (never cached publicly).
export async function GET(_req: Request, ctx: RouteContext<"/admin/payment-proof/[id]">) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "staff")) return new Response("Forbidden", { status: 403 });
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });
  const [row] = await db.select({ data: schema.media.data, mime: schema.media.mime }).from(schema.media).where(eq(schema.media.id, id)).limit(1);
  if (!row) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(row.data), { headers: { "Content-Type": row.mime, "Cache-Control": "private, no-store" } });
}
