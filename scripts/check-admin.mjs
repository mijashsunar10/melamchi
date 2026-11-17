// End-to-end check of the admin dashboard (B3): shell, team management, roles, own account.
// Usage: AUTH_EMAIL=… AUTH_PASSWORD=… node scripts/check-admin.mjs [baseUrl]
// Needs a TEST admin account. Creates and deletes a temporary staff account through the UI.
import { openBrowser } from "./cdp.mjs";

const base = process.argv[2] ?? "http://localhost:3000";
const adminEmail = process.env.AUTH_EMAIL;
const adminPass = process.env.AUTH_PASSWORD;
if (!adminEmail || !adminPass) {
  console.error("Set AUTH_EMAIL and AUTH_PASSWORD (a test admin account).");
  process.exit(1);
}
const staffEmail = `e2e-staff-${Date.now()}@topx.local`;
const staffPass = "Staff-Passw0rd-123";

const b = await openBrowser({ width: 1280, height: 900 });
await b.send("Page.addScriptToEvaluateOnNewDocument", { source: "window.confirm = () => true;" });
const fails = [];
const expect = (name, ok, got) => { console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : ` — got: ${String(got).slice(0, 200)}`}`); if (!ok) fails.push(name); };
const path = () => b.evaluate("location.pathname");
const text = () => b.evaluate("document.body.innerText");
const setVal = (sel, v) => b.evaluate(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); const proto = el.tagName === "SELECT" ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, "value").set.call(el, ${JSON.stringify(v)}); el.dispatchEvent(new Event(el.tagName === "SELECT" ? "change" : "input", { bubbles: true })); return true; })()`);
const clickText = (sel, t) => b.evaluate(`(() => { const el = [...document.querySelectorAll(${JSON.stringify(sel)})].find(x => x.textContent.includes(${JSON.stringify(t)})); if (!el) return false; el.click(); return true; })()`);
const login = async (em, pw) => {
  await b.goto(`${base}/admin/login`, 4000);
  await setVal("input[name=email]", em);
  await setVal("input[name=password]", pw);
  await clickText("button[type=submit]", "Sign in");
  await b.sleep(3500);
};
const logout = async () => {
  await b.evaluate(`document.querySelector('button[aria-label="Sign out"]').click()`);
  await b.sleep(2500);
};
const rowAction = async (email, label) => {
  await b.evaluate(`(() => { const row = [...document.querySelectorAll("tbody tr")].find(r => r.textContent.includes(${JSON.stringify(email)})); row.querySelector("button[aria-label^='Actions']").click(); return true; })()`);
  await b.sleep(300);
  await clickText("[role=menuitem]", label);
  await b.sleep(2500);
};
// role cell text (textContent, not affected by CSS capitalisation)
const rowText = (email) => b.evaluate(`(() => { const r = [...document.querySelectorAll("tbody tr")].find(r => r.textContent.includes(${JSON.stringify(email)})); return r ? [...r.cells].map(c => c.textContent.trim()).join(" | ") : ""; })()`);
const roleOf = async (email) => (await rowText(email)).split(" | ")[1] ?? "";

// --- Admin: dashboard
await login(adminEmail, adminPass);
expect("admin signs in to the dashboard", (await path()) === "/admin" && (await text()).includes("Namaste"), await path());
expect("sidebar shows Staff & users for admins", (await text()).includes("Staff & users"), "");

// --- Create staff through the form
await b.goto(`${base}/admin/users`, 5000);
await setVal("input[name=name]", "E2E Staff");
await setVal("input[name=email]", staffEmail);
await setVal("select[name=role]", "staff");
await setVal("input[name=password]", staffPass);
await clickText("button[type=submit]", "Add team member");
await b.sleep(3000);
expect("new staff appears in the team table", (await roleOf(staffEmail)) === "staff", await rowText(staffEmail));

// --- Duplicate email is rejected
await setVal("input[name=name]", "Dup");
await setVal("input[name=email]", staffEmail);
await setVal("input[name=password]", staffPass);
await clickText("button[type=submit]", "Add team member");
await b.sleep(2500);
expect("duplicate email is rejected", (await text()).includes("already exists"), "");

// --- Admin can't act on own account
const myRow = await rowText(adminEmail);
expect("own row has no actions (shows You)", myRow.includes("You"), myRow);
await logout();

// --- Staff: limited access
await login(staffEmail, staffPass);
expect("staff can sign in", (await path()) === "/admin", await path());
expect("staff does not see Staff & users", !(await text()).includes("Staff & users"), "");
await b.goto(`${base}/admin/users`, 5000);
expect("staff opening /admin/users is sent to the dashboard", (await path()) === "/admin", await path());
await logout();

// --- Admin: deactivate → staff can't sign in → re-activate
await login(adminEmail, adminPass);
await b.goto(`${base}/admin/users`, 5000);
await rowAction(staffEmail, "Deactivate");
expect("staff deactivated", (await rowText(staffEmail)).includes("Deactivated"), await rowText(staffEmail));
await logout();
await login(staffEmail, staffPass);
expect("deactivated staff cannot sign in", (await text()).includes("Incorrect email or password."), await path());

await login(adminEmail, adminPass);
await b.goto(`${base}/admin/users`, 5000);
await rowAction(staffEmail, "Re-activate");
expect("staff re-activated", (await rowText(staffEmail)).includes("| Active |"), await rowText(staffEmail));

// --- Role change
await rowAction(staffEmail, "Make admin");
expect("role changed to admin", (await roleOf(staffEmail)) === "admin", await rowText(staffEmail));
await rowAction(staffEmail, "Make staff");
expect("role changed back to staff", (await roleOf(staffEmail)) === "staff", await rowText(staffEmail));

// --- Reset password
await rowAction(staffEmail, "Reset password");
await setVal("dialog[open] input", "Brand-New-Pass-456");
await clickText("dialog[open] button", "Reset password");
await b.sleep(2500);
expect("password reset confirmed", (await text()).includes("Password reset"), "");

// --- Delete
await rowAction(staffEmail, "Delete");
expect("staff deleted", (await rowText(staffEmail)) === "", await rowText(staffEmail));

// --- Own account: change password and back
await b.goto(`${base}/admin/account`, 5000);
const changePw = async (cur, next) => {
  await setVal("input[name=current]", cur);
  await setVal("input[name=next]", next);
  await setVal("input[name=confirm]", next);
  await clickText("button[type=submit]", "Change password");
  await b.sleep(3000);
};
await changePw("wrong-current-password", "Another-Pass-789");
expect("wrong current password rejected", (await text()).includes("current password is incorrect"), "");
await changePw(adminPass, "Temp-Changed-Pass-1");
expect("own password changed", (await text()).includes("Password changed"), "");
await changePw("Temp-Changed-Pass-1", adminPass);
expect("own password changed back", (await text()).includes("Password changed"), "");

expect("no browser errors", b.errors.length === 0, JSON.stringify(b.errors));
b.close();
process.exit(fails.length ? 1 : 0);
