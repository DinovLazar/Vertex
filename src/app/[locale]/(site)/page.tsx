import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { generatePageMetadata } from '@/lib/metadata'
import { BackgroundSilk } from '@/components/backgrounds'
import { Section, AnimateIn, PageSchema } from '@/components/global'
import type { Locale } from '@/i18n/routing'
import {
  HeroSection,
  DivisionSplit,
  ServicesOverview,
  ProjectsShowcase,
  SocialProof,
  CTABanner,
} from '@/components/sections'

/**
 * The homepage previously shipped no `generateMetadata` at all, so it fell
 * back to the root layout's metadata — which carries no canonical URL and no
 * hreflang alternates. That left the site's single most important page unable
 * to tell Google that `/en` and `/mk` are translations of each other rather
 * than duplicate content.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home.meta' })
  return generatePageMetadata({
    title: t('title'),
    description: t('description'),
    path: '',
    locale,
  })
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  // The site's most-requested page was the last one still rendering
  // dynamically — every other page.tsx already calls setRequestLocale.
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('home')
  const tMeta = await getTranslations('home.meta')

  return (
    <>
      {/* No breadcrumb label — a one-item trail on the homepage is noise. */}
      <PageSchema
        path="/"
        type="WebPage"
        name={tMeta('title')}
        description={tMeta('description')}
      />

      {/* ===== SECTION 1: HERO ===== */}
      <HeroSection
        headline={t('hero.headline')}
        subtitle={t('hero.subtitle')}
        buttons={[
          { label: t('hero.ctaPrimary'), href: '/consulting', variant: 'primary' },
          { label: t('hero.ctaSecondary'), href: '/marketing', variant: 'outline' },
        ]}
      >
        <BackgroundSilk />
      </HeroSection>

      {/* ===== SECTION 2: DIVISION SPLIT ===== */}
      <Section id="divisions">
        <AnimateIn>
          <div className="text-center mb-12">
            <h2 className="text-h2 text-[var(--division-text-primary)]">
              {t('divisionSplit.sectionHeadline')}
            </h2>
            <p className="mt-3 text-body text-[var(--division-text-secondary)] max-w-2xl mx-auto">
              {t('divisionSplit.sectionSubtext')}
            </p>
          </div>
        </AnimateIn>
        <DivisionSplit />
      </Section>

      {/* ===== SECTION 3: SERVICES OVERVIEW ===== */}
      <Section id="services" className="bg-[var(--division-surface)]">
        <AnimateIn>
          <div className="text-center mb-12">
            <p className="overline text-[var(--division-accent)] mb-3">
              {t('servicesOverview.overline')}
            </p>
            <h2 className="text-h2 text-[var(--division-text-primary)]">
              {t('servicesOverview.sectionHeadline')}
            </h2>
            <p className="mt-3 text-body text-[var(--division-text-secondary)] max-w-2xl mx-auto">
              {t('servicesOverview.sectionSubtext')}
            </p>
          </div>
        </AnimateIn>
        <ServicesOverview />
      </Section>

      {/* ===== SECTION 4: OUR WORK ===== */}
      <ProjectsShowcase />

      {/* ===== SECTION 5: SOCIAL PROOF ===== */}
      <Section id="proof">
        <SocialProof />
      </Section>

      {/* ===== SECTION 6: CTA BANNER ===== */}
      <CTABanner
        headline={t('ctaBanner.headline')}
        subtext={t('ctaBanner.subtext')}
        buttonText={t('ctaBanner.cta')}
        buttonHref="/contact"
      />
    </>
  )
}
