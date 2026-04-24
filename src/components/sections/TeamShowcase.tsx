import { StaggerContainer, StaggerItem } from '@/components/global'
import { staggerContainerFast } from '@/lib/animations'
import BorderGlow from '@/components/ui/BorderGlow'

export interface TeamMember {
  name: string
  role: string
  bio: string
  initials: string
}

interface TeamShowcaseProps {
  members: TeamMember[]
}

/**
 * Marketing-only team showcase. Cards with initials avatars.
 * Fully prop-driven — names stay as proper nouns in the caller, roles and
 * bios resolve through translations. Placeholder avatars until real photos
 * are provided.
 */
export default function TeamShowcase({ members }: TeamShowcaseProps) {
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
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-white/20 bg-[rgba(255,255,255,0.08)]">
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
            </div>
          </BorderGlow>
        </StaggerItem>
      ))}
    </StaggerContainer>
  )
}
