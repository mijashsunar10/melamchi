"use server";

import { and, asc, eq, max, ne } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { ICON_NAMES } from "@/components/icon";
import { requireRole } from "@/server/auth/dal";
import { CATALOG_TAG } from "@/server/catalog/source";
import { db, schema } from "@/server/db";
import type { ActionState } from "./user-actions";

// Sections & categories (B4.2). Admin only. Every change refreshes the store cache.

const { domains, categories } = schema;
const icon = z.enum(ICON_NAMES as [string, ...string[]], { message: "Choose an icon." });

/** "Live-stream Coins!" → "live-stream-coins" */
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

function refresh() {
  updateTag(CATALOG_TAG); // store pages show the change on the next request
  revalidatePath("/admin/categories");
}

// ---------- sections ----------

const sectionSchema = z.object({
  slug: z.string().min(1),
  name: z.string().trim().min(2, "Name is too short.").max(40),
  shortName: z.string().trim().min(1, "Short name is required.").max(20),
  tagline: z.string().trim().min(3, "Tagline is too short.").max(80),
  description: z.string().trim().min(10, "Description is too short.").max(300),
  icon,
  highlights: z.array(z.string().trim().max(60)).max(3),
});

export async function updateSectionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(["admin"]);
  const parsed = sectionSchema.safeParse({
    ...Object.fromEntries(formData),
    highlights: formData.getAll("highlights").map(String).filter((h) => h.trim()),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { slug, ...values } = parsed.data;
  const updated = await db
    .update(domains)
    .set({ ...values, icon: values.icon as (typeof ICON_NAMES)[number], updatedAt: new Date() })
    .where(eq(domains.slug, slug))
    .returning({ slug: domains.slug });
  if (!updated.length) return { error: "Section not found." };
  refresh();
  return { ok: true, message: `“${values.name}” saved.` };
}

// ---------- categories ----------

const categorySchema = z.object({
  domainSlug: z.string().min(1),
  name: z.string().trim().min(2, "Name is too short.").max(40),
  slug: z.string().trim().max(60).optional(),
  icon,
});

export async function createCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(["admin"]);
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { domainSlug, name } = parsed.data;
  const slug = slugify(parsed.data.slug || name);
  if (!slug) return { error: "Enter a name with letters or numbers." };

  const [dup] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.domainSlug, domainSlug), eq(categories.slug, slug)))
    .limit(1);
  if (dup) return { error: `A category with the link name “${slug}” already exists in this section.` };

  const [{ last }] = await db.select({ last: max(categories.sortOrder) }).from(categories).where(eq(categories.domainSlug, domainSlug));
  await db.insert(categories).values({
    domainSlug,
    name,
    slug,
    icon: parsed.data.icon as (typeof ICON_NAMES)[number],
    sortOrder: (last ?? -1) + 1,
  });
  refresh();
  return { ok: true, message: `Category “${name}” added.` };
}

const updateCategorySchema = categorySchema.omit({ domainSlug: true }).extend({ id: z.string().uuid() });

export async function updateCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(["admin"]);
  const parsed = updateCategorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { id, name } = parsed.data;
  const slug = slugify(parsed.data.slug || name);

  const [current] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  if (!current) return { error: "Category not found." };
  const [dup] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.domainSlug, current.domainSlug), eq(categories.slug, slug), ne(categories.id, id)))
    .limit(1);
  if (dup) return { error: `Another category already uses “${slug}”.` };

  await db.update(categories).set({ name, slug, icon: parsed.data.icon as (typeof ICON_NAMES)[number] }).where(eq(categories.id, id));
  refresh();
  return { ok: true, message: `“${name}” saved.` };
}

export async function deleteCategoryAction(id: string): Promise<ActionState> {
  await requireRole(["admin"]);
  const [deleted] = await db.delete(categories).where(eq(categories.id, id)).returning({ name: categories.name });
  if (!deleted) return { error: "Category not found." };
  // products in it keep their section and simply have no category (ON DELETE SET NULL)
  refresh();
  return { ok: true, message: `“${deleted.name}” deleted.` };
}

/** Move a category one place up or down within its section. */
export async function moveCategoryAction(id: string, direction: "up" | "down"): Promise<ActionState> {
  await requireRole(["admin"]);
  const [current] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  if (!current) return { error: "Category not found." };
  const siblings = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.domainSlug, current.domainSlug))
    .orderBy(asc(categories.sortOrder), asc(categories.name));
  const ids = siblings.map((s) => s.id);
  const i = ids.indexOf(id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= ids.length) return { ok: true };
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await db.transaction(async (tx) => {
    for (const [order, cid] of ids.entries()) await tx.update(categories).set({ sortOrder: order }).where(eq(categories.id, cid));
  });
  refresh();
  return { ok: true };
}
