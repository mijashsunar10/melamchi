// End-to-end check of the product order form (dev server must be running).
// Usage: node scripts/check-order.mjs [baseUrl]
import { openBrowser } from "./cdp.mjs";

const base = process.argv[2] ?? "http://localhost:3000";
const b = await openBrowser();
await b.goto(`${base}/product/free-fire-diamonds`);
await b.evaluate(`window.__opened = []; window.open = (u) => { window.__opened.push(u); return null; }; true`);
const click = (sel, text) => b.evaluate(`[...document.querySelectorAll(${JSON.stringify(sel)})].find(e => e.textContent.includes(${JSON.stringify(text)})).click()`);
const fails = [];
const expect = (name, ok, got) => { console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : ` — got: ${got}`}`); if (!ok) fails.push(name); };

await click("button", "Order on WhatsApp"); await b.sleep(400);
const req = await b.evaluate(`[...document.querySelectorAll("p")].some(p => p.textContent.includes("Player ID is required"))`);
expect("empty order is blocked", req, req);

await b.evaluate(`(() => { const i = document.querySelector("input[inputmode=numeric]"); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(i, "5123456789"); i.dispatchEvent(new Event("input", { bubbles: true })); return true; })()`);
await click("button", "Check name"); await b.sleep(1400);
const name = await b.evaluate(`document.querySelector("p.text-success")?.textContent?.trim() ?? ""`);
expect("player name check", name.length > 0, name);

await click("[role=radio]", "Weekly Membership"); await b.sleep(200);
await b.evaluate(`document.querySelector("button[aria-label='Increase quantity']").click()`); await b.sleep(200);
await click("button", "Order on WhatsApp"); await b.sleep(500);
const url = await b.evaluate(`window.__opened[0] ?? ""`);
const msg = decodeURIComponent(url.split("?text=")[1] ?? "");
expect("opens WhatsApp", url.startsWith("https://wa.me/"), url);
expect("message has package", msg.includes("Weekly Membership"), msg);
expect("message has quantity 2", msg.includes("Quantity: 2"), msg);
expect("message has total Rs 460", msg.includes("Rs 460"), msg);
expect("no browser errors", b.errors.length === 0, JSON.stringify(b.errors));

b.close();
process.exit(fails.length ? 1 : 0);
