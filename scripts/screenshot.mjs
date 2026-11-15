// Full-page screenshot + console errors.
// Usage: node scripts/screenshot.mjs <url> <out.png> [width] [light|dark] [mobile]
import { writeFileSync } from "node:fs";
import { openBrowser } from "./cdp.mjs";

const [url, out, width = "1440", scheme = "light", mobile] = process.argv.slice(2);
const b = await openBrowser({ width: +width, scheme, mobile: mobile === "mobile" });
await b.goto(url, 6000);
const h = await b.evaluate("document.documentElement.scrollHeight");
await b.send("Emulation.setDeviceMetricsOverride", { width: +width, height: h, deviceScaleFactor: 1, mobile: mobile === "mobile" });
await b.sleep(2500);
const r = await b.send("Page.captureScreenshot", { format: "png" });
writeFileSync(out, Buffer.from(r.data, "base64"));
console.log(`${out} (${width}x${h}) errors: ${JSON.stringify(b.errors)}`);
b.close();
process.exit(0);
