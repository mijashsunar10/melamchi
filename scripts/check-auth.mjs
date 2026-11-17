// End-to-end check of admin authentication (dev or production server must be running).
// Usage: AUTH_EMAIL=… AUTH_PASSWORD=… node scripts/check-auth.mjs [baseUrl]
// Use a TEST account — the last check deliberately triggers the login rate limit for it
// (that account is then locked for 15 minutes; run other admin tests with a different account).
import { openBrowser } from "./cdp.mjs";

const base = process.argv[2] ?? "http://localhost:3000";
const email = process.env.AUTH_EMAIL;
const password = process.env.AUTH_PASSWORD;
if (!email || !password) {
  console.error("Set AUTH_EMAIL and AUTH_PASSWORD (a test admin account).");
  process.exit(1);
}

const b = await openBrowser();
const fails = [];
const expect = (name, ok, got) => { console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : ` — got: ${got}`}`); if (!ok) fails.push(name); };
const path = () => b.evaluate("location.pathname + location.search");
const text = () => b.evaluate("document.body.innerText");
const login = async (em, pw) => {
  await b.evaluate(`(() => {
    document.querySelector("input[name=email]").value = ${JSON.stringify(em)};
    document.querySelector("input[name=password]").value = ${JSON.stringify(pw)};
    document.querySelector("form button[type=submit]").click();
    return true; })()`);
  await b.sleep(2500);
};

// 1. Protected page redirects to login
await b.goto(`${base}/admin`, 5000);
expect("/admin redirects to login (with ?next)", (await path()) === "/admin/login?next=%2Fadmin", await path());

// 2. Wrong password
await login(email, "definitely-wrong-password");
expect("wrong password shows generic error", (await text()).includes("Incorrect email or password."), (await text()).slice(0, 200));

// 3. Correct login → dashboard
await login(email, password);
expect("correct login opens /admin", (await path()) === "/admin", await path());
await b.sleep(1500);
expect("dashboard greets the user", (await text()).includes("Namaste"), (await text()).slice(0, 200));

// 4. Session cookie is httpOnly (not readable by page JavaScript)
const jsCookies = await b.evaluate("document.cookie");
const { cookies } = await b.send("Network.getAllCookies");
const sessionCookie = cookies.find((c) => c.name === "topx_session");
expect("session cookie exists and is httpOnly", !!sessionCookie && sessionCookie.httpOnly && !jsCookies.includes("topx_session"), JSON.stringify(sessionCookie));

// 5. Visiting the login page while signed in goes back to /admin
await b.goto(`${base}/admin/login`, 4000);
expect("login page redirects signed-in user to /admin", (await path()) === "/admin", await path());

// 6. Sign out
await b.evaluate(`document.querySelector('button[aria-label="Sign out"]').click()`);
await b.sleep(2500);
expect("sign out returns to login", (await path()).startsWith("/admin/login"), await path());
await b.goto(`${base}/admin`, 4000);
expect("after sign out /admin is protected again", (await path()).startsWith("/admin/login"), await path());

// 7. A forged cookie is rejected by the database check
await b.send("Network.setCookie", { name: "topx_session", value: "forged-token-123", url: base, httpOnly: true });
await b.goto(`${base}/admin`, 5000);
expect("forged session cookie is rejected", (await path()).startsWith("/admin/login"), await path());
await b.send("Network.deleteCookies", { name: "topx_session", url: base });

// 8. Rate limit after repeated wrong passwords
await b.goto(`${base}/admin/login`, 4000);
for (let i = 0; i < 6; i++) await login(email, `wrong-${i}`);
expect("too many attempts are blocked", (await text()).includes("Too many attempts"), (await text()).slice(0, 200));

expect("no browser errors", b.errors.length === 0, JSON.stringify(b.errors));
b.close();
process.exit(fails.length ? 1 : 0);
