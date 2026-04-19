import { getTranslations } from 'next-intl/server'
import { BackgroundSilk } from '@/components/backgrounds'
import { Section, AnimateIn } from '@/components/global'
import {
  HeroSection,
  DivisionSplit,
  ServicesOverview,
  SocialProof,
  CTABanner,
} from '@/components/sections'

export default async function HomePage() {
  const t = await getTranslations('home')

  return (
    <>
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

      {/* ===== SECTION 4: SOCIAL PROOF ===== */}
      <Section id="proof">
        <SocialProof />
      </Section>

      {/* ===== SECTION 5: CTA BANNER ===== */}
      <CTABanner
        headline={t('ctaBanner.headline')}
        subtext={t('ctaBanner.subtext')}
        buttonText={t('ctaBanner.cta')}
        buttonHref="/contact"
      />
    </>
  )
}
