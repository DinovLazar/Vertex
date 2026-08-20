import Image from 'next/image'
import { ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Section, AnimateIn, StaggerContainer, StaggerItem } from '@/components/global'
import BorderGlow from '@/components/ui/BorderGlow'
import { projects } from '@/config/projects'

interface ProjectsShowcaseProps {
  /**
   * Render only the first N projects (the list is ordered newest-first).
   * Omit for the whole list — that's what `/projects` does.
   */
  limit?: number
  /**
   * Render the overline + heading + subheading block above the grid.
   * `/projects` turns it off because the page's own hero already carries
   * the <h1>, and a second heading underneath it would duplicate it.
   */
  showHeading?: boolean
  /**
   * Show the "See all projects" link below the grid. Defaults to on whenever
   * the grid is truncated, off when it already shows everything.
   */
  showSeeAll?: boolean
  /**
   * Append the "Your project here" invitation tile after the last project —
   * it fills the trailing gap in the grid on `/projects` and doubles as a
   * soft CTA. Off by default so the homepage strip stays a clean 3-up.
   */
  showInviteCard?: boolean
  /**
   * Heading level for the project-name headings on the cards. Defaults to 3,
   * which is correct when `showHeading` renders the section's own <h2> above
   * them. `/projects` turns that heading off and its page <h1> sits directly
   * above the grid, so it passes 2 — otherwise the document outline skips a
   * level.
   */
  cardHeadingLevel?: 2 | 3
  /** Section anchor id. Defaults to `work`. */
  id?: string
  /** Extra classes for the <Section> (e.g. an alternating surface bg). */
  className?: string
}

/**
 * "Our Work" — the client-project card grid.
 *
 * Rendered in three places from one component:
 *   • `/`          — `limit={3}`, heading on, "See all projects" link
 *   • `/marketing` — identical, on the alternating surface background
 *   • `/projects`  — everything, heading off (the page hero owns the <h1>),
 *                    invitation tile on
 *
 * Server component. The only interactivity (the pointer-follow edge glow on
 * hover) is owned by the client `BorderGlow` wrapper, mirroring how
 * `ServicesOverview` and `BlogCard` compose their cards.
 *
 * Every card links to that project's own page at `/projects/<slug>` rather
 * than straight out to the client's domain — the detail page is where the
 * case study and the "Visit live site" button live. Project data lives in
 * `src/config/projects.ts`; per-project copy lives in `messages/{en,mk}.json`
 * under `projects.items.<slug>`, keyed by the same slug.
 */
export default async function ProjectsShowcase({
  limit,
  showHeading = true,
  showSeeAll,
  showInviteCard = false,
  cardHeadingLevel = 3,
  id = 'work',
  className,
}: ProjectsShowcaseProps) {
  const CardHeading = (`h${cardHeadingLevel}` as const) satisfies 'h2' | 'h3'
  const t = await getTranslations('projects.showcase')
  const tDivision = await getTranslations('projects.divisionLabels')
  const tItems = await getTranslations('projects.items')
  const tInvite = await getTranslations('projects.invite')

  const shown = typeof limit === 'number' ? projects.slice(0, limit) : projects
  const truncated = shown.length < projects.length
  const seeAll = showSeeAll ?? truncated

  return (
    <Section id={id} className={className}>
      {/* Heading block — same shape as the other homepage sections */}
      {showHeading && (
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
      )}

      {/* Cards */}
      <StaggerContainer
        amount={0.1}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {shown.map((project) => (
          <StaggerItem key={project.slug} className="h-full">
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
              <Link
                href={`/projects/${project.slug}`}
                aria-label={t('viewProjectAria', { name: project.name })}
                className="group flex h-full flex-col overflow-hidden rounded-[12px] focus-ring"
              >
                {/* Screenshot or lettered placeholder (16:9) */}
                <div className="relative aspect-video w-full overflow-hidden border-b border-[var(--division-border)]">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={t('imageAlt', { name: project.name })}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
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
                      {tDivision(project.division)}
                    </span>
                  </div>

                  <CardHeading className="mt-3 text-h3 text-[var(--division-text-primary)]">
                    {project.name}
                  </CardHeading>

                  <p className="mt-2 text-small font-medium text-[var(--division-text-secondary)]">
                    {tItems(`${project.slug}.label`)}
                  </p>

                  <p className="mt-3 text-small text-[var(--division-text-muted)]">
                    {tItems(`${project.slug}.description`)}
                  </p>

                  <div className="mt-auto pt-5">
                    <span className="inline-flex items-center gap-1.5 text-small font-medium text-[var(--division-text-secondary)] transition-colors group-hover:text-[var(--division-text-primary)]">
                      {t('viewProject')}
                      <ArrowRight
                        aria-hidden="true"
                        size={16}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            </BorderGlow>
          </StaggerItem>
        ))}

        {/* Invitation tile — a deliberate "space for more" slot that fills the
            trailing gap in the grid instead of leaving a hole, and reads as a
            CTA rather than an empty cell. Dashed border marks it as the odd
            one out among the real project cards. */}
        {showInviteCard && (
          <StaggerItem className="h-full">
            <Link
              href="/contact"
              className="group flex h-full min-h-[280px] flex-col items-center justify-center gap-3 rounded-[12px] border border-dashed border-[var(--division-border)] p-8 text-center transition-colors hover:border-[var(--division-text-muted)] hover:bg-[var(--nav-hover-bg)] focus-ring"
            >
              <Sparkles
                aria-hidden="true"
                size={22}
                className="text-[var(--division-text-muted)] transition-colors group-hover:text-[var(--division-text-primary)]"
              />
              <span className="text-h3 text-[var(--division-text-primary)]">
                {tInvite('title')}
              </span>
              <span className="max-w-[26ch] text-small text-[var(--division-text-muted)]">
                {tInvite('body')}
              </span>
              <span className="mt-1 inline-flex items-center gap-1.5 text-small font-medium text-[var(--division-text-secondary)] transition-colors group-hover:text-[var(--division-text-primary)]">
                {tInvite('cta')}
                <ArrowUpRight
                  aria-hidden="true"
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </Link>
          </StaggerItem>
        )}
      </StaggerContainer>

      {/* See-all link — only when the grid above is a truncated preview */}
      {seeAll && (
        <AnimateIn className="mt-10 flex justify-center">
          <Link
            href="/projects"
            aria-label={t('seeAllAria')}
            className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-button border border-[var(--division-border)] font-heading text-small font-medium text-[var(--division-text-primary)] transition-colors hover:bg-[var(--nav-hover-bg)] focus-ring"
          >
            {t('seeAll')}
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </AnimateIn>
      )}
    </Section>
  )
}
