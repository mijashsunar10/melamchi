// End-to-end check of the Support page (help search + contact form).
// Usage: node scripts/check-support.mjs [baseUrl]
import { openBrowser } from "./cdp.mjs";

const base = process.argv[2] ?? "http://localhost:3000";
const b = await openBrowser();
await b.goto(`${base}/support`);
await b.evaluate(`window.__opened = []; window.open = (u) => { window.__opened.push(u); return null; }; true`);
const fails = [];
const expect = (name, ok, got) => { console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : ` — got: ${got}`}`); if (!ok) fails.push(name); };
const type = (sel, value) => b.evaluate(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : el.tagName === "SELECT" ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, "value").set.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event(el.tagName === "SELECT" ? "change" : "input", { bubbles: true })); return true; })()`);
const summaries = () => b.evaluate(`[...document.querySelectorAll("details summary")].map(s => s.textContent.trim()).join(" | ")`);

expect("default topic shows order questions", (await summaries()).includes("How do I place an order?"), await summaries());

await b.evaluate(`[...document.querySelectorAll("[role=tab]")].find(t => t.textContent.includes("Refunds")).click()`); await b.sleep(300);
expect("topic switch shows refund questions", (await summaries()).includes("When can I get a refund?"), await summaries());

await type("input[type=search]", "player id"); await b.sleep(300);
const s = await summaries();
expect("search finds Player ID answer", s.includes("Where do I find my Player ID?"), s);

await b.evaluate(`[...document.querySelectorAll("button")].find(x => x.textContent.includes("Send message")).click()`); await b.sleep(300);
const err = await b.evaluate(`[...document.querySelectorAll("p")].some(p => p.textContent.includes("Please enter your name."))`);
expect("empty form is blocked", err, err);

const form = `form:has(textarea)`;
await type(`${form} input:not([type=tel])`, "Aarav Shrestha");
await type(`${form} input[type=tel]`, "9812345678");
await type(`${form} select`, "Payments");
await type(`${form} textarea`, "I paid with eSewa but have not received my diamonds yet.");
await b.evaluate(`[...document.querySelectorAll("button")].find(x => x.textContent.includes("Send message")).click()`); await b.sleep(500);
const url = await b.evaluate(`window.__opened[0] ?? ""`);
const msg = decodeURIComponent(url.split("?text=")[1] ?? "");
expect("opens WhatsApp", url.startsWith("https://wa.me/"), url);
expect("message has topic + text", msg.includes("Topic: Payments") && msg.includes("eSewa"), msg);
expect("no browser errors", b.errors.length === 0, JSON.stringify(b.errors));

b.close();
process.exit(fails.length ? 1 : 0);
