// Gives products a clear picture: the official app artwork from Apple's public App Store lookup API.
//
//   npx tsx --conditions=react-server scripts/fetch-product-images.ts            → only products WITHOUT a picture
//   npx tsx --conditions=react-server scripts/fetch-product-images.ts --force    → also replace existing pictures
//
// Pictures are resized to 800×800 WebP and stored like admin uploads (media table → /media/<id>.webp),
// so they can be changed or removed any time in Admin → Products → Edit → "Look".
// Products not listed here (or without an official app) keep their coloured card until a picture is uploaded.
// For launch, prefer the artwork from each publisher's reseller / partner kit where you have one.

for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // missing — fine
  }
}

/** product slug → [App Store app id, store country where the app is listed] */
const APPS: Record<string, [number, string]> = {
  // gaming
  "pubg-mobile-uc": [1330123889, "us"],
  "free-fire-diamonds": [1300146617, "us"],
  "mobile-legends": [1160056295, "ph"],
  "cod-mobile-cp": [1287282214, "us"],
  "genshin-impact": [1517783697, "us"],
  "steam-wallet": [495369748, "us"],
  "bigo-live-diamonds": [1077137248, "us"],
  // gift cards
  "apple-gift-card": [375380948, "us"],
  "playstation-gift-card": [410896080, "us"],
  "xbox-gift-card": [736179781, "us"],
  "amazon-gift-card": [297606951, "us"],
  "netflix-gift-card": [363590051, "us"],
  "spotify-gift-card": [324684580, "us"],
  // AI tools
  "chatgpt-plus": [6448311069, "us"],
  "claude-pro": [6473753684, "us"],
  "gemini-advanced": [6477489729, "us"],
  "perplexity-pro": [1668000334, "us"],
  elevenlabs: [6743162587, "us"],
  "grammarly-premium": [1158877342, "us"],
  "github-copilot": [1477376905, "us"],
  // digital products
  "netflix-premium": [363590051, "us"],
  "spotify-premium": [324684580, "us"],
  "youtube-premium": [544007664, "us"],
  "prime-video": [545519333, "us"],
  "disney-plus-hotstar": [934459219, "in"],
  "coursera-plus": [736535961, "us"],
  "linkedin-premium": [288429040, "us"],
  "google-one": [1451784328, "us"],
  // software
  "windows-11-pro": [714464092, "us"],
  "office-2021-pro-plus": [586447913, "us"],
  "microsoft-365": [541164041, "us"],
  "kaspersky-premium": [1089969624, "gb"],
  nordvpn: [905953485, "us"],
  "canva-pro": [897446215, "us"],
  "capcut-pro": [1500855883, "us"],
  // support
  "remote-assistance": [1176131273, "us"],
};

const force = process.argv.includes("--force");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const { eq } = await import("drizzle-orm");
  const { default: sharp } = await import("sharp");
  const { db, schema } = await import("../src/server/db");
  const { products, media } = schema;

  let added = 0;
  const skipped: string[] = [];
  for (const [slug, [appId, country]] of Object.entries(APPS)) {
    const [p] = await db.select({ id: products.id, imageUrl: products.imageUrl }).from(products).where(eq(products.slug, slug)).limit(1);
    if (!p) {
      skipped.push(`${slug} (no such product)`);
      continue;
    }
    if (p.imageUrl && !force) continue; // keep pictures uploaded in the admin

    const lookup = (await (await fetch(`https://itunes.apple.com/lookup?id=${appId}&country=${country}`)).json()) as {
      results: { trackName: string; artworkUrl512?: string }[];
    };
    const art = lookup.results[0]?.artworkUrl512;
    if (!art) {
      skipped.push(`${slug} (app not found)`);
      continue;
    }
    const res = await fetch(art.replace(/\/\d+x\d+bb\.(jpg|png)$/, "/1024x1024bb.png"));
    if (!res.ok) {
      skipped.push(`${slug} (download failed)`);
      continue;
    }
    // trim ~5% per side: many app icons have rounded corners baked in, which would show as light corners in a square card
    const square = await sharp(Buffer.from(await res.arrayBuffer())).resize(1024, 1024, { fit: "cover" }).toBuffer();
    const out = await sharp(square)
      .extract({ left: 52, top: 52, width: 920, height: 920 })
      .resize(800, 800)
      .webp({ quality: 86 })
      .toBuffer({ resolveWithObject: true });
    const [row] = await db
      .insert(media)
      .values({ data: out.data, mime: "image/webp", width: out.info.width, height: out.info.height, size: out.info.size })
      .returning({ id: media.id });
    await db.update(products).set({ imageUrl: `/media/${row.id}.webp` }).where(eq(products.id, p.id));
    // an old picture that nothing uses any more
    const oldId = p.imageUrl?.match(/^\/media\/([0-9a-f-]{36})\.webp$/)?.[1];
    if (oldId) {
      const [inUse] = await db.select({ id: products.id }).from(products).where(eq(products.imageUrl, p.imageUrl!)).limit(1);
      if (!inUse) await db.delete(media).where(eq(media.id, oldId));
    }
    console.log(`✓ ${slug} ← ${lookup.results[0].trackName}`);
    added++;
    await sleep(250); // be gentle with the public API
  }
  console.log(`\n✓ ${added} pictures added.${skipped.length ? ` Skipped: ${skipped.join(", ")}` : ""}`);
  console.log("Refresh the store: save any product in the admin, or wait up to an hour for the cache.");
  process.exit(0);
}

main().catch((err) => {
  console.error("✗", err instanceof Error ? err.message : err);
  process.exit(1);
});
