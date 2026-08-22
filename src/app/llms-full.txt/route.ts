import { siteConfig } from '@/config/site'
import { SERVICE_CATALOG } from '@/lib/schema'
import { getAllPosts } from '@/lib/blog'
import { projects } from '@/config/projects'
import en from '../../../messages/en.json'

/**
 * `/llms-full.txt` — the long-form companion to `/llms.txt`.
 *
 * Where `llms.txt` is a link index, this is the actual prose: every service
 * page's body copy, process steps and FAQ answers flattened into plain
 * markdown. An LLM that fetches this one URL has the whole site's substance
 * without executing a line of JavaScript or crawling sixteen React routes.
 *
 * Sourced directly from `messages/en.json`, which is the same content the
 * pages render — so it cannot describe a version of the site that no longer
 * exists. Regenerating is automatic; there is nothing to maintain by hand.
 */

export const revalidate = 86_400 // 24h

// Shapes we read out of the translation file. Kept loose on purpose: the
// message JSON is the source of truth and this route only formats it.
/**
 * A bullet is either a plain string or a `{ term, description }` pair — the
 * page templates render the latter as "**Term:** description". Both shapes
 * appear in `messages/*.json`, so both are handled here.
 */
type Bullet = string | { term?: string; description?: string }

interface Section {
  heading?: string
  paragraphs?: string[]
  bullets?: Bullet[]
  /** Trailing paragraphs rendered below the bullet list. */
  paragraphsAfterBullets?: string[]
}
interface Step {
  title?: string
  description?: string
}
interface Faq {
  question: string
  answer: string
}
interface ServiceMessages {
  meta?: { title?: string; description?: string }
  hero?: { title?: string; subtitle?: string }
  sections?: Section[]
  process?: { steps?: Step[] }
  faq?: { items?: Faq[] }
}

const messages = en as unknown as Record<
  string,
  Record<string, ServiceMessages> & Record<string, unknown>
>

function renderBullet(b: Bullet): string {
  if (typeof b === 'string') return `- ${stripMd(b)}`
  const term = b.term ? `${b.term}: ` : ''
  return `- ${term}${stripMd(b.description ?? '')}`
}

function renderSection(s: Section): string {
  const out: string[] = []
  if (s.heading) out.push(`### ${s.heading}`)
  for (const p of s.paragraphs ?? []) out.push(stripMd(p))
  const bullets = (s.bullets ?? []).map(renderBullet).filter(Boolean)
  if (bullets.length) out.push(bullets.join('\n'))
  for (const p of s.paragraphsAfterBullets ?? []) out.push(stripMd(p))
  return out.filter(Boolean).join('\n\n')
}

/**
 * Flatten the `**bold**` inline markdown the copy uses, and defend against
 * a translation value that isn't a string (the message files are hand-edited).
 */
function stripMd(text: unknown): string {
  return typeof text === 'string' ? text.replace(/\*\*(.+?)\*\*/g, '$1') : ''
}

function renderService(
  divisionKey: 'consulting' | 'marketing',
  msgKey: string,
  entry: (typeof SERVICE_CATALOG)[number],
): string {
  const m = (messages[divisionKey]?.[msgKey] ?? {}) as ServiceMessages
  const parts: string[] = []

  parts.push(`## ${m.meta?.title ?? entry.name}`)
  parts.push(`URL: ${siteConfig.url}/en${entry.path}`)
  parts.push(`Macedonian: ${siteConfig.url}/mk${entry.path}`)
  if (m.meta?.description) parts.push(m.meta.description)
  if (m.hero?.subtitle) parts.push(stripMd(m.hero.subtitle))

  for (const s of m.sections ?? []) parts.push(renderSection(s))

  const steps = m.process?.steps ?? []
  if (steps.length) {
    parts.push('### How the engagement runs')
    parts.push(
      steps
        .map(
          (s, i) =>
            `${i + 1}. ${s.title ?? ''}${s.description ? `: ${stripMd(s.description)}` : ''}`,
        )
        .join('\n'),
    )
  }

  const faq = m.faq?.items ?? []
  if (faq.length) {
    parts.push('### Frequently asked questions')
    parts.push(
      faq
        .map((f) => `**${f.question}**\n\n${stripMd(f.answer)}`)
        .join('\n\n'),
    )
  }

  return parts.filter(Boolean).join('\n\n')
}

/** Message-file key for each catalog slug (JSON uses camelCase). */
const MSG_KEY: Record<string, string> = {
  'business-consulting': 'businessConsulting',
  'workflow-restructuring': 'workflowRestructuring',
  'it-systems': 'itSystems',
  'ai-consulting': 'aiConsulting',
  'web-design': 'webDesign',
  'social-media': 'socialMedia',
  'it-infrastructure': 'itInfrastructure',
  'ai-development': 'aiDevelopment',
}

export async function GET() {
  let posts: Awaited<ReturnType<typeof getAllPosts>> = []
  try {
    posts = await getAllPosts('en')
  } catch {
    // Blog source unavailable — serve the rest.
  }

  const header = `# ${siteConfig.name}: full site content

> ${siteConfig.tagline} Two-division business consulting and digital marketing company in ${siteConfig.address.city}, North Macedonia. Founded ${siteConfig.founded} by ${siteConfig.owner}.

This file contains the complete text content of ${siteConfig.domain} in English, intended for language models and other automated readers. The site is bilingual: every URL below has a Macedonian equivalent at the same path with \`/mk/\` instead of \`/en/\`.

## Company

- Legal entity: ${siteConfig.legalName}
- Trading names: ${siteConfig.divisions.consulting.name} (business consulting) and ${siteConfig.divisions.marketing.name} (digital marketing)
- Founded: ${siteConfig.founded}
- Founder and lead consultant: ${siteConfig.owner}
- Marketing team: ${siteConfig.divisions.marketing.team.join(', ')}
- Address: ${siteConfig.address.street}, ${siteConfig.address.city}, ${siteConfig.address.country}
- Service area: North Macedonia, plus remote engagements
- Working languages: Macedonian, English
- Hours: ${siteConfig.hours}
- Phone: ${siteConfig.contact.phone}
- Email (general): ${siteConfig.contact.emailInfo}
- Email (marketing): ${siteConfig.contact.emailMarketing}
- Website: ${siteConfig.url}

Vertex Consulting covers ${siteConfig.divisions.consulting.description.toLowerCase()}
Vertex Marketing covers ${siteConfig.divisions.marketing.description.toLowerCase()}

---

# Consulting services
`

  const consultingBody = SERVICE_CATALOG.filter(
    (s) => s.division === 'consulting',
  )
    .map((s) => renderService('consulting', MSG_KEY[s.slug], s))
    .join('\n\n---\n\n')

  const marketingBody = SERVICE_CATALOG.filter(
    (s) => s.division === 'marketing',
  )
    .map((s) => renderService('marketing', MSG_KEY[s.slug], s))
    .join('\n\n---\n\n')

  // Client projects. The label/description strings are the same ones the
  // /projects pages render (messages/en.json → projects.items.<slug>), so
  // this section stays true to the site without a second copy to maintain.
  const projectItems = (messages as unknown as {
    projects: { items: Record<string, { label: string; description: string }> }
  }).projects.items

  const projectsBody = projects.length
    ? `\n\n---\n\n# Client projects\n\n${projects
        .map((project) => {
          const copy = projectItems[project.slug]
          const live = project.href ? `\nLive site: ${project.href}` : ''
          return `## ${project.name}\n\nURL: ${siteConfig.url}/en/projects/${project.slug}\nWork: ${copy?.label ?? 'Website'}${live}\n\n${copy?.description ?? ''}`
        })
        .join('\n\n')}`
    : ''

  const blogBody = posts.length
    ? `\n\n---\n\n# Articles\n\n${posts
        .map(
          (p) =>
            `## ${p.title}\n\nURL: ${siteConfig.url}/en/blog/${p.slug}\nPublished: ${p.publishedAt}\n\n${p.excerpt}`,
        )
        .join('\n\n')}`
    : ''

  const footer = `

---

# Contact

To reach ${siteConfig.name}: call ${siteConfig.contact.phone}, email ${siteConfig.contact.emailInfo}, or use the contact form at ${siteConfig.url}/en/contact. Office at ${siteConfig.address.street}, ${siteConfig.address.city}, ${siteConfig.address.country}. Open ${siteConfig.hours}.
`

  const body = [
    header,
    consultingBody,
    '\n\n---\n\n# Marketing services\n',
    marketingBody,
    projectsBody,
    blogBody,
    footer,
  ].join('\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
