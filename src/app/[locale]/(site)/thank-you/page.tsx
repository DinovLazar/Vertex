import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { generatePageMetadata } from '@/lib/metadata'
import type { Locale } from '@/i18n/routing'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'thankYou.meta' })
  return generatePageMetadata({
    title: t('title'),
    description: t('description'),
    path: '/thank-you',
    locale,
    noIndex: true,
  })
}

export default async function ThankYouPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'thankYou' })

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-h1 text-[var(--division-text-primary)]">
          {t('headline')}
        </h1>
        <p className="mt-4 text-body-lg text-[var(--division-text-secondary)]">
          {t('subtitle')}
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center min-h-[44px] px-6 py-3 rounded-button font-heading text-small font-medium transition-[filter,transform] hover:brightness-110 active:scale-[0.98] focus-ring"
          style={{
            backgroundColor: 'var(--division-accent)',
            color: 'var(--division-bg)',
          }}
        >
          {t('cta')}
        </Link>
      </div>
    </div>
  )
}
