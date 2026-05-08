import { getTranslations } from 'next-intl/server'
import { StaggerContainer, StaggerItem } from '@/components/global'
import BorderGlow from '@/components/ui/BorderGlow'

export interface TeamGridMember {
  name: string
  role: string
  bio: string
  division: 'consulting' | 'marketing'
  initials: string
  /** Optional external link to the member's personal portfolio. Renders a small "Portfolio ↗" link below the bio. */
  portfolioUrl?: string
}

interface TeamGridProps {
  members: TeamGridMember[]
}

/**
 * About-page team grid. Prop-driven — the caller supplies translated roles
 * and bios; names stay as proper nouns. The division chip label resolves
 * against `sections.team.{consulting,marketing}Badge` translations.
 */
export default async function TeamGrid({ members }: TeamGridProps) {
  const t = await getTranslations('sections.team')
  return (
    <StaggerContainer
      amount={0.1}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
    >
      {members.map((member) => {
        const isMarketing = member.division === 'marketing'
        return (
          <StaggerItem key={member.name} className="h-full">
            <BorderGlow
              className="h-full"
              borderRadius={12}
              glowRadius={40}
              glowIntensity={0.8}
              coneSpread={25}
              animated={false}
            >
              <div className="p-6 h-full">
                {/* Division indicator — neutral; label text signals the division */}
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'var(--division-text-muted)' }}
                  />
                  <span className="overline text-[var(--division-text-muted)]">
                    {isMarketing ? t('marketingBadge') : t('consultingBadge')}
                  </span>
                </div>

                {/* Avatar */}
                <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center border-2 border-[var(--division-border)] bg-[var(--division-glow)]">
                  <span className="font-heading text-body-lg font-bold text-[var(--division-text-primary)]">
                    {member.initials}
                  </span>
                </div>

                <h3 className="font-heading text-body-lg font-semibold text-[var(--division-text-primary)]">
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
        )
      })}
    </StaggerContainer>
  )
}
