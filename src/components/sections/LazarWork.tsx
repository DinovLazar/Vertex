import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { AnimateIn, StaggerContainer, StaggerItem } from '@/components/global'
import BorderGlow from '@/components/ui/BorderGlow'
import { lazarProjects } from '@/config/lazar'

// Hand-rolled inline arrow (grayscale, currentColor) — the project-card and
// brutalist convention here is inline SVG rather than a lucide import.
function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export default async function LazarWork() {
  const t = await getTranslations('lazar.work')

  return (
    <section id="work" className="bg-[var(--division-bg)]">
      <div className="mx-auto max-w-7xl border-x-2 border-b-2 border-[var(--division-text-primary)] px-6 py-16 md:px-12 md:py-24">
        <AnimateIn>
          <span className="mb-5 inline-flex items-center gap-2 border border-[var(--division-text-primary)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--division-text-primary)]">
            <span aria-hidden="true" className="text-[var(--division-text-muted)]">03 //</span>
            {t('overline')}
          </span>
          <h2 className="mb-4 font-heading text-display font-extrabold uppercase leading-[0.95] tracking-[-0.02em] text-[var(--division-text-primary)]">
            {t('heading')}
          </h2>
          <p className="mb-12 max-w-2xl text-body-lg text-[var(--division-text-secondary)] md:mb-16">
            {t('subheading')}
          </p>
        </AnimateIn>

        <StaggerContainer amount={0.1} className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-10">
          {lazarProjects.map((project, i) => {
            const label = t(`projects.${i}.label`)
            const desc = t(`projects.${i}.desc`)
            // Zig-zag the second column down, brutalist-masonry style.
            const offset = i === 1 ? 'md:mt-20' : ''

            const cardInner = (
              <>
                {/* Screenshot — grayscale at rest, color on hover */}
                <div className="relative mb-6 aspect-video w-full overflow-hidden border-2 border-[var(--division-text-primary)] bg-[var(--division-surface)]">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={t('imageAlt', { name: project.name })}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover grayscale transition-all duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span aria-hidden="true" className="font-heading text-6xl font-extrabold text-[var(--division-border)]">
                        {project.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col">
                  <div className="mb-4 flex items-center justify-between gap-3 border-b-2 border-[var(--division-border)] pb-4">
                    <h3 className="font-heading text-h3 font-extrabold uppercase tracking-tight text-[var(--division-text-primary)]">
                      {project.name}
                    </h3>
                    <span className="shrink-0 border border-[var(--division-text-primary)] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--division-text-primary)]">
                      {label}
                    </span>
                  </div>
                  <p className="mb-8 flex-1 text-small leading-relaxed text-[var(--division-text-secondary)]">
                    {desc}
                  </p>
                  <span className="mt-auto inline-flex items-center justify-between gap-2 border-2 border-[var(--division-text-primary)] bg-[var(--division-accent)] px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--division-bg)] transition-all group-hover:brightness-110">
                    {t('viewProject')}
                    <span className="transition-transform group-hover:translate-x-1">
                      <ArrowIcon />
                    </span>
                  </span>
                </div>
              </>
            )

            return (
              <StaggerItem key={project.name} className={`h-full ${offset}`}>
                <BorderGlow className="h-full" borderRadius={0} glowRadius={36} glowIntensity={0.8} coneSpread={25} animated={false}>
                  {project.href ? (
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t('viewProjectAria', { name: project.name })}
                      className="group flex h-full flex-col border-2 border-[var(--division-text-primary)] bg-[var(--division-bg)] p-5 transition-colors hover:bg-[var(--division-surface)] focus-ring"
                    >
                      {cardInner}
                    </a>
                  ) : (
                    <div className="group flex h-full flex-col border-2 border-[var(--division-text-primary)] bg-[var(--division-bg)] p-5">
                      {cardInner}
                    </div>
                  )}
                </BorderGlow>
              </StaggerItem>
            )
          })}

          {/* "& more" card — hatch field, easy to grow */}
          <StaggerItem className="h-full md:mt-20">
            <div className="relative flex h-full min-h-[260px] items-center justify-center overflow-hidden border-2 border-[var(--division-text-primary)] bg-[var(--division-surface)] p-8">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-60"
                style={{ backgroundImage: 'repeating-linear-gradient(45deg, var(--division-border) 0, var(--division-border) 1px, transparent 1px, transparent 11px)' }}
              />
              <div className="relative border-2 border-[var(--division-text-primary)] bg-[var(--division-bg)] px-8 py-7 text-center">
                <div className="mb-2 font-heading text-3xl font-extrabold uppercase tracking-tight text-[var(--division-text-primary)]">
                  {t('moreTitle')}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--division-text-muted)]">
                  {t('moreSubtitle')}
                </div>
              </div>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  )
}
