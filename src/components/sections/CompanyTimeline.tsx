import { getTranslations } from 'next-intl/server'
import { StaggerContainer, StaggerItem } from '@/components/global'

const MILESTONE_KEYS = ['founded', 'itExpansion', 'aiLaunch', 'marketingDivision'] as const

export default async function CompanyTimeline() {
  const t = await getTranslations('sections.timeline.milestones')

  return (
    <StaggerContainer amount={0.2} className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-[11px] sm:left-4 top-0 bottom-0 w-px bg-[var(--division-border)]" />

      <div className="space-y-10">
        {MILESTONE_KEYS.map((key) => (
          <StaggerItem
            key={key}
            className="relative flex items-start gap-6 pl-8 sm:pl-12"
          >
            {/* Dot */}
            <div
              className="absolute left-0 top-1 w-6 h-6 rounded-full border-2 bg-[var(--division-bg)] flex items-center justify-center"
              style={{ borderColor: 'var(--division-accent)' }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: 'var(--division-accent)' }}
              />
            </div>

            {/* Content */}
            <div className="flex-1">
              <p className="overline text-[var(--division-accent)] tabular-nums mb-1">
                {t(`${key}.year`)}
              </p>
              <h3 className="text-h3 text-[var(--division-text-primary)]">
                {t(`${key}.title`)}
              </h3>
              <p className="mt-1 text-small text-[var(--division-text-secondary)] max-w-2xl">
                {t(`${key}.description`)}
              </p>
            </div>
          </StaggerItem>
        ))}
      </div>
    </StaggerContainer>
  )
}
