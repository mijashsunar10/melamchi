"use client";

// Image loader for the static (cPanel) export only — see next.config.ts.
// Shared hosting has no image server, so `scripts/build-cpanel.mjs` pre-generates
// `<name>.w<width>.webp` next to every bundled JPG/PNG. This loader points to them.

export default function staticImageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  if (src.startsWith("/_next/static/media/") && /\.(jpe?g|png)$/i.test(src)) {
    return src.replace(/\.(jpe?g|png)$/i, `.w${width}.webp`);
  }
  return src; // SVGs and anything else: served as-is
}
