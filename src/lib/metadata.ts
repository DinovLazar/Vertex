import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { routing } from '@/i18n/routing'

interface PageMetadataOptions {
  title: string
  description: string
  path: string
  locale?: 'en' | 'mk'
  noIndex?: boolean
}

/**
 * Generate consistent metadata for any page.
 *
 * `path` is locale-neutral (e.g. '/consulting/business-consulting').
 * `locale` selects which variant is canonical; defaults to 'en'.
 * `alternates.languages` lists every localized URL so search engines can
 * emit matching hreflang tags.
 */
export function generatePageMetadata({
  title,
  description,
  path,
  locale = 'en',
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const canonicalUrl = `${siteConfig.url}/${locale}${path}`
  const languages: Record<string, string> = {}
  routing.locales.forEach((l) => {
    languages[l] = `${siteConfig.url}/${l}${path}`
  })
  languages['x-default'] = `${siteConfig.url}/en${path}`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      type: 'website',
      locale: locale === 'mk' ? 'mk_MK' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteConfig.name}`,
      description,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}

/** Metadata for consulting division pages */
export function consultingMetadata(
  options: Omit<PageMetadataOptions, 'path'> & { slug: string },
): Metadata {
  return generatePageMetadata({
    ...options,
    path: `/consulting/${options.slug}`,
  })
}

/** Metadata for marketing division pages */
export function marketingMetadata(
  options: Omit<PageMetadataOptions, 'path'> & { slug: string },
): Metadata {
  return generatePageMetadata({
    ...options,
    path: `/marketing/${options.slug}`,
  })
}
