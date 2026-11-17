# Deploying TOPX Nepal to cPanel

The frontend is exported as a **static website** (plain HTML, CSS, JS and images).
It runs on any cPanel / shared hosting — no Node.js app needed.

---

## 1. Set the real details (before building)

Copy `.env.example` to `.env` and fill in:

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_WHATSAPP_NUMBER=9779800000000     # digits only, with 977
NEXT_PUBLIC_SUPPORT_EMAIL=support@yourdomain.com
NEXT_PUBLIC_SUPPORT_PHONE=+977 9800000000
NEXT_PUBLIC_ADDRESS=Kathmandu, Nepal
NEXT_PUBLIC_MAP_URL=https://maps.google.com/?q=...
NEXT_PUBLIC_OFFICE_HOURS=Sun–Fri, 10:00 AM – 6:00 PM
NEXT_PUBLIC_FACEBOOK_URL=...
```

These are **baked into the files at build time** — change them → build again.

## 2. Build the zip

```bash
npm install
npm run build:cpanel
```

Result: **`dist/topx-nepal-cpanel.zip`** (~17 MB, 72 pages).

The script exports every page, creates WebP images in all sizes, adds an Apache `.htaccess`
(compression, caching, 404 page) and zips it.

## 3. Upload in cPanel

1. Log in to **cPanel → File Manager**.
2. Open **`public_html`** (or the folder of your domain / sub-domain).
   - If it has old files (e.g. a default `index.html`), delete or move them first.
3. Click **Upload** → choose `topx-nepal-cpanel.zip` → wait until it reaches 100%.
4. Back in File Manager, right-click the zip → **Extract** → extract into `public_html`.
5. Delete the zip file.
6. In File Manager **Settings**, tick **“Show Hidden Files (dotfiles)”** and check that **`.htaccess`** is there.

Open your domain — the site is live.

## 4. HTTPS (recommended)

1. cPanel → **SSL/TLS Status** → run **AutoSSL** for your domain.
2. Open `public_html/.htaccess`, and **uncomment** the 3 lines under
   “Uncomment to force HTTPS” (remove the `#`).

## 5. Updating the site

Make changes → `npm run build:cpanel` → in File Manager delete the old files in `public_html`
(keep anything that isn't part of the site, e.g. `.well-known`) → upload & extract the new zip.

---

## Good to know

- **Ordering, support, reseller and tracking forms** all work through WhatsApp, so no server is needed.
- **Flash-deal timers** are set when the site is built. Rebuild when deals change.
- **Search** runs in the browser, so it works on static hosting.
- When the **backend** is ready, the site will need a host that runs Node.js (cPanel “Setup Node.js App”, a VPS, or Vercel).
  The normal `npm run build` + `npm start` setup is unchanged for that. See `BACKEND.md`.
- **Test locally before uploading:**
  ```bash
  cd out && python3 -m http.server 3200      # then open http://localhost:3200
  ```
