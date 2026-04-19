import { getTranslations } from 'next-intl/server'
import { Section, AnimateIn } from '@/components/global'
import { TeamGrid, ValuesGrid, CompanyTimeline, CTABanner } from '@/components/sections'
import type { TeamGridMember } from '@/components/sections/TeamGrid'

const TEAM_KEYS = [
  { key: 'goran', division: 'consulting' as const },
  { key: 'lazar', division: 'marketing' as const },
  { key: 'petar', division: 'marketing' as const },
  { key: 'andrej', division: 'marketing' as const },
] as const

export default async function AboutPageClient() {
  const t = await getTranslations('about')

  const members: TeamGridMember[] = TEAM_KEYS.map((m) => ({
    name: t(`team.members.${m.key}.name`),
    role: t(`team.members.${m.key}.role`),
    bio: t(`team.members.${m.key}.bio`),
    division: m.division,
    initials: t(`team.members.${m.key}.initials`),
  }))

  const storyParagraphs = t.raw('hero.paragraphs') as string[]

  return (
    <>
      {/* Hero / Story */}
      <Section className="pt-16 md:pt-24">
        <AnimateIn>
          <p className="overline text-[var(--division-accent)] mb-4">
            {t('hero.overline')}
          </p>
          <h1 className="text-h1 text-[var(--division-text-primary)] max-w-3xl">
            {t('hero.headline')}
          </h1>
          <div className="mt-6 max-w-3xl space-y-4 text-body text-[var(--division-text-secondary)]">
            {storyParagraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </AnimateIn>
      </Section>

      {/* Values */}
      <Section className="bg-[var(--division-surface)]">
        <AnimateIn>
          <p className="overline text-[var(--division-text-muted)] mb-3">
            {t('values.overline')}
          </p>
          <h2 className="text-h2 text-[var(--division-text-primary)] mb-10">
            {t('values.sectionTitle')}
          </h2>
        </AnimateIn>
        <ValuesGrid />
      </Section>

      {/* Team */}
      <Section>
        <AnimateIn>
          <p className="overline text-[var(--division-text-muted)] mb-3">
            {t('team.overline')}
          </p>
          <h2 className="text-h2 text-[var(--division-text-primary)] mb-3">
            {t('team.sectionTitle')}
          </h2>
          <p className="text-body text-[var(--division-text-secondary)] max-w-2xl mb-10">
            {t('team.sectionSubtitle')}
          </p>
        </AnimateIn>
        <TeamGrid members={members} />
      </Section>

      {/* Timeline */}
      <Section className="bg-[var(--division-surface)]">
        <AnimateIn>
          <p className="overline text-[var(--division-text-muted)] mb-3">
            {t('timeline.overline')}
          </p>
          <h2 className="text-h2 text-[var(--division-text-primary)] mb-10">
            {t('timeline.sectionTitle')}
          </h2>
        </AnimateIn>
        <CompanyTimeline />
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
