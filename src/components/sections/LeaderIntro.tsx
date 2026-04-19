import { getTranslations } from 'next-intl/server'
import { AnimateIn } from '@/components/global'

interface LeaderIntroProps {
  name: string
  role: string
  bio: string
  /** Optional overline — defaults to the shared `sections.leader.overline` translation. */
  overline?: string
}

/**
 * Founder / leader introduction section with initials avatar + bio.
 * Used on division landing pages. Division-themed via CSS vars.
 */
export default async function LeaderIntro({ name, role, bio, overline }: LeaderIntroProps) {
  const t = await getTranslations('sections.leader')
  const resolvedOverline = overline ?? t('overline')
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <AnimateIn amount={0.2} className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-start">
      <div className="flex-shrink-0">
        <div
          className="w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center border border-[var(--division-border)]"
          style={{
            backgroundColor: 'var(--division-surface)',
          }}
        >
          <span
            className="font-heading text-3xl md:text-4xl font-semibold"
            style={{ color: 'var(--division-text-primary)' }}
          >
            {initials}
          </span>
        </div>
      </div>

      <div>
        <p className="overline text-[var(--division-text-muted)] mb-3">
          {resolvedOverline}
        </p>
        <h2 className="text-h2 text-[var(--division-text-primary)]">
          {name}
        </h2>
        <p className="mt-1 text-body text-[var(--division-text-secondary)]">
          {role}
        </p>
        <p className="mt-5 text-body text-[var(--division-text-secondary)] max-w-2xl">
          {bio}
        </p>
      </div>
    </AnimateIn>
  )
}
