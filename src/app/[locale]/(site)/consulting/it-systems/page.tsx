import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { consultingMetadata } from '@/lib/metadata'
import { ConsultingServicePage } from '@/components/sections'
import type { Locale } from '@/i18n/routing'
import type {
  ContentSection,
  FAQItem,
  ProcessStep,
  RelatedServiceLink,
} from '@/types'

const SLUG = 'it-systems'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale,
    namespace: 'consulting.itSystems.meta',
  })
  return consultingMetadata({
    title: t('title'),
    description: t('description'),
    slug: SLUG,
    locale,
  })
}

export default async function ITSystemsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({
    locale,
    namespace: 'consulting.itSystems',
  })
  const tCommon = await getTranslations({
    locale,
    namespace: 'consulting.serviceCommon',
  })

  return (
    <ConsultingServicePage
      overline={tCommon('overline')}
      title={t('hero.title')}
      subtitle={t('hero.subtitle')}
      content={t.raw('sections') as ContentSection[]}
      processOverline={tCommon('processOverline')}
      processSectionTitle={tCommon('processSectionTitle')}
      processSteps={t.raw('process.steps') as ProcessStep[]}
      faqOverline={tCommon('faqOverline')}
      faqSectionTitle={tCommon('faqSectionTitle')}
      faqItems={t.raw('faq.items') as FAQItem[]}
      relatedSectionTitle={tCommon('relatedSectionTitle')}
      relatedServices={t.raw('related.links') as RelatedServiceLink[]}
      ctaBannerHeadline={tCommon('defaultCtaBannerHeadline')}
      ctaBannerSubtext={tCommon('defaultCtaBannerSubtext')}
      ctaBannerCta={tCommon('defaultCtaBannerCta')}
    />
  )
}
