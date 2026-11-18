// End-to-end check of B4.4 + B5: product pictures, deals, reviews, FAQ, help center, blog, legal pages, settings.
// Every change must show on the website immediately; everything is restored afterwards.
// Usage: AUTH_EMAIL=… AUTH_PASSWORD=… node scripts/check-content.mjs [baseUrl]   (needs a TEST admin)
import { join } from "node:path";
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
const J = JSON.stringify;
// set a React-controlled input / textarea / select
const set = (el, v) => `(() => { const el = ${el}; const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : el.tagName === "SELECT" ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, "value").set.call(el, ${J(v)}); el.dispatchEvent(new Event(el.tagName === "SELECT" ? "change" : "input", { bubbles: true })); return true; })()`;
const selectByText = (el, label) => `(() => { const el = ${el}; const o = [...el.options].find(o => o.textContent.trim().startsWith(${J(label)})); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set.call(el, o.value); el.dispatchEvent(new Event("change", { bubbles: true })); return o.value; })()`;
const click = (scope, label) => `[...${scope}.querySelectorAll("button, a")].find(x => x.textContent.trim() === ${J(label)}).click()`;
const visibleForm = `[...document.querySelectorAll("form")].find(f => f.offsetParent !== null && f.querySelector("[data-save]"))`;
const dialog = `document.querySelector("dialog[open]")`;
const go = async (path, wait = 5000) => { await b.goto(base + path, wait); await b.evaluate("window.confirm = () => true"); };
const save = async () => { await b.evaluate(`${visibleForm}.querySelector("[data-save]").click()`); await b.sleep(3500); };
const store = async (path) => {
  const s = await openBrowser({ width: 1280, height: 900 });
  await s.goto(base + path, 6000);
  const t = { text: (await s.evaluate("document.body.innerText")) ?? "", html: (await s.evaluate("document.documentElement.outerHTML")) ?? "" };
  s.close();
  return t;
};

// sign in
await go("/admin/login", 4000);
await b.evaluate(set(`document.querySelector("input[name=email]")`, email));
await b.evaluate(set(`document.querySelector("input[name=password]")`, password));
await b.evaluate(`document.querySelector("form button[type=submit]").click()`);
await b.sleep(4000);

// ---------------------------------------------------------------- sidebar
await go("/admin");
const nav = await b.evaluate(`[...document.querySelectorAll("nav[aria-label=Admin] a")].map(a => a.textContent.trim())`);
expect("sidebar: Deals, Reviews, Content, Settings are open (no “Soon”)", ["Deals", "Reviews", "Content", "Settings"].every((n) => nav?.includes(n)), J(nav));

// ---------------------------------------------------------------- pictures (B4.4)
await go("/admin/products");
const ffHref = await b.evaluate(`document.querySelector("[data-product='free-fire-diamonds'] a").getAttribute("href")`);
await go(ffHref, 6000);
const { root } = await b.send("DOM.getDocument", { depth: -1, pierce: true });
const { nodeId } = await b.send("DOM.querySelector", { nodeId: root.nodeId, selector: "[data-picture-input]" });
await b.send("DOM.setFileInputFiles", { nodeId, files: [join(import.meta.dirname, "fixtures", "test-picture.png")] });
await b.sleep(5000);
expect("picture uploaded (toast)", (await text()).includes("Picture saved"), (await text()).slice(-300));
let page = await store("/product/free-fire-diamonds");
const mediaUrl = page.html.match(/\/media\/[0-9a-f-]{36}\.webp/)?.[0];
expect("product page shows the uploaded picture", !!mediaUrl, "");
if (mediaUrl) {
  const res = await fetch(base + mediaUrl);
  expect("picture is served as WebP and cached", res.status === 200 && res.headers.get("content-type") === "image/webp" && res.headers.get("cache-control")?.includes("immutable"), `${res.status} ${res.headers.get("content-type")}`);
}
await b.evaluate(click("document", "Remove picture"));
await b.sleep(3500);
page = await store("/product/free-fire-diamonds");
expect("picture removed → colour card again", !page.html.includes("/media/"), "");
if (mediaUrl) expect("removed picture is deleted", (await fetch(base + mediaUrl)).status === 404, "");

// ---------------------------------------------------------------- deals
await go("/admin/deals");
await b.evaluate(click("document", "Add deal"));
await b.sleep(600);
await b.evaluate(selectByText(`${dialog}.querySelector("select[name=product]")`, "PUBG Mobile UC"));
await b.sleep(300);
await b.evaluate(selectByText(`${dialog}.querySelector("select[name=plan]")`, "60 UC"));
await b.evaluate(set(`${dialog}.querySelector("input[name=percent]")`, "33"));
await b.evaluate(click(dialog, "In 1 day"));
await b.evaluate(set(`${dialog}.querySelector("input[name=label]")`, "E2E Deal"));
expect("deal shows the price customers pay", (await b.evaluate(`${dialog}.textContent`))?.includes("Customer pays"), "");
await b.evaluate(`${dialog}.querySelector("button[type=submit]").click()`);
await b.sleep(3500);
expect("deal is running", (await b.evaluate(`document.querySelector("[data-deal-list=running]").textContent`))?.includes("E2E Deal"), "");
page = await store("/deals");
expect("deal shows on /deals immediately", page.text.includes("E2E Deal") && page.text.includes("33%"), page.text.slice(0, 200));
const dealRow = `[...document.querySelectorAll("[data-deal-list=running] [data-deal]")].find(li => li.textContent.includes("E2E Deal"))`;
await b.evaluate(`${dealRow}.querySelector("button[aria-label^='More actions']").click()`);
await b.evaluate(click(dealRow, "End now"));
await b.sleep(3500);
page = await store("/deals");
expect("ended deal is gone from the website", !page.text.includes("E2E Deal"), "");
const endedRow = `[...document.querySelectorAll("[data-deal-list=ended] [data-deal]")].find(li => li.textContent.includes("E2E Deal"))`;
expect("ended deal listed under Ended", await b.evaluate(`!!${endedRow}`), "");
await b.evaluate(`${endedRow}.querySelector("button[aria-label^='More actions']").click()`);
await b.evaluate(click(endedRow, "Delete"));
await b.sleep(3000);
expect("deal deleted", !(await text()).includes("E2E Deal"), "");

// ---------------------------------------------------------------- reviews
const comment = `E2E review ${Date.now() % 100000} — super fast delivery`;
await go("/admin/reviews");
await b.evaluate(click("document", "Add review"));
await b.sleep(600);
await b.evaluate(selectByText(`${dialog}.querySelector("select[name=product]")`, "Free Fire Diamonds"));
await b.evaluate(`${dialog}.querySelector("button[aria-label='4 stars']").click()`);
await b.evaluate(set(`${dialog}.querySelector("textarea[name=comment]")`, comment));
await b.evaluate(set(`${dialog}.querySelector("input[name=name]")`, "E2E Tester"));
await b.evaluate(set(`${dialog}.querySelector("input[name=city]")`, "Pokhara"));
await b.evaluate(`${dialog}.querySelector("button[type=submit]").click()`);
await b.sleep(3500);
expect("review added", (await text()).includes(comment), "");
page = await store("/product/free-fire-diamonds");
expect("review shows on the product page", page.text.includes(comment), "");
const reviewRow = `document.querySelector("[data-review='E2E Tester']")`;
await b.evaluate(click(reviewRow, "On website"));
await b.sleep(3000);
page = await store("/product/free-fire-diamonds");
expect("hidden review is gone from the website", !page.text.includes(comment), "");
await b.evaluate(`${reviewRow}.querySelector("button[aria-label='Delete review']").click()`);
await b.sleep(3000);
expect("review deleted", !(await text()).includes(comment), "");

// ---------------------------------------------------------------- FAQ (home)
const faqQ = `E2E question ${Date.now() % 100000}?`;
await go("/admin/content/faq/home");
const faqCount = await b.evaluate(`document.querySelectorAll("[data-qa]").length`);
await b.evaluate(click("document", "Add question & answer"));
await b.evaluate(set(`[...document.querySelectorAll("[data-qa]")].at(-1).querySelector("[data-q]")`, faqQ));
await b.evaluate(set(`[...document.querySelectorAll("[data-qa]")].at(-1).querySelector("[data-a]")`, "E2E answer."));
await save();
page = await store("/");
expect("home FAQ shows the new question", page.text.includes(faqQ), "");
await b.evaluate(`[...document.querySelectorAll("[data-qa]")].at(-1).querySelector("button[aria-label='Remove question']").click()`);
await save();
expect("home FAQ restored", (await b.evaluate(`document.querySelectorAll("[data-qa]").length`)) === faqCount, "");
await go("/admin/content/faq/gaming");
expect("section FAQ editor opens for Gaming", (await text()).includes("Gaming Top-up questions") || (await text()).includes("questions"), "");

// ---------------------------------------------------------------- help center
await go("/admin/content/help");
await b.evaluate(click("document", "Add topic"));
await b.sleep(300);
await b.evaluate(set(`[...document.querySelectorAll("[data-topic]")].at(-1).querySelector("[data-topic-name]")`, "E2E Topic"));
await b.evaluate(click(`[...document.querySelectorAll("[data-topic]")].at(-1)`, "Add question & answer"));
await b.evaluate(set(`[...document.querySelectorAll("[data-topic]")].at(-1).querySelector("[data-q]")`, "E2E help question?"));
await b.evaluate(set(`[...document.querySelectorAll("[data-topic]")].at(-1).querySelector("[data-a]")`, "E2E help answer."));
await save();
page = await store("/support");
expect("new help topic shows on /support", page.text.includes("E2E Topic"), "");
await b.evaluate(`[...document.querySelectorAll("[data-topic]")].at(-1).querySelector("button[aria-label='Remove topic']").click()`);
await save();
page = await store("/support");
expect("help topic removed", !page.text.includes("E2E Topic"), "");

// ---------------------------------------------------------------- blog
const title = `E2E guide ${Date.now() % 100000}`;
const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
await go("/admin/content/blog/new");
await b.evaluate(set(`${visibleForm}.querySelector("input[name=title]")`, title));
await b.evaluate(set(`${visibleForm}.querySelector("textarea[name=excerpt]")`, "A temporary guide written by the automatic test."));
await b.evaluate(set(`${visibleForm}.querySelector("input[name=category]")`, "Gaming"));
await b.evaluate(selectByText(`${visibleForm}.querySelector("select[name=productSlug]")`, "Free Fire Diamonds"));
await b.evaluate(set(`${visibleForm}.querySelector("[data-block=p] textarea")`, "This is the first paragraph of the test guide."));
await b.evaluate(click(visibleForm, "Steps"));
await b.evaluate(set(`${visibleForm}.querySelector("[data-block=steps] textarea")`, "Step one\nStep two"));
await save();
expect("post saved → editor opens", /^\/admin\/content\/blog\/[0-9a-f-]{36}$/.test(await b.evaluate("location.pathname")), await b.evaluate("location.pathname"));
page = await store(`/blog/${slug}`);
expect("post is on the website with its steps", page.text.includes(title) && page.text.includes("Step two"), page.text.slice(0, 200));
await go("/admin/content/blog");
await b.evaluate(click(`document.querySelector("[data-post='${slug}']")`, "Published"));
await b.sleep(3000);
page = await store("/blog");
expect("draft post is hidden from /blog", !page.text.includes(title), "");
await b.evaluate(`document.querySelector("[data-post='${slug}'] button[aria-label^='Delete']").click()`);
await b.sleep(3000);
expect("post deleted", !(await b.evaluate(`!!document.querySelector("[data-post='${slug}']")`)), "");

// ---------------------------------------------------------------- legal page
await go("/admin/content/legal/terms");
const oldTitle = await b.evaluate(`${visibleForm}.querySelector("input[name=title]").value`);
await b.evaluate(set(`${visibleForm}.querySelector("input[name=title]")`, `${oldTitle} E2E`));
await save();
page = await store("/terms");
expect("legal page title updated on the website", page.text.includes(`${oldTitle} E2E`), "");
await b.evaluate(set(`${visibleForm}.querySelector("input[name=title]")`, oldTitle));
await save();
page = await store("/terms");
expect("legal page restored", !page.text.includes(`${oldTitle} E2E`), "");

// ---------------------------------------------------------------- settings
await go("/admin/settings");
const oldNumber = await b.evaluate(`document.querySelector("input[name=whatsappNumber]").value`);
await b.evaluate(set(`document.querySelector("input[name=whatsappNumber]")`, "12345"));
await save();
expect("bad WhatsApp number is explained", (await text()).includes("977 followed by"), "");
await b.evaluate(set(`document.querySelector("input[name=whatsappNumber]")`, "9779811111111"));
await save();
page = await store("/");
expect("new WhatsApp number used on the website", page.html.includes("wa.me/9779811111111") && !page.html.includes(`wa.me/${oldNumber}`), "");
page = await store("/contact");
expect("contact page uses it too", page.html.includes("wa.me/9779811111111"), "");
await b.evaluate(set(`document.querySelector("input[name=whatsappNumber]")`, oldNumber));
await save();
page = await store("/");
expect("WhatsApp number restored", page.html.includes(`wa.me/${oldNumber}`), "");

expect("no browser errors", b.errors.length === 0, J(b.errors));
b.close();
process.exit(fails.length ? 1 : 0);
