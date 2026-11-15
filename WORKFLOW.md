# TOPX NEPAL — Project Workflow

> **Brand:** TOPX NEPAL, by **Melamchi Tech**
> **Tagline:** *Everything Digital. One Place.* · **Positioning:** *Nepal's Digital Powerhouse*
> **What it is:** one store for **AI Tools, Gaming Top-ups, Gift Cards, Software & Apps, Digital Products, and Support**.
> **Approach:** frontend first, one section at a time, using mock data. Backend comes after the UI is approved.
> **Brand board:** `public/brand/brand-board.jpeg`

---

## 0. Ground rules

1. **One step at a time.** Build → you review on phone and desktop → fix → approve → commit → tick the box → next step.
2. **Mock data first.** All data lives in `src/data/*.ts` and has types in `src/types/`. The backend replaces these later and the UI doesn't change.
3. **Not a Hamro Nova copy.** We use our own layout, colors, components, and copy (see Section 2).
4. **Mobile first.** Every section is designed at 375px, then 768px, then 1280px.
5. **Stack:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4. This Next.js has breaking changes, so check `node_modules/next/dist/docs/` before using a Next API.
6. **Done means:** responsive at 3 sizes, works in light and dark mode, no console errors, `npm run lint` passes, uses brand tokens only, committed.

---
alt text
## 1. Brand system (from the brand board)

### Logo set (need source files from the CEO: SVG or transparent PNG)
- [ ] `logo-mt.svg`: the Melamchi Tech "MT" round mark (orange + blue ring)
- [ ] `logo-topx.svg`: the "TOPX NEPAL" wordmark (blue, orange X swoosh)
- [ ] `logo-full.svg` (light) and `logo-full-dark.svg` (on navy)
- [ ] `app-icon.png` (512×512) for the PWA and favicon

### Colors (taken from the board; confirm with the final logo files)
| Token | Hex | Use |
|---|---|---|
| `brand-blue` | `#1D3FBF` | Primary: links, active nav, headings |
| `brand-navy` | `#0A1640` | Hero / dark sections, dark mode background |
| `brand-orange` | `#FF4D1A` | CTA buttons ("Explore Now"), X swoosh, badges |
| `brand-sky` | `#3B82F6` → `#60A5FA` | Glow, gradients, highlights |
| `surface` | `#F4F7FF` | Light page background, cards |
| `nepal-red` | `#DC143C` | Small Nepal accents only |

### Typography
- **Display:** heavy *italic* sans for headings, matching the TOPX wordmark (e.g. Montserrat 800 Italic or Poppins 800 Italic)
- **Body:** Inter / Plus Jakarta Sans
- Nepali text: Mukta or Noto Sans Devanagari

### Visual motifs (our own identity)
- Himalaya silhouette + Nepal flag accent
- Orange swoosh underline under key headings (from the tagline)
- Dark navy hero with blue neon glow and floating 3D-style icons (controller, AI chip, Windows, Steam, Play Store)
- Rounded "glass" tiles for the 6 domains (as on the board)
- Trust pills: Secure Payment · Instant Delivery · 24/7 Support · Trusted by Nepal

---

## 2. How we beat Hamro Nova (and look different)

| | Hamro Nova | TOPX NEPAL |
|---|---|---|
| Scope | Mostly gaming top-ups + some subscriptions | **6 domains**: AI, Gaming, Gift Cards, Software, Digital Products, Support |
| Navigation | 4 plain links | **Mega-menu** for each domain + global search (Ctrl+K) + **mobile bottom tab bar** |
| Look | Light, generic product grid | Navy + blue-glow hero, Himalaya motif, glass domain tiles, bold italic type |
| Home | Banner slider → product grid | Domain-led home: hero → 6 domain tiles → deals → per-domain showcases → trust |
| Buying | Single product checkout | **Cart** (several items) + single "Buy now" |
| Order form | Player ID only | **Smart form by delivery type** (game ID, email activation, code delivery, licence key) |
| Payment | Unnamed logos | eSewa, Khalti, IME Pay, Fonepay QR, bank, **TOPX Wallet** |
| After purchase | No confirmation page | Order page with live status timeline, codes/keys shown securely, guest tracking |
| Support | Chat (login required) + WhatsApp | Full **Support domain**: help center, tickets, setup help, WhatsApp/Messenger |
| Extras | — | Dark mode, EN/NP toggle, PWA app, product FAQs, related products, compare plans |

---

## 3. Catalog structure (the 6 domains)

> Example products; the CEO confirms the final list and prices.

| Domain | Sub-categories (examples) | Delivery type |
|---|---|---|
| **AI Tools** | Chat AI (ChatGPT Plus, Claude Pro, Gemini, Perplexity), Image/Video (Midjourney, Runway, Leonardo), Voice (ElevenLabs), Writing (Grammarly, Quillbot), Coding (GitHub Copilot, Cursor) | Account activation (email) |
| **Gaming Top-up** | Mobile games (PUBG UC, Free Fire, MLBB, COD, Genshin, HoK), PC/Console (Valorant, Steam Wallet), Live-stream coins (Tango, Bigo, Poppo, Chamet) | Direct top-up (Player ID / Zone ID) |
| **Gift Cards** | Google Play, Apple/iTunes, Steam, PlayStation, Xbox, Amazon, Netflix, Spotify, Razer Gold | Code delivery |
| **Software & Apps** | Windows & Office/M365, Antivirus (Kaspersky, Norton, ESET), Adobe CC, VPN (NordVPN, Express), Utilities (IDM, WinRAR), Design (Canva Pro, CapCut Pro) | Licence key / account |
| **Digital Products** | Streaming (Netflix, Spotify, YouTube Premium, Prime Video, Disney+), Learning (Coursera, Udemy, LinkedIn Learning), Templates & eBooks, Cloud storage (Google One, iCloud) | Account / code / download |
| **Support** | Help center, order help, installation & setup, remote assistance, business/bulk orders, become a reseller | Service request / ticket |

**Delivery types** decide the product form and the order page:
- `TOPUP`: Player ID (+ Zone/Server) + "Check name"
- `CODE`: email/phone to receive the code; code shown on the order page
- `ACCOUNT`: customer email (+ optional password/notes), activation time
- `LICENSE`: key + download link + activation guide
- `SERVICE`: request form (issue, device, preferred time)

---

## 4. Sitemap

```
/                               Home
/ai-tools                       Domain landing pages (hero, sub-category chips, products, FAQ)
/gaming
/gift-cards
/software
/digital-products
/support                        Support hub (help center, tickets, contact, setup services)
/support/[article]              Help article
/products                       All products: search, filter (domain, category, price, delivery), sort
/product/[slug]                 Product detail + smart order form
/compare                        Compare plans (e.g. AI tools, streaming) — optional
/cart                           Cart
/checkout                       Payment method + summary
/order/[id]                     Order status, codes/keys
/track                          Guest order tracking
/deals                          All offers
/blog  /blog/[slug]             Guides & news
/about  /contact  /reseller
/privacy-policy  /terms  /refund-policy  /kyc

(auth)       /login  /register  /forgot-password  /verify-otp
/dashboard   overview · orders · wallet · my-keys (codes & licences) · subscriptions (renewals)
             · favorites · tickets · kyc · profile · referrals
```

---

## 5. Folder structure

```
src/
  app/
    (site)/          public pages: header + footer layout
    (auth)/          minimal layout
    dashboard/       sidebar layout
    layout.tsx  globals.css (Tailwind @theme brand tokens)
  components/
    ui/              Button, Input, Badge, Card, Tabs, Sheet, Modal, Skeleton, Toast, Accordion
    layout/          TopBar, Header, MegaMenu, MobileNav, Footer, SearchDialog, FloatingSupport
    home/            Hero, DomainTiles, DealsCarousel, DomainShowcase, HowItWorks, Trust, Reviews…
    product/         ProductCard, ProductHero, PlanPicker, OrderForm (by delivery type), Summary…
    cart/ checkout/ dashboard/
  data/              domains, categories, products, deals, reviews, blog, orders (mock)
  types/             Domain, Category, Product, Plan, DeliveryType, CartItem, Order…
  lib/               formatNPR(), cn(), constants (contacts, socials), cart store
public/brand/ public/products/ public/payments/
```

---

## 6. Build phases (one step at a time)

### Phase 1: Foundation
- [x] **1.1** Brand assets → `public/brand/`; favicon + app icon *(placeholder vectors until the official logo files arrive)*
- [x] **1.2** Design tokens in `globals.css` (colors, radius, shadows, gradients, glow), light + dark
- [x] **1.3** Fonts (`next/font`), root metadata, theme provider (dark mode)
- [x] **1.4** Types + mock data for the 6 domains (~8 products each, with plans and delivery types)
- [x] **1.5** UI kit (buttons incl. orange CTA, inputs, badges, cards, tabs, sheet, modal, skeleton, toast)

### Phase 2: Layout shell
- [x] **2.1** Top bar (rotating notices, EN/NP toggle, WhatsApp number)
- [x] **2.2** Header: logo, Home pill, **6 domain mega-menus**, search, cart (count), account
- [x] **2.3** Mobile: hamburger drawer + **bottom tab bar** (Home, Explore, Search, Cart, Account)
- [ ] **2.4** Search dialog (Ctrl+K) across all domains
- [x] **2.5** Footer: domains, links, contact, payments, socials, Melamchi Tech credit
- [x] **2.6** Floating support (WhatsApp / Messenger / call)

### Phase 3: Home page
- [x] **3.1** Hero: navy + glow, "TOPX NEPAL / Everything Digital. One Place.", Explore Now CTA, trust pills
- [x] **3.2** 6 domain tiles (AI · Gaming · Gift Cards · Software · Digital · Support)
- [x] **3.3** Flash deals carousel (discount %, countdown)
- [x] **3.4** Domain showcases: a product row for each domain with tabs
- [x] **3.5** Trending / best sellers
- [x] **3.6** How it works (Choose → Details → Pay → Instant delivery)
- [x] **3.7** "Nepal's Digital Powerhouse" stats band (orders, customers, avg delivery, rating) with Himalaya art
- [x] **3.8** Reviews (verified)
- [ ] **3.9** Payment partners + live orders ticker
- [ ] **3.10** Blog/guides preview + FAQ + app download / reseller CTA

### Phase 4: Domain landing pages
- [x] **4.1** Shared domain page template (mini hero, sub-category chips, filters, grid, FAQ)
- [x] **4.2** AI Tools page
- [x] **4.3** Gaming page
- [x] **4.4** Gift Cards page
- [x] **4.5** Software & Apps page
- [x] **4.6** Digital Products page
- [ ] **4.7** `/products` all-products page + `/deals`

### Phase 5: Product page (smart order flow)
- [x] **5.1** Product hero (image, badges: instant / official / region / delivery time, rating, favorite, share)
- [x] **5.2** Plan/package picker (cards with price, bonus, validity, stock, "Popular")
- [x] **5.3** Order form by delivery type: TOPUP / CODE / ACCOUNT / LICENSE / SERVICE
- [x] **5.4** Summary: qty, promo code, total in Rs, **Add to cart** + **Buy now**; sticky bar on mobile
- [x] **5.5** Tabs: description, how to redeem/activate, FAQ, reviews
- [x] **5.6** Related products + "people also bought"

### Phase 6: Cart, checkout, orders — ⏸ ON HOLD (no login/cart for now, keeps backend light)
- [ ] **6.1** Cart page + mini-cart drawer
- [ ] **6.2** Checkout: contact info, payment methods (eSewa, Khalti, IME Pay, Fonepay QR, bank, wallet), summary
- [ ] **6.3** Order success / status page (timeline, code/key reveal, download guide)
- [ ] **6.4** Guest order tracking `/track`

### Phase 7: Support domain
- [ ] **7.1** Support hub (search help, categories, popular articles, contact options)
- [ ] **7.2** Help article page
- [ ] **7.3** Submit ticket / setup service request form
- [ ] **7.4** Contact page, reseller / business page

### Phase 8: Auth (UI only) — ⏸ ON HOLD (no login/cart for now, keeps backend light)
- [ ] **8.1** Login, Register, Forgot password, OTP (phone/email), Google button

### Phase 9: User dashboard — ⏸ ON HOLD (no login/cart for now, keeps backend light)
- [ ] **9.1** Layout + overview (wallet, active subscriptions, recent orders)
- [ ] **9.2** Orders + order detail
- [ ] **9.3** My Keys & Codes (gift codes, licence keys)
- [ ] **9.4** Subscriptions (expiry, renew)
- [ ] **9.5** Wallet (load funds, transactions)
- [ ] **9.6** Tickets, favorites, KYC, profile, referrals

### Phase 10: Content + polish
- [ ] **10.1** Blog list + post; About; Privacy / Terms / Refund / KYC
- [ ] **10.2** EN/NP translations
- [ ] **10.3** PWA (manifest, icons, install prompt)
- [ ] **10.4** SEO: metadata per page, OG images, sitemap, robots, JSON-LD (Organization, Product)
- [ ] **10.5** Loading, error, and 404 pages (branded)
- [ ] **10.6** Accessibility + Lighthouse 90+, full responsive and dark-mode QA
- [ ] **10.7** Backend hand-off doc (every data model + API the UI needs)

---

## 7. Backend (later, planned separately)

Admin panel (domains, products, plans, stock/codes, banners, deals, orders, users, coupons, reviews, blog, tickets) · Auth (OTP, Google) · Payments (eSewa, Khalti, Fonepay, wallet ledger) · Fulfilment (supplier top-up APIs, code/key inventory, manual queue) · Player-name check · Subscription renewals and reminders · KYC + limits · Email/SMS/WhatsApp notifications · Hosting, domain, SSL, backups, analytics.

---

## 8. Need from the CEO

- [ ] Logo files (SVG/PNG): MT mark, TOPX wordmark, full lockup light + dark
- [ ] Domain name (e.g. topxnepal.com?)
- [ ] Contacts: phone, WhatsApp, email, office address
- [ ] Social links
- [ ] Launch product list per domain + prices
- [ ] Payment methods to support
- [ ] Banner/offer images (or we design them)

---

## 9. How each step runs

1. You say "Start **1.1**" (or any step number).
2. I build only that step.
3. You check `npm run dev` → `http://localhost:3000` on phone and desktop.
4. Feedback → fixes → approved → commit → tick the box.

## Progress log

| Date | Step | Status | Notes |
|---|---|---|---|
| 2026-11-12 | Workflow v2 (TOPX NEPAL, 6 domains) | ✅ | Brand board read; waiting on logo source files |
| 2026-11-13 | 1.1 Brand assets + icons | ✅ | Placeholder SVG logo set, favicon, icon.svg, apple-icon, PWA PNGs |
| 2026-11-13 | 1.2 Design tokens | ✅ | Light/dark tokens, brand scales, glow/gradient/glass/swoosh utilities; preview at `/styleguide` |
| 2026-11-13 | 1.3 Fonts, metadata, dark mode | ✅ | Montserrat / Plus Jakarta Sans / Noto Sans Devanagari, SEO metadata + theme-color, no-flash dark mode toggle, `src/lib/site.ts` |
| 2026-11-13 | 1.4 Types + mock data | ✅ | 47 sample products across 6 domains, 5 delivery types, deals, reviews, payment methods; async data layer in `src/lib/catalog.ts`; preview at `/styleguide/catalog` |
| 2026-11-13 | 1.5 UI kit + header, footer, home page | ✅ | Real landing page with photos (Unsplash), brand-logo product covers, mega menus, mobile nav, dark mode |
| 2026-11-14 | Simple header | ✅ | Removed mega-menu dropdowns, login and cart; added WhatsApp "Contact us". Login/cart/dashboard phases on hold |
| 2026-11-14 | Section pages | ✅ | /ai-tools, /gaming, /gift-cards, /software, /digital-products — photo banner, category filter + sort, FAQ, help box, other categories; active nav highlight |
| 2026-11-14 | Product pages | ✅ | /product/[slug] for all 47 products — package picker, smart order form (Player ID + name check, email, etc.), quantity + total, Order on WhatsApp (sends full order details), tabs (About / How to / FAQ / Reviews), related products, mobile sticky order bar |
| 2026-11-15 | Section pages: no banner | ✅ | Removed the big top banner; compact breadcrumb + title, products start immediately |
| 2026-11-15 | Support page | ✅ | /support — WhatsApp/call/email, searchable help center by topic, expert services, message form → WhatsApp (src/lib/support.ts) |
| 2026-11-15 | Speed & images | ✅ | Fonts 241→98KB (variable Montserrat, system Devanagari), AVIF images, photos 3.4→1.7MB, home HTML 1MB→509KB, page switches ~100ms |
| 2026-11-15 | Search page | ✅ | /products — instant ranked search with aliases (ff, uc, mlbb, gpt…), section filter, sort, ?q= links, empty state with WhatsApp; first visible row loads eagerly |
| 2026-11-15 | Deals page + deal pricing | ✅ | /deals with countdowns and savings; product pages pre-select the deal package and charge the deal price (priceOrder) |
