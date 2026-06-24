import Image from 'next/image'
import { StaggerContainer, StaggerItem } from '@/components/global'
import { staggerContainerFast } from '@/lib/animations'
import { Link } from '@/i18n/navigation'
import BorderGlow from '@/components/ui/BorderGlow'

export interface TeamMember {
  name: string
  role: string
  bio: string
  initials: string
  /** When set, the whole card becomes a locale-aware link (e.g. '/lazar'). */
  href?: string
  /** When set, a grayscale portrait fills the avatar circle instead of initials. */
  image?: string
}

interface TeamShowcaseProps {
  members: TeamMember[]
}

/**
 * Marketing-only team showcase. Cards with initials avatars.
 * Fully prop-driven — names stay as proper nouns in the caller, roles and
 * bios resolve through translations. Placeholder avatars until real photos
 * are provided. A member with an `href` renders as a focusable link to that
 * member's page.
 */
export default function TeamShowcase({ members }: TeamShowcaseProps) {
  return (
    <StaggerContainer
      variants={staggerContainerFast}
      amount={0.2}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {members.map((member) => {
        const inner = (
          <div className="p-6 h-full text-center">
            {/* Avatar — grayscale portrait when provided, else initials */}
            {member.image ? (
              <div className="relative w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-2 border-[var(--division-border)] bg-[var(--division-glow)]">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-[var(--division-border)] bg-[var(--division-glow)]">
                <span className="font-heading text-h3 font-bold text-[var(--division-text-primary)]">
                  {member.initials}
                </span>
              </div>
            )}

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
