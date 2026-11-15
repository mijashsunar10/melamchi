# TOPX NEPAL — Backend hand-off guide

The frontend is built so the backend can be plugged in **without changing any page or component**.
This file lists every place the backend connects, and the data shapes it must return.

> Keep this file updated whenever a new page adds data or an action.

---

## 1. The rule

```
Pages / components  ──►  src/lib/*.ts (async functions)  ──►  src/data/*.ts (sample data today)
                                                         ──►  API / database (backend later)
```

- **Components never import `src/data/` directly.** They call functions in `src/lib/`.
- Every function in `src/lib/catalog.ts` and `src/lib/content.ts` is already `async`.
  To go live, replace the function **body** with a database query or API call. The return type stays the same.
- All user actions (ordering, name check) go through **`src/lib/orders.ts`** only.
- All TypeScript types the backend must match live in **`src/types/`**.

---

## 2. Read functions (data the pages show)

| Function | File | Returns | Used on |
|---|---|---|---|
| `getDomains()` | `src/lib/catalog.ts` | `Domain[]` | header, home, section pages, footer |
| `getDomain(slug)` | `src/lib/catalog.ts` | `Domain \| undefined` | section page, product page |
| `getProducts({ domain?, category?, tag? })` | `src/lib/catalog.ts` | `Product[]` | home, section pages |
| `getProduct(slug)` | `src/lib/catalog.ts` | `Product \| undefined` | product page |
| `getRelatedProducts(product, limit)` | `src/lib/catalog.ts` | `Product[]` | product page |
| `getBestSellers(limit)` | `src/lib/catalog.ts` | `Product[]` (sorted by `sold`) | home "Trending" |
| `getDeals()` | `src/lib/catalog.ts` | `DealWithProduct[]` — **only active deals** (`endsAt` in the future) | home flash deals, `/deals` |
| `getProductDeal(slug)` | `src/lib/catalog.ts` | `Deal \| null` — active deal for one product | product page (pre-selects the deal package) |
| `getReviews(productSlug?)` | `src/lib/catalog.ts` | `Review[]` | home, product page |
| `getPaymentMethods()` | `src/lib/catalog.ts` | `PaymentMethod[]` | footer |
| `searchProducts(query)` | `src/lib/catalog.ts` | `Product[]` ranked by relevance | (available for an API / quick search) |
| `getSiteStats()` | `src/lib/content.ts` | `SiteStats` | hero, stats band, reviews |
| `getHomeFaq()` | `src/lib/content.ts` | `FAQ[]` | home FAQ |
| `getSupportTopics()` | `src/lib/content.ts` | `SupportTopic[]` (`slug`, `name`, `icon`, `faqs[]`) | Support page help center, contact form topics |
| `getDomainFaq(slug)` | `src/lib/content.ts` | `FAQ[]` | section page FAQ |
| `getLegalPage(slug)` / `getLegalPages()` | `src/lib/content.ts` | `LegalPage` (`title`, `description`, `updated`, `sections[]`) | `/refund-policy`, `/privacy-policy`, `/terms` |
| `getProducts({ domain: "support" })` | `src/lib/catalog.ts` | `Product[]` (SERVICE type) | Support page "expert services" |

Sample data for all of these is in `src/data/` — use it as seed data for the database.

### Search (`/products`)

The search page gets the full product list from `getProducts()` and searches **in the browser**
(instant, no server round-trip) using `src/lib/search.ts`:

- `toSearchEntry(product, domain, price)` — builds the searchable text (name, brand, section, category, packages, description)
- `scoreEntry(entry, query)` — relevance score; all typed words must match
- `ALIASES` — short forms people type (`ff` → Free Fire, `uc` → PUBG, `mlbb`, `gpt`, `yt`…). Add more here.

With hundreds of products later, keep the same functions but move them behind `GET /api/search?q=…`
(`searchProducts()` in `catalog.ts` already uses the same scoring).

## 3. Actions (things the customer does)

All in **`src/lib/orders.ts`**:

| Function | Today | Backend should |
|---|---|---|
| `submitOrder(product, request)` | builds a WhatsApp message and returns its link | `POST /api/orders` → create order, return `{ orderId, paymentUrl }`; function returns `{ ok: true, orderId, redirectUrl: paymentUrl }` |
| `newOrderRef()` | makes a ref like `TX-8K2F9Q`, added to the WhatsApp message and shown to the customer | replace with the real order ID from `POST /api/orders` |
| `trackOrder(orderId, phone?)` | returns `{ found: false, reason: "offline" }` → `/track` asks on WhatsApp | `GET /api/orders/{orderId}?phone=…` → `{ found: true, order: OrderTracking }` (or `reason: "not-found"`). The `/track` page already renders the status timeline |
| `lookupPlayerName(productSlug, playerId)` | returns a demo name | `GET /api/player-name?product=…&id=…` → `{ name }` or 404 (supplier API) |
| `validateOrder(product, request)` | runs in the browser | **also run it on the server** before saving an order (same function, no changes) |
| `priceOrder(product, planId, qty, deal?)` | runs in the browser; applies the deal discount to the deal's package | **always recalculate the price on the server** (with the active deal) — never trust the price from the browser |

Support / contact form — **`src/lib/support.ts`** (used on `/support` and `/contact`):

| Function | Today | Backend should |
|---|---|---|
| `submitSupportRequest(request)` | opens WhatsApp with the message | `POST /api/support` → create a ticket, return `{ ticketId }` (and notify staff) |
| `validateSupportRequest(request)` | runs in the browser | also run on the server |

`SupportRequest`: `{ name, phone, topic, orderNumber?, message }`

Reseller / business applications — **`src/lib/reseller.ts`** (used on `/reseller`):

| Function | Today | Backend should |
|---|---|---|
| `submitResellerApplication(app)` | opens WhatsApp with the application | `POST /api/reseller-applications` → `{ applicationId }`, notify the business team |
| `validateResellerApplication(app)` | runs in the browser | also run on the server |

`ResellerApplication`: `{ businessName, contactName, phone, city, businessType, monthlyVolume, interests[], message? }`
(`BUSINESS_TYPES` and `MONTHLY_VOLUMES` lists are in the same file).

`OrderRequest` (what the order form sends):

```ts
{
  productSlug: string;
  planId: string;
  quantity: number;               // 1–10, only for TOPUP and CODE products
  details: Record<string, string>; // e.g. { playerId: "5123456789", zoneId: "2101" } — keys = product.fields[].name
  playerName?: string;
}
```

---

## 4. Data models

Full definitions: `src/types/catalog.ts`, `src/types/content.ts`.

| Model | Key fields | Notes |
|---|---|---|
| **Domain** | `slug`, `name`, `tagline`, `description`, `icon`, `gradient`, `highlights[]`, `categories[]` | The 6 sections. `slug` is fixed: `ai-tools`, `gaming`, `gift-cards`, `software`, `digital-products`, `support` |
| **Category** | `slug`, `name`, `icon` | belongs to a Domain |
| **Product** | `slug`, `name`, `brand`, `domain`, `category`, `deliveryType`, `image`, `color`, `shortDescription`, `description`, `region`, `deliveryTime`, `rating`, `reviewCount`, `sold`, `tags[]`, `plans[]`, `fields[]`, `howTo[]`, `faq[]` | `image: null` → the site shows a branded cover with a stock photo |
| **Plan** (package) | `id`, `name`, `price` (NPR), `originalPrice?`, `bonus?`, `validity?`, `inStock`, `popular?` | `price: 0` = "get a quote" |
| **OrderField** | `name`, `label`, `type` (`text/email/tel/number/select/textarea`), `required`, `placeholder?`, `help?`, `options?`, `verifiable?` | Drives the order form. `verifiable: true` shows the "Check name" button |
| **DeliveryType** | `TOPUP` · `CODE` · `ACCOUNT` · `LICENSE` · `SERVICE` | How the order is fulfilled |
| **Deal** | `productSlug`, `planId`, `discountPercent`, `endsAt` (ISO), `label?` | |
| **Review** | `id`, `productSlug`, `name`, `city`, `rating`, `comment`, `date`, `verified` | only show reviews from real orders |
| **PaymentMethod** | `id`, `name`, `description`, `color` | eSewa, Khalti, IME Pay, Fonepay, bank, wallet |
| **SiteStats** | `ordersDelivered`, `avgDeliverySeconds`, `rating`, `reviewCount` | calculate from real orders & reviews |
| **FAQ** | `q`, `a` | |
| **LegalPage** | `slug`, `title`, `description`, `updated`, `sections[]` (`id`, `heading`, `paragraphs?`, `bullets?`) | **draft text — review before launch** |

### Suggested database tables

`domains`, `categories`, `products`, `plans`, `order_fields` (or a JSON column on products),
`deals`, `reviews`, `orders`, `order_items`, `payments`, `faqs`, `support_topics`, `support_tickets`,
`reseller_applications`, `settings`.

An **order** should store: id (format `TX-XXXXXX` so customers can track it), product, plan, quantity, details (JSON), player name, unit price, total,
status (`received → paid → processing → delivered / failed / refunded` — type `OrderStatus` in `src/lib/orders.ts`), payment method, payment reference,
delivered code/key (encrypted), customer contact, timestamps.

---

## 5. Settings / environment variables

Copy `.env.example` → `.env.local`. Contact details are read in `src/lib/site.ts`.

| Variable | Used for |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | SEO / share links |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | every "Contact" and "Order on WhatsApp" button (digits only, e.g. `9779812345678`) |
| `NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_SUPPORT_PHONE`, `NEXT_PUBLIC_ADDRESS` | header, footer, contact page |
| `NEXT_PUBLIC_MAP_URL`, `NEXT_PUBLIC_OFFICE_HOURS` | contact page ("Get directions", office hours) |
| `NEXT_PUBLIC_FACEBOOK_URL` … `NEXT_PUBLIC_YOUTUBE_URL` | footer social icons |

---

## 6. Things deliberately left out (on hold)

Login, cart, checkout, user dashboard — see `WORKFLOW.md`. Ordering works through WhatsApp until
online payment is added. When it is, only `submitOrder()` changes.

## 7. Checking that nothing broke

With the site running:

```bash
node scripts/check-order.mjs http://localhost:3000     # end-to-end order form test
node scripts/check-support.mjs http://localhost:3000   # help center search + support form test
node scripts/check-search.mjs http://localhost:3000    # search page: aliases, ranking, filters, URL
node scripts/perf.mjs http://localhost:3000            # page weight per page (run on a production build)
node scripts/nav-speed.mjs http://localhost:3000       # click-to-page switch time
node scripts/screenshot.mjs http://localhost:3000/ out.png 1440 light   # screenshot + console errors
```
