import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'

// Next 16 App Router doesn't pass `params` to top-level `not-found.tsx`. We
// use the fallback English copy here because the active request may not
// have a resolved locale (e.g. an unmatched `/<bad-slug>` at the root).
// If a localized not-found is needed per-segment, add a `not-found.tsx`
// at the segment level and pull the locale from its parent route segment.
export default async function LocaleNotFound() {
  const t = await getTranslations({ locale: 'en' as Locale, namespace: 'notFound' }).catch(() => null)
  const title = t?.('title') ?? 'Page not found'
  const description = t?.('description') ?? "The page you're looking for doesn't exist — or has moved."
  const cta = t?.('cta') ?? 'Back to home'

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="overline tabular-nums text-[var(--division-text-muted)] mb-3">
          404
        </p>
        <h1 className="text-h1 text-[var(--division-text-primary)]">
          {title}
        </h1>
        <p className="mt-4 text-body-lg text-[var(--division-text-secondary)]">
          {description}
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center min-h-[44px] px-6 py-3 rounded-button font-heading text-small font-medium transition-[filter,transform] hover:brightness-110 active:scale-[0.98] focus-ring"
          style={{
            backgroundColor: 'var(--division-accent)',
            color: 'var(--division-bg)',
          }}
        >
          {cta}
        </Link>
      </div>
    </div>
  )
}
