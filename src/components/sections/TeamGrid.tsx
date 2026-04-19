import { getTranslations } from 'next-intl/server'
import { StaggerContainer, StaggerItem } from '@/components/global'
import BorderGlow from '@/components/ui/BorderGlow'

export interface TeamGridMember {
  name: string
  role: string
  bio: string
  division: 'consulting' | 'marketing'
  initials: string
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
              colors={['#F5F5F5', '#C9C9C9', '#A3A3A3']}
              glowColor="0 0 85"
              backgroundColor="#1C1C1C"
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
                <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center border-2 border-white/10 bg-white/5">
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
              </div>
            </BorderGlow>
          </StaggerItem>
        )
      })}
    </StaggerContainer>
  )
}
