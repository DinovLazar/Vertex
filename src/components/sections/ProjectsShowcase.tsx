import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Section, AnimateIn, StaggerContainer, StaggerItem } from '@/components/global'
import BorderGlow from '@/components/ui/BorderGlow'
import { projects } from '@/config/projects'

/**
 * "Our Work" — homepage showcase of client projects.
 *
 * Server component. The only interactivity (the pointer-follow edge glow on
 * hover) is owned by the client `BorderGlow` wrapper, mirroring how
 * `ServicesOverview` and `BlogCard` compose their cards.
 *
 * Self-contained: it renders its own `<Section>` + heading block (like
 * `CTABanner`), so the homepage inserts it with a single `<ProjectsShowcase />`
 * line. Project data — names, division, screenshot path, live URL — lives in
 * `src/config/projects.ts`; `image`/`href` default to `null`, which renders a
 * grayscale placeholder and a muted "Coming soon" until Goran fills them in.
 */
export default async function ProjectsShowcase() {
  const t = await getTranslations('home.projects')

  return (
    <Section id="work">
      {/* Heading block — same shape as the other homepage sections */}
      <AnimateIn>
        <div className="text-center mb-12">
          <p className="overline text-[var(--division-accent)] mb-3">
            {t('overline')}
          </p>
          <h2 className="text-h2 text-[var(--division-text-primary)]">
            {t('heading')}
          </h2>
          <p className="mt-3 text-body text-[var(--division-text-secondary)] max-w-2xl mx-auto">
            {t('subheading')}
          </p>
        </div>
      </AnimateIn>

      {/* Cards */}
      <StaggerContainer
        amount={0.1}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {projects.map((project) => {
          // Shared card body — reused whether or not the project links out.
          const cardInner = (
            <>
              {/* Screenshot or grayscale placeholder (16:9) */}
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
                    style={{
                      background:
                        'linear-gradient(135deg, var(--division-card) 0%, var(--division-surface) 100%)',
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="font-heading text-6xl font-bold text-[var(--division-border)]"
                    >
                      {project.name.charAt(0)}
                    </span>
                    <span className="absolute bottom-3 right-3 overline text-[var(--division-text-muted)]">
                      {t('placeholder')}
                    </span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col p-6">
                {/* Division tag — neutral dot + label, matching the site convention */}
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: 'var(--division-text-muted)' }}
                  />
                  <span className="overline text-[var(--division-text-muted)]">
                    {t('divisionLabel')}
                  </span>
                </div>

                <h3 className="mt-3 text-h3 text-[var(--division-text-primary)]">
                  {project.name}
                </h3>

                <p className="mt-2 text-small text-[var(--division-text-secondary)]">
                  {t('serviceLabel')}
                </p>

                <div className="mt-auto pt-5">
                  {project.href ? (
                    <span className="inline-flex items-center gap-1.5 text-small font-medium text-[var(--division-text-secondary)] transition-colors group-hover:text-[var(--division-text-primary)]">
                      {t('viewProject')}
                      <ExternalLink
                        aria-hidden="true"
                        size={16}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  ) : (
                    <span className="text-small text-[var(--division-text-muted)]">
                      {t('comingSoon')}
                    </span>
                  )}
                </div>
              </div>
            </>
          )

          return (
            <StaggerItem key={project.name} className="h-full">
              {/* BorderGlow owns the rounded container + hover glow (matches
                  ServicesOverview/BlogCard) — no extra border or radius here,
                  just `rounded-[12px] overflow-hidden` to clip the screenshot. */}
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
                  <div className="group flex h-full flex-col overflow-hidden rounded-[12px]">
                    {cardInner}
                  </div>
                )}
              </BorderGlow>
            </StaggerItem>
          )
        })}
      </StaggerContainer>
    </Section>
  )
}
