// Database schema (PostgreSQL, Drizzle ORM).
// Change this file → `npm run db:generate` → `npm run db:migrate`. See BACKEND.md.

import { boolean, customType, index, integer, jsonb, pgEnum, pgTable, real, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import type { FAQ, IconName, OrderField } from "@/types/catalog";
import type { BlogBlock, LegalSection, SiteSettings } from "@/types/content";

/** admin: everything · staff: orders & support · customer: (later) shop accounts */
export const userRole = pgEnum("user_role", ["admin", "staff", "customer"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(), // always stored lower-case
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull().default("customer"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Login sessions. `id` is the SHA-256 hash of the random token stored in the cookie,
 * so a leaked database can't be used to log in.
 */
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    userAgent: text("user_agent"),
    ip: text("ip"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_user_id_idx").on(t.userId), index("sessions_expires_at_idx").on(t.expiresAt)],
);

// ---------------------------------------------------------------- catalog (B4)

/** The 6 store sections. `slug` is fixed (it is the page URL), everything else is editable. */
export const domains = pgTable("domains", {
  slug: text("slug").primaryKey(), // ai-tools, gaming, gift-cards, software, digital-products, support
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  icon: text("icon").$type<IconName>().notNull(),
  gradient: text("gradient").notNull(),
  highlights: jsonb("highlights").$type<string[]>().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    domainSlug: text("domain_slug")
      .notNull()
      .references(() => domains.slug, { onDelete: "cascade", onUpdate: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    icon: text("icon").$type<IconName>().notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [unique("categories_domain_slug_unique").on(t.domainSlug, t.slug)],
);

export const deliveryType = pgEnum("delivery_type", ["TOPUP", "CODE", "ACCOUNT", "LICENSE", "SERVICE"]);

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(), // page URL: /product/<slug>
    name: text("name").notNull(),
    brand: text("brand").notNull(),
    domainSlug: text("domain_slug")
      .notNull()
      .references(() => domains.slug, { onUpdate: "cascade" }),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    deliveryType: deliveryType("delivery_type").notNull(),
    imageUrl: text("image_url"), // null → branded cover with stock photo
    initials: text("initials").notNull().default(""),
    color: text("color").notNull().default("#1d3fbf"),
    shortDescription: text("short_description").notNull(),
    description: text("description").notNull(),
    region: text("region").notNull().default("Nepal"),
    deliveryTime: text("delivery_time").notNull().default("Instant"),
    rating: real("rating").notNull().default(4.8),
    reviewCount: integer("review_count").notNull().default(0),
    sold: integer("sold").notNull().default(0),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    fields: jsonb("fields").$type<OrderField[]>().notNull().default([]),
    howTo: jsonb("how_to").$type<string[]>().notNull().default([]),
    faq: jsonb("faq").$type<FAQ[]>().notNull().default([]),
    isActive: boolean("is_active").notNull().default(true), // hidden from the store when false
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("products_domain_idx").on(t.domainSlug), index("products_category_idx").on(t.categoryId)],
);

/** Packages / prices of a product. `slug` is the stable id used by deals and orders. */
export const plans = pgTable(
  "plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    price: integer("price").notNull(), // NPR, whole rupees; 0 = price on request
    originalPrice: integer("original_price"),
    bonus: text("bonus"),
    validity: text("validity"),
    inStock: boolean("in_stock").notNull().default(true),
    popular: boolean("popular").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [unique("plans_product_slug_unique").on(t.productId, t.slug), index("plans_product_idx").on(t.productId)],
);

// ---------------------------------------------------------------- pictures (B4.4)

const bytea = customType<{ data: Buffer; driverData: Buffer }>({ dataType: () => "bytea" });

/** Uploaded pictures, stored in the database (backed up with it) and served at /media/<id>.webp */
export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  data: bytea("data").notNull(),
  mime: text("mime").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------- content (B5)

/** Flash deals: a % discount on one package until `endsAt`. */
export const deals = pgTable(
  "deals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    planSlug: text("plan_slug").notNull(),
    discountPercent: integer("discount_percent").notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    label: text("label"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("deals_ends_at_idx").on(t.endsAt)],
);

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    city: text("city").notNull().default(""),
    rating: integer("rating").notNull(),
    comment: text("comment").notNull(),
    date: text("date").notNull(), // YYYY-MM-DD
    verified: boolean("verified").notNull().default(true),
    isVisible: boolean("is_visible").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("reviews_product_idx").on(t.productId)],
);

/** FAQ lists: scope "home" = home page, otherwise a section slug (section page FAQ). */
export const faqs = pgTable(
  "faqs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    scope: text("scope").notNull(),
    q: text("q").notNull(),
    a: text("a").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("faqs_scope_idx").on(t.scope)],
);

/** Help-center topics on /support, each with its questions. */
export const supportTopics = pgTable("support_topics", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  icon: text("icon").$type<IconName>().notNull(),
  faqs: jsonb("faqs").$type<FAQ[]>().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  category: text("category").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  readMinutes: integer("read_minutes").notNull().default(2),
  productSlug: text("product_slug").notNull(),
  body: jsonb("body").$type<BlogBlock[]>().notNull().default([]),
  isPublished: boolean("is_published").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Refund / Privacy / Terms. `slug` is fixed (page URL). */
export const legalPages = pgTable("legal_pages", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  updated: text("updated").notNull(), // YYYY-MM-DD
  sections: jsonb("sections").$type<LegalSection[]>().notNull().default([]),
});

/** Site-wide settings (one row per key). Key "site" holds contact, social links, stats and payment methods. */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<SiteSettings>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type UserRole = (typeof userRole.enumValues)[number];

// ---------------------------------------------------------------- customer orders

/** unpaid = sent to eSewa, not paid yet (hidden) · pending = customer says they paid by QR, waiting for admin · delivered/failed/refunded = done */
export const orderStatus = pgEnum("order_status", ["unpaid", "pending", "processing", "delivered", "failed", "refunded"]);

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(), // TX-XXXXXX
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productSlug: text("product_slug").notNull(),
    productName: text("product_name").notNull(),
    planId: text("plan_id").notNull(),
    planName: text("plan_name").notNull(),
    quantity: integer("quantity").notNull().default(1),
    details: jsonb("details").$type<Record<string, string>>().notNull().default({}),
    unitPrice: integer("unit_price").notNull(),
    total: integer("total").notNull(),
    paymentRef: text("payment_ref"),
    /** payment screenshot uploaded by the customer (media.id) — staff-only at /admin/payment-proof/<id> */
    paymentProofId: uuid("payment_proof_id"),
    status: orderStatus("status").notNull().default("pending"),
    adminNote: text("admin_note"),
    seenByAdmin: boolean("seen_by_admin").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("orders_user_id_idx").on(t.userId), index("orders_status_idx").on(t.status)],
);
