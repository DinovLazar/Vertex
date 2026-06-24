import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { StaggerContainer, StaggerItem } from '@/components/global'
import { Link } from '@/i18n/navigation'
import BorderGlow from '@/components/ui/BorderGlow'

export interface TeamGridMember {
  name: string
  role: string
  bio: string
  division: 'consulting' | 'marketing'
  initials: string
  /** When set, the whole card becomes a locale-aware link (e.g. '/lazar'). */
  href?: string
  /** When set, a grayscale portrait fills the avatar circle instead of initials. */
  image?: string
}

interface TeamGridProps {
  members: TeamGridMember[]
}

/**
 * About-page team grid. Prop-driven — the caller supplies translated roles
 * and bios; names stay as proper nouns. The division chip label resolves
 * against `sections.team.{consulting,marketing}Badge` translations. A member
 * with an `href` renders as a focusable link to that member's page.
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
        const inner = (
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

            {/* Avatar — grayscale portrait when provided, else initials */}
            {member.image ? (
              <div className="relative w-16 h-16 rounded-full mb-4 overflow-hidden border-2 border-[var(--division-border)] bg-[var(--division-glow)]">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center border-2 border-[var(--division-border)] bg-[var(--division-glow)]">
                <span className="font-heading text-body-lg font-bold text-[var(--division-text-primary)]">
                  {member.initials}
                </span>
              </div>
            )}

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
        )
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
              {member.href ? (
                <Link href={member.href} className="group block h-full rounded-[12px] focus-ring">
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </BorderGlow>
          </StaggerItem>
        )
      })}
    </StaggerContainer>
  )
}
