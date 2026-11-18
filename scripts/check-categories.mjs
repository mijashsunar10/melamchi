// End-to-end check of Sections & categories: edits in the admin show on the store immediately.
// Usage: AUTH_EMAIL=… AUTH_PASSWORD=… node scripts/check-categories.mjs [baseUrl]
// Needs a TEST admin. Changes the Gaming section summary and adds/renames/deletes a temporary
// category, then restores everything.
import { openBrowser } from "./cdp.mjs";

const base = process.argv[2] ?? "http://localhost:3000";
const email = process.env.AUTH_EMAIL;
const password = process.env.AUTH_PASSWORD;
if (!email || !password) {
  console.error("Set AUTH_EMAIL and AUTH_PASSWORD (a test admin account).");
  process.exit(1);
}

const b = await openBrowser({ width: 1280, height: 900 });
const fails = [];
const expect = (name, ok, got) => { console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : ` — got: ${String(got).slice(0, 200)}`}`); if (!ok) fails.push(name); };
const text = () => b.evaluate("document.body.innerText");
const set = (el, v) => `(() => { const el = ${el}; const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, "value").set.call(el, ${JSON.stringify(v)}); el.dispatchEvent(new Event("input", { bubbles: true })); return true; })()`;
const clickButton = (scope, label) => `[...${scope}.querySelectorAll("button")].find(x => x.textContent.trim() === ${JSON.stringify(label)}).click()`;
const dialog = `document.querySelector("dialog[open]")`;
const details = `document.querySelector("#details form")`;
const rowOf = (name) => `[...document.querySelectorAll("[data-category-list] > li")].find(li => li.querySelector("[data-category-name]").textContent === ${JSON.stringify(name)})`;
const names = () => b.evaluate(`[...document.querySelectorAll("[data-category-name]")].map(p => p.textContent)`);
// what a real visitor sees
const storeText = async (path) => {
  const s = await openBrowser({ width: 1280, height: 900 });
  await s.goto(base + path, 6000);
  const t = await s.evaluate("document.body.innerText");
  const errs = s.errors;
  s.close();
  if (errs.length) console.log("  store page errors:", JSON.stringify(errs).slice(0, 300));
  return t ?? "";
};

// sign in
await b.goto(`${base}/admin/login`, 5000);
await b.evaluate(set(`document.querySelector("input[name=email]")`, email));
await b.evaluate(set(`document.querySelector("input[name=password]")`, password));
await b.evaluate(`document.querySelector("form button[type=submit]").click()`);
await b.sleep(4000);

// --- overview: 6 simple cards
await b.goto(`${base}/admin/categories`, 6000);
const cards = await b.evaluate(`[...document.querySelectorAll("main a[href^='/admin/categories/']")].map(a => a.textContent)`);
expect("overview shows the 6 sections as cards", cards?.length === 6, JSON.stringify(cards));
expect("cards say how many categories/products", cards?.[0]?.includes("categor") && cards?.[0]?.includes("product"), cards?.[0]);
expect("no technical links shown", !(await text()).includes("?category="), "");

// --- open Gaming
await b.evaluate(`document.querySelector("main a[href='/admin/categories/gaming']").click()`);
await b.sleep(4000);
expect("section page opens", (await b.evaluate("location.pathname")) === "/admin/categories/gaming", await b.evaluate("location.pathname"));
expect("section page shows details + categories", (await text()).includes("Section details") && (await text()).includes("Add category"), "");

// --- edit the one-line summary
const original = await b.evaluate(`${details}.querySelector("input[name=tagline]").value`);
const testTagline = `Test summary ${Date.now()}`;
const saveTagline = async (value) => {
  await b.evaluate(set(`${details}.querySelector("input[name=tagline]")`, value));
  await b.evaluate(clickButton(details, "Save changes"));
  await b.sleep(3000);
};
await saveTagline(testTagline);
expect("summary saved (toast shown)", (await text()).includes("saved"), "");
const gamingPage = await storeText("/gaming");
expect("store /gaming shows the new summary immediately", gamingPage.includes(testTagline), gamingPage.slice(0, 200));
await saveTagline(original);
expect("summary restored", (await b.evaluate(`${details}.querySelector("input[name=tagline]").value`)) === original, "");

// --- add a category with the picture icon picker
const catName = `E2E Category ${Date.now() % 100000}`;
const addCategory = async (name) => {
  await b.evaluate(clickButton("document", "Add category"));
  await b.sleep(500);
  await b.evaluate(set(`${dialog}.querySelector("input[name=name]")`, name));
  await b.evaluate(`${dialog}.querySelector("button[aria-label='Game controller']").click()`);
  await b.sleep(200);
  await b.evaluate(`${dialog}.querySelector("button[type=submit]").click()`);
  await b.sleep(3000);
};
await addCategory(catName);
let list = await names();
expect("category added at the end", list?.at(-1) === catName, list?.join(" | "));
expect("dialog closed after adding", !(await b.evaluate(`!!${dialog}`)), "");

// --- duplicate rejected with a plain message
await addCategory(catName);
expect("duplicate rejected in plain words", (await text()).includes("There is already a category called"), "");
await b.evaluate(clickButton(dialog, "Cancel"));
await b.sleep(500);

// --- move up
await b.evaluate(`${rowOf(catName)}.querySelector("button[aria-label='Move up']").click()`);
await b.sleep(3000);
list = await names();
expect("category moved up one place", list?.at(-2) === catName, list?.join(" | "));

// --- rename (link stays the same)
const renamed = `${catName} Renamed`;
await b.evaluate(clickButton(rowOf(catName), "Rename"));
await b.sleep(500);
await b.evaluate(set(`${dialog}.querySelector("input[name=name]")`, renamed));
await b.evaluate(`${dialog}.querySelector("button[type=submit]").click()`);
await b.sleep(3000);
list = await names();
expect("category renamed", list?.includes(renamed), list?.join(" | "));

// --- delete with a friendly confirmation
await b.evaluate(clickButton(rowOf(renamed), "Delete"));
await b.sleep(500);
expect("delete asks first, in plain words", (await b.evaluate(`${dialog}.textContent`))?.includes("nothing else will change"), await b.evaluate(`${dialog}?.textContent`));
await b.evaluate(clickButton(dialog, "Yes, delete"));
await b.sleep(3000);
list = await names();
expect("category deleted", !list?.some((n) => n.startsWith("E2E Category")), list?.join(" | "));

expect("no browser errors", b.errors.length === 0, JSON.stringify(b.errors));
b.close();
process.exit(fails.length ? 1 : 0);
