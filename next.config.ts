import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['motion', 'lucide-react', 'gsap'],
  },
  images: {
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
    ]
  },
}

export default withNextIntl(nextConfig)
