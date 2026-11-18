// End-to-end check of Products admin: add, edit prices/packages, hide, copy, delete — and the store updates immediately.
// Usage: AUTH_EMAIL=… AUTH_PASSWORD=… node scripts/check-products.mjs [baseUrl]
// Needs a TEST admin. Creates a temporary product and deletes it again.
import { openBrowser } from "./cdp.mjs";

const base = process.argv[2] ?? "http://localhost:3000";
const email = process.env.AUTH_EMAIL;
const password = process.env.AUTH_PASSWORD;
if (!email || !password) {
  console.error("Set AUTH_EMAIL and AUTH_PASSWORD (a test admin account).");
  process.exit(1);
}

const b = await openBrowser({ width: 1366, height: 900 });
const fails = [];
const expect = (name, ok, got) => { console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : ` — got: ${String(got).slice(0, 300)}`}`); if (!ok) fails.push(name); };
const text = () => b.evaluate("document.body.innerText");
const set = (el, v) => `(() => { const el = ${el}; const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, "value").set.call(el, ${JSON.stringify(v)}); el.dispatchEvent(new Event("input", { bubbles: true })); return true; })()`;
const clickText = (scope, label) => `[...${scope}.querySelectorAll("button, a")].find(x => x.textContent.trim() === ${JSON.stringify(label)}).click()`;
const dialog = `document.querySelector("dialog[open]")`;
// Next.js keeps the previous page mounted but hidden — always use the visible editor
const form = `[...document.querySelectorAll("[data-product-form]")].find(f => f.offsetParent !== null)`;
const storeText = async (path) => {
  const s = await openBrowser({ width: 1280, height: 900 });
  await s.goto(base + path, 6000);
  const t = await s.evaluate("document.body.innerText");
  s.close();
  return t ?? "";
};

// sign in
await b.goto(`${base}/admin/login`, 5000);
await b.evaluate(set(`document.querySelector("input[name=email]")`, email));
await b.evaluate(set(`document.querySelector("input[name=password]")`, password));
await b.evaluate(`document.querySelector("form button[type=submit]").click()`);
await b.sleep(4000);

// --- list
await b.goto(`${base}/admin/products`, 6000);
const total = await b.evaluate(`document.querySelectorAll("[data-product]").length`);
expect("product list shows products", total > 10, total);
await b.evaluate(set(`document.querySelector("input[type=search]")`, "free fire"));
await b.sleep(800);
const found = await b.evaluate(`[...document.querySelectorAll("[data-product]")].map(li => li.dataset.product)`);
expect("search filters the list", found?.length >= 1 && found.includes("free-fire-diamonds") && found.length < total, JSON.stringify(found));

// --- add
await b.goto(`${base}/admin/products/new`, 6000);
const name = `E2E Product ${Date.now() % 100000}`;
const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
await b.evaluate(set(`${form}.querySelector("input[name=name]")`, name));
await b.evaluate(set(`${form}.querySelector("input[name=brand]")`, "E2E Brand"));
await b.evaluate(set(`${form}.querySelector("textarea[name=shortDescription]")`, "A temporary product made by the automatic test."));
await b.evaluate(set(`${form}.querySelector("[data-plan-name]")`, "100 Gems"));
await b.evaluate(set(`${form}.querySelector("[data-plan-price]")`, "1,234"));
await b.sleep(300);
expect("unsaved-changes note shows", (await text()).includes("unsaved changes"), "");
await b.evaluate(`${form}.querySelector("[data-save]").click()`);
await b.sleep(5000);
const editPath = await b.evaluate("location.pathname");
expect("after saving, the edit page opens", /^\/admin\/products\/[0-9a-f-]{36}$/.test(editPath), editPath);
let store = await storeText(`/product/${slug}`);
expect("new product is on the website with its price", store.includes(name) && store.includes("1,234"), store.slice(0, 300));

// --- validation in plain words
await b.evaluate(set(`${form}.querySelector("[data-plan-price]")`, "abc"));
await b.evaluate(`${form}.querySelector("[data-save]").click()`);
await b.sleep(800);
expect("bad price is explained", (await text()).includes("prices must be numbers"), "");

// --- edit price, add a second package (out of stock)
await b.evaluate(set(`${form}.querySelector("[data-plan-price]")`, "999"));
await b.evaluate(clickText(form, "Add package"));
await b.sleep(300);
await b.evaluate(set(`${form}.querySelectorAll("[data-plan-name]")[1]`, "500 Gems"));
await b.evaluate(set(`${form}.querySelectorAll("[data-plan-price]")[1]`, "4500"));
await b.evaluate(`${form}.querySelectorAll("[data-plan]")[1].querySelector("input[role=switch]").click()`);
await b.evaluate(`${form}.querySelector("[data-save]").click()`);
await b.sleep(5000);
expect("changes saved", (await text()).includes("All changes saved"), (await text()).slice(-200));
const planCount = await b.evaluate(`${form}.querySelectorAll("[data-plan]").length`);
expect("two packages after saving", planCount === 2, planCount + " " + JSON.stringify(await b.evaluate(`[...${form}.querySelectorAll("[data-plan-name]")].map(i => i.value)`)));
store = await storeText(`/product/${slug}`);
expect("store shows the new price immediately", store.includes("999") && store.includes("500 Gems"), store.slice(0, 400));

// --- hide from the list
await b.goto(`${base}/admin/products`, 6000);
const row = `document.querySelector("[data-product='${slug}']")`;
await b.evaluate(clickText(row, "On website"));
await b.sleep(3500);
expect("product shows as hidden", (await b.evaluate(`${row}.textContent`))?.includes("Hidden"), "");
store = await storeText(`/product/${slug}`);
expect("hidden product is gone from the website", !store.includes("E2E Brand"), store.slice(0, 200));

// --- copy
await b.evaluate(`${row}.querySelector("button[aria-label^='More actions']").click()`);
await b.evaluate(clickText(row, "Make a copy"));
await b.sleep(5000);
await b.goto(`${base}/admin/products/new`, 5000);
expect("“Add product” starts empty again after creating one", (await b.evaluate(`${form}.querySelector("input[name=name]").value`)) === "", "");
await b.evaluate("history.back()");
await b.sleep(3000);
expect("copy opens in the editor", (await b.evaluate(`${form}.querySelector("input[name=name]").value`)) === `${name} (copy)`, "");

// --- delete both
for (const s of [`${slug}-copy`, slug]) {
  await b.goto(`${base}/admin/products`, 6000);
  const r = `document.querySelector("[data-product='${s}']")`;
  await b.evaluate(`${r}.querySelector("button[aria-label^='More actions']").click()`);
  await b.evaluate(clickText(r, "Delete"));
  await b.sleep(500);
  expect(`delete asks first (${s})`, (await b.evaluate(`${dialog}?.textContent`))?.includes("removed for good"), "");
  await b.evaluate(clickText(dialog, "Yes, delete"));
  await b.sleep(3500);
  expect(`deleted (${s})`, !(await b.evaluate(`!!${r}`)), "");
}

expect("no browser errors", b.errors.length === 0, JSON.stringify(b.errors));
b.close();
process.exit(fails.length ? 1 : 0);
