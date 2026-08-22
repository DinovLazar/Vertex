import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { generatePageMetadata } from '@/lib/metadata'
import { buildProjectSchema } from '@/lib/schema'
import {
  getAdjacentProjects,
  getProjectBySlug,
  projectSlugs,
} from '@/config/projects'
import { Link } from '@/i18n/navigation'
import { Section, AnimateIn, Breadcrumbs, JsonLd } from '@/components/global'
import { CTABanner } from '@/components/sections'
import { routing, type Locale } from '@/i18n/routing'

/**
 * `/projects/<slug>` — one page per client project.
 *
 * Fully static: every locale × slug pair is prerendered from
 * `src/config/projects.ts`, so adding a project needs no route work.
 *
 * The case study itself is deliberately a placeholder for now — the page
 * ships the frame (hero, hero screenshot, at-a-glance facts, gallery slot,
 * prev/next, CTA) with a clearly-marked "coming soon" panel where the
 * write-up will go. The two slots to fill later are marked ▼ SLOT below.
 */

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    projectSlugs.map((slug) => ({ locale, slug })),
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: Locale }>
}): Promise<Metadata> {
  const { slug, locale } = await params
  const project = getProjectBySlug(slug)
  if (!project) {
    const tNotFound = await getTranslations({ locale, namespace: 'notFound.meta' })
    return generatePageMetadata({
      title: tNotFound('title'),
      description: tNotFound('description'),
      path: `/projects/${slug}`,
      locale,
      noIndex: true,
    })
  }

  const t = await getTranslations({ locale, namespace: 'projects' })
  const label = t(`items.${slug}.label`)
  const description = t(`items.${slug}.description`)

  return generatePageMetadata({
    title: `${project.name}: ${label}`,
    description,
    path: `/projects/${slug}`,
    locale,
    // The screenshot is a far better social card for a portfolio page than
    // the generic site-wide OG banner.
    image: project.image
      ? {
          url: project.image,
          width: 2560,
          height: 1440,
          alt: t('showcase.imageAlt', { name: project.name }),
        }
      : null,
  })
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: Locale }>
}) {
  const { slug, locale } = await params
  setRequestLocale(locale)

  const project = getProjectBySlug(slug)
  if (!project) notFound()

  const t = await getTranslations({ locale, namespace: 'projects' })
  const tNav = await getTranslations({ locale, namespace: 'nav' })

  const label = t(`items.${slug}.label`)
  const description = t(`items.${slug}.description`)
  const { prev, next } = getAdjacentProjects(slug)
  const gallery = project.gallery ?? []

  /** One row of the at-a-glance table. */
  const facts: Array<{ term: string; detail: React.ReactNode }> = [
    { term: t('detail.divisionLabel'), detail: t(`divisionLabels.${project.division}`) },
    { term: t('detail.serviceLabel'), detail: label },
    ...(project.href
      ? [
          {
            term: t('detail.liveSiteLabel'),
            detail: (
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 min-h-[24px] underline underline-offset-4 decoration-1 transition-colors hover:text-[var(--division-text-primary)] focus-ring rounded-sm"
              >
                {new URL(project.href).hostname.replace(/^www\./, '')}
                <ExternalLink aria-hidden="true" size={14} />
              </a>
            ),
          },
        ]
      : []),
  ]

  return (
    <>
      <JsonLd
        data={buildProjectSchema({
          locale,
          slug,
          name: project.name,
          description,
          image: project.image,
          liveUrl: project.href,
        })}
      />

      {/* ===== Header ===== */}
      <Section className="pt-16 md:pt-24 pb-8 md:pb-8">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: tNav('projects'), href: '/projects' },
            { label: project.name },
          ]}
        />
        <AnimateIn>
          <p className="overline text-[var(--division-accent)] mb-4">{label}</p>
          <h1 className="text-h1 text-[var(--division-text-primary)] max-w-3xl">
            {project.name}
          </h1>
          <p className="mt-4 text-body-lg text-[var(--division-text-secondary)] max-w-2xl">
            {description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {project.href && (
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('detail.visitSiteAria', { name: project.name })}
                className="btn-accent cta-sheen inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-button font-heading text-small font-semibold active:scale-[0.98] focus-ring"
              >
                {t('detail.visitSite')}
                <ExternalLink aria-hidden="true" size={16} />
              </a>
            )}
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-button border border-[var(--division-border)] font-heading text-small font-medium text-[var(--division-text-primary)] transition-colors hover:bg-[var(--nav-hover-bg)] focus-ring"
            >
              <ArrowLeft aria-hidden="true" size={16} />
              {t('detail.backToProjects')}
            </Link>
          </div>
        </AnimateIn>
      </Section>

      {/* ===== Hero screenshot ===== */}
      {project.image && (
        <Section className="pt-0 md:pt-0 pb-10 md:pb-14">
          <AnimateIn>
            <div className="relative aspect-video w-full overflow-hidden rounded-card border border-[var(--division-border)] bg-[var(--division-surface)] elevation-2">
              <Image
                src={project.image}
                alt={t('showcase.imageAlt', { name: project.name })}
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover object-top"
                priority
              />
            </div>
          </AnimateIn>
        </Section>
      )}

      {/* ===== At a glance + case-study slot ===== */}
      <Section className="pt-0 md:pt-0 pb-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-10 lg:gap-14 items-start">
          {/* ▼ SLOT 1 — the case-study write-up goes here. Replace this panel
               with the real sections (brief / approach / build / results).
               Keep the `.prose-marketing` wrapper so long-form copy picks up
               the site's reading styles automatically. */}
          <AnimateIn>
            <h2 className="text-h2 text-[var(--division-text-primary)]">
              {t('detail.caseStudyHeading')}
            </h2>
            <div className="mt-5 rounded-card border border-dashed border-[var(--division-border)] bg-[var(--division-surface)] p-6 md:p-8">
              <span className="inline-flex items-center rounded-pill border border-[var(--division-border)] px-3 py-1 overline text-[var(--division-text-muted)]">
                {t('detail.caseStudyNote')}
              </span>
              <p className="mt-4 prose-marketing text-body text-[var(--division-text-secondary)]">
                {t('detail.caseStudyBody')}
              </p>
            </div>
          </AnimateIn>

          {/* At a glance */}
          <AnimateIn>
            <aside className="rounded-card border border-[var(--division-border)] bg-[var(--division-surface)] p-6 elevation-1">
              <h2 className="overline text-[var(--division-text-muted)]">
                {t('detail.atAGlance')}
              </h2>
              <dl className="mt-4 space-y-4">
                {facts.map((fact) => (
                  <div key={fact.term}>
                    <dt className="text-micro uppercase tracking-wider text-[var(--division-text-muted)]">
                      {fact.term}
                    </dt>
                    <dd className="mt-1 text-small text-[var(--division-text-secondary)]">
                      {fact.detail}
                    </dd>
                  </div>
                ))}
              </dl>
            </aside>
          </AnimateIn>
        </div>
      </Section>

      {/* ▼ SLOT 2 — extra screenshots. Renders only when `gallery` on the
           project entry has entries, so it stays invisible until images land.
           Add paths to `gallery: []` in src/config/projects.ts. */}
      {gallery.length > 0 && (
        <Section className="pt-0 md:pt-0 pb-16 md:pb-20">
          <AnimateIn>
            <h2 className="text-h2 text-[var(--division-text-primary)] mb-8">
              {t('detail.galleryHeading')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {gallery.map((src) => (
                <div
                  key={src}
                  className="relative aspect-video w-full overflow-hidden rounded-card border border-[var(--division-border)] bg-[var(--division-surface)]"
                >
                  <Image
                    src={src}
                    alt={t('showcase.imageAlt', { name: project.name })}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-top"
                  />
                </div>
              ))}
            </div>
          </AnimateIn>
        </Section>
      )}

      {/* ===== Prev / next ===== */}
      {(prev || next) && (
        <Section className="pt-0 md:pt-0 pb-16 md:pb-20">
          <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[var(--division-border)] pt-8">
            {prev ? (
              <Link
                href={`/projects/${prev.slug}`}
                className="group flex flex-col gap-1 rounded-card border border-[var(--division-border)] p-5 transition-colors hover:bg-[var(--nav-hover-bg)] focus-ring"
              >
                <span className="inline-flex items-center gap-1.5 overline text-[var(--division-text-muted)]">
                  <ArrowLeft
                    aria-hidden="true"
                    size={14}
                    className="transition-transform group-hover:-translate-x-0.5"
                  />
                  {t('detail.prevLabel')}
                </span>
                <span className="text-body font-medium text-[var(--division-text-primary)]">
                  {prev.name}
                </span>
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
            {next && (
              <Link
                href={`/projects/${next.slug}`}
                className="group flex flex-col gap-1 rounded-card border border-[var(--division-border)] p-5 text-right transition-colors hover:bg-[var(--nav-hover-bg)] focus-ring sm:items-end"
              >
                <span className="inline-flex items-center gap-1.5 overline text-[var(--division-text-muted)]">
                  {t('detail.nextLabel')}
                  <ArrowRight
                    aria-hidden="true"
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
                <span className="text-body font-medium text-[var(--division-text-primary)]">
                  {next.name}
                </span>
              </Link>
            )}
          </nav>
        </Section>
      )}

      <CTABanner
        headline={t('detail.ctaHeadline')}
        subtext={t('detail.ctaSubtext')}
        buttonText={t('detail.ctaButton')}
        buttonHref="/contact"
      />
    </>
  )
}
