// Tiny headless-Chrome helper (no dependencies) used by the dev check scripts.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export async function openBrowser({ width = 1440, height = 900, scheme = "light", mobile = false } = {}) {
  const port = 9300 + Math.floor(Math.random() * 600);
  // own profile folder per browser, so several test browsers never share (or hijack) one Chrome
  const profile = mkdtempSync(join(tmpdir(), "topx-cdp-"));
  const chrome = spawn(
    "google-chrome",
    ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
     `--blink-settings=preferredColorScheme=${scheme === "dark" ? 0 : 1}`, "about:blank"],
    { stdio: "ignore" },
  );
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let tabs;
  for (let i = 0; i < 40 && !tabs; i++) {
    try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); } catch { await sleep(250); }
  }
  const ws = new WebSocket(tabs.find((t) => t.type === "page").webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { pending.get(d.id)(d.result); pending.delete(d.id); }
    if (d.method === "Runtime.exceptionThrown") errors.push(d.params.exceptionDetails.exception?.description ?? d.params.exceptionDetails.text);
    if (d.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(d.params.type))
      errors.push(d.params.args.map((a) => a.value ?? a.description).join(" ").slice(0, 300));
  };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result?.value;
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  return {
    send, evaluate, errors, sleep,
    async goto(url, wait = 5000) { await send("Page.navigate", { url }); await sleep(wait); },
    close() {
      ws.close();
      chrome.kill();
      setTimeout(() => rmSync(profile, { recursive: true, force: true }), 500).unref();
    },
  };
}
