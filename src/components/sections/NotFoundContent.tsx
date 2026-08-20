'use client'

import { useTranslations } from 'next-intl'
import { ArrowRight, Mail } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { siteConfig } from '@/config/site'

// Shared body of the 404 page, rendered by both not-found boundaries that can
// win a locale request — `(site)/not-found.tsx` (the normal one, which gets
// Navbar and Footer from the (site) layout) and `[locale]/not-found.tsx` (the
// inner fallback, which does not). Keeping the copy in one component is what
// stops the two from drifting apart, which is how the fallback ended up
// hardcoded to English in the first place.
//
// A client component on purpose, and this is load-bearing. The obvious server
// version reads the locale with `getLocale()`, which works in dev and for
// `/en/nonsense` but returns a 500 in production on `/en/blog/<bad-slug>`:
//   Error: Page changed from static to dynamic at runtime, reason: headers
// A not-found boundary renders in its own pass, so the `setRequestLocale`
// store the surrounding layout populated is not visible to it — even though
// the blog page calls `setRequestLocale` before its own `notFound()`. next-intl
// then falls back to `requestLocale`, which reads headers, and a dynamic read
// inside a prerendered route is a hard error.
//
// Resolving the locale from React context sidesteps that entirely:
// `useTranslations` and the localized `Link` both read the
// NextIntlClientProvider that `[locale]/layout.tsx` mounts with an explicit
// `locale`, so no dynamic API is touched and the blog route stays static.

const SUGGESTIONS = [
  { key: 'consulting', href: '/consulting', navKey: 'consulting' },
  { key: 'marketing', href: '/marketing', navKey: 'marketing' },
  { key: 'blog', href: '/blog', navKey: 'blog' },
  { key: 'contact', href: '/contact', navKey: 'contact' },
] as const

export default function NotFoundContent() {
  const t = useTranslations('notFound')
  const tNav = useTranslations('nav')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
      <div className="max-w-2xl">
        <p className="overline tabular-nums text-[var(--division-text-muted)]">404</p>
        <h1 className="mt-3 text-h1 text-[var(--division-text-primary)]">{t('title')}</h1>
        <p className="mt-4 text-body-lg text-[var(--division-text-secondary)]">
          {t('description')}
        </p>
        <Link
          href="/"
          className="btn-accent mt-8 inline-flex items-center gap-2 min-h-[44px] px-6 py-3 rounded-button font-heading text-small font-medium active:scale-[0.98] focus-ring"
        >
          {t('cta')}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <h2 className="mt-16 overline text-[var(--division-text-muted)]">
        {t('suggestionsTitle')}
      </h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {SUGGESTIONS.map(({ key, href, navKey }) => (
          <li key={key}>
            <Link
              href={href}
              className="group flex h-full flex-col rounded-button border border-[var(--division-border)] bg-[var(--division-surface)] p-6 transition-colors hover:border-[var(--division-border-hover)] focus-ring"
            >
              <span className="flex items-center gap-2 font-heading font-semibold text-[var(--division-text-primary)]">
                {tNav(navKey)}
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
              <span className="mt-2 text-small text-[var(--division-text-secondary)]">
                {t(`suggestions.${key}`)}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-12 border-t border-[var(--division-border)] pt-8">
        <h2 className="font-heading font-semibold text-[var(--division-text-primary)]">
          {t('helpTitle')}
        </h2>
        <p className="mt-2 text-small text-[var(--division-text-secondary)]">{t('helpBody')}</p>
        <a
          href={`mailto:${siteConfig.contact.emailInfo}`}
          className="mt-4 inline-flex items-center gap-2 min-h-[44px] text-small font-heading font-medium text-[var(--division-accent)] hover:underline focus-ring"
        >
          <Mail className="size-4" aria-hidden="true" />
          {t('helpCta')}
        </a>
      </div>
    </div>
  )
}
