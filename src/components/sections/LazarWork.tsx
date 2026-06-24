import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Section, AnimateIn, StaggerContainer, StaggerItem } from '@/components/global'
import BorderGlow from '@/components/ui/BorderGlow'
import { lazarProjects } from '@/config/lazar'

export default async function LazarWork() {
  const t = await getTranslations('lazar.work')

  return (
    <Section id="work" className="bg-[var(--division-bg)]">
      <AnimateIn>
        <p className="overline text-[var(--division-text-muted)] mb-3">{t('overline')}</p>
        <h2 className="text-h2 text-[var(--division-text-primary)] mb-3">{t('heading')}</h2>
        <p className="text-body text-[var(--division-text-secondary)] max-w-2xl mb-12">{t('subheading')}</p>
      </AnimateIn>
      <StaggerContainer amount={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
        {lazarProjects.map((project, i) => {
          const label = t(`projects.${i}.label`)
          const desc = t(`projects.${i}.desc`)
          const cardInner = (
            <>
              {/* Screenshot (16:9) or grayscale placeholder */}
              <div className="relative aspect-video w-full overflow-hidden border-b border-[var(--division-border)]">
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={t('imageAlt', { name: project.name })}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, var(--division-card) 0%, var(--division-surface) 100%)' }}
                  >
                    <span aria-hidden="true" className="font-heading text-6xl font-bold text-[var(--division-border)]">
                      {project.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: 'var(--division-text-muted)' }}
                  />
                  <span className="overline text-[var(--division-text-muted)]">{label}</span>
                </div>
                <h3 className="mt-3 text-h3 text-[var(--division-text-primary)]">{project.name}</h3>
                <p className="mt-2 text-small text-[var(--division-text-secondary)]">{desc}</p>
                <div className="mt-auto pt-5">
                  <span className="inline-flex items-center gap-1.5 text-small font-medium text-[var(--division-text-secondary)] transition-colors group-hover:text-[var(--division-text-primary)]">
                    {t('viewProject')}
                    <ExternalLink aria-hidden="true" size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </>
          )
          return (
            <StaggerItem key={project.name} className="h-full">
              <BorderGlow
                className="h-full"
                borderRadius={12}
                glowRadius={40}
                glowIntensity={0.8}
                coneSpread={25}
                animated={false}
              >
                {project.href ? (
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t('viewProjectAria', { name: project.name })}
                    className="group flex h-full flex-col overflow-hidden rounded-[12px] focus-ring"
                  >
                    {cardInner}
                  </a>
                ) : (
                  <div className="group flex h-full flex-col overflow-hidden rounded-[12px]">{cardInner}</div>
                )}
              </BorderGlow>
            </StaggerItem>
          )
        })}

        {/* "& more" card — dashed, easy to grow */}
        <StaggerItem className="h-full">
          <div className="flex h-full min-h-[200px] items-center justify-center rounded-[12px] border border-dashed border-[var(--division-border)] bg-[var(--division-surface)] transition-colors hover:border-[var(--division-text-muted)]">
            <div className="px-8 text-center">
              <div className="font-heading text-body-lg font-semibold text-[var(--division-text-secondary)] mb-1.5">
                {t('moreTitle')}
              </div>
              <div className="text-small text-[var(--division-text-muted)]">{t('moreSubtitle')}</div>
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>
    </Section>
  )
}
