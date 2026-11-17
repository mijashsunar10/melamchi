// Database schema (PostgreSQL, Drizzle ORM).
// Change this file → `npm run db:generate` → `npm run db:migrate`. See BACKEND.md.

import { boolean, index, integer, jsonb, pgEnum, pgTable, real, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import type { FAQ, IconName, OrderField } from "@/types/catalog";

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

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type UserRole = (typeof userRole.enumValues)[number];
