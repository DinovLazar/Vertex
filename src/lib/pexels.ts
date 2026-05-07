/**
 * Minimal Pexels API helper.
 * Docs: https://www.pexels.com/api/documentation/
 *
 * Free tier: 200 req/hr, 20k/month. Blog generator uses 1/week — plenty of headroom.
 */

const PEXELS_SEARCH_URL = 'https://api.pexels.com/v1/search'

export interface PexelsPhoto {
  id: number
  url: string
  photographer: string
  photographer_url: string
  src: {
    original: string
    large2x: string
    large: string
    medium: string
    small: string
    portrait: string
    landscape: string
    tiny: string
  }
  alt: string
  width: number
  height: number
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[]
  total_results: number
  next_page?: string
}

/**
 * Search Pexels for a landscape photo matching the query.
 * Returns the top result or null if none found.
 * Throws if PEXELS_API_KEY is missing or the API returns non-2xx.
 */
export async function searchPexelsPhoto(query: string): Promise<PexelsPhoto | null> {
  const apiKey = process.env.VERTEX_PEXELS_API_KEY
  if (!apiKey) {
    throw new Error(
      'VERTEX_PEXELS_API_KEY is not set. Add it to .env.local and Vercel env vars.'
    )
  }

  const url = new URL(PEXELS_SEARCH_URL)
  url.searchParams.set('query', query)
  url.searchParams.set('orientation', 'landscape')
  url.searchParams.set('size', 'large')
  url.searchParams.set('per_page', '3')

  const res = await fetch(url, {
    headers: { Authorization: apiKey },
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Pexels API error ${res.status}: ${text.slice(0, 200)}`)
  }
  const data = (await res.json()) as PexelsSearchResponse
  return data.photos[0] ?? null
}

/**
 * Download the photo's large2x variant as a Buffer — ready to upload to Sanity.
 * large2x is ~1880px wide; that's the right size for featured-image display
 * without wasting bytes on original (often 4000px+).
 */
export async function downloadPexelsPhoto(photo: PexelsPhoto): Promise<Buffer> {
  const res = await fetch(photo.src.large2x, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`Failed to download Pexels image (${res.status})`)
  }
  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
