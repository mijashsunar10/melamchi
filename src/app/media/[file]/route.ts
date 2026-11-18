import { eq } from "drizzle-orm";
import { db, schema } from "@/server/db";

// Uploaded pictures (product images), stored in the database: /media/<id>.webp
// A picture never changes once uploaded (a new upload gets a new id), so browsers may cache it for a year.

export async function GET(_req: Request, ctx: RouteContext<"/media/[file]">) {
  const { file } = await ctx.params;
  const id = file.replace(/\.webp$/, "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });
  const [row] = await db.select({ data: schema.media.data, mime: schema.media.mime }).from(schema.media).where(eq(schema.media.id, id)).limit(1);
  if (!row) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(row.data), {
    headers: { "Content-Type": row.mime, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
