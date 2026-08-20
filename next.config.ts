import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['motion', 'lucide-react', 'gsap'],
  },
  images: {
    // AVIF first, WebP as the fallback for browsers without it. Next picks
    // per-request from the Accept header and falls back to the original
    // format when neither is supported. The team PNGs and project
    // screenshots are the heaviest assets on the site, so this is where the
    // byte savings actually land.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },
  async redirects() {
    return [
      // --- Legacy OptiMind URLs (pre-Vertex agency site) ---
      // Still indexed by Google. optimind000.com 308s here with the path
      // preserved, so these paths must resolve rather than 404.
      // permanent: true emits a 308.
      {
        source: '/:locale(en|mk)/demo',
        destination: '/:locale',
        permanent: true,
      },
      {
        source: '/:locale(en|mk)/terms',
        destination: '/:locale',
        permanent: true,
      },
      // Unprefixed variants, in case anything links without a locale.
      {
        source: '/demo',
        destination: '/en',
        permanent: true,
      },
      {
        source: '/terms',
        destination: '/en',
        permanent: true,
      },
      // --- Retired project pages ---
      // Northgate Dental was published at /projects/northgate-dental and sat
      // in sitemap.xml, so the URL is indexable; it was replaced by Trajanov
      // on 2026-08-20 (see src/config/projects.ts). Send it to the grid
      // instead of 404-ing, and keep the visitor's locale.
      {
        source: '/:locale(en|mk)/projects/northgate-dental',
        destination: '/:locale/projects',
        permanent: true,
      },
      {
        source: '/projects/northgate-dental',
        destination: '/en/projects',
        permanent: true,
      },
    ]
  },
}

export default withNextIntl(nextConfig)
