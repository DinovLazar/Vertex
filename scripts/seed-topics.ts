/**
 * Seeds the topic backlog with 20 starter topics derived from Vertex's 8 service pages.
 * Run once: npx tsx scripts/seed-topics.ts
 *
 * Idempotent — uses fixed _id values and createOrReplace. Safe to re-run.
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })

import { createClient } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !dataset || !token) {
  console.error(
    'Missing Sanity env vars. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN in .env.local.'
  )
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-10-01',
  token,
  useCdn: false,
})

interface TopicSeed {
  key: string
  titleEn: string
  titleMk: string
  descriptionEn?: string
  descriptionMk?: string
  division: 'consulting' | 'marketing' | 'shared'
  targetService?: string
  priority?: number
}

const topics: TopicSeed[] = [
  // --- Consulting: Business Consulting ---
  {
    key: 'three-questions-before-hiring-consultant',
    titleEn: 'Three questions to ask before hiring a business consultant',
    titleMk: 'Три прашања што треба да ги поставите пред да ангажирате бизнис консултант',
    descriptionEn:
      'Help small business owners filter out bad consultants. Cover: specificity of deliverables, how they measure success, real experience with businesses their size.',
    descriptionMk:
      'Помогнете им на сопствениците на мали бизниси да разликуваат добри од лоши консултанти.',
    division: 'consulting',
    targetService: '/consulting/business-consulting',
    priority: 3,
  },
  {
    key: 'quarterly-business-review-that-works',
    titleEn: 'How to run a quarterly business review that actually changes anything',
    titleMk: 'Како да спроведете квартален бизнис преглед што навистина менува нешто',
    descriptionEn:
      'Most QBRs are reporting theater. Show what a real one looks like: 3 decisions, 1 problem to solve, honest numbers.',
    division: 'consulting',
    targetService: '/consulting/business-consulting',
    priority: 5,
  },
  // --- Consulting: Workflow Restructuring ---
  {
    key: 'when-business-needs-workflow-audit',
    titleEn: 'How to know when your business needs a workflow audit',
    titleMk: 'Како да препознаете дека на вашиот бизнис му треба ревизија на процесите',
    descriptionEn:
      'Symptoms: team always busy but nothing ships, owner is the bottleneck, same questions asked weekly, things fall through cracks.',
    division: 'consulting',
    targetService: '/consulting/workflow-restructuring',
    priority: 2,
  },
  {
    key: 'hidden-cost-of-tribal-knowledge',
    titleEn: 'The hidden cost of tribal knowledge in small businesses',
    titleMk: 'Скриената цена на „племенското знаење" во малите бизниси',
    descriptionEn:
      'What happens when one person leaves and the processes go with them. Why documentation is a business asset.',
    division: 'consulting',
    targetService: '/consulting/workflow-restructuring',
    priority: 4,
  },
  {
    key: 'team-drowning-in-tools',
    titleEn: 'Signs your team is drowning in tools instead of being helped by them',
    titleMk: 'Знаци дека вашиот тим се дави во алатки наместо да му помагаат',
    descriptionEn:
      'Too many SaaS subscriptions, overlapping features, context-switching costs, the cure (audit → consolidate).',
    division: 'consulting',
    targetService: '/consulting/workflow-restructuring',
    priority: 6,
  },
  // --- Consulting: IT Systems ---
  {
    key: 'hidden-cost-small-business-it',
    titleEn: 'Why most small business IT systems cost more than they should',
    titleMk: 'Зошто ИТ системите на повеќето мали бизниси чинат повеќе отколку што треба',
    descriptionEn:
      'Legacy licenses nobody uses, tool sprawl, per-seat billing for inactive seats, the audit approach.',
    division: 'consulting',
    targetService: '/consulting/it-systems',
    priority: 5,
  },
  {
    key: 'when-to-upgrade-accounting-software',
    titleEn: 'When to upgrade your accounting software, and when to wait',
    titleMk: 'Кога да го надградите сметководствениот софтвер, а кога да почекате',
    descriptionEn:
      'Signs the current tool is holding you back vs. signs the pain is worth enduring another year.',
    division: 'consulting',
    targetService: '/consulting/it-systems',
    priority: 7,
  },
  // --- Consulting: AI Consulting ---
  {
    key: 'ai-tools-macedonian-sme-should-try',
    titleEn: 'AI tools every Macedonian small business should try first',
    titleMk: 'AI алатки што секој македонски мал бизнис треба прв да ги пробаат',
    descriptionEn:
      'Practical starter stack: ChatGPT/Claude for drafts, a meeting transcription tool, a local OCR solution. Cost under 50 EUR/month.',
    division: 'consulting',
    targetService: '/consulting/ai-consulting',
    priority: 2,
  },
  {
    key: 'practical-ai-use-cases-services',
    titleEn: 'Practical AI use cases for service businesses in 2026',
    titleMk: 'Практични примени на AI за услужни бизниси во 2026',
    descriptionEn:
      'Not the hype — specific use cases: client intake automation, proposal drafts, follow-up scheduling, knowledge base search.',
    division: 'consulting',
    targetService: '/consulting/ai-consulting',
    priority: 4,
  },
  // --- Marketing: Web Design ---
  {
    key: 'website-costing-customers',
    titleEn: 'Five signs your website is costing you customers',
    titleMk: 'Пет знаци дека вашата веб страница ве чини клиенти',
    descriptionEn:
      'Slow load, no clear CTA, outdated design, broken mobile, no contact form. Each with the "what to fix" line.',
    division: 'marketing',
    targetService: '/marketing/web-design',
    priority: 3,
  },
  {
    key: 'bare-minimum-business-website-2026',
    titleEn: 'The bare minimum a business website needs in 2026',
    titleMk: 'Апсолутниот минимум што треба да го има една бизнис веб страница во 2026',
    descriptionEn:
      'HTTPS, mobile-first, sub-3s load, clear service pages, one primary CTA, working contact form. Everything else is optional.',
    division: 'marketing',
    targetService: '/marketing/web-design',
    priority: 5,
  },
  {
    key: 'content-that-converts-services',
    titleEn: 'How to write content that converts on a services website',
    titleMk: 'Како да пишувате содржина што конвертира на веб страница за услуги',
    descriptionEn:
      'Specificity over adjectives, real examples over buzzwords, address the actual doubt the visitor has.',
    division: 'marketing',
    targetService: '/marketing/web-design',
    priority: 6,
  },
  // --- Marketing: Social Media ---
  {
    key: 'more-than-facebook-page',
    titleEn: 'Why Macedonian businesses need more than just a Facebook page',
    titleMk: 'Зошто на македонските бизниси им треба повеќе од Facebook страница',
    descriptionEn:
      'Facebook is table stakes but organic reach is dead. Where to invest next (Instagram, Google Business Profile, LinkedIn for B2B).',
    division: 'marketing',
    targetService: '/marketing/social-media',
    priority: 4,
  },
  {
    key: 'reels-vs-tiktok-macedonia-b2b',
    titleEn: 'Instagram Reels vs. TikTok for local B2B in Macedonia',
    titleMk: 'Instagram Reels наспроти TikTok за локален B2B во Македонија',
    descriptionEn:
      'Audience demographics, content that actually works on each, time investment required.',
    division: 'marketing',
    targetService: '/marketing/social-media',
    priority: 7,
  },
  {
    key: 'metrics-that-matter-vs-vanity',
    titleEn: 'Social media metrics that matter vs. vanity numbers',
    titleMk: 'Социјални мрежи: метрики што навистина значат наспроти метрики за фалба',
    descriptionEn:
      'Followers and likes are mostly meaningless. What to track: saves, profile visits, DMs, website clicks.',
    division: 'marketing',
    targetService: '/marketing/social-media',
    priority: 6,
  },
  // --- Marketing: IT Infrastructure ---
  {
    key: 'what-it-infrastructure-means-for-small-business',
    titleEn: 'What "IT infrastructure" actually means for a 10-person business',
    titleMk: 'Што навистина значи „ИТ инфраструктура" за бизнис со десет луѓе',
    descriptionEn:
      'Demystify the term. Email, file storage, a CRM, backups, device management. Total cost under 100 EUR/month/person typically.',
    division: 'marketing',
    targetService: '/marketing/it-infrastructure',
    priority: 5,
  },
  {
    key: 'real-roi-crm-marketing-agency',
    titleEn: 'The real ROI of a proper CRM for a small marketing agency',
    titleMk: 'Реалниот ROI на добар CRM за мала маркетинг агенција',
    descriptionEn:
      'What agencies lose without one (dropped leads, no pipeline visibility), what a good one costs, which ones work for Balkan-sized teams.',
    division: 'marketing',
    targetService: '/marketing/it-infrastructure',
    priority: 7,
  },
  // --- Marketing: AI Development ---
  {
    key: 'custom-software-vs-saas-for-sme',
    titleEn: 'When custom software beats off-the-shelf SaaS for SMEs',
    titleMk: 'Кога custom софтвер е подобар од готови SaaS решенија за мали бизниси',
    descriptionEn:
      'The rule of thumb: if 3+ people spend 2+ hours/week fighting the tool, custom pays for itself in a year.',
    division: 'marketing',
    targetService: '/marketing/ai-development',
    priority: 6,
  },
  {
    key: 'ai-chatbots-that-help-vs-annoy',
    titleEn: 'AI chatbots that actually help customers vs. ones that annoy them',
    titleMk: 'AI чатботови што навистина помагаат наспроти оние што ги иритираат клиентите',
    descriptionEn:
      `The design difference: scoped, honest about limits, has an escape hatch to a human, speaks the customer's language.`,
    division: 'marketing',
    targetService: '/marketing/ai-development',
    priority: 3,
  },
  // --- Shared / General ---
  {
    key: 'consulting-vs-marketing-when-to-use-which',
    titleEn: 'Consulting vs. marketing: knowing which one your business actually needs',
    titleMk: 'Консалтинг наспроти маркетинг: како да знаете што навистина му треба на вашиот бизнис',
    descriptionEn:
      'Founders conflate the two. Consulting fixes what the business does; marketing communicates what the business does. Examples of each.',
    division: 'shared',
    priority: 8,
  },
]

async function main() {
  console.log(`Seeding ${topics.length} topics into backlog...`)
  for (const t of topics) {
    const doc: Record<string, unknown> = {
      _id: `topic-${t.key}`,
      _type: 'topicBacklog',
      title: { _type: 'localizedString', en: t.titleEn, mk: t.titleMk },
      division: t.division,
      priority: t.priority ?? 5,
      status: 'pending',
    }
    if (t.descriptionEn) {
      doc.description = {
        _type: 'localizedText',
        en: t.descriptionEn,
        mk: t.descriptionMk ?? t.descriptionEn,
      }
    }
    if (t.targetService) {
      doc.targetService = t.targetService
    }
    await client.createOrReplace(doc as never)
    console.log(`  ✓ ${t.key}`)
  }
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
