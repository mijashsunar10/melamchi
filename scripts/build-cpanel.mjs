// Builds a static version of the site and zips it for cPanel (shared hosting).
//
//   npm run build:cpanel
//
// Output: dist/topx-nepal-cpanel.zip → upload to public_html and Extract (see DEPLOY.md).

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
const out = join(root, "out");
const dist = join(root, "dist");
const zipPath = join(dist, "topx-nepal-cpanel.zip");
// keep in sync with deviceSizes + imageSizes in next.config.ts
const WIDTHS = [64, 128, 256, 384, 640, 828, 1080, 1280, 1920];

const step = (msg) => console.log(`\n▸ ${msg}`);
const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { stdio: "inherit", cwd: root, ...opts });
  if (r.status !== 0) {
    console.error(`✗ ${cmd} ${args.join(" ")} failed`);
    process.exit(r.status ?? 1);
  }
};

// 1. Static export
step("Building static site (next build, output: export)…");
rmSync(out, { recursive: true, force: true });
run("npx", ["next", "build"], { env: { ...process.env, DEPLOY_TARGET: "static" } });
if (!existsSync(join(out, "index.html"))) {
  console.error("✗ out/index.html missing — export failed");
  process.exit(1);
}

// 2. Pre-generate WebP images for every size the pages may request
step("Generating WebP images…");
const media = join(out, "_next", "static", "media");
const sources = existsSync(media) ? readdirSync(media).filter((f) => /\.(jpe?g|png)$/i.test(f)) : [];
let made = 0;
for (const file of sources) {
  const input = join(media, file);
  const base = file.replace(/\.(jpe?g|png)$/i, "");
  const meta = await sharp(input).metadata();
  for (const w of WIDTHS) {
    await sharp(input)
      .resize({ width: Math.min(w, meta.width ?? w), withoutEnlargement: true })
      .webp({ quality: 74, effort: 5 })
      .toFile(join(media, `${base}.w${w}.webp`));
    made++;
  }
}
console.log(`  ${made} WebP files from ${sources.length} images`);

// 3. Apache config for cPanel
step("Writing .htaccess…");
writeFileSync(
  join(out, ".htaccess"),
  `# TOPX Nepal — static site on Apache (cPanel)
DirectoryIndex index.html
Options -Indexes
ErrorDocument 404 /404.html

AddType image/webp .webp
AddType image/avif .avif
AddType application/manifest+json .webmanifest

# Uncomment to force HTTPS once SSL is active in cPanel:
# RewriteEngine On
# RewriteCond %{HTTPS} off
# RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/plain text/xml application/javascript application/json image/svg+xml
</IfModule>

<IfModule mod_headers.c>
  # Pages: always check for a newer version
  <FilesMatch "\\.(html|txt)$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
  # Images and fonts in /public: cache for a week
  <FilesMatch "\\.(jpe?g|png|webp|avif|svg|ico|woff2?)$">
    Header set Cache-Control "public, max-age=604800"
  </FilesMatch>
</IfModule>
`,
);
// Hashed build files never change → cache for a year
writeFileSync(
  join(out, "_next", "static", ".htaccess"),
  `<IfModule mod_headers.c>
  Header set Cache-Control "public, max-age=31536000, immutable"
</IfModule>
`,
);

// 4. Zip (files at the zip root, so they extract straight into public_html)
step("Creating zip…");
mkdirSync(dist, { recursive: true });
rmSync(zipPath, { force: true });
run("zip", ["-r", "-q", "-9", zipPath, "."], { cwd: out });

const size = (statSync(zipPath).size / 1024 / 1024).toFixed(1);
const pages = spawnSync("find", [out, "-name", "*.html"], { encoding: "utf8" }).stdout.trim().split("\n").length;
console.log(`\n✓ Done: ${zipPath} (${size} MB, ${pages} pages)`);
console.log("  Upload it to public_html in cPanel File Manager and click Extract. See DEPLOY.md.");
