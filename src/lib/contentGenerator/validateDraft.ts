import type { PortableTextBlock, PortableTextSpan } from '@portabletext/types'
import type { GeneratedPost } from './toolSchema'

export interface ValidationResult {
  ok: boolean
  errors: string[]
}

function countWordsInPT(blocks: PortableTextBlock[]): number {
  let count = 0
  for (const block of blocks) {
    if (block._type !== 'block' || !Array.isArray(block.children)) continue
    for (const child of block.children) {
      const span = child as PortableTextSpan
      if (span._type === 'span' && typeof span.text === 'string') {
        count += span.text.trim().split(/\s+/).filter(Boolean).length
      }
    }
  }
  return count
}

function countH2s(blocks: PortableTextBlock[]): number {
  return blocks.filter((b) => b._type === 'block' && b.style === 'h2').length
}

function flattenPTText(blocks: PortableTextBlock[]): string {
  return blocks
    .map((b) =>
      (Array.isArray(b.children) ? b.children : [])
        .map((c) => ((c as PortableTextSpan).text ?? ''))
        .join('')
    )
    .join(' ')
}

/**
 * Quality gates that run after Claude returns. Anything here that fails marks the
 * topic as `failed` in Sanity so the cron in 13C doesn't retry broken topics in a loop.
 */
export function validateDraft(draft: GeneratedPost): ValidationResult {
  const errors: string[] = []

  // Title
  if (draft.title.en.length < 10) errors.push('EN title too short')
  if (draft.title.mk.length < 10) errors.push('MK title too short')

  // Slug
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug)) {
    errors.push('Slug invalid format')
  }
  if (draft.slug.length < 5 || draft.slug.length > 80) {
    errors.push('Slug length out of range')
  }

  // Excerpt
  if (draft.excerpt.en.length < 60 || draft.excerpt.en.length > 300) {
    errors.push(`EN excerpt length ${draft.excerpt.en.length} out of range (60-300)`)
  }
  if (draft.excerpt.mk.length < 60 || draft.excerpt.mk.length > 300) {
    errors.push(`MK excerpt length ${draft.excerpt.mk.length} out of range (60-300)`)
  }

  // Body word counts
  const enWords = countWordsInPT(draft.body.en)
  const mkWords = countWordsInPT(draft.body.mk)
  if (enWords < 500) errors.push(`EN body too short: ${enWords} words (min 500)`)
  if (enWords > 1500) errors.push(`EN body too long: ${enWords} words (max 1500)`)
  if (mkWords < 400) errors.push(`MK body too short: ${mkWords} words (min 400)`)
  if (mkWords > 1500) errors.push(`MK body too long: ${mkWords} words (max 1500)`)

  // H2 structure
  const enH2s = countH2s(draft.body.en)
  const mkH2s = countH2s(draft.body.mk)
  if (enH2s < 2) errors.push(`EN body has ${enH2s} h2 headings, need at least 2`)
  if (mkH2s < 2) errors.push(`MK body has ${mkH2s} h2 headings, need at least 2`)

  // Tags
  if (draft.tags.en.length < 3 || draft.tags.en.length > 5) {
    errors.push('EN tags count out of range (3-5)')
  }
  if (draft.tags.mk.length < 3 || draft.tags.mk.length > 5) {
    errors.push('MK tags count out of range (3-5)')
  }

  // Read time
  if (draft.readTime < 3 || draft.readTime > 15) {
    errors.push(`Read time ${draft.readTime} out of range (3-15)`)
  }

  // Pexels query
  if (draft.pexelsQuery.length < 5 || draft.pexelsQuery.length > 60) {
    errors.push('Pexels query length out of range')
  }

  // Image alt
  if (draft.imageAlt.en.length < 20 || draft.imageAlt.mk.length < 20) {
    errors.push('Image alt text too short')
  }

  // Banned-phrase check on the EN body. Case-insensitive substring match.
  const bannedPhrases = [
    'unleash',
    'leverage',
    'synergy',
    'ecosystem',
    'revolutionize',
    "in today's fast-paced",
  ]
  const enText = flattenPTText(draft.body.en).toLowerCase()
  for (const phrase of bannedPhrases) {
    if (enText.includes(phrase)) {
      errors.push(`EN body contains banned phrase: "${phrase}"`)
    }
  }

  return { ok: errors.length === 0, errors }
}
