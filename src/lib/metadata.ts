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

  // The file-convention image at `src/app/opengraph-image.tsx` is auto-injected
  // for routes whose `openGraph` block isn't overridden. Since this helper sets
  // its own `openGraph` block (per-page title/url/locale), Next.js treats the
  // child object as a full replacement and drops the framework-added images.
  // We have to repeat the image reference here so every page using this helper
  // still surfaces a preview card. URLs are resolved against `metadataBase`.
  const ogImage = {
    url: '/opengraph-image',
    width: 1200,
    height: 630,
    alt: 'Vertex Consulting — We help businesses grow smarter.',
  }

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
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [{ url: '/twitter-image', alt: ogImage.alt }],
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
