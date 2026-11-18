"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { ICON_NAMES } from "@/components/icon";
import { requireRole, requireStaff } from "@/server/auth/dal";
import { CONTENT_TAG } from "@/server/content/source";
import { db, schema } from "@/server/db";
import type { IconName } from "@/types/catalog";
import type { BlogPostInput, ContentResult, DealInput, FaqScope, LegalPageInput, ReviewInput, SettingsInput, SupportTopicInput } from "./content-types";
import { slugify } from "./product-types";

// Deals, reviews, FAQ, help topics, blog, legal pages and settings (B5).
// Admins and staff manage deals, reviews, FAQ, help topics and the blog; legal pages and Settings are admin only.
// Every change refreshes the website cache so it updates immediately.

const { deals, reviews, products, plans, faqs, supportTopics, blogPosts, legalPages, settings, domains } = schema;

function refresh() {
  updateTag(CONTENT_TAG);
  revalidatePath("/admin", "layout");
}

const text = (max: number) => z.string().trim().max(max, `Too long (max ${max} characters).`);
const faqList = z.array(z.object({ q: text(300).min(1, "Every question needs text."), a: text(2000).min(1, "Every question needs an answer.") })).max(40);
const firstError = (e: z.ZodError, prefix = "") => {
  const i = e.issues[0];
  const where = typeof i?.path[1] === "number" ? `${prefix} ${i.path[1] + 1}: ` : "";
  return { error: (prefix ? where : "") + (i?.message ?? "Please check the form.") };
};
const today = () => new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------- deals

const dealSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid("Choose a product."),
  planSlug: z.string().min(1, "Choose a package."),
  discountPercent: z.number().int("Use a whole number, e.g. 10.").min(1, "Discount must be at least 1%.").max(90, "Discount can be at most 90%."),
  endsAt: z.string().datetime({ offset: true, message: "Choose when the deal ends." }),
  label: text(30),
});

export async function saveDealAction(input: DealInput): Promise<ContentResult> {
  await requireStaff();
  const parsed = dealSchema.safeParse(input);
  if (!parsed.success) return firstError(parsed.error);
  const d = parsed.data;
  const endsAt = new Date(d.endsAt);
  if (endsAt.getTime() < Date.now() + 60_000) return { error: "The end time must be in the future." };

  const [plan] = await db
    .select({ name: plans.name })
    .from(plans)
    .where(and(eq(plans.productId, d.productId), eq(plans.slug, d.planSlug)))
    .limit(1);
  if (!plan) return { error: "That package doesn’t belong to the chosen product." };

  const values = { productId: d.productId, planSlug: d.planSlug, discountPercent: d.discountPercent, endsAt, label: d.label || null };
  if (d.id) {
    const [row] = await db.update(deals).set(values).where(eq(deals.id, d.id)).returning({ id: deals.id });
    if (!row) return { error: "Deal not found." };
  } else {
    // one running deal per package: replace an existing one
    await db.delete(deals).where(and(eq(deals.productId, d.productId), eq(deals.planSlug, d.planSlug)));
    await db.insert(deals).values(values);
  }
  refresh();
  return { ok: true, message: d.id ? "Deal saved." : `Deal on “${plan.name}” is live.` };
}

/** Stop a deal now (it stays in the list as ended). */
export async function endDealAction(id: string): Promise<ContentResult> {
  await requireStaff();
  const [row] = await db.update(deals).set({ endsAt: new Date() }).where(eq(deals.id, id)).returning({ id: deals.id });
  if (!row) return { error: "Deal not found." };
  refresh();
  return { ok: true, message: "Deal ended. It’s no longer on the website." };
}

export async function deleteDealAction(id: string): Promise<ContentResult> {
  await requireStaff();
  const [row] = await db.delete(deals).where(eq(deals.id, id)).returning({ id: deals.id });
  if (!row) return { error: "Deal not found." };
  refresh();
  return { ok: true, message: "Deal deleted." };
}

// ---------------------------------------------------------------- reviews

const reviewSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid("Choose a product."),
  name: text(60).min(2, "Enter the customer’s name, e.g. Aarav S."),
  city: text(40),
  rating: z.number().int().min(1, "Choose 1 to 5 stars.").max(5, "Choose 1 to 5 stars."),
  comment: text(600).min(5, "The review text is too short."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date."),
  verified: z.boolean(),
  isVisible: z.boolean(),
});

export async function saveReviewAction(input: ReviewInput): Promise<ContentResult> {
  await requireStaff();
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return firstError(parsed.error);
  const { id, ...values } = parsed.data;
  const [p] = await db.select({ id: products.id }).from(products).where(eq(products.id, values.productId)).limit(1);
  if (!p) return { error: "Choose a product." };
  if (id) {
    const [row] = await db.update(reviews).set(values).where(eq(reviews.id, id)).returning({ id: reviews.id });
    if (!row) return { error: "Review not found." };
  } else {
    await db.insert(reviews).values(values);
  }
  refresh();
  return { ok: true, message: id ? "Review saved." : "Review added." };
}

export async function setReviewVisibleAction(id: string, visible: boolean): Promise<ContentResult> {
  await requireStaff();
  const [row] = await db.update(reviews).set({ isVisible: visible }).where(eq(reviews.id, id)).returning({ id: reviews.id });
  if (!row) return { error: "Review not found." };
  refresh();
  return { ok: true, message: visible ? "Review is shown on the website." : "Review hidden." };
}

export async function deleteReviewAction(id: string): Promise<ContentResult> {
  await requireStaff();
  const [row] = await db.delete(reviews).where(eq(reviews.id, id)).returning({ id: reviews.id });
  if (!row) return { error: "Review not found." };
  refresh();
  return { ok: true, message: "Review deleted." };
}

// ---------------------------------------------------------------- FAQ

/** Replace the whole FAQ list of the home page ("home") or one section. */
export async function saveFaqListAction(scope: FaqScope, items: { q: string; a: string }[]): Promise<ContentResult> {
  await requireStaff();
  if (scope !== "home") {
    const [d] = await db.select({ slug: domains.slug }).from(domains).where(eq(domains.slug, scope)).limit(1);
    if (!d) return { error: "Unknown section." };
  }
  const parsed = faqList.safeParse(items);
  if (!parsed.success) return firstError(parsed.error, "Question");
  await db.transaction(async (tx) => {
    await tx.delete(faqs).where(eq(faqs.scope, scope));
    if (parsed.data.length) await tx.insert(faqs).values(parsed.data.map((f, i) => ({ scope, q: f.q, a: f.a, sortOrder: i })));
  });
  refresh();
  return { ok: true, message: "Questions saved." };
}

// ---------------------------------------------------------------- help topics (/support)

const topicSchema = z
  .array(
    z.object({
      slug: z.string().max(60),
      name: text(40).min(2, "Every topic needs a name."),
      icon: z.enum(ICON_NAMES as [string, ...string[]], { message: "Choose an icon." }),
      faqs: faqList,
    }),
  )
  .max(20);

export async function saveSupportTopicsAction(topics: SupportTopicInput[]): Promise<ContentResult> {
  await requireStaff();
  const parsed = topicSchema.safeParse(topics);
  if (!parsed.success) return firstError(parsed.error, "Topic");
  const used = new Set<string>();
  const rows = parsed.data.map((t, i) => {
    let slug = t.slug || slugify(t.name) || "topic";
    const root = slug;
    for (let n = 2; used.has(slug); n++) slug = `${root}-${n}`;
    used.add(slug);
    return { slug, name: t.name, icon: t.icon as IconName, faqs: t.faqs, sortOrder: i };
  });
  await db.transaction(async (tx) => {
    await tx.delete(supportTopics);
    if (rows.length) await tx.insert(supportTopics).values(rows);
  });
  refresh();
  return { ok: true, message: "Help topics saved." };
}

// ---------------------------------------------------------------- blog

const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("p"), text: text(3000).min(1, "A paragraph is empty.") }),
  z.object({ type: z.literal("h2"), text: text(120).min(1, "A heading is empty.") }),
  z.object({ type: z.literal("tip"), text: text(600).min(1, "A tip is empty.") }),
  z.object({ type: z.literal("steps"), items: z.array(text(400).min(1)).min(1, "A steps list is empty.").max(20) }),
]);

const postSchema = z.object({
  id: z.string().uuid().optional(),
  slug: text(80),
  title: text(120).min(5, "The title is too short."),
  excerpt: text(300).min(10, "The summary is too short."),
  category: text(30).min(2, "Enter a category, e.g. Gaming."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date."),
  readMinutes: z.number().int().min(1).max(60),
  productSlug: z.string().min(1, "Choose the product this guide is about."),
  body: z.array(blockSchema).min(1, "Write at least one paragraph.").max(80),
  isPublished: z.boolean(),
});

export async function saveBlogPostAction(input: BlogPostInput): Promise<ContentResult> {
  await requireStaff();
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return firstError(parsed.error);
  const { id, ...d } = parsed.data;
  const [p] = await db.select({ id: products.id }).from(products).where(eq(products.slug, d.productSlug)).limit(1);
  if (!p) return { error: "Choose the product this guide is about." };

  if (id) {
    // the web address stays the same after creation so shared links keep working
    const values = { title: d.title, excerpt: d.excerpt, category: d.category, date: d.date, readMinutes: d.readMinutes, productSlug: d.productSlug, body: d.body, isPublished: d.isPublished };
    const [row] = await db.update(blogPosts).set({ ...values, updatedAt: new Date() }).where(eq(blogPosts.id, id)).returning({ id: blogPosts.id });
    if (!row) return { error: "Post not found." };
    refresh();
    return { ok: true, id, message: "Post saved." };
  }
  const slug = slugify(d.slug || d.title);
  if (!slug) return { error: "Enter a title with letters or numbers." };
  const [dup] = await db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  if (dup) return { error: `Another post already uses the web address “${slug}”. Change the title or the web address.` };
  const [row] = await db.insert(blogPosts).values({ ...d, slug }).returning({ id: blogPosts.id });
  refresh();
  return { ok: true, id: row.id, message: d.isPublished ? "Post published." : "Draft saved." };
}

export async function setBlogPublishedAction(id: string, published: boolean): Promise<ContentResult> {
  await requireStaff();
  const [row] = await db.update(blogPosts).set({ isPublished: published, updatedAt: new Date() }).where(eq(blogPosts.id, id)).returning({ id: blogPosts.id });
  if (!row) return { error: "Post not found." };
  refresh();
  return { ok: true, message: published ? "Post is on the website." : "Post hidden (draft)." };
}

export async function deleteBlogPostAction(id: string): Promise<ContentResult> {
  await requireStaff();
  const [row] = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning({ title: blogPosts.title });
  if (!row) return { error: "Post not found." };
  refresh();
  return { ok: true, message: `“${row.title}” deleted.` };
}

// ---------------------------------------------------------------- legal pages (admin only)

const legalSchema = z.object({
  slug: z.enum(["refund-policy", "privacy-policy", "terms"]),
  title: text(80).min(3, "The title is too short."),
  description: text(300).min(10, "The summary is too short."),
  sections: z
    .array(
      z.object({
        id: z.string().max(60),
        heading: text(120).min(1, "Every part needs a heading."),
        paragraphs: z.array(text(3000)).max(20).optional(),
        bullets: z.array(text(600)).max(30).optional(),
      }),
    )
    .min(1, "Add at least one part.")
    .max(30),
});

export async function saveLegalPageAction(input: LegalPageInput): Promise<ContentResult> {
  await requireRole(["admin"]);
  const parsed = legalSchema.safeParse(input);
  if (!parsed.success) return firstError(parsed.error, "Part");
  const d = parsed.data;
  // anchor ids for the table of contents: keep existing ones, make new ones from the heading
  const used = new Set<string>();
  const sections = d.sections.map((s) => {
    let id = s.id || slugify(s.heading) || "part";
    const root = id;
    for (let n = 2; used.has(id); n++) id = `${root}-${n}`;
    used.add(id);
    const paragraphs = s.paragraphs?.filter(Boolean);
    const bullets = s.bullets?.filter(Boolean);
    return { id, heading: s.heading, ...(paragraphs?.length && { paragraphs }), ...(bullets?.length && { bullets }) };
  });
  const [row] = await db
    .update(legalPages)
    .set({ title: d.title, description: d.description, sections, updated: today() })
    .where(eq(legalPages.slug, d.slug))
    .returning({ slug: legalPages.slug });
  if (!row) return { error: "Page not found — run npm run db:seed." };
  refresh();
  return { ok: true, message: `“${d.title}” saved.` };
}

// ---------------------------------------------------------------- settings (admin only)

const url = z.union([z.literal(""), z.literal("#"), z.string().trim().url("Enter a full link starting with https://")]);
const settingsSchema = z.object({
  contact: z.object({
    whatsappNumber: z
      .string()
      .transform((s) => s.replace(/\D/g, ""))
      .pipe(z.string().regex(/^977\d{10}$/, "WhatsApp number: 977 followed by the 10-digit mobile number, e.g. 9779812345678.")),
    email: z.string().trim().email("Enter a valid email."),
    phone: text(30).min(5, "Enter a phone number."),
    address: text(120).min(3, "Enter the address."),
    mapUrl: url,
    officeHours: text(80),
  }),
  social: z.object({ facebook: url, instagram: url, tiktok: url, youtube: url }),
  stats: z.object({
    ordersDelivered: z.number().int().min(0),
    avgDeliverySeconds: z.number().int().min(1).max(86_400),
    rating: z.number().min(0).max(5),
    reviewCount: z.number().int().min(0),
  }),
  paymentMethods: z
    .array(
      z.object({
        id: z.enum(["esewa", "khalti", "imepay", "fonepay", "bank", "wallet"]),
        name: text(30).min(2, "Every payment method needs a name."),
        description: text(80),
        color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
        enabled: z.boolean(),
      }),
    )
    .max(6),
});

export async function saveSettingsAction(input: SettingsInput): Promise<ContentResult> {
  await requireRole(["admin"]);
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return firstError(parsed.error);
  const value = parsed.data;
  await db
    .insert(settings)
    .values({ key: "site", value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
  refresh();
  return { ok: true, message: "Settings saved. The website is updated." };
}
