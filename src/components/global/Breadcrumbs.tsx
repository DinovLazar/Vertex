import { getLocale, getTranslations } from 'next-intl/server'
import { ChevronRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import JsonLd from './JsonLd'
import { buildBreadcrumbSchema } from '@/lib/schema'
import { cn } from '@/lib/utils'
import type { Locale } from '@/i18n/routing'

export interface BreadcrumbItem {
  /** Visible label. Comes from the message files, never from the URL slug. */
  label: string
  /**
   * Locale-neutral path, e.g. '/consulting'. Omit on the LAST item — the
   * current page is not a link.
   */
  href?: string
}

interface BreadcrumbsProps {
  /**
   * The trail *excluding* Home, which is prepended automatically. Ordered
   * ancestor-first, so the page itself is last and carries no `href`.
   */
  items: BreadcrumbItem[]
  className?: string
}

/**
 * Visible breadcrumb trail + its BreadcrumbList JSON-LD, generated from one
 * `items` array so the two can never drift apart.
 *
 * This is the site's ONLY source of BreadcrumbList structured data. The
 * schema used to be emitted separately by <PageSchema> and by the two service
 * page templates; those emissions were removed when this component landed, so
 * a page rendering breadcrumbs does not also publish a second, competing
 * trail.
 *
 * Server component — the JSON-LD is in the initial HTML, which is what
 * Googlebot and non-JS LLM crawlers actually read.
 *
 * Not rendered on the homepage (a one-item trail is noise) or on the 404.
 */
export default async function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('breadcrumbs')

  const homeLabel = t('home')
  // Home is always first and always links to the locale root.
  const trail: BreadcrumbItem[] = [{ label: homeLabel, href: '/' }, ...items]

  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema({
          locale,
          homeLabel,
          // buildBreadcrumbSchema prepends Home itself, so pass only the rest.
          // The final item legitimately has no path; schema.org treats `item`
          // as optional on the last ListItem, so it is simply omitted.
          trail: items.map((item) => ({ name: item.label, path: item.href })),
        })}
      />

      <nav
        aria-label={t('ariaLabel')}
        // On narrow screens a three-level trail would wrap to three lines and
        // shove the page header down. Scroll it horizontally instead, with the
        // scrollbar hidden — the chevrons already signal there is more to see.
        className={cn(
          'font-body text-sm overflow-x-auto whitespace-nowrap scrollbar-none -mx-1 px-1',
          className,
        )}
      >
        <ol className="flex items-center gap-1.5">
          {trail.map((item, i) => {
            const isCurrent = i === trail.length - 1
            return (
              <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
                {i > 0 && (
                  <ChevronRight
                    size={14}
                    aria-hidden="true"
                    className="shrink-0 text-[var(--division-text-muted)]"
                  />
                )}
                {isCurrent || !item.href ? (
                  <span
                    aria-current={isCurrent ? 'page' : undefined}
                    className="text-[var(--division-text-primary)]"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    /* inline-flex + min-h-[24px] so the tap target clears the
                       24x24 floor in WCAG 2.5.8 — a 20px-tall breadcrumb link
                       is a nav control, not prose, so the inline-text exception
                       does not apply. */
                    className="inline-flex items-center min-h-[24px] text-[var(--division-text-secondary)] hover:text-[var(--division-text-primary)] transition-colors focus-ring rounded-sm"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
