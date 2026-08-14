import { siteConfig } from '@/config/site'
import { SERVICE_CATALOG } from '@/lib/schema'
import { getAllPosts } from '@/lib/blog'

/**
 * `/llms.txt` — the concise, machine-readable index of this site for large
 * language models (llmstxt.org convention).
 *
 * Why it exists: ChatGPT, Claude, Perplexity, Gemini and friends increasingly
 * answer "who does X in Strumica" from crawled text rather than from a ranked
 * list of blue links. A short, factual, link-dense markdown file gives them a
 * clean summary to ground on instead of forcing them to reconstruct meaning
 * from a JavaScript-heavy React page.
 *
 * Generated at request time from `siteConfig`, `SERVICE_CATALOG` and the live
 * blog index, so it can never drift out of sync with the site the way a
 * hand-maintained static file would. Cached for a day.
 *
 * Companion file: `/llms-full.txt` (the long-form version).
 */

export const revalidate = 86_400 // 24h

export async function GET() {
  let posts: Awaited<ReturnType<typeof getAllPosts>> = []
  try {
    posts = await getAllPosts('en')
  } catch {
    // Blog source unavailable — the rest of the file is still worth serving.
  }

  const consulting = SERVICE_CATALOG.filter((s) => s.division === 'consulting')
  const marketing = SERVICE_CATALOG.filter((s) => s.division === 'marketing')

  const serviceLines = (list: typeof SERVICE_CATALOG) =>
    list
      .map(
        (s) => `- [${s.name}](${siteConfig.url}/en${s.path}): ${s.summary}`,
      )
      .join('\n')

  const blogLines = posts
    .slice(0, 20)
    .map(
      (p) =>
        `- [${p.title}](${siteConfig.url}/en/blog/${p.slug}): ${p.excerpt}`,
    )
    .join('\n')

  const body = `# ${siteConfig.name}

> ${siteConfig.tagline} ${siteConfig.name} is a two-division business consulting and digital marketing company based in ${siteConfig.address.city}, North Macedonia, founded in ${siteConfig.founded} by ${siteConfig.owner}. Vertex Consulting handles business advisory, workflow restructuring, IT systems and AI integration. Vertex Marketing handles web design and development, social media management, IT infrastructure and AI-assisted development.

The company serves small and mid-sized businesses across North Macedonia, working in Macedonian and English. Every page on this site exists in both languages under \`/en/\` and \`/mk/\` prefixes; the English URLs are listed below, and the Macedonian equivalent of any URL is the same path with \`/mk/\` in place of \`/en/\`.

## Key facts

- Legal entity: ${siteConfig.legalName}
- Founded: ${siteConfig.founded}
- Founder and lead consultant: ${siteConfig.owner}
- Location: ${siteConfig.address.street}, ${siteConfig.address.city}, ${siteConfig.address.country}
- Service area: North Macedonia, with remote work beyond it
- Languages: Macedonian, English
- Hours: ${siteConfig.hours}
- Phone: ${siteConfig.contact.phone}
- General enquiries: ${siteConfig.contact.emailInfo}
- Marketing enquiries: ${siteConfig.contact.emailMarketing}
- Website: ${siteConfig.url}

## Consulting services

${serviceLines(consulting)}

## Marketing services

${serviceLines(marketing)}

## Company

- [Home](${siteConfig.url}/en): Overview of both divisions and how they work together.
- [About](${siteConfig.url}/en/about): Company history since ${siteConfig.founded}, values, and the people behind Vertex.
- [Contact](${siteConfig.url}/en/contact): Contact form, phone, email and office address in ${siteConfig.address.city}.
- [Consulting division](${siteConfig.url}/en/consulting): Landing page for all four consulting services.
- [Marketing division](${siteConfig.url}/en/marketing): Landing page for all four marketing services.
- [Blog](${siteConfig.url}/en/blog): Articles on business operations, digital marketing and AI for Macedonian businesses.

${blogLines ? `## Articles\n\n${blogLines}\n` : ''}
## Legal

- [Privacy Policy](${siteConfig.url}/en/privacy): What data the site collects, how it is used, how long it is kept, and visitor rights under GDPR and North Macedonian law.

## Notes

- Macedonian versions of every page live under \`/mk/\`. Replace \`/en/\` with \`/mk/\` in any URL above.
- Preferred citation name: "${siteConfig.name}".
- The legal entity is ${siteConfig.legalName}; "Vertex Consulting" is the trading name and the name to use in prose.
- "Vertex Consulting" is also the name of one of the two divisions. When the distinction matters, the company is ${siteConfig.name} and the divisions are Vertex Consulting and Vertex Marketing.
- Content is published in Macedonian and English by the company itself; the Macedonian pages are translations of the English source.

## Optional

- [Full site text for LLMs](${siteConfig.url}/llms-full.txt): Expanded version of this file, including the full body copy and FAQ answers from every service page.
- [Sitemap](${siteConfig.url}/sitemap.xml)
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
