// Create (or reset) an admin / staff account.
//
//   npm run admin:create -- --email you@example.com --name "Your Name" [--role admin|staff]
//
// You'll be asked for the password (hidden). For automation you can pass ADMIN_PASSWORD instead.

import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline";
import { eq } from "drizzle-orm";

// Load DATABASE_URL from .env.local, then .env (same files Next.js reads)
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // file missing — fine
  }
}

const args = process.argv.slice(2);
const arg = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: stdin, output: stdout, terminal: true });
    const write = (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput.bind(rl);
    (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s: string) =>
      write(s.startsWith(question) ? s : "*".repeat(s.length ? 1 : 0));
    rl.question(question, (answer) => {
      rl.close();
      stdout.write("\n");
      resolve(answer);
    });
  });
}

async function main() {
  const email = arg("email")?.trim().toLowerCase();
  const name = arg("name")?.trim() || "Admin";
  const role = (arg("role") ?? "admin") as "admin" | "staff";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('Usage: npm run admin:create -- --email you@example.com --name "Your Name" [--role admin|staff]');
    process.exit(1);
  }
  if (role !== "admin" && role !== "staff") {
    console.error("--role must be admin or staff");
    process.exit(1);
  }

  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    password = await askHidden("Password (min 10 characters): ");
    const again = await askHidden("Repeat password: ");
    if (password !== again) {
      console.error("✗ Passwords don't match.");
      process.exit(1);
    }
  }
  if (password.length < 10) {
    console.error("✗ Password must be at least 10 characters.");
    process.exit(1);
  }

  // imported after env is loaded
  const { db, schema } = await import("../src/server/db");
  const { hashPassword } = await import("../src/server/auth/password");
  const { invalidateAllSessions } = await import("../src/server/auth/session");

  const passwordHash = await hashPassword(password);
  const [existing] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);

  if (existing) {
    await db
      .update(schema.users)
      .set({ name, role, passwordHash, isActive: true, updatedAt: new Date() })
      .where(eq(schema.users.id, existing.id));
    await invalidateAllSessions(existing.id);
    console.log(`✓ Updated ${role} ${email} (password reset, old sessions signed out)`);
  } else {
    await db.insert(schema.users).values({ email, name, role, passwordHash });
    console.log(`✓ Created ${role} ${email}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("✗", err instanceof Error ? err.message : err);
  process.exit(1);
});
