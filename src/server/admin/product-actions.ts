"use server";

import { and, eq, like, max, notInArray } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireRole, requireStaff } from "@/server/auth/dal";
import { CATALOG_TAG } from "@/server/catalog/source";
import { db, schema } from "@/server/db";
import { fieldKey, type ProductActionResult, type ProductInput, slugify } from "./product-types";

// Products (B4.3). Admins and staff can add / edit / show / hide; only admins can delete.
// Every change refreshes the store cache so the website updates immediately.

const { products, plans, categories, domains, media } = schema;

function refresh() {
  updateTag(CATALOG_TAG);
  revalidatePath("/admin/products", "layout");
  revalidatePath("/admin/categories", "layout"); // product counts
}

const text = (max: number) => z.string().trim().max(max, `Too long (max ${max} characters).`);
const money = z.number().int("Prices must be whole rupees.").min(0, "Prices can’t be negative.").max(10_000_000);

const planSchema = z.object({
  key: z.string().max(80),
  name: text(60).min(1, "Every package needs a name."),
  price: money,
  originalPrice: money.nullable(),
  bonus: text(60),
  validity: text(40),
  inStock: z.boolean(),
  popular: z.boolean(),
});

const fieldSchema = z.object({
  name: z.string().max(40),
  label: text(60).min(1, "Every question needs a label."),
  type: z.enum(["text", "email", "tel", "number", "select", "textarea"]),
  placeholder: text(80).optional(),
  required: z.boolean(),
  help: text(160).optional(),
  options: z.array(text(60)).max(30).optional(),
  verifiable: z.boolean().optional(),
});

const productSchema = z.object({
  id: z.string().uuid().optional(),
  slug: text(60),
  name: text(80).min(2, "Product name is too short."),
  brand: text(60).min(1, "Enter the brand (e.g. Garena, Netflix)."),
  domainSlug: z.string().min(1, "Choose a section."),
  categoryId: z.string().uuid().nullable(),
  deliveryType: z.enum(["TOPUP", "CODE", "ACCOUNT", "LICENSE", "SERVICE"]),
  shortDescription: text(200).min(10, "Short description is too short (at least 10 characters)."),
  description: text(3000),
  region: text(40),
  deliveryTime: text(40),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Pick a colour."),
  initials: text(8),
  tags: z.array(z.enum(["hot", "new", "bestseller", "official", "limited"])).max(5),
  isActive: z.boolean(),
  plans: z.array(planSchema).min(1, "Add at least one package with a price.").max(60),
  fields: z.array(fieldSchema).max(15),
  howTo: z.array(text(200)).max(10),
  faq: z.array(z.object({ q: text(200), a: text(1000) })).max(20),
});

/** Unique key for each item: keep existing ones, make new ones from `base` (adds -2, -3… on clashes). */
function uniqueKeys<T>(items: T[], existing: (t: T) => string, base: (t: T) => string, sep = "-") {
  const used = new Set<string>();
  return items.map((it) => {
    let k = existing(it) || base(it) || "item";
    const root = k;
    for (let n = 2; used.has(k); n++) k = `${root}${sep}${n}`;
    used.add(k);
    return k;
  });
}

export async function saveProductAction(input: ProductInput): Promise<ProductActionResult> {
  await requireStaff();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const where = issue?.path[0] === "plans" ? `Package ${Number(issue.path[1]) + 1}: ` : issue?.path[0] === "fields" ? `Question ${Number(issue.path[1]) + 1}: ` : "";
    return { error: where + (issue?.message ?? "Please check the form.") };
  }
  const d = parsed.data;

  // section & category must exist and belong together
  const [section] = await db.select({ slug: domains.slug }).from(domains).where(eq(domains.slug, d.domainSlug)).limit(1);
  if (!section) return { error: "Choose a section." };
  if (d.categoryId) {
    const [cat] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(and(eq(categories.id, d.categoryId), eq(categories.domainSlug, d.domainSlug)))
      .limit(1);
    if (!cat) return { error: "That category isn’t in the chosen section." };
  }

  for (const [i, p] of d.plans.entries()) {
    if (p.originalPrice != null && p.originalPrice <= p.price)
      return { error: `Package ${i + 1} (“${p.name}”): the “was” price must be higher than the price, or left empty.` };
  }
  for (const [i, f] of d.fields.entries()) {
    if (f.type === "select" && !f.options?.filter(Boolean).length)
      return { error: `Question ${i + 1} (“${f.label}”): add at least one choice, one per line.` };
  }

  // stable keys: packages are referenced by deals/orders, questions by saved order details
  const planKeys = uniqueKeys(d.plans, (p) => p.key, (p) => slugify(p.name));
  const fieldNames = uniqueKeys(d.fields, (f) => f.name, (f) => fieldKey(f.label), "");

  const values = {
    name: d.name,
    brand: d.brand,
    domainSlug: d.domainSlug,
    categoryId: d.categoryId,
    deliveryType: d.deliveryType,
    shortDescription: d.shortDescription,
    description: d.description || d.shortDescription,
    region: d.region || "Nepal",
    deliveryTime: d.deliveryTime || "Instant",
    color: d.color,
    initials: d.initials || d.name.slice(0, 2).toUpperCase(),
    tags: d.tags,
    isActive: d.isActive,
    fields: d.fields.map((f, i) => ({
      name: fieldNames[i],
      label: f.label,
      type: f.type,
      required: f.required,
      ...(f.placeholder && { placeholder: f.placeholder }),
      ...(f.help && { help: f.help }),
      ...(f.type === "select" && { options: f.options!.filter(Boolean) }),
      ...(f.verifiable && { verifiable: true }),
    })),
    howTo: d.howTo.filter(Boolean),
    faq: d.faq.filter((x) => x.q && x.a),
    updatedAt: new Date(),
  };

  let id = d.id;
  if (id) {
    const [exists] = await db.select({ id: products.id }).from(products).where(eq(products.id, id)).limit(1);
    if (!exists) return { error: "This product no longer exists." };
  } else {
    const slug = slugify(d.slug || d.name);
    if (!slug) return { error: "Enter a product name with letters or numbers." };
    const [dup] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
    if (dup) return { error: `Another product already uses the web address “${slug}”. Change the name or the web address.` };
  }

  await db.transaction(async (tx) => {
    if (id) {
      await tx.update(products).set(values).where(eq(products.id, id));
    } else {
      const [{ last }] = await tx.select({ last: max(products.sortOrder) }).from(products);
      const [row] = await tx
        .insert(products)
        .values({ ...values, slug: slugify(d.slug || d.name), sortOrder: (last ?? -1) + 1 })
        .returning({ id: products.id });
      id = row.id;
    }
    const productId = id!;

    // packages: remove the ones that were deleted, update the rest, add new ones
    await tx.delete(plans).where(and(eq(plans.productId, productId), notInArray(plans.slug, planKeys)));
    const existing = new Set(
      (await tx.select({ slug: plans.slug }).from(plans).where(eq(plans.productId, productId))).map((r) => r.slug),
    );
    for (const [i, p] of d.plans.entries()) {
      const v = {
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice,
        bonus: p.bonus || null,
        validity: p.validity || null,
        inStock: p.inStock,
        popular: p.popular,
        sortOrder: i,
      };
      if (existing.has(planKeys[i])) await tx.update(plans).set(v).where(and(eq(plans.productId, productId), eq(plans.slug, planKeys[i])));
      else await tx.insert(plans).values({ ...v, productId, slug: planKeys[i] });
    }
  });

  refresh();
  return { ok: true, id, message: d.id ? `“${d.name}” saved.` : `“${d.name}” added.` };
}

/** Show or hide a product on the website. */
export async function setProductVisibleAction(id: string, visible: boolean): Promise<ProductActionResult> {
  await requireStaff();
  const [row] = await db
    .update(products)
    .set({ isActive: visible, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning({ name: products.name });
  if (!row) return { error: "Product not found." };
  refresh();
  return { ok: true, message: visible ? `“${row.name}” is now on the website.` : `“${row.name}” is now hidden.` };
}

/** Copy a product (hidden) so a similar one can be made quickly. */
export async function duplicateProductAction(id: string): Promise<ProductActionResult> {
  await requireStaff();
  const [p] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!p) return { error: "Product not found." };
  const ps = await db.select().from(plans).where(eq(plans.productId, id));

  const root = `${p.slug}-copy`.slice(0, 55);
  const taken = new Set((await db.select({ slug: products.slug }).from(products).where(like(products.slug, `${root}%`))).map((r) => r.slug));
  let slug = root;
  for (let n = 2; taken.has(slug); n++) slug = `${root}-${n}`;

  const newId = await db.transaction(async (tx) => {
    const rest: Partial<typeof p> = { ...p };
    delete rest.id;
    delete rest.createdAt;
    delete rest.updatedAt;
    const [row] = await tx
      .insert(products)
      .values({ ...(rest as typeof p), slug, name: `${p.name} (copy)`, isActive: false, sold: 0, reviewCount: 0 })
      .returning({ id: products.id });
    if (ps.length)
      await tx.insert(plans).values(
        ps.map(({ slug: s, name: n, price, originalPrice, bonus, validity, inStock, popular, sortOrder }) => ({
          productId: row.id, slug: s, name: n, price, originalPrice, bonus, validity, inStock, popular, sortOrder,
        })),
      );
    return row.id;
  });
  refresh();
  return { ok: true, id: newId, message: `Copy created. It is hidden until you show it.` };
}

/** Delete a product and its packages (admin only). */
export async function deleteProductAction(id: string): Promise<ProductActionResult> {
  await requireRole(["admin"]);
  const [row] = await db.delete(products).where(eq(products.id, id)).returning({ name: products.name, imageUrl: products.imageUrl });
  if (!row) return { error: "Product not found." };
  await deleteOldMedia(row.imageUrl);
  refresh();
  return { ok: true, message: `“${row.name}” deleted.` };
}

// ---------- pictures (B4.4)

const MAX_UPLOAD = 5 * 1024 * 1024;

/** Upload / replace a product's picture. Resized to max 1200 px and saved as WebP in the database. */
export async function uploadProductImageAction(productId: string, formData: FormData): Promise<ProductActionResult & { url?: string }> {
  await requireStaff();
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a picture first." };
  if (file.size > MAX_UPLOAD) return { error: "That picture is too big. Please use one under 5 MB." };
  if (!/^image\/(jpeg|png|webp|gif|avif)$/.test(file.type)) return { error: "Please choose a JPG, PNG or WebP picture." };

  const [product] = await db.select({ imageUrl: products.imageUrl }).from(products).where(eq(products.id, productId)).limit(1);
  if (!product) return { error: "Product not found." };

  let out: { data: Buffer; info: { width: number; height: number; size: number } };
  try {
    const { default: sharp } = await import("sharp");
    out = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 50_000_000 })
      .rotate() // respect phone camera orientation
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    return { error: "We couldn’t read that picture. Please try another file." };
  }

  const [row] = await db
    .insert(media)
    .values({ data: out.data, mime: "image/webp", width: out.info.width, height: out.info.height, size: out.info.size })
    .returning({ id: media.id });
  const url = `/media/${row.id}.webp`;
  // updatedAt is left alone on purpose: the open editor keeps any unsaved changes
  await db.update(products).set({ imageUrl: url }).where(eq(products.id, productId));
  await deleteOldMedia(product.imageUrl);
  refresh();
  return { ok: true, url, message: "Picture saved." };
}

/** Remove a product's picture (the branded colour card is shown again). */
export async function removeProductImageAction(productId: string): Promise<ProductActionResult> {
  await requireStaff();
  const [product] = await db.select({ imageUrl: products.imageUrl }).from(products).where(eq(products.id, productId)).limit(1);
  if (!product) return { error: "Product not found." };
  await db.update(products).set({ imageUrl: null }).where(eq(products.id, productId));
  await deleteOldMedia(product.imageUrl);
  refresh();
  return { ok: true, message: "Picture removed." };
}

async function deleteOldMedia(url: string | null) {
  const id = url?.match(/^\/media\/([0-9a-f-]{36})\.webp$/)?.[1];
  if (!id) return;
  // a copied product may share the same picture — only delete it when nothing uses it any more
  const [inUse] = await db.select({ id: products.id }).from(products).where(eq(products.imageUrl, url!)).limit(1);
  if (!inUse) await db.delete(media).where(eq(media.id, id));
}
