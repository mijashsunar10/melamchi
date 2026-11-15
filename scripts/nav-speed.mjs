// Measures client-side page switches (click a link → new page visible).
// Usage: node scripts/nav-speed.mjs <baseUrl>
import { openBrowser } from "./cdp.mjs";

const base = process.argv[2] ?? "http://localhost:3000";
const b = await openBrowser({ width: 1440, height: 900 });
await b.goto(base + "/", 6000);

const hops = [
  ["/gaming", "Gaming Top-up"],
  ["/ai-tools", "AI Tools"],
  ["/support", "How can we help?"],
  ["/", "TOPX"],
  ["/gift-cards", "Gift Cards"],
];
for (const [href, h1] of hops) {
  const ms = await b.evaluate(`new Promise((resolve) => {
    const a = [...document.querySelectorAll('a[href="${href}"]')][0];
    const t0 = performance.now();
    a.click();
    const tick = () => {
      const h = document.querySelector("h1");
      if (location.pathname === "${href}" && h && h.textContent.includes(${JSON.stringify(h1)})) resolve(Math.round(performance.now() - t0));
      else if (performance.now() - t0 > 10000) resolve(-1);
      else requestAnimationFrame(tick);
    };
    tick();
  })`);
  console.log(`click → ${href.padEnd(12)} ${ms < 0 ? "timeout" : ms + "ms"}`);
  await b.sleep(1500);
}
b.close();
process.exit(0);
