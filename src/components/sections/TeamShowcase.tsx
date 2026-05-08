import { getTranslations } from 'next-intl/server'
import { StaggerContainer, StaggerItem } from '@/components/global'
import { staggerContainerFast } from '@/lib/animations'
import BorderGlow from '@/components/ui/BorderGlow'

export interface TeamMember {
  name: string
  role: string
  bio: string
  initials: string
  /** Optional external link to the member's personal portfolio. Renders a small "Portfolio ↗" link below the bio. */
  portfolioUrl?: string
}

interface TeamShowcaseProps {
  members: TeamMember[]
}

/**
 * Marketing-only team showcase. Cards with initials avatars.
 * Fully prop-driven — names stay as proper nouns in the caller, roles and
 * bios resolve through translations. Placeholder avatars until real photos
 * are provided.
 *
 * Members may optionally provide a `portfolioUrl` to render a small external
 * link below the bio (label resolves from `sections.team.portfolioLabel`).
 */
export default async function TeamShowcase({ members }: TeamShowcaseProps) {
  const t = await getTranslations('sections.team')
  return (
    <StaggerContainer
      variants={staggerContainerFast}
      amount={0.2}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {members.map((member) => (
        <StaggerItem key={member.name} className="h-full">
          <BorderGlow
            className="h-full"
            borderRadius={12}
            glowRadius={40}
            glowIntensity={0.8}
            coneSpread={25}
            animated={false}
          >
            <div className="p-6 h-full text-center">
              {/* Avatar placeholder */}
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-[var(--division-border)] bg-[var(--division-glow)]">
                <span className="font-heading text-h3 font-bold text-[var(--division-text-primary)]">
                  {member.initials}
                </span>
              </div>

              <h3 className="text-h3 text-[var(--division-text-primary)]">
                {member.name}
              </h3>
              <p className="mt-1 overline text-[var(--division-text-secondary)]">
                {member.role}
              </p>
              <p className="mt-3 text-small text-[var(--division-text-muted)]">
                {member.bio}
              </p>
              {member.portfolioUrl && (
                <a
                  href={member.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name} — ${t('portfolioAriaSuffix')}`}
                  className="focus-ring mt-4 inline-flex items-center gap-1.5 rounded text-small font-medium text-[var(--division-text-secondary)] transition-colors hover:text-[var(--division-text-primary)]"
                >
                  {t('portfolioLabel')}
                  <svg
                    aria-hidden="true"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17L17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </a>
              )}
            </div>
          </BorderGlow>
        </StaggerItem>
      ))}
    </StaggerContainer>
  )
}
