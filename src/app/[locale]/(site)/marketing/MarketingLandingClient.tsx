import { getTranslations } from 'next-intl/server'
import { Globe, Share2, Server, Cpu } from 'lucide-react'
import { BackgroundPlasma } from '@/components/backgrounds'
import { Section, AnimateIn } from '@/components/global'
import {
  HeroSection,
  MarketingServicesGrid,
  TeamShowcase,
  CTABanner,
} from '@/components/sections'

// Locale-neutral metadata for the 4 marketing services. Titles come from
// `nav.dropdown.*`, descriptions from `marketing.landing.services.*.description`.
const SERVICES = [
  { key: 'webDesign', href: '/marketing/web-design', icon: Globe },
  { key: 'socialMedia', href: '/marketing/social-media', icon: Share2 },
  { key: 'itInfrastructure', href: '/marketing/it-infrastructure', icon: Server },
  { key: 'aiDevelopment', href: '/marketing/ai-development', icon: Cpu },
] as const

const TEAM_KEYS = ['lazar', 'petar', 'andrej'] as const

export default async function MarketingLandingClient() {
  const t = await getTranslations('marketing.landing')
  const tNav = await getTranslations('nav.dropdown')

  const services = SERVICES.map((s) => ({
    title: tNav(s.key),
    description: t(`services.${s.key}.description`),
    href: s.href,
    icon: s.icon,
  }))

  const members = TEAM_KEYS.map((key) => ({
    name: t(`team.members.${key}.name`),
    role: t(`team.members.${key}.role`),
    bio: t(`team.members.${key}.bio`),
    initials: t(`team.members.${key}.initials`),
  }))

  return (
    <>
      {/* Hero — grayscale plasma backdrop, no mouse interaction */}
      <HeroSection
        headline={t('hero.headline')}
        subtitle={t('hero.subtitle')}
        buttons={[
          { label: t('hero.ctaPrimary'), href: '#services', variant: 'primary' },
          { label: t('hero.ctaSecondary'), href: '#team', variant: 'outline' },
        ]}
      >
        <BackgroundPlasma
          color="#F5F5F5"
          speed={0.5}
          direction="forward"
          scale={1.3}
          opacity={0.35}
          mouseInteractive={false}
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
        <MarketingServicesGrid services={services} />
      </Section>

      {/* Team showcase */}
      <Section id="team" className="bg-[var(--division-surface)]">
        <AnimateIn>
          <p className="overline text-[var(--division-text-muted)] mb-3">
            {t('team.overline')}
          </p>
          <h2 className="text-h2 text-[var(--division-text-primary)] mb-3">
            {t('team.sectionHeadline')}
          </h2>
          <p className="text-body text-[var(--division-text-secondary)] max-w-2xl mb-10">
            {t('team.sectionSubtext')}
          </p>
        </AnimateIn>
        <TeamShowcase members={members} />
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
