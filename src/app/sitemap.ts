import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'
import { routing } from '@/i18n/routing'
import { getAllPosts } from '@/lib/blog'
import { projects } from '@/config/projects'

/**
 * sitemap.xml
 *
 * One row per locale per page, with `alternates.languages` so Google reads the
 * hreflang pairings cleanly. `/privacy` and `/thank-you` are excluded — both
 * carry `noIndex: true`, and listing a noindex URL in a sitemap is a
 * contradictory signal that shows up as a Search Console warning.
 *
 * `lastModified` used to be `new Date()` for every row on every request, which
 * told Google the entire site changed each time it fetched the sitemap. That
 * is the fastest way to get your `lastmod` values ignored altogether. Static
 * pages now report the build time; blog posts report their real publish date.
 */

interface PathEntry {
  path: string
  priority: number
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
}

// Priority is relative *within this site* — it does not raise you against
// competitors. It tells Google which of your own pages matter most when it
// budgets crawl time. Service pages sit just under the homepage because they
// are the pages that actually earn commercial searches.
const STATIC_PATHS: PathEntry[] = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/consulting', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/marketing', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/consulting/business-consulting', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/consulting/workflow-restructuring', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/consulting/it-systems', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/consulting/ai-consulting', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/marketing/web-design', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/marketing/social-media', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/marketing/it-infrastructure', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/marketing/ai-development', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/projects', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.7, changeFrequency: 'yearly' },
  { path: '/about', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/blog', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/lazar', priority: 0.3, changeFrequency: 'yearly' },
]

function buildUrl(locale: string, path: string): string {
  return `${siteConfig.url}/${locale}${path === '/' ? '' : path}`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  let posts: Awaited<ReturnType<typeof getAllPosts>> = []
  try {
    posts = await getAllPosts('en')
  } catch {
    // Blog source unavailable — still emit the static pages.
  }

  const buildTime = new Date()

  const all: Array<PathEntry & { lastModified: Date }> = [
    ...STATIC_PATHS.map((e) => ({ ...e, lastModified: buildTime })),
    // One row per client project. Generated from the config so a new project
    // is in the sitemap the moment it is added — there is no second list to
    // remember to update.
    ...projects.map((project) => ({
      path: `/projects/${project.slug}`,
      priority: 0.5,
      changeFrequency: 'yearly' as const,
      lastModified: buildTime,
    })),
    ...posts.map((post) => ({
      path: `/blog/${post.slug}`,
      priority: 0.5,
      changeFrequency: 'yearly' as const,
      lastModified: new Date(post.publishedAt),
    })),
  ]

  for (const entry of all) {
    for (const locale of routing.locales) {
      const languages = Object.fromEntries(
        routing.locales.map((l) => [l, buildUrl(l, entry.path)]),
      )
      languages['x-default'] = buildUrl(routing.defaultLocale, entry.path)

      entries.push({
        url: buildUrl(locale, entry.path),
        lastModified: entry.lastModified,
        changeFrequency: entry.changeFrequency,
        priority: entry.priority,
        alternates: { languages },
      })
    }
  }

  return entries
}
