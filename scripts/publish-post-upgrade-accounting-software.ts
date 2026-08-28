/**
 * One-off publisher for the bilingual blog post:
 * "When to upgrade your accounting software, and when to wait"
 * Goran Dinov, Vertex Consulting.
 *
 * Usage:
 *   PATH="$HOME/.cache/node-v24.20.0-linux-x64/bin:$PATH" npx tsx scripts/publish-post-upgrade-accounting-software.ts --check
 *   PATH="$HOME/.cache/node-v24.20.0-linux-x64/bin:$PATH" npx tsx scripts/publish-post-upgrade-accounting-software.ts
 *
 * The script is idempotent: it owns one fixed post ID, retains the original
 * publishedAt on reruns, reuses its Sanity image asset, validates both locales,
 * closes exactly one backlog topic, and revalidates the live blog cache.
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'

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
  console.error('Missing Sanity env vars. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, and SANITY_API_WRITE_TOKEN.')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-10-01',
  token,
  useCdn: false,
})

const POST_ID = 'post-when-to-upgrade-accounting-software'
const TOPIC_ID = 'topic-when-to-upgrade-accounting-software'
const AUTHOR_REF = 'author-goran'
const SLUG = 'when-to-upgrade-accounting-software-and-when-to-wait'
const PEXELS_QUERY = 'small business accounting laptop calculator invoices'

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

function mdToPortableText(md: string): PTBlock[] {
  const blocks: PTBlock[] = []
  let blockIndex = 0

  for (const chunk of md.split('\n\n').map((part) => part.trim()).filter(Boolean)) {
    const lines = chunk.split('\n').map((line) => line.trim()).filter(Boolean)
    const isBulletBlock = lines.length > 0 && lines.every((line) => line.startsWith('- '))

    if (isBulletBlock) {
      for (const line of lines) blocks.push(makeBlock(line.slice(2), 'normal', blockIndex++, 'bullet'))
      continue
    }

    const isH2 = chunk.startsWith('## ')
    blocks.push(makeBlock(isH2 ? chunk.slice(3) : chunk.replace(/\n/g, ' '), isH2 ? 'h2' : 'normal', blockIndex++))
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
    if (slice) children.push({ _type: 'span', _key: `b${idx}-s${spanCounter++}`, text: slice, marks })
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

const bodyEn = `Most businesses do not wake up one morning and decide they need new accounting software. The decision arrives after a late invoice, a customer asking whether they have paid, or an accountant asking for a report that takes half a day to assemble from three spreadsheets.

That is a real signal, but it is not an automatic order to buy the most expensive system on the market. A new tool can reduce repeated work and give you cleaner information. It can also add a monthly cost, a migration project, and another login nobody uses properly. The useful question is simpler: is the current setup blocking a business decision, creating avoidable risk, or merely annoying you once in a while?

## Upgrade when your numbers arrive after the decision

The clearest sign is not that a spreadsheet looks untidy. It is that you cannot answer a basic question while it is still useful. How much is overdue? Which customers have not paid? What did the business make last month after direct costs? Are invoices being sent on time?

If the answer lives in someone's inbox, a notebook, or a file that only one person understands, you have an information problem. You are making decisions with old data because turning the records into a useful view takes too long.

A better system should not create reports for their own sake. It should make the few numbers you actually use available without a rescue operation at month end.

## Upgrade when the same information is entered twice

Many small businesses start with a sensible patchwork: an invoice template, a bank statement, a shared spreadsheet, and an accountant who receives a folder at the end of the month. That can work for a while.

It stops working when the same sale is typed into the invoice, then copied into a spreadsheet, then sent again to the accountant. Every repeat entry creates a chance for a wrong amount, a missing customer, or a payment that looks overdue because nobody updated one of the files.

Look for repetition rather than features. If a system can remove one reliable piece of duplicate work, it may be worth paying for. If it only adds a dashboard that nobody checks, it is not solving the problem.

## Upgrade when the business has outgrown one person's memory

A spreadsheet is not automatically bad. A spreadsheet that only one person can safely change is a problem.

You have probably outgrown the current setup when the owner has to answer every question about an invoice, when staff cannot see the current status without asking, or when holidays create a backlog because the person who knows the file is away. The issue is continuity, not software taste.

Give the people who need the information an appropriate role. That might mean a sales person can see whether an invoice is paid, an operations lead can see what has been billed, and the accountant can get the records in the format they need. It does not mean everyone needs permission to change the books.

## Upgrade when invoices need a dependable digital workflow

There is also a local reason to put this question on the agenda. In January 2026, the [Ministry of Finance announced the start of implementing the E-faktura system](https://finance.gov.mk/mk-MK/odnosi-so-javnost/novosti/dimitrieska-kocoska-sistemot-e-faktura-seriozen-cekor-vo-borbata-so-sivata-ekonomija-i-reforma-vo-javnite-finansii), describing a move away from paper-heavy processes and physical documents.

That announcement is not a reason to rush into any software package. It is a reason to ask better questions before you choose one: can your accountant work with its exports, can it handle the invoice process your business needs, and can you retrieve the records when a customer or authority asks for them? Your accountant should confirm the current legal and tax requirements for your exact business before you commit.

## When waiting is the better decision

You do not need new software just because another business uses it. Waiting is sensible when your activity is simple, invoices are few, records are complete, and the current routine produces what you and your accountant need without chasing people for missing information.

It is also sensible to wait when the real problem is not the software. No accounting platform will fix unclear prices, unapproved discounts, staff who do not send invoices, or customers who are never followed up. Fix the working rule first. Then decide whether a tool can support it.

A useful test: if you changed software tomorrow, what would become easier in the first week? If you cannot name a specific repeated task or decision, keep the current setup and revisit the question later.

## Make the decision from two weeks of evidence

Before you book demos, spend two weeks noting where the current process breaks. Write down every item that had to be entered twice, every payment status somebody had to chase, every invoice delayed by missing information, and every question that could not be answered quickly.

At the end, group the notes. If the same failure appears repeatedly, you have a requirements list built from real work rather than a salesman’s feature list. Bring it to your accountant and shortlist systems that can meet those requirements.

Ask each vendor or implementer to show your actual workflow: create an invoice, correct it, record a payment, export what your accountant needs, and give the right person read-only access. A clean demo with fake data proves very little.

## Buy the smallest system that removes the bottleneck

The right upgrade is rarely the system with the longest feature list. It is the one your team can use consistently, your accountant accepts, and the business can afford to keep using next year.

For some companies, that is a cleaner shared process around the software they already own. For others, it is a proper accounting platform with invoice tracking, permissions, exports, and a record everyone can rely on. The answer depends on the bottleneck, not the brand name.

If you are not sure whether the problem is the tool, the workflow, or the handoff to your accountant, our [IT and systems support](/consulting/it-systems) starts with the actual process. If the records reveal that quotes, follow-ups, and delivery are falling through the gaps too, that is work for [workflow restructuring](/consulting/workflow-restructuring).`

const bodyMk = `Повеќето бизниси не се будат едно утро со одлука дека им треба нов сметководствен софтвер. Одлуката доаѓа по доцна фактура, по прашање од клиент дали веќе платил, или кога сметководителот бара извештај за кој треба половина ден да се состави од три табели.

Тоа е вистински сигнал, но не е автоматска наредба да го купите најскапиот систем на пазарот. Новата алатка може да намали повторлива работа и да ви даде почисти информации. Може и да донесе месечен трошок, миграција и уште една најава што никој не ја користи како што треба. Покорисното прашање е поедноставно: дали сегашниот начин ве спречува да донесете деловна одлука, создава ризик што може да се избегне или само ве нервира одвреме-навреме?

## Надградете кога бројките доаѓаат по одлуката

Најјасниот знак не е неуредна табела. Тоа е кога не можете да одговорите на основно прашање додека одговорот уште е корисен. Колку пари се доцни? Кои клиенти не платиле? Колку заработи бизнисот минатиот месец по директните трошоци? Дали фактурите се испраќаат навреме?

Ако одговорот живее во нечие сандаче, тетратка или датотека што ја разбира само еден човек, имате проблем со информациите. Одлуките ги носите со стари податоци бидејќи претворањето на записите во корисен преглед трае предолго.

Подобриот систем не треба да создава извештаи само заради извештаи. Треба без месечно спасување да ви ги даде неколкуте бројки што навистина ги користите.

## Надградете кога истата информација ја внесувате двапати

Многу мали бизниси почнуваат со разумна комбинација: образец за фактура, банкарски извод, споделена табела и сметководител што добива папка на крајот на месецот. Тоа може да работи некое време.

Престанува да работи кога истата продажба ја пишувате во фактурата, потоа ја копирате во табела и повторно ја испраќате кај сметководителот. Секој повторен внес создава можност за погрешна сума, клиент што недостасува или уплата што изгледа доцна бидејќи некој не ја ажурирал една од датотеките.

Барајте повторување, не функции. Ако системот може да отстрани една сигурна двојна работа, можеби вреди да се плати. Ако само додава табла што никој не ја гледа, не го решава проблемот.

## Надградете кога бизнисот ја надминал меморијата на еден човек

Табелата не е автоматски лоша. Табелата што само еден човек може безбедно да ја менува е проблем.

Веројатно сте го надминале сегашниот начин кога сопственикот мора да одговори на секое прашање за фактура, кога вработените не можат да ја видат актуелната состојба без да прашаат или кога одморот создава застој бидејќи човекот што ја знае датотеката го нема. Прашањето е континуитет, не вкус за софтвер.

На луѓето што им треба информацијата дајте им соодветна улога. Тоа може да значи продавачот да гледа дали фактурата е платена, одговорниот за операции да гледа што е фактурирано, а сметководителот да ги добива записите во формат што му одговара. Не значи секој да има дозвола да ги менува книгите.

## Надградете кога фактурите бараат сигурен дигитален процес

Постои и локална причина ова прашање да биде на списокот. Во јануари 2026, [Министерството за финансии го најави почетокот на имплементацијата на системот Е-фактура](https://finance.gov.mk/mk-MK/odnosi-so-javnost/novosti/dimitrieska-kocoska-sistemot-e-faktura-seriozen-cekor-vo-borbata-so-sivata-ekonomija-i-reforma-vo-javnite-finansii), како чекор подалеку од процесите со многу хартија и физички документи.

Ова соопштение не е причина да брзате со кој било софтверски пакет. Тоа е причина да поставите подобри прашања пред да изберете: дали сметководителот може да работи со неговите извози, дали може да го поддржи процесот на фактурирање што му треба на вашиот бизнис и дали можете да ги извадите записите кога ќе ги побара клиент или институција? Пред да се обврзете, сметководителот треба да ги потврди тековните законски и даночни барања за вашиот конкретен бизнис.

## Кога е подобро да почекате

Не ви треба нов софтвер само затоа што друг бизнис користи таков. Чекањето има смисла кога работата е едноставна, има малку фактури, записите се целосни и сегашната рутина им го дава на вас и на сметководителот тоа што ви треба, без да бркате луѓе за информации што недостасуваат.

Има смисла да почекате и кога вистинскиот проблем не е софтверот. Ниедна сметководствена платформа нема да поправи нејасни цени, попусти без одобрение, вработени што не испраќаат фактури или клиенти што никој не ги следи. Прво поправете го работното правило. Потоа одлучете дали алатката може да го поддржи.

Корисен тест: ако утре смените софтвер, што ќе ви биде полесно уште во првата недела? Ако не можете да именувате конкретна повторлива задача или одлука, задржете го сегашниот начин и вратете се на прашањето подоцна.

## Донесете одлука од две недели докази

Пред да закажете демоа, две недели бележете каде се прекинува сегашниот процес. Запишете секоја ставка што морала да се внесе двапати, секој статус на уплата што некој морал да го брка, секоја фактура што доцнела поради информација што недостасува и секое прашање на кое не можело брзо да се одговори.

На крајот, групирајте ги белешките. Ако истото пропаѓање се појавува повторно, имате листа со барања направена од вистинска работа, а не од листа со функции на продавач. Однесете ја кај сметководителот и направете краток список со системи што можат да ги исполнат тие барања.

Побарајте од секој понудувач или имплементатор да ви го покаже вашиот вистински процес: креирајте фактура, поправете ја, внесете уплата, извезете го она што му треба на сметководителот и дајте му на вистинскиот човек пристап само за читање. Убаво демо со измислени податоци докажува многу малку.

## Купете го најмалиот систем што го отстранува тесното грло

Вистинската надградба ретко е системот со најдолга листа на функции. Тоа е системот што тимот може доследно да го користи, сметководителот го прифаќа и бизнисот може да си дозволи да го користи и следната година.

За некои компании тоа е почист заеднички процес околу софтверот што веќе го имаат. За други, тоа е вистинска сметководствена платформа со следење на фактури, улоги, извози и записи на кои секој може да се потпре. Одговорот зависи од тесното грло, не од името на брендот.

Ако не сте сигурни дали проблемот е алатката, работниот процес или предавањето кај сметководителот, нашата [поддршка за IT и системи](/consulting/it-systems) почнува од вистинскиот процес. Ако записите откриваат дека понудите, следењето и испораката паѓаат низ празнините, тогаш ви треба [преструктуирање на процеси](/consulting/workflow-restructuring).`

const titleEn = 'When to upgrade your accounting software, and when to wait'
const titleMk = 'Кога да го надградите сметководствениот софтвер, а кога да почекате'
const excerptEn =
  'A practical way for small businesses to decide whether their accounting setup is holding them back, or whether a new system would only add cost and complexity.'
const excerptMk =
  'Практичен начин малите бизниси да одлучат дали сегашниот сметководствен начин ги кочи или новиот систем само ќе донесе трошок и сложеност.'
const imageAltEn = 'Small business owner reviewing invoices, a calculator and a laptop at a desk'
const imageAltMk = 'Сопственик на мал бизнис разгледува фактури, калкулатор и лаптоп на биро'
const tagsEn = ['accounting software', 'small business', 'invoices', 'business systems']
const tagsMk = ['сметководствен софтвер', 'мал бизнис', 'фактури', 'деловни системи']

function buildDraft(): GeneratedPost {
  return {
    title: { en: titleEn, mk: titleMk },
    slug: SLUG,
    excerpt: { en: excerptEn, mk: excerptMk },
    body: { en: mdToPortableText(bodyEn), mk: mdToPortableText(bodyMk) },
    tags: { en: tagsEn, mk: tagsMk },
    readTime: 7,
    pexelsQuery: PEXELS_QUERY,
    imageAlt: { en: imageAltEn, mk: imageAltMk },
    facebookCaption: '',
    instagramCaption: '',
  }
}

function runQualityGates(): boolean {
  const wordCount = (md: string) => md.replace(/[#*[\]()]/g, ' ').split(/\s+/).filter(Boolean).length
  const draft = buildDraft()

  console.log('Quality gates:')
  console.log(`  EN words ${wordCount(bodyEn)} (500-1500) · MK words ${wordCount(bodyMk)} (400-1500)`)
  console.log(`  EN excerpt ${excerptEn.length} chars · MK excerpt ${excerptMk.length} chars (60-300)`)
  console.log(`  EN h2 ${(bodyEn.match(/^## /gm) ?? []).length} · MK h2 ${(bodyMk.match(/^## /gm) ?? []).length} (min 2)`)

  const result = validateDraft(draft)
  if (!result.ok) {
    console.error('  FAILED:')
    for (const error of result.errors) console.error(`    - ${error}`)
    return false
  }

  console.log('  all gates passed')
  return true
}

interface ExistingPost {
  featuredImage?: { asset?: { _ref?: string } }
}

async function resolveFeaturedImage(): Promise<{ assetId: string; credit: { photographer: string; url: string } | null } | null> {
  const existing = await client.fetch<ExistingPost | null>(`*[_id == $id][0]{ featuredImage }`, { id: POST_ID })
  const existingRef = existing?.featuredImage?.asset?._ref
  if (existingRef) {
    console.log(`  reusing existing featured image ${existingRef}`)
    return { assetId: existingRef, credit: null }
  }

  try {
    const photo = await searchPexelsPhoto(PEXELS_QUERY)
    if (!photo) {
      console.warn('  Pexels returned no photo, publishing without an image')
      return null
    }
    const asset = await client.assets.upload('image', await downloadPexelsPhoto(photo), {
      filename: `pexels-${photo.id}.jpg`,
      contentType: 'image/jpeg',
    })
    console.log(`  uploaded featured image ${asset._id} (photo by ${photo.photographer})`)
    return { assetId: asset._id, credit: { photographer: photo.photographer, url: photo.url } }
  } catch (error) {
    console.warn('  Pexels step failed, publishing without an image:', (error as Error).message)
    return null
  }
}

async function main() {
  const publish = !process.argv.includes('--draft')
  const checkOnly = process.argv.includes('--check')

  if (!runQualityGates()) process.exit(1)
  if (checkOnly) {
    console.log('\n--check: no writes performed.')
    return
  }

  const [slugOwner, authorExists, topic] = await Promise.all([
    client.fetch<string | null>(`*[_type == "blogPost" && slug.current == $slug][0]._id`, { slug: SLUG }),
    client.fetch<string | null>(`*[_id == $id][0]._id`, { id: AUTHOR_REF }),
    client.fetch<{ _id: string; status: string } | null>(`*[_id == $id][0]{ _id, status }`, { id: TOPIC_ID }),
  ])

  if (slugOwner && slugOwner !== POST_ID) throw new Error(`Slug "${SLUG}" is already taken by ${slugOwner}.`)
  if (!authorExists) throw new Error(`Author ${AUTHOR_REF} not found in this dataset.`)
  if (!topic) throw new Error(`Expected backlog topic ${TOPIC_ID} was not found. Refusing to publish.`)
  if (topic.status !== 'pending' && topic.status !== 'used') throw new Error(`Backlog topic ${TOPIC_ID} has status ${topic.status}. Refusing to overwrite it.`)

  console.log(`\nPublishing to project=${projectId} dataset=${dataset}`)
  console.log(`  status=${publish ? 'published' : 'draft'}`)

  const image = await resolveFeaturedImage()
  const previousPublishedAt = await client.fetch<string | null>(`*[_id == $id][0].publishedAt`, { id: POST_ID })
  const doc: Record<string, unknown> = {
    _id: POST_ID,
    _type: 'blogPost',
    title: { _type: 'localizedString', en: titleEn, mk: titleMk },
    slug: { _type: 'slug', current: SLUG },
    excerpt: { _type: 'localizedText', en: excerptEn, mk: excerptMk },
    body: { _type: 'localizedPortableText', en: mdToPortableText(bodyEn), mk: mdToPortableText(bodyMk) },
    author: { _type: 'reference', _ref: AUTHOR_REF },
    division: 'consulting',
    publishedAt: previousPublishedAt ?? new Date().toISOString(),
    readTime: 7,
    tags: { en: tagsEn, mk: tagsMk },
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

  await client
    .patch(TOPIC_ID)
    .set({
      status: 'used',
      usedAt: new Date().toISOString(),
      resultingPost: { _type: 'reference', _ref: POST_ID },
    })
    .commit()
  console.log(`  marked topic ${TOPIC_ID} as used`)

  const verification = await client.fetch<{
    post: { status: string; title: { en: string; mk: string }; featuredImage?: unknown } | null
    topic: { status: string; resultingPost?: { _ref?: string } } | null
  }>(
    `{ "post": *[_id == $postId][0]{ status, title, featuredImage }, "topic": *[_id == $topicId][0]{ status, resultingPost } }`,
    { postId: POST_ID, topicId: TOPIC_ID }
  )
  if (verification.post?.status !== (publish ? 'published' : 'draft')) throw new Error('Sanity read-back failed: post status mismatch.')
  if (verification.topic?.status !== 'used' || verification.topic.resultingPost?._ref !== POST_ID) {
    throw new Error('Sanity read-back failed: backlog topic was not closed correctly.')
  }
  console.log('  Sanity read-back verified post and backlog topic')

  if (!process.argv.includes('--no-revalidate')) {
    const target = process.env.REVALIDATE_TARGET_URL || siteConfig.url
    const secret = process.env.REVALIDATE_SECRET
    if (!secret) {
      console.warn('  REVALIDATE_SECRET missing, skipped cache flush')
    } else {
      const response = await fetch(`${target}/api/revalidate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-revalidate-secret': secret },
        body: JSON.stringify({ tag: 'blog', slug: SLUG }),
      })
      const payload = await response.text()
      if (!response.ok) throw new Error(`Revalidate failed: ${response.status} ${payload.slice(0, 160)}`)
      console.log(`  revalidate ${target} -> ${response.status} ${payload.slice(0, 160)}`)
    }
  }

  console.log('\nDone.')
  console.log(`  ${siteConfig.url}/en/blog/${SLUG}`)
  console.log(`  ${siteConfig.url}/mk/blog/${SLUG}`)
  if (image?.credit) console.log(`  Image credit: ${image.credit.photographer} - ${image.credit.url}`)
}

main().catch((error) => {
  console.error('Failed:', error)
  process.exit(1)
})
