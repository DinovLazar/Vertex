/**
 * Backfills featured images onto the three original seeded blog posts.
 *
 * `scripts/seed-blog.ts` migrated the three mock posts before Phase 13B existed,
 * so none of them ever got a `featuredImage` — they were the only posts on the
 * site rendering without one (BlogCard and the post hero both fall back
 * gracefully, but the cards read as second-class next to the generated posts,
 * and `BlogPosting.image` in the JSON-LD was falling back to the generic
 * `/opengraph-image` for all three).
 *
 * Unlike the generator, this does NOT search Pexels at run time. Each photo was
 * picked by eye from several candidate sets and is pinned by **photo ID**, so
 * this script is deterministic: re-running can never silently swap in whatever
 * Pexels currently ranks first for a query.
 *
 * Idempotent and non-destructive: posts that already have a `featuredImage` are
 * skipped, and the write is a `.patch()` of the single `featuredImage` field —
 * never a `createOrReplace` of a document this script did not author.
 *
 * Usage:
 *   npx tsx scripts/backfill-blog-images.ts               # backfill what's missing
 *   npx tsx scripts/backfill-blog-images.ts --dry-run     # report only, no writes
 *   npx tsx scripts/backfill-blog-images.ts --force       # re-upload + overwrite existing
 *   npx tsx scripts/backfill-blog-images.ts --no-revalidate
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'

// See `publish-post-it-infrastructure.ts` — this machine carries the env in
// `env.local`, not the documented `.env.local`.
for (const path of ['.env.local', 'env.local']) {
  if (existsSync(path)) {
    loadEnv({ path })
    break
  }
}

import { createClient } from '@sanity/client'
import { downloadPexelsPhoto, type PexelsPhoto } from '../src/lib/pexels'
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

interface Backfill {
  postId: string
  /** For log output only — the real lookup is by `postId`. */
  label: string
  /** Pexels photo ID, chosen by eye. See the session writeup for why each one. */
  photoId: number
  alt: { en: string; mk: string }
}

/**
 * MK alt text follows the house conventions in TRANSLATION_NOTES.md: tech and
 * product terms stay Latin (`Kanban`, `email`-family words use the site's
 * „е-мејл" form), everything else is Cyrillic.
 */
const BACKFILLS: Backfill[] = [
  {
    postId: 'post-workflow-overhaul',
    label: 'Five signs your business needs a workflow overhaul (consulting)',
    // Kanban board chalked onto dark brick: ICE BOX / In progress / Emergency /
    // Testing / Complete. Literally a workflow, and the dark frame sits well
    // against the consulting division's dark theme.
    photoId: 6804093,
    alt: {
      en: 'A kanban board on a dark brick wall, sticky notes arranged in columns for each stage of work',
      mk: 'Kanban табла на ѕид од темна цигла, со ливчиња распоредени во колони за секоја фаза од работата',
    },
  },
  {
    postId: 'post-website-costing-customers',
    label: 'Why your business website is probably costing you customers (marketing)',
    // Someone holding a phone up against the same site open on a laptop —
    // exactly the "open your own site on your phone right now" test the post asks for.
    photoId: 5839461,
    alt: {
      en: 'A person checking the same website on a smartphone and a laptop side by side',
      mk: 'Лице што ја проверува истата веб страница на телефон и на лаптоп еден до друг',
    },
  },
  {
    postId: 'post-ai-tools-2026',
    label: 'The practical guide to AI tools for small business in 2026 (shared)',
    // Laptop, printed documents, notebook and phone on a desk. The post's
    // strongest use case is document processing, so paperwork beats a robot.
    photoId: 7679173,
    alt: {
      en: 'A desk with an open laptop, printed documents, a notebook and a phone during a working session',
      mk: 'Работна маса со отворен лаптоп, печатени документи, тетратка и телефон во текот на работна сесија',
    },
  },
]

/**
 * Fetch one specific Pexels photo by ID. `src/lib/pexels.ts` only exposes
 * search (the generator picks whatever ranks first); pinning by ID is what
 * makes this script deterministic, so the lookup lives here.
 */
async function fetchPexelsPhotoById(id: number): Promise<PexelsPhoto> {
  const apiKey = process.env.VERTEX_PEXELS_API_KEY
  if (!apiKey) {
    throw new Error('VERTEX_PEXELS_API_KEY is not set. Add it to .env.local (or env.local).')
  }
  const res = await fetch(`https://api.pexels.com/v1/photos/${id}`, {
    headers: { Authorization: apiKey },
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Pexels photo ${id} lookup failed: ${res.status} ${await res.text()}`)
  }
  return (await res.json()) as PexelsPhoto
}

interface PostRow {
  _id: string
  title: string
  hasImage: boolean
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const force = process.argv.includes('--force')

  console.log(`Target project=${projectId} dataset=${dataset}`)
  if (dryRun) console.log('--dry-run: no writes will be performed\n')

  const credits: string[] = []
  let written = 0

  for (const item of BACKFILLS) {
    const post = await client.fetch<PostRow | null>(
      `*[_id == $id][0]{ _id, "title": title.en, "hasImage": defined(featuredImage.asset) }`,
      { id: item.postId }
    )

    if (!post) {
      console.warn(`SKIP ${item.postId} — not found in this dataset`)
      continue
    }

    console.log(`${post.title}`)

    if (post.hasImage && !force) {
      console.log('  already has a featured image — skipped (use --force to replace)\n')
      continue
    }

    const photo = await fetchPexelsPhotoById(item.photoId)
    console.log(`  pexels ${photo.id} by ${photo.photographer} — ${photo.width}x${photo.height}`)

    if (dryRun) {
      console.log('  would upload + patch featuredImage\n')
      continue
    }

    const buffer = await downloadPexelsPhoto(photo)
    const asset = await client.assets.upload('image', buffer, {
      filename: `pexels-${photo.id}.jpg`,
      contentType: 'image/jpeg',
    })

    // Patch only `featuredImage`. Everything else on these documents was
    // authored elsewhere and must survive untouched.
    await client
      .patch(item.postId)
      .set({
        featuredImage: {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id },
          alt: { _type: 'localizedString', en: item.alt.en, mk: item.alt.mk },
        },
      })
      .commit()

    console.log(`  patched featuredImage -> ${asset._id}\n`)
    credits.push(`${photo.photographer} — ${photo.url}`)
    written++
  }

  if (!dryRun && written > 0 && !process.argv.includes('--no-revalidate')) {
    const target = process.env.REVALIDATE_TARGET_URL || siteConfig.url
    const secret = process.env.REVALIDATE_SECRET
    if (!secret) {
      console.warn('REVALIDATE_SECRET missing — skipped cache flush (ISR catches up in ~60s)')
    } else {
      try {
        const res = await fetch(`${target}/api/revalidate`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-revalidate-secret': secret },
          body: JSON.stringify({ tag: 'blog' }),
        })
        console.log(`revalidate ${target} -> ${res.status} ${(await res.text()).slice(0, 160)}`)
      } catch (err) {
        console.warn(`revalidate call failed (non-fatal): ${(err as Error).message}`)
      }
    }
  }

  console.log(`\nDone. ${written} post(s) updated.`)
  if (credits.length) {
    console.log('Image credits (Pexels licence — attribution appreciated, not required):')
    for (const c of credits) console.log(`  ${c}`)
  }
}

main().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
