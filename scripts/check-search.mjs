// End-to-end check of the search page: typed queries → top result.
// Usage: node scripts/check-search.mjs [baseUrl]
import { openBrowser } from "./cdp.mjs";

const base = process.argv[2] ?? "http://localhost:3000";
const b = await openBrowser();
const fails = [];
const expect = (name, ok, got) => { console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : ` — got: ${got}`}`); if (!ok) fails.push(name); };

// 1. URL query (as used by the hero search form)
await b.goto(`${base}/products?q=pubg`);
const first = () => b.evaluate(`document.querySelector("main .grid h3")?.textContent ?? ""`);
expect("?q=pubg → PUBG first", (await first()).includes("PUBG"), await first());

// 2. Typing queries
const type = async (v) => {
  await b.evaluate(`(() => { const i = document.querySelector("input[type=search]"); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(i, ${JSON.stringify(v)}); i.dispatchEvent(new Event("input", { bubbles: true })); return true; })()`);
  await b.sleep(350);
};
const cases = [
  ["ff", "Free Fire"],
  ["free fire diamond", "Free Fire"],
  ["uc", "PUBG"],
  ["mlbb", "Mobile Legends"],
  ["gpt", "ChatGPT"],
  ["netflix", "Netflix"],
  ["windows", "Windows 11"],
  ["spotify premium", "Spotify Premium"],
  ["gift card", "Gift Card"],
  ["NETFLIX", "Netflix"],
];
for (const [q, want] of cases) {
  await type(q);
  const got = await first();
  expect(`"${q}" → ${want}`, got.includes(want), got);
}

await type("xyznotaproduct");
const empty = await b.evaluate(`document.body.textContent.includes("No results for")`);
expect("no-match shows empty state", empty, empty);

// 3. URL is kept in sync
await type("canva"); await b.sleep(400);
const url = await b.evaluate("location.search");
expect("URL updates to ?q=canva", url === "?q=canva", url);

// 4. Section filter
await type("");
await b.evaluate(`[...document.querySelectorAll("[role=tab]")].find(t => t.textContent.startsWith("Gift Cards")).click()`); await b.sleep(300);
const names = await b.evaluate(`[...document.querySelectorAll("main .grid h3")].map(h => h.textContent).join(" | ")`);
expect("Gift Cards filter shows only gift cards", names.split(" | ").every((n) => /Gift Card|Card|Razer|Steam|Valorant/.test(n)) && names.length > 0, names);
expect("no browser errors", b.errors.length === 0, JSON.stringify(b.errors));

b.close();
process.exit(fails.length ? 1 : 0);
