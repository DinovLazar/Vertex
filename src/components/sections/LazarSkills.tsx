import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'
import { Section, AnimateIn, StaggerContainer, StaggerItem } from '@/components/global'
import BorderGlow from '@/components/ui/BorderGlow'

// Thin-stroke grayscale line icons, index-aligned to the `lazar.skills.items`
// array. currentColor is inherited from the tile's text color.
const ICONS: ReactNode[] = [
  // Web Design & Development
  (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="14" rx="2" /><path d="M3 9h18M8 21h8" />
    </svg>
  ),
  // Social Media
  (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  ),
  // Branding & Visual Identity
  (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    </svg>
  ),
  // SEO & Content
  (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
    </svg>
  ),
  // AI-Assisted Marketing
  (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="6" width="14" height="12" rx="2" /><path d="M9 2v4M15 2v4M9 11h.01M15 11h.01M9 15h6" />
    </svg>
  ),
  // Web Infrastructure
  (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="6" rx="1.5" /><rect x="3" y="14" width="18" height="6" rx="1.5" /><path d="M7 7h.01M7 17h.01" />
    </svg>
  ),
]

export default async function LazarSkills() {
  const t = await getTranslations('lazar.skills')
  const items = t.raw('items') as { title: string; desc: string }[]

  return (
    <Section className="bg-[var(--division-bg)]">
      <AnimateIn>
        <p className="overline text-[var(--division-text-muted)] mb-3">{t('overline')}</p>
        <h2 className="text-h2 text-[var(--division-text-primary)] mb-12">{t('heading')}</h2>
      </AnimateIn>
      <StaggerContainer amount={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
        {items.map((item, i) => (
          <StaggerItem key={i} className="h-full">
            <BorderGlow
              className="h-full"
              borderRadius={12}
              glowRadius={40}
              glowIntensity={0.8}
              coneSpread={25}
              animated={false}
            >
              <div className="p-[30px] h-full">
                <div className="mb-[22px] flex h-11 w-11 items-center justify-center rounded-[11px] border border-[var(--division-border)] bg-[var(--division-card)] text-[var(--division-text-secondary)]">
                  {ICONS[i]}
                </div>
                <h3 className="font-heading text-body-lg font-semibold text-[var(--division-text-primary)] mb-2.5">
                  {item.title}
                </h3>
                <p className="text-small leading-relaxed text-[var(--division-text-muted)]">{item.desc}</p>
              </div>
            </BorderGlow>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </Section>
  )
}
