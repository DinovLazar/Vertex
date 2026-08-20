import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { generatePageMetadata } from '@/lib/metadata'
import { buildProjectListSchema } from '@/lib/schema'
import { projects } from '@/config/projects'
import { Section, AnimateIn, Breadcrumbs, PageSchema, JsonLd } from '@/components/global'
import { ProjectsShowcase, CTABanner } from '@/components/sections'
import type { Locale } from '@/i18n/routing'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'projects.meta' })
  return generatePageMetadata({
    title: t('title'),
    description: t('description'),
    path: '/projects',
    locale,
  })
}

/**
 * `/projects` — the full portfolio index.
 *
 * The grid itself is <ProjectsShowcase> with no `limit`, the same component
 * the homepage and `/marketing` render as a 3-up preview. Heading is off here
 * because this page's hero already carries the <h1>; the invitation tile is
 * on so the trailing grid cells read as an invitation instead of a gap.
 */
export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'projects' })
  const tItems = await getTranslations({ locale, namespace: 'projects.items' })
  const tNav = await getTranslations({ locale, namespace: 'nav' })

  return (
    <>
      <PageSchema
        path="/projects"
        type="CollectionPage"
        name={t('meta.title')}
        description={t('meta.description')}
      />
      <JsonLd
        data={buildProjectListSchema({
          locale,
          items: projects.map((p) => ({
            slug: p.slug,
            name: p.name,
            description: tItems(`${p.slug}.description`),
          })),
        })}
      />

      {/* Header. `md:pb-8` actually zeroes desktop bottom padding override. */}
      <Section className="pt-16 md:pt-24 pb-8 md:pb-8">
        <Breadcrumbs className="mb-6" items={[{ label: tNav('projects') }]} />
        <AnimateIn>
          <p className="overline text-[var(--division-accent)] mb-4">
            {t('hero.overline')}
          </p>
          <h1 className="text-h1 text-[var(--division-text-primary)] max-w-3xl">
            {t('hero.headline')}
          </h1>
          <p className="mt-4 text-body-lg text-[var(--division-text-secondary)] max-w-2xl">
            {t('hero.subtitle')}
          </p>
          <p className="mt-6 overline text-[var(--division-text-muted)]">
            {t('showcase.countLabel', { count: projects.length })}
          </p>
        </AnimateIn>
      </Section>

      {/* Grid. `md:pt-0` strips desktop top padding so it sits under the hero. */}
      <ProjectsShowcase
        id="projects"
        className="pt-0 md:pt-0"
        showHeading={false}
        showInviteCard
        /* The page <h1> sits directly above this grid with no section <h2>
           between, so the card headings are the next level down. */
        cardHeadingLevel={2}
      />

      <CTABanner />
    </>
  )
}
