/**
 * One-off publisher for the blog post:
 *   "Why your business doesn't show up on Google Maps — and how to fix it"
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
 * `scripts/seed-topics.ts` as "Why Macedonian businesses need more than just a
 * Facebook page" — this post answers that same underlying question (where do
 * local customers actually find you) with sharper research behind it, so the
 * topic is retired under its new title.
 *
 * Usage:
 *   npx tsx scripts/publish-post-google-maps-visibility.ts            # publish
 *   npx tsx scripts/publish-post-google-maps-visibility.ts --draft    # stage as draft
 *   npx tsx scripts/publish-post-google-maps-visibility.ts --check    # validate only, no writes
 *   npx tsx scripts/publish-post-google-maps-visibility.ts --no-revalidate
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

const POST_ID = 'post-google-maps-visibility-small-business'
const TOPIC_ID = 'topic-why-macedonian-businesses-need-more-than-facebook-page'
const AUTHOR_REF = 'author-lazar'
const SLUG = 'why-your-business-doesnt-show-up-on-google-maps'

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

const bodyEn = `Somebody in your town picks up their phone right now and types what you sell into Google. If your business has a shop front, a workshop, or visits clients at their premises, Google shows them a map with three businesses on it. Yours is not one of them. A competitor gets the call.

That map — the one with the pins and the star ratings — is called the local pack, and for shops, salons, trades, mechanics, dentists, restaurants and service companies it sends more real customers than any Facebook post ever will. Getting into it is free. So why are thousands of Macedonian businesses missing from it?

The most common answer I see on audits: nobody ever claimed the listing. Here is how to check whether that is you, and everything that comes after it.

## Your Facebook page is not on Google Maps

Most small businesses here did their "online presence" years ago as a single task: create a Facebook page, post occasionally, done. That page does useful work — but when someone searches Google for what you sell, Facebook pages rank poorly, and they never appear on the map at all.

Google's map runs on a separate thing entirely: the **Google Business Profile**. It is free, it takes about twenty minutes to set up, and it is what decides whether you exist when somebody nearby searches. The businesses sitting in those three map spots are not paying for placement and mostly are not SEO experts — they claimed a profile, filled it in completely, and collected reviews while everyone else stayed invisible.

## Step one: find out if you are already listed

Before anything else, search your exact business name plus your town on Google. Two outcomes:

- **A listing exists but you never made it.** Google auto-creates rough listings from public data, phone directories, customer photos. Someone may have added you years ago. It shows your old hours, an unclaimed badge, maybe a photo a customer took of the closed shutters. This is the most common situation — the fix is to claim the existing profile rather than create a new one, which keeps whatever reviews it already has.
- **Nothing appears at all.** You genuinely do not exist on Google Maps. Go to business.google.com/add and add your business.

Either way you end up in the same place: a profile you control, waiting to be verified.

## Verification is where most businesses give up

Google will not show a profile until it confirms you actually run the business. Depending on your category, verification is a video recording of your workplace (signage, equipment, proof you trade there), a code by SMS or email, or rarely a postcard. In 2026 the video method is the default for most categories, and it trips people up:

- Film continuously — do not cut or edit the recording.
- Show the street entrance or sign with your exact business name as written on the profile.
- Show the inside: counter, tools, office — evidence the business operates there.
- Match the name exactly. If the profile says "Auto servis Marko", the sign should read that too, not "Marko" or a different spelling.

Verification usually clears in a few days. An unverified profile shows nothing anywhere — this single step is where most of the missing businesses are stuck.

## What fills the profile once you are in

A claimed-but-empty profile ranks below a complete one. Work through all of it — none of it costs money:

- **Primary category**, chosen as specifically as Google allows. "Механичар за возила" beats "Автосервис" beats nothing. Add secondary categories for the other things you do.
- **Hours**, including holiday hours — the number-one frustration customers report is driving to a closed business.
- **Services or products** list with prices or price ranges where possible.
- **Photos**: exterior so people recognise the place, interior, team, work in progress. Profiles with photos collect substantially more calls and direction requests.
- **Description**: 750 characters, plain language, what you do and where.
- **Messaging or WhatsApp link** — in Macedonia half the enquiries arrive by Viber or WhatsApp anyway; make it possible.

## Reviews decide who gets the call

Between two similar profiles, the one with recent reviews wins — customers read them, and Google's local ranking counts them. Yet most Macedonian businesses have zero, not because customers refuse, but because nobody asks.

The working method is unglamorous: after a satisfied job, send a message — "thank you, if you have two minutes, a Google review helps us a lot" — with your direct review link (you can generate it in the profile dashboard). Ask every time, not once. Ten honest reviews beat fifty bought ones, and buying them risks removal plus a penalty. And reply to every review, good or bad; replies are visible to every future customer who reads the page.

## The weekly routine that keeps you in the top three

Ranking in the map's three spots is not a one-time setup — it favours profiles that stay alive. After the initial work above, the maintenance is roughly fifteen minutes a week:

- Post one update: a finished job, an offer, a seasonal note.
- Upload a photo or two from real work.
- Reply to new reviews and answer questions.
- Check the dashboard's performance numbers monthly: calls, direction requests, which searches found you.

That is the whole system. Claim, verify, fill completely, collect reviews, stay active. No agency gatekeeping it, no monthly fee required — which raises the fair question of what we charge for.

## Where we come in

Honest version: a business with one location, some patience, and an afternoon can do everything above alone, and we say so. What we get hired for is the layer around the profile — the website it links to being fast and correct, the name-address-phone data matching across directories, the review wording responses, the photos that present the work properly, and the paid campaigns that sit on top of organic visibility when a result is needed this month rather than in three.

If you checked your name on the map today and found nothing — or a stale, unclaimed listing with old photos — our [social media & local visibility](/marketing/social-media) work starts exactly there. And if the deeper issue is that the business cannot sustain any channel because jobs, quotes and follow-ups live in one person's head, that is a conversation for [business consulting](/consulting/business-consulting).`

const bodyMk = `Некој во вашиот град токму сега го крева телефонот и пишува во Google што продавате. Ако бизнисот има локал, работилница или одите кај клиентите, Google му покажува мапа со три бизниси на неа. Вашиот не е ниеден од нив. Повикот го добива конкурентот.

Таа мапа — со игличките и ѕвездите — се вика „локален пакет“ и за дуќани, салони, занаетчии, механичари, стоматолози, ресторани и услужни фирми носи повеќе реални клиенти од која било Facebook објава. Влегувањето во неа е бесплатно. Зошто тогаш илјадници македонски бизниси ја немаат?

Најчестиот одговор што го гледам на ревизии: никој никогаш не го презел профилот. Еве како да проверите дали тоа сте вие — и сè што следи потоа.

## Вашата Facebook страница не е на Google мапите

Повеќето мали бизниси тука своето „онлајн присуство“ го направија пред години како една задача: креирај Facebook страница, објавуваш повремено, готово. Таа страница прави корисна работа — но кога некој во Google бара она што вие го продавате, Facebook страниците се рангирани слабо и на мапата воопшто не се појавуваат.

Мапата на Google работи на сосема друга работа: **Google Business Profile**. Бесплатен е, поставувањето трае околу дваесет минути и тој одлучува дали постоите кога некој во соседството бара вашата услуга. Бизнисите во трите места на мапата не плаќаат за позиција и најчесто не се SEO експерти — презеле профил, го пополниле до крај и собирале препораки додека останатите биле невидливи.

## Чекор прв: дознајте дали веќе сте евидентирани

Пред сè друго, побарајте ги точното име на бизнисот и градот во Google. Два исхода:

- **Профилот постои, но вие никогаш не сте го направиле.** Google сам создава груби профили од јавни податоци, телефонски именици, фотографии на клиенти. Некои можеби ве додале пред години. Покажува стари работни часови, ознака дека не е преземен, можеби фотографија што клиент ја снимил со затворена клупа. Ова е најчестата ситуација — решението е да го преземете постоечкиот профил наместо да создавате нов, за да ги задржите препораките што веќе ги има.
- **Воопшто ништо не се појавува.** Навистина не постоите на Google мапите. Одете на business.google.com/add и додајте го бизнисот.

И во двата случаи завршувате на истото место: профил што вие го контролирате и чека верификација.

## Верификацијата е местото каде повеќето се откажуваат

Google нема да прикаже профил додека не потврди дека навистина вие го водите бизнисот. Според категоријата, верификацијата е видео снимка на просторот (натпис, опрема, доказ дека таму работите), код по SMS или е-мејл, или ретко разгледница. Во 2026 видеото е стандард за повеќето категории и токму таму се заплеткуваат:

- Снимајте непрекинато — без сечење и монтирање.
- Покажете го влезот од улица или натписот со точното име на бизнисот како што е напишано во профилот.
- Покажете ја внатрешноста: пулт, алати, канцеларија — доказ дека таму работи бизнисот.
- Името нека е идентично. Ако профилот вели „Авто сервис Марко“, и натписот треба така да стои, не само „Марко“ или друг правопис.

Верификацијата обично поминува за неколку дена. Непреземениот профил не се прикажува никаде — овој еден чекор е местото каде повеќето недостасуващи бизниси стојат заглавени.

## Што се пополнува откако ќе влезете

Преземен, но празен профил рангира под пополнетиот. Поминете низ сè — ништо не чини пари:

- **Примарна категорија**, избрана колку што е можно поспецифично. „Механичар за возила“ е подобро од „Автосервис“, а празно поле е најлошо. Додајте споредни категории за другите работи што ги работите.
- **Работни часови**, вклучително и празнични — број еден фрустрација што ја пријавуваат клиентите е возење до затворено место.
- **Услуги или производи** со цени или ценовни распони каде што може.
- **Фотографии**: надворешност за луѓето да го препознаат местото, внатрешност, екипата, работење во тек. Профилите со фотографии собираат значително повеќе повици и барања за насока.
- **Опис**: 750 знаци, прост јазик, што работите и каде.
- **Пораки или WhatsApp линк** — во Македонија половина барања и онака пристигнуваат преку Viber или WhatsApp; овозможете го тоа.

## Препораките одлучуваат кој го добива повикот

Кај два слични профили, оној со свежи препораки победува — клиентите ги читаат, а Google ги брои во локалното рангирање. Сепак повеќето македонски бизниси имаат нула, не затоа што клиентите одбиваат, туку затоа што никој не побарува.

Методот што работи е досаден: по завршен задоволувачки налог, испратете порака — „ви благодарам, ако имате две минути, Google препорака многу би ни помогнала“ — со директниот линк за препорака (генерира се во контролната табла на профилот). Барајте секојпат, не еднаш. Десет искрени препораки вредат повеќе педесет купени, а купените ризикуваат бришење и казна. И одговарајте на секоја препорака, добра или лоша — одговорите ги гледа секој иден клиент што ќе ја отвори страницата.

## Неделната рутина што ве држи во топ три

Рангирањето во трите места на мапата не е еднаш-за-секогаш поставка — претпочита профили што остануваат живи. По почетната работа погоре, одржувањето е околу петнаесет минути неделно:

- Објавете една новости: завршена работа, акција, сезонска забелешка.
- Подигнете една-две фотографија од вистинско работење.
- Одговорете на новите препораки и прашања.
- Месечно проверувајте ги бројките во контролната табла: повици, барања за насока, со кои пребарувања ве нашле.

Тоа е целиот систем. Преземи, верификувај, пополни до крај, собирај препораки, остани активен. Без агентска гарда и без месечна такса — што оправдано поставува прашањето за што наплатуваме ние.

## Тука влегуваме ние

Честна верзија: бизнис со една локација, малку трпение и едно попладне може сè погоре да го направи сам, и тоа го кажуваме. За тоа што нè ангажираат е слојот околу профилот — веб страницата на која профилот води да е брза и исправна, податоците име-адреса-телефон да се совпаѓаат насекаде, формулациите на одговорите на препораките, фотографиите што го претставуваат работењето како што треба, и платените кампањи што седат врз органската видливост кога резултатот треба овој месец, а не за три.

Ако денес го побаравте името на мапата и најдовте ништо — или стар, непреземен профил со стари фотографии — нашата работа за [социјални мрежи и локална видливост](/marketing/social-media) почнува точно оттаму. А ако подлабокиот проблем е дека бизнисот не може да одржи ниеден канал бидејќи налогите, понудите и следењето живеат во главата на еден човек — тоа е разговор за [деловно консалтинг](/consulting/business-consulting).`

const titleEn = "Why your business doesn't show up on Google Maps — and how to fix it"
const titleMk = 'Зошто вашиот бизнис не се појавува на Google мапите — и како да го поправите'

const excerptEn =
  "When someone nearby searches what you sell, Google shows three businesses on the map. Most Macedonian SMEs aren't there — usually because nobody claimed the free listing. How to claim, verify and run the profile that decides who gets the call."

const excerptMk =
  'Кога некој во соседството бара она што вие го продавате, Google прикажува три бизниси на мапата. Повеќето македонски мали фирми ги нема — најчесто затоа што никој не го презел бесплатниот профил. Како да го преземете, верификувате и одржувате.'

const imageAltEn = 'Smartphone held over a cafe table showing a map application with location pins'
const imageAltMk = 'Смартфон над кафеана маса со апликација за мапи и локации означени на неа'

const PEXELS_QUERY = 'smartphone maps navigation street'

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
      en: ['google business profile', 'local seo', 'maps', 'reviews'],
      mk: ['Google Business Profile', 'локално SEO', 'мапи', 'препораки'],
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
      en: ['google business profile', 'local seo', 'maps', 'reviews'],
      mk: ['Google Business Profile', 'локално SEO', 'мапи', 'препораки'],
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
