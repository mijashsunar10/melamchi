// Measures page weight + load timing on a production server.
// Usage: node scripts/perf.mjs <baseUrl> [path ...]
import { openBrowser } from "./cdp.mjs";

const [base, ...paths] = process.argv.slice(2);
const list = paths.length ? paths : ["/", "/gaming", "/product/free-fire-diamonds", "/support"];

for (const path of list) {
  const b = await openBrowser({ width: 390, height: 844, mobile: true });
  await b.send("Network.enable");
  await b.send("Network.setCacheDisabled", { cacheDisabled: true });
  await b.goto(base + path, 7000);
  const res = await b.evaluate(`JSON.stringify((() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const lcp = performance.getEntriesByType("largest-contentful-paint").at(-1);
    const out = { image: 0, script: 0, font: 0, css: 0, other: 0, count: 0 };
    for (const r of performance.getEntriesByType("resource")) {
      const size = r.transferSize || r.encodedBodySize || 0;
      out.count++;
      const k = r.initiatorType === "img" || /\\/_next\\/image|\\.(jpe?g|png|webp|avif)/.test(r.name) ? "image"
        : r.initiatorType === "script" || /\\.js/.test(r.name) ? "script"
        : /\\.woff2?/.test(r.name) ? "font"
        : /\\.css/.test(r.name) ? "css" : "other";
      out[k] += size;
    }
    out.html = nav.transferSize;
    out.domContentLoaded = Math.round(nav.domContentLoadedEventEnd);
    out.load = Math.round(nav.loadEventEnd);
    return out;
  })())`);
  const r = JSON.parse(res);
  const kb = (n) => `${Math.round(n / 1024)}KB`;
  const total = r.image + r.script + r.font + r.css + r.other + r.html;
  console.log(`${path.padEnd(30)} total ${kb(total).padStart(7)} | img ${kb(r.image).padStart(6)} js ${kb(r.script).padStart(6)} font ${kb(r.font).padStart(5)} css ${kb(r.css).padStart(5)} | DCL ${r.domContentLoaded}ms load ${r.load}ms | ${r.count} req`);
  b.close();
}
process.exit(0);
