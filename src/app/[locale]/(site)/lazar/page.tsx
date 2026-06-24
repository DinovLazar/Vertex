import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { generatePageMetadata } from '@/lib/metadata'
import type { Locale } from '@/i18n/routing'
import LazarHero from '@/components/sections/LazarHero'
import LazarAbout from '@/components/sections/LazarAbout'
import LazarSkills from '@/components/sections/LazarSkills'
import LazarWork from '@/components/sections/LazarWork'
import LazarContact from '@/components/sections/LazarContact'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'lazar.meta' })
  return generatePageMetadata({
    title: t('title'),
    description: t('description'),
    path: '/lazar',
    locale,
  })
}

export default async function LazarPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <>
      <LazarHero />
      <LazarAbout />
      <LazarSkills />
      <LazarWork />
      <LazarContact />
    </>
  )
}
