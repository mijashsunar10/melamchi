CREATE TYPE "public"."order_status" AS ENUM('pending', 'processing', 'delivered', 'failed', 'refunded');--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"product_slug" text NOT NULL,
	"product_name" text NOT NULL,
	"plan_id" text NOT NULL,
	"plan_name" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"unit_price" integer NOT NULL,
	"total" integer NOT NULL,
	"payment_ref" text,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"admin_note" text,
	"seen_by_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "orders_user_id_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");