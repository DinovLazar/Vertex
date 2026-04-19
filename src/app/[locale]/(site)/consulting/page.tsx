import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { generatePageMetadata } from '@/lib/metadata'
import type { Locale } from '@/i18n/routing'
import ConsultingLandingClient from './ConsultingLandingClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'consulting.meta' })
  return generatePageMetadata({
    title: t('title'),
    description: t('description'),
    path: '/consulting',
    locale,
  })
}

export default async function ConsultingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  return <ConsultingLandingClient />
}
