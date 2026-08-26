/**
 * One-off publisher for the blog post:
 *   "Consulting vs. marketing: knowing which one your business actually needs"
 *   — Lazar, Vertex Marketing division.
 *
 * Hand-authored (not run through the Phase 13B generator), but it writes the
 * exact same document shape `src/lib/contentGenerator/createPost.ts` produces,
 * so the post is indistinguishable from a generated one in the Studio.
 *
 * Idempotent: the post uses a fixed `_id` + `createOrReplace`, and the Pexels
 * featured image is only fetched when the document doesn't already have one.
 * Re-running updates in place instead of creating duplicates or re-uploading.
 *
 * It also closes out the matching `topicBacklog` entry (status -> `used`,
 * `usedAt`, `resultingPost`) the way the generator does, so the topic doesn't
 * get picked up and written a second time. The topic is seeded by
 * `scripts/seed-topics.ts` as "Consulting vs. marketing: knowing which one your
 * business actually needs", so it is retired after publication.
 *
 * Usage:
 *   npx tsx scripts/publish-post-consulting-vs-marketing.ts            # publish
 *   npx tsx scripts/publish-post-consulting-vs-marketing.ts --draft    # stage as draft
 *   npx tsx scripts/publish-post-consulting-vs-marketing.ts --check    # validate only, no writes
 *   npx tsx scripts/publish-post-consulting-vs-marketing.ts --no-revalidate
 *
 * After writing, it POSTs /api/revalidate on the live site (the same step the
 * generator performs) so the blog routes, sitemap and llms.txt pick the post up
 * immediately instead of waiting out their ISR windows, and so IndexNow gets
 * pinged. Target defaults to `siteConfig.url`; override with REVALIDATE_TARGET_URL.
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'

// The documented env file is `.env.local`, but this machine also carries the
// values in `env.local` (no leading dot). Load BOTH — first-set-wins — so the
// script runs in either layout without editing. (As of 2026-08-26 a stub
// `.env.local` holding only the four Resend vars exists here; the Sanity,
// Pexels and revalidate values live in `env.local`.)
for (const path of ['.env.local', 'env.local']) {
  if (existsSync(path)) loadEnv({ path })
}

import { createClient } from '@sanity/client'
import { searchPexelsPhoto, downloadPexelsPhoto } from '../src/lib/pexels'
import { validateDraft } from '../src/lib/contentGenerator/validateDraft'
import type { GeneratedPost } from '../src/lib/contentGenerator/toolSchema'
import { siteConfig } from '../src/config/site'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !dataset || !token) {
  console.error(
    'Missing Sanity env vars. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN in .env.local (or env.local).'
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

const POST_ID = 'post-consulting-vs-marketing-which-one'
const TOPIC_ID = 'topic-consulting-vs-marketing-when-to-use-which'
const AUTHOR_REF = 'author-lazar'
const SLUG = 'consulting-vs-marketing-which-one-does-your-business-need'

// ------------------------------- helpers -----------------------------------

type Span = { _type: 'span'; _key: string; text: string; marks: string[] }
type MarkDef = { _key: string; _type: string; href?: string }
type PTBlock = {
  _type: 'block'
  _key: string
  style: string
  markDefs: MarkDef[]
  children: Span[]
  listItem?: 'bullet'
  level?: number
}

/**
 * Markdown -> Portable Text, restricted to exactly what the `localizedPortableText`
 * schema allows: `normal` + `h2` styles, `bullet` lists, `strong` decorator and
 * `link` annotations. Same converter contract as `scripts/seed-blog.ts`.
 */
function mdToPortableText(md: string): PTBlock[] {
  const blocks: PTBlock[] = []
  let blockIndex = 0

  const chunks = md.split('\n\n').map((c) => c.trim()).filter(Boolean)

  for (const chunk of chunks) {
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean)
    const isBulletBlock = lines.length > 0 && lines.every((l) => l.startsWith('- '))

    if (isBulletBlock) {
      for (const line of lines) {
        blocks.push(makeBlock(line.slice(2), 'normal', blockIndex++, 'bullet'))
      }
      continue
    }

    const isH2 = chunk.startsWith('## ')
    const text = isH2 ? chunk.slice(3) : chunk.replace(/\n/g, ' ')
    blocks.push(makeBlock(text, isH2 ? 'h2' : 'normal', blockIndex++))
  }

  return blocks
}

function makeBlock(text: string, style: string, idx: number, listItem?: 'bullet'): PTBlock {
  const children: Span[] = []
  const markDefs: MarkDef[] = []
  let cursor = 0
  let spanCounter = 0

  const regex = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g
  let match: RegExpExecArray | null

  const pushSpan = (slice: string, marks: string[]) => {
    if (!slice) return
    children.push({ _type: 'span', _key: `b${idx}-s${spanCounter++}`, text: slice, marks })
  }

  while ((match = regex.exec(text)) !== null) {
    if (match.index > cursor) pushSpan(text.slice(cursor, match.index), [])

    if (match[1] !== undefined) {
      pushSpan(match[1], ['strong'])
    } else if (match[2] !== undefined && match[3] !== undefined) {
      const linkKey = `b${idx}-lnk${spanCounter}`
      markDefs.push({ _key: linkKey, _type: 'link', href: match[3] })
      pushSpan(match[2], [linkKey])
    }
    cursor = match.index + match[0].length
  }

  if (cursor < text.length) pushSpan(text.slice(cursor), [])
  if (children.length === 0) pushSpan(text, [])

  const block: PTBlock = { _type: 'block', _key: `b${idx}`, style, markDefs, children }
  if (listItem) {
    block.listItem = listItem
    block.level = 1
  }
  return block
}

// ---------------------------------- copy -----------------------------------

const bodyEn = `A question comes up in almost every conversation with a small business owner: “Do we need marketing, or do we need a consultant?” It usually arrives after a disappointing month. The website is live, someone is posting on Facebook, and the owner is still answering every enquiry and solving every emergency.

These are not two names for the same service. **Consulting changes how the business works. Marketing changes how the market sees and chooses it.** Sometimes you need one. Sometimes you need both, but in a particular order.

## Start with the problem, not the service label

Do not begin with “Should we run ads?” Begin with “Where does the customer journey break?” If people never discover you, the problem is visibility. If they discover you but do not understand your offer, the problem is positioning. If they enquire and disappear into a slow reply, forgotten spreadsheet, or one employee’s phone, the problem is process.

More attention cannot repair an operation that drops the attention it already receives. And a beautifully organised business cannot grow if the right people do not know it exists.

## What a consultant actually fixes

Consulting is the right starting point when the bottleneck is inside the business. Typical signs include:

- Every decision waits for the owner.
- Quotes are made differently by different people.
- Leads arrive, but nobody knows how many became customers.
- Work is tracked in chats, notebooks, and memory.
- The team is busy all day, but deadlines still slip.
- Growth sounds attractive until you imagine handling ten more clients.

A consultant maps the current way of working, finds repeated friction, and helps the team replace it with a clearer system. That might mean a sales pipeline, a better handoff between enquiry and delivery, documented responsibilities, or a simple dashboard. The output should be decisions, ownership, and a way of working the team can continue without the consultant in the room.

## What marketing actually fixes

Marketing is the right starting point when the business can serve more customers, but the right customers are not finding or choosing it. Signs include:

- Your best work is invisible outside word of mouth.
- The website describes the company but not the customer’s problem.
- Social posts get views, but no enquiries.
- A weaker competitor appears more often in search.
- People ask what you do even though you thought it was obvious.

Marketing clarifies the offer, puts it in front of a defined audience, and gives interested people a path to contact you. It can include a better service page, local search work, useful social content, paid campaigns, email, or a clearer website conversion path. The output should connect attention to an action: a call, enquiry, booking, shop visit, or qualified conversation.

## The two common mistakes

The first mistake is buying marketing to hide an operational problem. You increase enquiries, then discover replies take three days and nobody owns follow-up. The campaign did its job. The business was not ready for the result.

The second mistake is hiring a consultant when the real issue is simple visibility. A process workshop will not make a new customer find your company, recognise your offer, or click your contact button. The honest diagnosis can feel uncomfortable because it does not always lead to the service you expected. That is exactly why it is useful.

## Which one should come first?

Use this order as a practical rule:

- **No demand:** start with marketing and positioning.
- **Demand but chaos:** start with consulting and workflow.
- **Both problems:** fix the leak that costs the most first, usually with a short operational cleanup before scaling promotion.
- **Unclear:** measure one week of reality. Count enquiries, response times, quote turnaround, wins, losses, and where each lead came from.

You do not need perfect numbers. You need enough evidence to stop choosing based on the loudest opinion in the room.

## Where Vertex fits

At Vertex, the two sides are connected but not blurred. Our [marketing work](/marketing/social-media) helps customers find you, understand the offer, and take the next step. Our [business consulting](/consulting/business-consulting) work helps the business handle that next step without relying on heroics from the owner.

If you are unsure which door to open, tell us how enquiries arrive, where they stall, and what happens after a customer says yes. The right first project removes the biggest constraint, not the one with the most fashionable label.`

const bodyMk = `Речиси во секој разговор со сопственик на мал бизнис се појавува истото прашање: „Дали ни треба маркетинг или консултант?“ Најчесто доаѓа по разочарувачки месец. Веб страницата е активна, некој објавува на Facebook, а сопственикот сè уште одговара на секое барање и го решава секој итен проблем.

Ова не се две имиња за иста услуга. **Консалтингот го менува начинот на кој работи бизнисот. Маркетингот го менува начинот на кој пазарот ве гледа и ве избира.** Понекогаш ви треба едното, а понекогаш и двете по одреден редослед.

## Почнете со проблемот, не со името на услугата

Не почнувајте со „Дали да пуштиме реклами?“ Почнете со „Каде се прекинува патот на клиентот?“ Ако луѓето не ве откриваат, проблемот е видливоста. Ако ве откриваат, но не ја разбираат понудата, проблемот е позиционирањето. Ако прашуваат, а потоа исчезнуваат во бавен одговор или заборавена табела, проблемот е во процесот.

Повеќе внимание не може да поправи операција што го губи вниманието што веќе го добива. И добро организиран бизнис не може да расте ако вистинските луѓе не знаат дека постои.

## Што навистина поправа консултантот

Консалтингот е правилниот почеток кога тесното грло е внатре во бизнисот. Знаци се:

- Секоја одлука го чека сопственикот.
- Различни луѓе прават понуди на различен начин.
- Барањата пристигнуваат, но никој не знае колку станале клиенти.
- Работата се следи во разговори, тетратки и меморија.
- Тимот е зафатен цел ден, но роковите сепак се пробиваат.
- Поголем раст звучи убаво додека не замислите уште десет клиенти.

Консултантот го мапира начинот на работа, го наоѓа повторливото триење и му помага на тимот да изгради појасен систем. Тоа може да биде продажен процес, подобар премин од барање кон испорака, јасни одговорности или едноставна табла. Резултатот треба да има одлуки, сопственици и начин на работа што тимот може да го продолжи и без консултантот.

## Што навистина поправа маркетингот

Маркетингот е правилниот почеток кога бизнисот може добро да услужи повеќе клиенти, но вистинските клиенти не ве наоѓаат или не ве избираат. Знаци се:

- Најдобрата работа ја знаат само оние што ве препорачуваат.
- Веб страницата ја опишува компанијата, но не и проблемот на клиентот.
- Објавите имаат прегледи, но немаат барања.
- Конкурент со послаба услуга се појавува почесто во пребарувањето.
- Луѓето прашуваат што работите иако вам ви изгледа очигледно.

Маркетингот ја појаснува понудата, ја носи пред одредена публика и им дава на заинтересираните јасен начин да ве контактираат. Тоа може да биде подобра услужна страница, локално SEO, корисна содржина, платени кампањи или појасен пат до контакт.

## Двете најчести грешки

Првата грешка е да купите маркетинг за да прикриете оперативен проблем. Добивате повеќе барања, а потоа откривате дека одговорите доцнат и никој не е одговорен за следењето. Кампањата си ја завршила работата. Бизнисот не бил подготвен за резултатот.

Втората грешка е да ангажирате консултант кога вистинскиот проблем е едноставна видливост. Работилница за процеси нема да направи нов клиент да ве најде или да ја препознае понудата. Искрената дијагноза може да биде непријатна, но токму затоа е корисна.

## Кој треба да биде прв?

Користете го ова практично правило:

- **Нема побарувачка:** почнете со маркетинг и позиционирање.
- **Има побарувачка, но има хаос:** почнете со консалтинг и процеси.
- **Има двата проблема:** прво поправете го истекувањето што ве чини најмногу.
- **Не сте сигурни:** една недела бројте ги барањата, времето на одговор, понудите и изворот на секој контакт.

Не ви требаат совршени бројки. Ви треба доволно докази за да не одлучувате според најгласното мислење.

## Каде се вклопува Vertex

Во Vertex, двете страни се поврзани, но не се мешаат. Нашата [маркетинг работа](/marketing/social-media) им помага на клиентите да ве најдат, да ја разберат понудата и да го направат следниот чекор. Нашиот [деловен консалтинг](/consulting/business-consulting) му помага на бизнисот да го поднесе тој чекор без сопственикот постојано да спасува ситуации.

Ако не знаете од каде да почнете, кажете ни како пристигнуваат барањата, каде застануваат и што се случува откако клиентот ќе каже да. Добриот прв проект го отстранува најголемото ограничување, не оној со најмодерното име.`

const titleEn = 'Consulting vs. marketing: knowing which one your business actually needs'
const titleMk = 'Консалтинг наспроти маркетинг: како да знаете што навистина му треба на вашиот бизнис'

const excerptEn =
  'If sales are slow, should you hire a consultant or start posting more? The answer depends on whether the problem is inside the business or in how customers find it. A practical way to tell the difference.'

const excerptMk =
  'Ако продажбата стагнира, дали ви треба консултант или треба повеќе да објавувате? Одговорот зависи од тоа дали проблемот е внатре во бизнисот или во начинот на кој клиентите ве наоѓаат.'

const imageAltEn = 'Business team reviewing notes and planning around a table'
const imageAltMk = 'Бизнис тим разгледува белешки и планира околу маса'

const PEXELS_QUERY = 'small business team planning table'

// ---------------------------------- run ------------------------------------

interface ExistingPost {
  featuredImage?: { asset?: { _ref?: string } }
}

async function resolveFeaturedImage(): Promise<
  { assetId: string; credit: { photographer: string; url: string } | null } | null
> {
  // Reuse the already-uploaded asset on re-runs so the script stays idempotent
  // and we don't pile up orphaned images in the media library.
  const existing = await client.fetch<ExistingPost | null>(
    `*[_id == $id][0]{ featuredImage }`,
    { id: POST_ID }
  )
  const existingRef = existing?.featuredImage?.asset?._ref
  if (existingRef) {
    console.log(`  reusing existing featured image ${existingRef}`)
    return { assetId: existingRef, credit: null }
  }

  // Non-blocking, exactly like the generator: BlogCard and the post page both
  // fall back gracefully when there is no featured image.
  try {
    const photo = await searchPexelsPhoto(PEXELS_QUERY)
    if (!photo) {
      console.warn('  Pexels returned no photo — publishing without an image')
      return null
    }
    const buffer = await downloadPexelsPhoto(photo)
    const asset = await client.assets.upload('image', buffer, {
      filename: `pexels-${photo.id}.jpg`,
      contentType: 'image/jpeg',
    })
    console.log(`  uploaded featured image ${asset._id} (photo by ${photo.photographer})`)
    return {
      assetId: asset._id,
      credit: { photographer: photo.photographer, url: photo.url },
    }
  } catch (err) {
    console.warn('  Pexels step failed, publishing without an image:', (err as Error).message)
    return null
  }
}

/**
 * Run the post through the exact quality gates the Phase 13B generator applies
 * to Claude's output — word counts, h2 structure, excerpt length, tag counts,
 * banned marketing phrases. Hand-written copy gets held to the same bar.
 */
function runQualityGates(): boolean {
  const draft: GeneratedPost = {
    title: { en: titleEn, mk: titleMk },
    slug: SLUG,
    excerpt: { en: excerptEn, mk: excerptMk },
    body: { en: mdToPortableText(bodyEn), mk: mdToPortableText(bodyMk) },
    tags: {
      en: ['business consulting', 'marketing strategy', 'small business', 'growth'],
      mk: ['деловен консалтинг', 'маркетинг стратегија', 'мал бизнис', 'раст'],
    },
    readTime: 6,
    pexelsQuery: PEXELS_QUERY,
    imageAlt: { en: imageAltEn, mk: imageAltMk },
    facebookCaption: '',
    instagramCaption: '',
  }

  const wordCount = (md: string) =>
    md.replace(/[#*[\]()]/g, ' ').split(/\s+/).filter(Boolean).length

  console.log('Quality gates:')
  console.log(`  EN words ${wordCount(bodyEn)} (500-1500) · MK words ${wordCount(bodyMk)} (400-1500)`)
  console.log(`  EN excerpt ${excerptEn.length} chars · MK excerpt ${excerptMk.length} chars (60-300)`)
  console.log(
    `  EN h2 ${(bodyEn.match(/^## /gm) ?? []).length} · MK h2 ${(bodyMk.match(/^## /gm) ?? []).length} (min 2)`
  )

  const result = validateDraft(draft)
  if (!result.ok) {
    console.error('  FAILED:')
    for (const e of result.errors) console.error(`    - ${e}`)
    return false
  }
  console.log('  all gates passed')
  return true
}

async function main() {
  const publish = !process.argv.includes('--draft')
  const checkOnly = process.argv.includes('--check')

  if (!runQualityGates()) process.exit(1)
  if (checkOnly) {
    console.log('\n--check: no writes performed.')
    return
  }

  console.log(`\nPublishing to project=${projectId} dataset=${dataset}`)
  console.log(`  status=${publish ? 'published' : 'draft'}`)

  // Guard: never silently collide with a different post that owns this slug.
  const slugOwner = await client.fetch<string | null>(
    `*[_type == "blogPost" && slug.current == $slug][0]._id`,
    { slug: SLUG }
  )
  if (slugOwner && slugOwner !== POST_ID) {
    console.error(`Slug "${SLUG}" is already taken by ${slugOwner}. Aborting.`)
    process.exit(1)
  }

  // Guard: the author must exist, otherwise the post renders with a dangling ref.
  const authorExists = await client.fetch<string | null>(`*[_id == $id][0]._id`, {
    id: AUTHOR_REF,
  })
  if (!authorExists) {
    console.error(`Author ${AUTHOR_REF} not found in this dataset. Aborting.`)
    process.exit(1)
  }

  const image = await resolveFeaturedImage()

  // Preserve the original publish date across re-runs so an edit doesn't shuffle
  // the post to the top of the listing.
  const previousPublishedAt = await client.fetch<string | null>(
    `*[_id == $id][0].publishedAt`,
    { id: POST_ID }
  )

  const doc: Record<string, unknown> = {
    _id: POST_ID,
    _type: 'blogPost',
    title: { _type: 'localizedString', en: titleEn, mk: titleMk },
    slug: { _type: 'slug', current: SLUG },
    excerpt: { _type: 'localizedText', en: excerptEn, mk: excerptMk },
    body: {
      _type: 'localizedPortableText',
      en: mdToPortableText(bodyEn),
      mk: mdToPortableText(bodyMk),
    },
    author: { _type: 'reference', _ref: AUTHOR_REF },
    division: 'marketing',
    publishedAt: previousPublishedAt ?? new Date().toISOString(),
    readTime: 6,
    tags: {
      en: ['business consulting', 'marketing strategy', 'small business', 'growth'],
      mk: ['деловен консалтинг', 'маркетинг стратегија', 'мал бизнис', 'раст'],
    },
    status: publish ? 'published' : 'draft',
  }

  if (image) {
    doc.featuredImage = {
      _type: 'image',
      asset: { _type: 'reference', _ref: image.assetId },
      alt: { _type: 'localizedString', en: imageAltEn, mk: imageAltMk },
    }
  }

  await client.createOrReplace(doc as never)
  console.log(`  wrote blogPost ${POST_ID}`)

  // Close the backlog topic so the generator never writes this one again.
  const topic = await client.fetch<string | null>(`*[_id == $id][0]._id`, { id: TOPIC_ID })
  if (topic) {
    await client
      .patch(TOPIC_ID)
      .set({
        status: 'used',
        usedAt: new Date().toISOString(),
        resultingPost: { _type: 'reference', _ref: POST_ID },
      })
      .commit()
    console.log(`  marked topic ${TOPIC_ID} as used`)
  } else {
    console.log(`  topic ${TOPIC_ID} not found — skipped backlog update`)
  }

  // Flush the ISR caches on the live site. `NEXT_PUBLIC_SITE_URL` points at
  // localhost on this machine, so default to the canonical production URL.
  if (!process.argv.includes('--no-revalidate')) {
    const target = process.env.REVALIDATE_TARGET_URL || siteConfig.url
    const secret = process.env.REVALIDATE_SECRET
    if (!secret) {
      console.warn('  REVALIDATE_SECRET missing — skipped cache flush (ISR catches up in ~60s)')
    } else {
      try {
        const res = await fetch(`${target}/api/revalidate`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-revalidate-secret': secret },
          body: JSON.stringify({ tag: 'blog', slug: SLUG }),
        })
        const payload = await res.text()
        console.log(`  revalidate ${target} -> ${res.status} ${payload.slice(0, 160)}`)
      } catch (err) {
        console.warn(`  revalidate call failed (non-fatal): ${(err as Error).message}`)
      }
    }
  }

  console.log('\nDone.')
  console.log(`  https://www.vertexconsulting.mk/en/blog/${SLUG}`)
  console.log(`  https://www.vertexconsulting.mk/mk/blog/${SLUG}`)
  console.log('  Live within ~60s (ISR revalidate on the blog routes).')
  if (image?.credit) {
    console.log(`  Image credit: ${image.credit.photographer} — ${image.credit.url}`)
  }
}

main().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
