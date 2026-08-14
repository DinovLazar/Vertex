import { getLocale } from 'next-intl/server'
import JsonLd from './JsonLd'
import { buildWebPageSchema } from '@/lib/schema'
import type { Locale } from '@/i18n/routing'

interface PageSchemaProps {
  /** Locale-neutral path, e.g. '/about'. */
  path: string
  type?: 'AboutPage' | 'ContactPage' | 'CollectionPage' | 'WebPage'
  /** Page title — normally the same string used for the meta title. */
  name: string
  /** Page description — normally the same string used for the meta description. */
  description: string
}

/**
 * Emits the typed WebPage node for a page, linked into the site graph via
 * `isPartOf` / `about`.
 *
 * It used to emit a BreadcrumbList too, via a `breadcrumbLabel` prop. That
 * moved to <Breadcrumbs>, which builds the visible trail and the schema from
 * one array — keeping it here as well would publish two competing
 * BreadcrumbLists on every page that renders breadcrumbs.
 *
 * Server component. Drop it at the top of any page's returned tree — it reads
 * the active locale itself, so callers pass only page-specific strings.
 */
export default async function PageSchema({
  path,
  type = 'WebPage',
  name,
  description,
}: PageSchemaProps) {
  const locale = (await getLocale()) as Locale

  return (
    <JsonLd data={buildWebPageSchema({ locale, path, type, name, description })} />
  )
}
