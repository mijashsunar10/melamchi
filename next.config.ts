import type { NextConfig } from "next";

/**
 * DEPLOY_TARGET=static → plain HTML/CSS/JS export for shared hosting (cPanel).
 * Built with `npm run build:cpanel` (see DEPLOY.md). Normal dev/build are unchanged.
 */
const isStaticExport = process.env.DEPLOY_TARGET === "static";

/** Image widths Next.js may request — keep in sync with WIDTHS in scripts/build-cpanel.mjs. */
const deviceSizes = [640, 828, 1080, 1280, 1920];
const imageSizes = [64, 128, 256, 384];

const nextConfig: NextConfig = {
  // Cache Components / partial prerendering needs a Node server; a static export prebuilds every page fully instead
  cacheComponents: !isStaticExport,
  images: {
    deviceSizes,
    imageSizes,
    ...(isStaticExport
      ? // no image server on shared hosting: a loader points to pre-generated WebP files
        { loader: "custom", loaderFile: "./src/lib/static-image-loader.ts" }
      : // AVIF first (smallest), WebP fallback for older browsers
        { formats: ["image/avif", "image/webp"] }),
  },
  ...(isStaticExport
    ? {
        output: "export",
        // /about → /about/index.html, which Apache (cPanel) serves without any rewrite rules
        trailingSlash: true,
      }
    : { partialPrefetching: true }),
  turbopack: {
    // Static build: read the catalog from a JSON snapshot instead of the (cached) database
    ...(isStaticExport && {
      resolveAlias: { "@/server/catalog/source": "./src/server/catalog/static-source.ts" },
    }),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
