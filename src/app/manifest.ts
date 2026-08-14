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
        // Maskable variant reuses the same square: the mark sits well inside
        // the 80% safe zone, so an installer cropping to a circle or squircle
        // never clips it.
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
