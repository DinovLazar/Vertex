import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

/**
 * Web app manifest, served at /manifest.webmanifest.
 *
 * Deliberately minimal: this is a marketing site, not an installable app. The
 * manifest exists so Android/Chrome pick a real icon and theme colour instead
 * of guessing, and so the address bar matches the site's own surface colour.
 *
 * `theme_color` and `background_color` are the dark palette's base (#141414)
 * rather than a token lookup — the manifest is generated at build time, with
 * no CSS custom properties available, and dark is the site's unconditional
 * default (see the pre-hydration theme script in [locale]/layout.tsx).
 *
 * Not localised. The manifest has no locale context — it is fetched once per
 * origin, outside the /en|/mk routing — so it carries the brand name only.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: 'Vertex',
    description: siteConfig.tagline,
    start_url: '/en',
    scope: '/',
    display: 'standalone',
    theme_color: '#141414',
    background_color: '#141414',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        // Maskable needs its own file, not a reuse of the `any` icons. Those
        // are the brand disc with transparent corners; Android applies its own
        // silhouette to a maskable icon, and a disc inside a squircle — or
        // worse, a disc whose transparent corners show the launcher wallpaper
        // through the mask — reads as a mistake. This variant is the same
        // wordmark on a full-bleed #0E0E0E plate. The wordmark's corners sit
        // 372px from centre on the 1024 grid, inside the 409.6px safe-zone
        // radius, so no crop can clip it.
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
