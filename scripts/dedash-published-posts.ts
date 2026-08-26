/**
 * De-dash sweep for published Sanity blog posts (Lazar directive, 2026-08-26).
 * Applies hand-written replacements per span so bold/link marks survive.
 * Every replacement must match exactly once or the script aborts pre-write.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
for (const p of ['.env.local', 'env.local']) if (existsSync(p)) loadEnv({ path: p })
import { createClient } from '@sanity/client'

const c = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-10-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

type Span = { _type: 'span'; _key: string; text: string; marks: string[] }
type Block = { _type: 'block'; _key: string; style: string; markDefs: unknown[]; children: Span[] }

// [docId, locale, old, new]
const RULES: Array<[string, 'en' | 'mk', string, string]> = [
  // ---- AI tools post ----
  ['post-ai-tools-2026', 'en', 'businesses — and what', 'businesses, and what'],
  ['post-ai-tools-2026', 'en', 'moment — again — and business owners', 'moment (again), and business owners'],
  ['post-ai-tools-2026', 'en', ' — extracting data from invoices', ': extracting data from invoices'],
  ['post-ai-tools-2026', 'en', ' — AI-powered chat assistants', ': AI-powered chat assistants'],
  ['post-ai-tools-2026', 'en', ' — for reports, emails', ': for reports, emails'],
  ['post-ai-tools-2026', 'en', " — making your company's accumulated", ": making your company's accumulated"],
  ['post-ai-tools-2026', 'mk', 'бизниси — и што сѐ уште', 'бизниси, и што сѐ уште'],
  ['post-ai-tools-2026', 'mk', 'момент — повторно — а', 'момент (повторно), а'],
  ['post-ai-tools-2026', 'mk', ' — извлекувањето податоци', ': извлекувањето податоци'],
  ['post-ai-tools-2026', 'mk', ' — AI-напојувани чет асистенти', ': AI-напојувани чет асистенти'],
  ['post-ai-tools-2026', 'mk', ' — за извештаи, е-мејлови', ': за извештаи, е-мејлови'],
  ['post-ai-tools-2026', 'mk', ' — правење на акумулираното', ': правење на акумулираното'],
  ['post-ai-tools-2026', 'mk', 'горенаведеното — одете си', 'горенаведеното. Одете си'],
  // ---- IT infrastructure post ----
  ['post-it-infrastructure-ten-person-business', 'en', 'IT infrastructure — domain, DNS, hosting', 'IT infrastructure: domain, DNS, hosting'],
  ['post-it-infrastructure-ten-person-business', 'en', 'design it — you accumulated', 'design it; you accumulated'],
  ['post-it-infrastructure-ten-person-business', 'en', ' — the name customers type', ': the name customers type'],
  ['post-it-infrastructure-ten-person-business', 'en', ' — the records that tell', ': the records that tell'],
  ['post-it-infrastructure-ten-person-business', 'en', ' — whatever serves your website', ': whatever serves your website'],
  ['post-it-infrastructure-ten-person-business', 'en', ' — mailboxes, aliases', ': mailboxes, aliases'],
  ['post-it-infrastructure-ten-person-business', 'en', ' — where contracts, designs', ': where contracts, designs'],
  ['post-it-infrastructure-ten-person-business', 'en', ' — copies of all of the above', ': copies of all of the above'],
  ['post-it-infrastructure-ten-person-business', 'en', 'most damage — and the cause', 'most damage, and the cause'],
  ['post-it-infrastructure-ten-person-business', 'en', 'You get silence — and you conclude', 'You get silence, and you conclude'],
  ['post-it-infrastructure-ten-person-business', 'en', 'ten times larger — or they are', 'ten times larger, or they are'],
  ['post-it-infrastructure-ten-person-business', 'en', '— for most business sites in 2026', ': for most business sites in 2026'],
  ['post-it-infrastructure-ten-person-business', 'en', '— shared logins closed', ': shared logins closed'],
  ['post-it-infrastructure-ten-person-business', 'en', 'businesses — hosting, business email', 'businesses: hosting, business email'],
  ['post-it-infrastructure-ten-person-business', 'en', 'technical — nobody owning the list, no process when someone leaves — that is', 'technical (nobody owning the list, no process when someone leaves), that is'],
  ['post-it-infrastructure-ten-person-business', 'mk', 'IT инфраструктура — домен, DNS', 'IT инфраструктура: домен, DNS'],
  ['post-it-infrastructure-ten-person-business', 'mk', 'Не сте ја дизајнирале — ја акумулиравте', 'Не сте ја дизајнирале; ја акумулиравте'],
  ['post-it-infrastructure-ten-person-business', 'mk', ' — името што клиентите го пишуваат', ': името што клиентите го пишуваат'],
  ['post-it-infrastructure-ten-person-business', 'mk', ' — записите што му кажуваат', ': записите што му кажуваат'],
  ['post-it-infrastructure-ten-person-business', 'mk', ' — она што ја сервира', ': она што ја сервира'],
  ['post-it-infrastructure-ten-person-business', 'mk', ' — сандачиња, алијаси', ': сандачиња, алијаси'],
  ['post-it-infrastructure-ten-person-business', 'mk', ' — каде навистина живеат договорите', ': каде навистина живеат договорите'],
  ['post-it-infrastructure-ten-person-business', 'mk', ' — копии од сето погоре', ': копии од сето погоре'],
  ['post-it-infrastructure-ten-person-business', 'mk', 'најмногу штета — а причината', 'најмногу штета, а причината'],
  ['post-it-infrastructure-ten-person-business', 'mk', 'Добивате тишина — и заклучувате', 'Добивате тишина, и заклучувате'],
  ['post-it-infrastructure-ten-person-business', 'mk', 'десет пати поголема — или се на најевтиниот', 'десет пати поголема, или се на најевтиниот'],
  ['post-it-infrastructure-ten-person-business', 'mk', '— за повеќето бизнис страници во 2026', ': за повеќето бизнис страници во 2026'],
  ['post-it-infrastructure-ten-person-business', 'mk', '— споделените сметки затворени', ': споделените сметки затворени'],
  ['post-it-infrastructure-ten-person-business', 'mk', 'македонски бизниси — хостинг, деловен', 'македонски бизниси: хостинг, деловен'],
  ['post-it-infrastructure-ten-person-business', 'mk', 'технички — никој не го држи списокот, нема процес кога некој заминува — тоа е разговор', 'технички (никој не го држи списокот, нема процес кога некој заминува), тоа е разговор'],
  // ---- Website costing post ----
  ['post-website-costing-customers', 'en', 'mobile-hostile — and their owners', 'mobile-hostile, and their owners'],
  ['post-website-costing-customers', 'en', 'risen dramatically — and most Macedonian', 'risen dramatically, and most Macedonian'],
  ['post-website-costing-customers', 'en', 'phone — slow to load, awkward to navigate, text too small to read — you are losing', 'phone (slow to load, awkward to navigate, text too small to read), you are losing'],
  ['post-website-costing-customers', 'en', 'minor issue — it means most', 'minor issue. It means most'],
  ['post-website-costing-customers', 'en', 'none of this — resulting in visitors', 'none of this, resulting in visitors'],
  ['post-website-costing-customers', 'mk', 'мобилни уреди — а сопствениците', 'мобилни уреди, а сопствениците'],
  ['post-website-costing-customers', 'mk', 'се подигна — а повеќето', 'се подигна, а повеќето'],
  ['post-website-costing-customers', 'mk', 'телефон — се вчитува бавно, се навигира незгодно, текстот е премал за читање — ги губите', 'телефон (се вчитува бавно, се навигира незгодно, текстот е премал за читање), ги губите'],
  ['post-website-costing-customers', 'mk', 'мал проблем — тоа значи', 'мал проблем. Тоа значи'],
  ['post-website-costing-customers', 'mk', 'нема — што резултира со посетители', 'нема, што резултира со посетители'],
  // ---- Workflow overhaul post ----
  ['post-workflow-overhaul', 'en', 'your processes — not your people', 'your processes, not your people'],
  ['post-workflow-overhaul', 'en', 'three people — it collapses', 'three people; it collapses'],
  ['post-workflow-overhaul', 'en', 'clear criteria — not based on', 'clear criteria, not based on'],
  ['post-workflow-overhaul', 'en', 'getting better — the work is not structured', 'getting better, the work is not structured'],
  ['post-workflow-overhaul', 'en', 'happening — missed deadlines, quality problems, lost information — no amount', 'happening (missed deadlines, quality problems, lost information), no amount'],
  ['post-workflow-overhaul', 'en', ' — see our ', '; see our '],
  ['post-workflow-overhaul', 'mk', 'во процесите — не во луѓето', 'во процесите, не во луѓето'],
  ['post-workflow-overhaul', 'mk', 'тројца луѓе — пропаѓа', 'тројца луѓе; пропаѓа'],
  ['post-workflow-overhaul', 'mk', 'јасни критериуми — не врз основа', 'јасни критериуми, не врз основа'],
  ['post-workflow-overhaul', 'mk', 'не се подобрува — работата не е правилно', 'не се подобрува, работата не е правилно'],
  ['post-workflow-overhaul', 'mk', 'Ако одговорот е не — бизнисот', 'Ако одговорот е не, бизнисот'],
  ['post-workflow-overhaul', 'mk', 'се случува — пропуштени рокови, проблеми со квалитет, изгубени информации — ниту', 'се случува (пропуштени рокови, проблеми со квалитет, изгубени информации), ниту'],
  ['post-workflow-overhaul', 'mk', 'вид работа — видете ја', 'вид работа; видете ја'],
]

const DOC_IDS = [
  'post-ai-tools-2026',
  'post-it-infrastructure-ten-person-business',
  'post-website-costing-customers',
  'post-workflow-overhaul',
]

function applyToText(text: string, rules: typeof RULES): { text: string; hits: number } {
  let out = text
  let hits = 0
  for (const [, , old, newer] of rules) {
    while (out.includes(old)) {
      out = out.replace(old, newer)
      hits++
    }
  }
  return { text: out, hits }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')

  // Pass 1: count matches before writing anything.
  const counts = new Map<string, number>()
  const docsCache = new Map<string, { title?: Record<string, string>; excerpt?: Record<string, string>; body?: Record<string, Block[]> }>()
  for (const id of DOC_IDS) counts.set(id, 0)

  for (const id of DOC_IDS) {
    const doc = await c.fetch(`*[_id == $id][0]{title, excerpt, body}`, { id })
    if (!doc) {
      console.error(`MISSING DOC ${id}`)
      process.exit(1)
    }
    docsCache.set(id, doc)
    for (const loc of ['en', 'mk'] as const) {
      const rules = RULES.filter(([, l]) => l === loc)
      const t = doc.title?.[loc] ?? ''
      const ex = doc.excerpt?.[loc] ?? ''
      let found = 0
      found += applyToText(t, rules).hits
      found += applyToText(ex, rules).hits
      for (const b of (doc.body?.[loc] ?? []) as Block[]) {
        for (const s of b.children ?? []) {
          found += applyToText(s.text ?? '', rules).hits
        }
      }
      counts.set(id, (counts.get(id) ?? 0) + found)
    }
  }

  console.log('Match counts:', Object.fromEntries(counts))
  // per-rule hit tally
  const tally = new Map<string, number>()
  for (const id of DOC_IDS) {
    const doc = docsCache.get(id)!
    for (const loc of ['en', 'mk'] as const) {
      const texts = [doc.title?.[loc] ?? '', doc.excerpt?.[loc] ?? '']
      for (const b of (doc.body?.[loc] ?? []) as Block[]) for (const s of b.children ?? []) texts.push(s.text ?? '')
      for (const rule of RULES) {
        if (rule[1] !== loc) continue
        const o = rule[2]
        const hits = texts.reduce((a, t) => a + t.split(o).length - 1, 0)
        tally.set(`${rule[1]}|${o.slice(0, 40)}`, (tally.get(`${rule[1]}|${o.slice(0, 40)}`) ?? 0) + hits)
      }
    }
  }
  for (const [k, v] of tally) if (v === 0) console.log(`UNMATCHED ${JSON.stringify(k)}`)
  const total = [...counts.values()].reduce((a, b) => a + b, 0)
  const unmatched = RULES.length - total
  console.log(`rules=${RULES.length} matched=${total} unmatched=${unmatched}`)
  if (unmatched !== 0) {
    console.error('Some rules did not match — aborting without writing.')
    process.exit(1)
  }

  if (dryRun) {
    console.log('--dry-run: no writes.')
    return
  }

  // Pass 2: write.
  for (const id of DOC_IDS) {
    const doc = await c.fetch(`*[_id == $id][0]{title, excerpt, body}`, { id })
    const patch: Record<string, unknown> = {}
    let changed = false

    const title: Record<string, string> = {}
    const excerpt: Record<string, string> = {}
    const body: Record<string, Block[]> = {}

    for (const loc of ['en', 'mk'] as const) {
      const rules = RULES.filter(([, l]) => l === loc)
      const t = applyToText(doc.title?.[loc] ?? '', rules)
      const e = applyToText(doc.excerpt?.[loc] ?? '', rules)
      if (t.hits || e.hits) changed = true
      title[loc] = t.text
      excerpt[loc] = e.text

      const blocks = (doc.body?.[loc] ?? []) as Block[]
      body[loc] = blocks.map((b) => ({
        ...b,
        children: (b.children ?? []).map((s) => ({ ...s, text: applyToText(s.text ?? '', rules).text })),
      }))
    }

    patch.title = { ...doc.title, _type: 'localizedString', ...title }
    patch.excerpt = { ...doc.excerpt, _type: 'localizedText', ...excerpt }
    patch.body = { ...doc.body, _type: 'localizedPortableText', ...body }

    if (!changed) {
      console.log(`${id}: nothing to change`)
      continue
    }
    await c.patch(id).set(patch).commit()
    console.log(`${id}: patched`)
  }

  console.log('done')
}

main().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
