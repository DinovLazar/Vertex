/**
 * One-off publisher for the blog post:
 *   "What 'IT infrastructure' actually means for a 10-person business"
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
 * get picked up and written a second time.
 *
 * Usage:
 *   npx tsx scripts/publish-post-it-infrastructure.ts            # publish
 *   npx tsx scripts/publish-post-it-infrastructure.ts --draft    # stage as draft
 *   npx tsx scripts/publish-post-it-infrastructure.ts --check    # validate only, no writes
 *   npx tsx scripts/publish-post-it-infrastructure.ts --no-revalidate
 *
 * After writing, it POSTs /api/revalidate on the live site (the same step the
 * generator performs) so the blog routes, sitemap and llms.txt pick the post up
 * immediately instead of waiting out their ISR windows, and so IndexNow gets
 * pinged. Target defaults to `siteConfig.url`; override with REVALIDATE_TARGET_URL.
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'

// The documented env file is `.env.local`, but this machine carries the values
// in `env.local` (no leading dot). Load whichever exists so the script runs in
// both places without editing.
for (const path of ['.env.local', 'env.local']) {
  if (existsSync(path)) {
    loadEnv({ path })
    break
  }
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

const POST_ID = 'post-it-infrastructure-ten-person-business'
const TOPIC_ID = 'topic-what-it-infrastructure-means-for-small-business'
const AUTHOR_REF = 'author-lazar'
const SLUG = 'what-it-infrastructure-actually-means-for-a-10-person-business'

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

const bodyEn = `"IT infrastructure" sounds like something that belongs to a company with a server room, a rack of blinking lights, and a systems administrator on staff. Most ten-person businesses in Macedonia hear the phrase and reasonably conclude it is somebody else's problem.

Then the website goes down on a Friday afternoon. Invoices start landing in clients' spam folders. The person who registered the domain six years ago no longer works here, and nobody knows which address the renewal notice goes to.

If you employ ten people, you already have IT infrastructure. You did not design it — you accumulated it. Here is what it actually consists of, what it costs you when nobody owns it, and how to check yours in about an hour.

## Infrastructure is six things, not a server room

Strip the terminology away and infrastructure is the list of things that must be working before your business can open in the morning:

- **Domain** — the name customers type, plus the registrar account that controls it and the renewal date attached to it
- **DNS** — the records that tell the internet where your website lives and which servers are allowed to send email as you
- **Hosting** — whatever serves your website to visitors
- **Email** — mailboxes, aliases, forwarding rules, and the authentication records that decide whether your message reaches an inbox or a junk folder
- **Files** — where contracts, designs, and invoices actually live, and who can reach them
- **Backups** — copies of all of the above that somebody has actually restored from at least once

Six items. A ten-person business usually has all six, spread across four or five providers, configured by three different people over six years, with half the passwords in one person's head. That is not a problem yet. It becomes one the day that person is on holiday.

## The failures are quiet, not dramatic

At this size, infrastructure does not fail in a way that looks like a crisis on television. It fails like this:

- The domain renewal notice goes to an address nobody has opened since 2022, and the site disappears for two days.
- A shared hosting server picks up a bad reputation because of another customer on it, and your quotes start going to junk.
- The backup job has run every night for a year. Nobody has ever restored from it, so nobody knows it has been writing empty archives since March.
- A former employee's mailbox still forwards to their private address.

None of this requires an attacker or a disaster. It requires only that nobody owns the list. Every item above is cheap to prevent and expensive to discover late.

## Email is usually the weakest part

Of the six, email is where I find the most damage — and the cause is nearly always three DNS records that nobody configured:

- **SPF** declares which servers are allowed to send mail using your domain.
- **DKIM** signs your outgoing messages so the receiving server can confirm they were not altered.
- **DMARC** tells receiving servers what to do when a message fails the first two checks.

Without them, Gmail and Outlook treat your mail as suspicious. You do not get an error. You get silence — and you conclude that the client is ignoring you. For a business that sends offers and invoices by email, that is a revenue problem wearing a technical costume. Setting all three up properly is an afternoon of work, once.

## Overpaying and underpaying are the same mistake

Small businesses tend to land in one of two places. Either they are paying for a dedicated server, a corporate mail suite, and a support contract sized for a company ten times larger — or they are on the cheapest shared plan available, sharing an IP address with a few hundred strangers, with no backup policy worth the name.

Both come from the same cause: infrastructure bought once, under pressure, with nobody in the room able to judge what was actually needed. The right size for ten people is unglamorous, and usually cheaper than what they are paying now.

## What "good" looks like at ten people

You do not need a data centre. You need boring, documented, and owned:

- One inventory document listing every domain, provider, access owner, and renewal date
- Business email on a real provider, with SPF, DKIM and DMARC passing
- Hosting that matches the site — for most business sites in 2026 that is a managed platform, not a VPS you have to patch yourself
- DNS at a provider you control directly (we use **Cloudflare**), not left with whoever built the last website
- Automated backups with one tested restore a year, written down
- Access that belongs to the company rather than to individuals — shared logins closed, admin rights on named people

That is the entire target. It is achievable in a week, and once it exists it needs roughly an hour of attention per quarter.

## The audit you can run yourself this afternoon

Before you call anyone, answer these six questions in writing:

- Who owns the registrar account for your domain, and when does it renew?
- If your website vanished right now, who would you call, and do they have access?
- Send a test email to a Gmail address from your business account. Did it arrive in the inbox?
- Where is your website backed up, and when was a restore last tested?
- Which former employees still have working accounts?
- Which of the six items above has no named owner at all?

If you cannot answer three or more of them, you do not have an IT problem yet. You have an ownership problem, which is the one that turns into an IT problem later.

## Where we come in

At Vertex Marketing we set up and run exactly this layer for Macedonian businesses — hosting, business email and DNS, domains and certificates, server hardening, and backups that actually get tested. We document all of it and hand you the documentation, because infrastructure you cannot walk away with is not infrastructure you own.

If any of those six questions made you uncomfortable, our [IT Infrastructure service](/marketing/it-infrastructure) is the place to start. And if the mess turns out to be organisational rather than technical — nobody owning the list, no process when someone leaves — that is a conversation for [IT & Systems](/consulting/it-systems) on the consulting side.`

const bodyMk = `„IT инфраструктура" звучи како нешто што им припаѓа на компании со сервер сала, рек полн трепкави ламбички и системски администратор во редовен работен однос. Повеќето бизниси со десет луѓе во Македонија ја слушаат фразата и сосема разумно заклучуваат дека тоа е нечиј туѓ проблем.

Потоа веб страницата паѓа во петок попладне. Фактурите почнуваат да слетуваат во spam папките на клиентите. Човекот што го регистрирал доменот пред шест години веќе не работи тука, а никој не знае на која адреса стигнува известувањето за обнова.

Ако имате десет вработени, веќе имате IT инфраструктура. Не сте ја дизајнирале — ја акумулиравте. Еве од што всушност се состои, што ве чини кога никој не ја држи, и како да ја проверите вашата за околу еден час.

## Инфраструктурата се шест работи, не сервер сала

Тргнете ја терминологијата настрана и инфраструктурата е списокот работи што мора да функционираат пред бизнисот да се отвори наутро:

- **Домен** — името што клиентите го пишуваат, заедно со сметката кај регистраторот што го контролира и датумот на обнова врзан за неа
- **DNS** — записите што му кажуваат на интернетот каде живее вашата веб страница и кои сервери смеат да испраќаат е-мејл во ваше име
- **Хостинг** — она што ја сервира страницата до посетителите
- **Е-мејл** — сандачиња, алијаси, правила за препраќање и записите за автентикација што одлучуваат дали пораката ќе стигне во инбокс или во junk
- **Датотеки** — каде навистина живеат договорите, дизајните и фактурите, и кој може да дојде до нив
- **Резервни копии** — копии од сето погоре од кои некој барем еднаш навистина вратил податоци

Шест ставки. Бизнис со десет луѓе обично ги има сите шест, распослани кај четири или пет добавувачи, поставени од тројца различни луѓе низ шест години, со половина од лозинките во главата на еден човек. Тоа сѐ уште не е проблем. Станува проблем оној ден кога тој човек е на одмор.

## Дефектите се тивки, не драматични

На оваа големина, инфраструктурата не паѓа на начин што личи на криза од филм. Паѓа вака:

- Известувањето за обнова на доменот оди на адреса што никој не ја отворил од 2022, и страницата исчезнува два дена.
- Споделен хостинг сервер добива лоша репутација поради друг клиент на него, и вашите понуди почнуваат да одат во junk.
- Резервната копија се прави секоја ноќ цела година. Никој никогаш не вратил податоци од неа, па никој не знае дека од март запишува празни архиви.
- Сандачето на поранешен вработен сѐ уште препраќа на неговата приватна адреса.

Ништо од ова не бара напаѓач или катастрофа. Бара само никој да не го држи списокот. Секоја ставка погоре е евтина за спречување и скапа за откривање доцна.

## Е-мејлот обично е најслабата точка

Од шесте, кај е-мејлот наоѓам најмногу штета — а причината речиси секогаш се три DNS записи што никој не ги поставил:

- **SPF** објавува кои сервери смеат да испраќаат пошта од вашиот домен.
- **DKIM** ги потпишува излезните пораки за да може серверот примач да потврди дека не се менувани.
- **DMARC** им кажува на серверите примачи што да прават кога пораката не ги поминува првите две проверки.

Без нив, Gmail и Outlook ја третираат вашата пошта како сомнителна. Не добивате грешка. Добивате тишина — и заклучувате дека клиентот ве игнорира. За бизнис што испраќа понуди и фактури по е-мејл, тоа е приходен проблем преоблечен во технички костум. Правилното поставување на сите три е работа од едно попладне, еднаш.

## Преплаќањето и потплаќањето се иста грешка

Малите бизниси обично завршуваат на едно од две места. Или плаќаат за посветен сервер, корпоративен пакет за е-мејл и договор за поддршка димензиониран за компанија десет пати поголема — или се на најевтиниот споделен план, делат IP адреса со неколку стотини непознати и немаат политика за резервни копии вредна за спомнување.

И двете доаѓаат од истата причина: инфраструктурата е купена еднаш, под притисок, без никој во просторијата да можел да процени што навистина треба. Вистинската големина за десет луѓе е незабележлива и обично поевтина од она што го плаќаат сега.

## Како изгледа „добро" кај десет луѓе

Не ви треба центар за податоци. Ви треба досадно, документирано и со сопственик:

- Еден документ со попис на секој домен, добавувач, сопственик на пристапот и датум на обнова
- Деловен е-мејл кај вистински добавувач, со исправни SPF, DKIM и DMARC
- Хостинг што одговара на страницата — за повеќето бизнис страници во 2026 тоа е управувана платформа, а не VPS што сами мора да го одржувате
- DNS кај добавувач што вие директно го контролирате (ние користиме **Cloudflare**), а не оставен кај оној што ја правел последната страница
- Автоматски резервни копии со едно тестирано враќање годишно, запишано
- Пристап што ѝ припаѓа на компанијата, а не на поединци — споделените сметки затворени, администраторски права на именувани луѓе

Тоа е целата цел. Остварливо е за една недела, и штом постои, бара околу еден час внимание на квартал.

## Ревизија што можете сами да ја направите попладнево

Пред да повикате некого, одговорете на овие шест прашања во писмена форма:

- Кој ја поседува сметката кај регистраторот за вашиот домен и кога се обновува?
- Ако страницата исчезне во овој момент, кого би го повикале и дали има пристап?
- Испратете тест порака до Gmail адреса од вашата деловна сметка. Дали стигна во инбокс?
- Каде се чуваат резервните копии на страницата и кога последен пат е тестирано враќање?
- Кои поранешни вработени сѐ уште имаат активни сметки?
- Која од шесте ставки погоре нема воопшто именуван сопственик?

Ако не можете да одговорите на три или повеќе, сѐ уште немате IT проблем. Имате проблем со сопственост, а тој е оној што подоцна се претвора во IT проблем.

## Тука влегуваме ние

Во Vertex Marketing го поставуваме и го одржуваме токму овој слој за македонски бизниси — хостинг, деловен е-мејл и DNS, домени и сертификати, зајакнување на серверите и резервни копии што навистина се тестираат. Сѐ документираме и документацијата ви ја предаваме, бидејќи инфраструктура од која не можете да си заминете не е инфраструктура што ја поседувате.

Ако некое од тие шест прашања ве вознемири, нашата [услуга IT инфраструктура](/marketing/it-infrastructure) е местото каде да започнете. А ако хаосот се покаже како организациски наместо технички — никој не го држи списокот, нема процес кога некој заминува — тоа е разговор за [IT и системи](/consulting/it-systems) на консалтинг страната.`

const titleEn = 'What "IT infrastructure" actually means for a 10-person business'
const titleMk = 'Што навистина значи „IT инфраструктура" за бизнис со десет луѓе'

const excerptEn =
  'You already have IT infrastructure — domain, DNS, hosting, email, files, backups. You may just not know who owns it. What the term actually means at ten employees, and a six-question audit you can run this afternoon.'
const excerptMk =
  'Веќе имате IT инфраструктура — домен, DNS, хостинг, е-мејл, датотеки, резервни копии. Можеби само не знаете кој ја држи. Што значи терминот кај десет вработени и ревизија од шест прашања што можете да ја направите попладнево.'

const imageAltEn = 'Network cables patched into a server rack in a small business office'
const imageAltMk = 'Мрежни кабли поврзани во сервер рек во канцеларија на мал бизнис'

const PEXELS_QUERY = 'network server rack cables'

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
      en: ['IT infrastructure', 'hosting', 'email', 'small business'],
      mk: ['IT инфраструктура', 'хостинг', 'е-мејл', 'мал бизнис'],
    },
    readTime: 7,
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
    readTime: 7,
    tags: {
      en: ['IT infrastructure', 'hosting', 'email', 'small business'],
      mk: ['IT инфраструктура', 'хостинг', 'е-мејл', 'мал бизнис'],
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
  console.log(`  https://vertexconsulting.mk/en/blog/${SLUG}`)
  console.log(`  https://vertexconsulting.mk/mk/blog/${SLUG}`)
  console.log('  Live within ~60s (ISR revalidate on the blog routes).')
  if (image?.credit) {
    console.log(`  Image credit: ${image.credit.photographer} — ${image.credit.url}`)
  }
}

main().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
