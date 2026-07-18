import { getLocale, getTranslations } from 'next-intl/server'
import JsonLd from './JsonLd'
import { buildWebPageSchema, buildBreadcrumbSchema } from '@/lib/schema'
import type { Locale } from '@/i18n/routing'

interface PageSchemaProps {
  /** Locale-neutral path, e.g. '/about'. */
  path: string
  type?: 'AboutPage' | 'ContactPage' | 'CollectionPage' | 'WebPage'
  /** Page title — normally the same string used for the meta title. */
  name: string
  /** Page description — normally the same string used for the meta description. */
  description: string
  /**
   * Breadcrumb label for this page. Omit to skip the BreadcrumbList (correct
   * for the homepage, where a one-item trail is noise).
   */
  breadcrumbLabel?: string
}

/**
 * Emits the per-page structured data pair: a typed WebPage node linked into
 * the site graph via `isPartOf`/`about`, plus a BreadcrumbList.
 *
 * Server component. Drop it at the top of any page's returned tree — it reads
 * the active locale itself, so callers pass only page-specific strings.
 */
export default async function PageSchema({
  path,
  type = 'WebPage',
  name,
  description,
  breadcrumbLabel,
}: PageSchemaProps) {
  const locale = (await getLocale()) as Locale
  const tNav = await getTranslations('nav')

  return (
    <>
      <JsonLd
        data={buildWebPageSchema({ locale, path, type, name, description })}
      />
      {breadcrumbLabel && (
        <JsonLd
          data={buildBreadcrumbSchema({
            locale,
            homeLabel: tNav('home'),
            trail: [{ name: breadcrumbLabel, path }],
          })}
        />
      )}
    </>
  )
}
