import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'
import { AnimateIn, StaggerContainer, StaggerItem } from '@/components/global'

// Thin-stroke grayscale line icons, index-aligned to the `lazar.skills.items`
// array. currentColor is inherited from the cell's text color; the cell sizes
// the SVG up via the `[&_svg]` utility so they read at the brutalist scale.
const ICONS: ReactNode[] = [
  // Web Design & Development
  (
    <svg key="web" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="14" rx="2" /><path d="M3 9h18M8 21h8" />
    </svg>
  ),
  // Social Media
  (
    <svg key="social" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  ),
  // Branding & Visual Identity
  (
    <svg key="brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    </svg>
  ),
  // SEO & Content
  (
    <svg key="seo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
    </svg>
  ),
  // AI-Assisted Marketing
  (
    <svg key="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="6" width="14" height="12" rx="2" /><path d="M9 2v4M15 2v4M9 11h.01M15 11h.01M9 15h6" />
    </svg>
  ),
  // Web Infrastructure
  (
    <svg key="infra" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="6" rx="1.5" /><rect x="3" y="14" width="18" height="6" rx="1.5" /><path d="M7 7h.01M7 17h.01" />
    </svg>
  ),
]

export default async function LazarSkills() {
  const t = await getTranslations('lazar.skills')
  const items = t.raw('items') as { title: string; desc: string }[]

  return (
    <section id="expertise" className="bg-[var(--division-bg)]">
      <div className="mx-auto max-w-7xl border-x-2 border-b-2 border-[var(--division-text-primary)] px-6 py-16 md:px-12 md:py-24">
        <AnimateIn>
          <span className="mb-5 inline-flex items-center gap-2 border border-[var(--division-text-primary)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--division-text-primary)]">
            <span aria-hidden="true" className="text-[var(--division-text-muted)]">02 //</span>
            {t('overline')}
          </span>
          <h2 className="mb-12 font-heading text-display font-extrabold uppercase leading-[0.95] tracking-[-0.02em] text-[var(--division-text-primary)] md:mb-16">
            {t('heading')}
          </h2>
        </AnimateIn>

        {/* Brutalist bordered table — shared hairlines, no gaps. The grid owns
            the top + left edges; each cell contributes its bottom + right
            edge, so the frame closes cleanly at every breakpoint. */}
        <StaggerContainer
          amount={0.1}
          className="grid grid-cols-1 border-l-2 border-t-2 border-[var(--division-text-primary)] sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item, i) => (
            <StaggerItem
              key={i}
              className="group flex flex-col border-b-2 border-r-2 border-[var(--division-text-primary)] bg-[var(--division-bg)] p-8 transition-colors duration-300 hover:bg-[var(--division-surface)] md:p-10"
            >
              <div className="mb-10 flex items-start justify-between">
                <span className="text-[var(--division-text-primary)] transition-transform duration-300 group-hover:scale-110 [&_svg]:h-8 [&_svg]:w-8">
                  {ICONS[i]}
                </span>
                <span aria-hidden="true" className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--division-text-muted)]">
                  {`// 0${i + 1}`}
                </span>
              </div>
              <h3 className="mb-3 font-heading text-h3 font-bold uppercase tracking-tight text-[var(--division-text-primary)]">
                {item.title}
              </h3>
              <p className="text-small leading-relaxed text-[var(--division-text-secondary)]">
                {item.desc}
              </p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
