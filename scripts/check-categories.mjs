// End-to-end check of Sections & categories (B4.2): edits in the admin show on the store immediately.
// Usage: AUTH_EMAIL=… AUTH_PASSWORD=… node scripts/check-categories.mjs [baseUrl]
// Needs a TEST admin. Changes the Gaming section tagline and adds/edits/deletes a temporary category,
// then restores everything.
import { openBrowser } from "./cdp.mjs";

const base = process.argv[2] ?? "http://localhost:3000";
const email = process.env.AUTH_EMAIL;
const password = process.env.AUTH_PASSWORD;
if (!email || !password) {
  console.error("Set AUTH_EMAIL and AUTH_PASSWORD (a test admin account).");
  process.exit(1);
}

const b = await openBrowser({ width: 1280, height: 900 });
await b.send("Page.addScriptToEvaluateOnNewDocument", { source: "window.confirm = () => true;" });
const fails = [];
const expect = (name, ok, got) => { console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : ` — got: ${String(got).slice(0, 200)}`}`); if (!ok) fails.push(name); };
const text = () => b.evaluate("document.body.innerText");
const set = (el, v) => `(() => { const el = ${el}; const proto = el.tagName === "SELECT" ? HTMLSelectElement.prototype : el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, "value").set.call(el, ${JSON.stringify(v)}); el.dispatchEvent(new Event(el.tagName === "SELECT" ? "change" : "input", { bubbles: true })); return true; })()`;
// NOTE: each card also contains hidden edit dialogs with their own forms — always target precisely
const gamingCard = `[...document.querySelectorAll("main section")].find(s => s.querySelector("header h2")?.textContent === "Gaming Top-up")`;
const addForm = `${gamingCard}.querySelector("form:has(input[name=domainSlug])")`;
const catRows = `[...${gamingCard}.querySelectorAll(":scope > ul > li")]`;
// what a real visitor sees (after an edit the page shell streams its content, so use a real browser)
const storeText = async (path) => {
  const s = await openBrowser({ width: 1280, height: 900 });
  await s.goto(base + path, 5000);
  const t = await s.evaluate("document.body.innerText");
  const errs = s.errors;
  s.close();
  if (errs.length) console.log("  store page errors:", JSON.stringify(errs).slice(0, 300));
  return t ?? "";
};

// sign in
await b.goto(`${base}/admin/login`, 4000);
await b.evaluate(set(`document.querySelector("input[name=email]")`, email));
await b.evaluate(set(`document.querySelector("input[name=password]")`, password));
await b.evaluate(`document.querySelector("form button[type=submit]").click()`);
await b.sleep(3500);

await b.goto(`${base}/admin/categories`, 5000);
expect("page lists the 6 sections", (await b.evaluate(`document.querySelectorAll("main section").length`)) === 6, "");

// --- edit section tagline
const original = await b.evaluate(`${gamingCard}.querySelector("header p").textContent`);
const testTagline = `Test tagline ${Date.now()}`;
const editTagline = async (value) => {
  await b.evaluate(`${gamingCard}.querySelector("header button").click()`);
  await b.sleep(400);
  await b.evaluate(set(`document.querySelector("dialog[open] input[name=tagline]")`, value));
  await b.evaluate(`[...document.querySelectorAll("dialog[open] button[type=submit]")][0].click()`);
  await b.sleep(2500);
};
await editTagline(testTagline);
expect("section tagline saved in admin", (await b.evaluate(`${gamingCard}.querySelector("header p").textContent`)) === testTagline, "");
const gamingPage = await storeText("/gaming");
expect("store /gaming shows the new tagline immediately", gamingPage.includes(testTagline), gamingPage.split("\n").find((l) => l.includes("products")) ?? gamingPage.slice(0, 200));
await editTagline(original);
expect("tagline restored", (await b.evaluate(`${gamingCard}.querySelector("header p").textContent`)) === original, "");

// --- add a category
const catName = `E2E Category ${Date.now() % 100000}`;
await b.evaluate(set(`${addForm}.querySelector("input[name=name]")`, catName));
await b.evaluate(set(`${addForm}.querySelector("select[name=icon]")`, "Gamepad2"));
await b.evaluate(`${addForm}.querySelector("button[type=submit]").click()`);
await b.sleep(2500);
const rows = () => b.evaluate(`${catRows}.map(li => li.querySelector("p")?.textContent ?? "")`);
let list = await rows();
expect("category added at the end", list.at(-1) === catName, list.join(" | "));

// --- duplicate rejected
await b.evaluate(set(`${addForm}.querySelector("input[name=name]")`, catName));
await b.evaluate(`${addForm}.querySelector("button[type=submit]").click()`);
await b.sleep(2000);
expect("duplicate category rejected", (await text()).includes("already exists"), "");

// --- move up
await b.evaluate(`${catRows}.find(li => li.textContent.includes(${JSON.stringify(catName)})).querySelector("button[aria-label='Move up']").click()`);
await b.sleep(2500);
list = await rows();
expect("category moved up one place", list.at(-2) === catName, list.join(" | "));

// --- rename
const renamed = `${catName} Renamed`;
await b.evaluate(`${catRows}.find(li => li.textContent.includes(${JSON.stringify(catName)})).querySelector("button[aria-label^='Edit']").click()`);
await b.sleep(400);
await b.evaluate(set(`document.querySelector("dialog[open] input[name=name]")`, renamed));
await b.evaluate(set(`document.querySelector("dialog[open] input[name=slug]")`, ""));
await b.evaluate(`[...document.querySelectorAll("dialog[open] button[type=submit]")][0].click()`);
await b.sleep(2500);
list = await rows();
expect("category renamed", list.includes(renamed), list.join(" | "));

// --- delete
await b.evaluate(`${catRows}.find(li => li.textContent.includes(${JSON.stringify(renamed)})).querySelector("button[aria-label^='Delete']").click()`);
await b.sleep(2500);
list = await rows();
expect("category deleted", !list.some((n) => n.startsWith("E2E Category")), list.join(" | "));

expect("no browser errors", b.errors.length === 0, JSON.stringify(b.errors));
b.close();
process.exit(fails.length ? 1 : 0);
