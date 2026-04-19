import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { generatePageMetadata } from '@/lib/metadata'
import type { Locale } from '@/i18n/routing'
import MarketingLandingClient from './MarketingLandingClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'marketing.meta' })
  return generatePageMetadata({
    title: t('title'),
    description: t('description'),
    path: '/marketing',
    locale,
  })
}

export default async function MarketingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  return <MarketingLandingClient />
}
