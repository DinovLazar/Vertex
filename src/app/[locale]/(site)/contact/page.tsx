import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { generatePageMetadata } from '@/lib/metadata'
import { PageSchema, Breadcrumbs } from '@/components/global'
import type { Locale } from '@/i18n/routing'
import ContactPageClient from './ContactPageClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact.meta' })
  return generatePageMetadata({
    title: t('title'),
    description: t('description'),
    path: '/contact',
    locale,
  })
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const tMeta = await getTranslations({ locale, namespace: 'contact.meta' })
  const tNav = await getTranslations({ locale, namespace: 'nav' })

  return (
    <>
      <PageSchema
        path="/contact"
        type="ContactPage"
        name={tMeta('title')}
        description={tMeta('description')}
      />
      <ContactPageClient
        breadcrumbs={<Breadcrumbs items={[{ label: tNav('contact') }]} />}
      />
    </>
  )
}
