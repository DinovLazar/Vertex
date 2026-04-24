import { getTranslations } from 'next-intl/server'
import { Briefcase, Settings, Monitor, Brain } from 'lucide-react'
import { BackgroundGrid } from '@/components/backgrounds'
import { Section, AnimateIn } from '@/components/global'
import {
  HeroSection,
  ConsultingServicesGrid,
  LeaderIntro,
  CTABanner,
} from '@/components/sections'

// Locale-neutral metadata for the 4 consulting services. The title /
// description are resolved against the `consulting.landing.services.*`
// translation namespace at render time.
const SERVICES = [
  { key: 'businessConsulting', href: '/consulting/business-consulting', icon: Briefcase },
  { key: 'workflowRestructuring', href: '/consulting/workflow-restructuring', icon: Settings },
  { key: 'itSystems', href: '/consulting/it-systems', icon: Monitor },
  { key: 'aiConsulting', href: '/consulting/ai-consulting', icon: Brain },
] as const

export default async function ConsultingLandingClient() {
  const t = await getTranslations('consulting.landing')
  const tNav = await getTranslations('nav.dropdown')

  const services = SERVICES.map((s) => ({
    title: tNav(s.key),
    description: t(`services.${s.key}.description`),
    href: s.href,
    icon: s.icon,
  }))

  return (
    <>
      {/* Hero with GridMotion background + legibility scrim */}
      <HeroSection
        headline={t('hero.headline')}
        subtitle={t('hero.subtitle')}
        buttons={[
          { label: t('hero.ctaPrimary'), href: '#services', variant: 'primary' },
          { label: t('hero.ctaSecondary'), href: '#leader', variant: 'outline' },
        ]}
      >
        <BackgroundGrid />
        {/* Radial scrim — improves hero text contrast over the animated bg.
            Dark mode: darkens the center ellipse. Light mode: lightens it
            (tokens flip in globals.css). Sits between BackgroundGrid (z-0)
            and hero content (z-10). */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 50% 40% at 50% 50%, var(--hero-scrim-center) 0%, var(--hero-scrim-mid) 40%, transparent 80%)',
          }}
        />
      </HeroSection>

      {/* Services grid */}
      <Section id="services">
        <AnimateIn>
          <p className="overline text-[var(--division-text-muted)] mb-3">
            {t('services.overline')}
          </p>
          <h2 className="text-h2 text-[var(--division-text-primary)] mb-3">
            {t('services.sectionHeadline')}
          </h2>
          <p className="text-body text-[var(--division-text-secondary)] max-w-2xl mb-10">
            {t('services.sectionSubtext')}
          </p>
        </AnimateIn>
        <ConsultingServicesGrid services={services} />
      </Section>

      {/* Goran introduction */}
      <Section id="leader" className="bg-[var(--division-surface)]">
        <LeaderIntro
          name={t('leader.name')}
          role={t('leader.role')}
          bio={t('leader.bio')}
          overline={t('leader.overline')}
        />
      </Section>

      {/* CTA */}
      <CTABanner
        headline={t('ctaBanner.headline')}
        subtext={t('ctaBanner.subtext')}
        buttonText={t('ctaBanner.cta')}
        buttonHref="/contact"
      />
    </>
  )
}
