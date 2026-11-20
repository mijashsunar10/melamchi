import "server-only";
import nodemailer from "nodemailer";
import { eq } from "drizzle-orm";
import { db, schema } from "@/server/db";

// SMTP (e.g. Gmail with an App Password, or any mail provider). Without SMTP_HOST the email is printed in the terminal (dev).
const transport = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 465),
      secure: Number(process.env.SMTP_PORT ?? 465) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export async function sendEmail(to: string, subject: string, lines: string[], button?: { label: string; url: string }) {
  const text = [...lines, button ? `${button.label}: ${button.url}` : "", "", "— TopX"].join("\n");
  if (!transport) {
    console.log(`\n[email → ${to}] ${subject}\n${text}\n`);
    return;
  }
  const html = `<div style="font-family:sans-serif;font-size:15px;line-height:1.5;color:#111">${lines.map((l) => `<p>${esc(l)}</p>`).join("")}${
    button ? `<p><a href="${esc(button.url)}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold">${esc(button.label)}</a></p>` : ""
  }<p style="color:#666">— TopX</p></div>`;
  try {
    await transport.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text, html });
  } catch (e) {
    console.error("[email] send failed:", e);
  }
}

const site = () => (process.env.NEXT_PUBLIC_SITE_URL || "https://topxnepal.com").replace(/\/$/, "");

const STATUS_TEXT: Record<string, [string, string]> = {
  processing: ["Payment received", "We got your payment. Your order is being processed now."],
  delivered: ["Order delivered", "Your order has been delivered. Enjoy!"],
  failed: ["Order failed", "We couldn't complete your order. Our team will contact you, or reply to this email for help."],
  refunded: ["Order refunded", "Your order has been refunded."],
};

/** Tell the customer their order status changed. Never throws. */
export async function sendOrderStatusEmail(orderId: string) {
  try {
    const [o] = await db
      .select({ id: schema.orders.id, status: schema.orders.status, product: schema.orders.productName, plan: schema.orders.planName, total: schema.orders.total, note: schema.orders.adminNote, email: schema.users.email, name: schema.users.name })
      .from(schema.orders)
      .innerJoin(schema.users, eq(schema.users.id, schema.orders.userId))
      .where(eq(schema.orders.id, orderId))
      .limit(1);
    const t = o && STATUS_TEXT[o.status];
    if (!o || !t) return;
    await sendEmail(
      o.email,
      `${t[0]} — ${o.id}`,
      [`Hi ${o.name},`, t[1], `Order: ${o.id} · ${o.product} (${o.plan}) · Rs ${o.total}`, ...(o.note ? [`Note: ${o.note}`] : [])],
      { label: "View order", url: `${site()}/account` },
    );
  } catch (e) {
    console.error("[email] order status:", e);
  }
}

export { site };
