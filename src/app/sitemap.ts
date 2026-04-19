import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'
import { routing } from '@/i18n/routing'
import { getAllSlugs } from '@/lib/blog'

// Locale-neutral page paths that should appear in the sitemap. Every entry
// emits one row per locale; `alternates.languages` lets Google see the
// hreflang pairings cleanly. Excludes `/privacy` and `/thank-you` because
// both are `noIndex: true`.
const STATIC_PATHS = [
  '/',
  '/about',
  '/contact',
  '/blog',
  '/consulting',
  '/consulting/business-consulting',
  '/consulting/workflow-restructuring',
  '/consulting/it-systems',
  '/consulting/ai-consulting',
  '/marketing',
  '/marketing/web-design',
  '/marketing/social-media',
  '/marketing/it-infrastructure',
  '/marketing/ai-development',
]

function buildUrl(locale: string, path: string): string {
  return `${siteConfig.url}/${locale}${path === '/' ? '' : path}`
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []
  const allPaths = [
    ...STATIC_PATHS,
    ...getAllSlugs().map((slug) => `/blog/${slug}`),
  ]
  const lastModified = new Date()

  for (const path of allPaths) {
    for (const locale of routing.locales) {
      const languages = Object.fromEntries(
        routing.locales.map((l) => [l, buildUrl(l, path)])
      )
      languages['x-default'] = buildUrl(routing.defaultLocale, path)

      entries.push({
        url: buildUrl(locale, path),
        lastModified,
        alternates: { languages },
      })
    }
  }

  return entries
}
