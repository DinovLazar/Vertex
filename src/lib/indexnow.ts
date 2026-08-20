import { siteConfig } from '@/config/site'
import { routing } from '@/i18n/routing'

/**
 * IndexNow — push-based indexing.
 *
 * Normally you publish a page and wait days for a crawler to notice. IndexNow
 * inverts that: you tell the engines the moment a URL changes, and they fetch
 * it in minutes. One submission reaches Bing (and therefore Microsoft Copilot),
 * Yandex, Seznam and Naver — they share the same feed.
 *
 * Google does not participate. Google's equivalent is submitting the sitemap in
 * Search Console and letting ISR keep `lastModified` honest.
 *
 * Setup (one-time):
 *   1. Generate a key — any 8–128 character string of a-z, A-Z, 0-9 and `-`.
 *      `openssl rand -hex 16` produces a good one.
 *   2. Set `INDEXNOW_KEY` in Vercel's environment variables.
 *   3. Deploy. The key is then served at `/indexnow-key.txt`, which is the
 *      `keyLocation` sent with every submission — no file to upload manually.
 *
 * If `INDEXNOW_KEY` is unset, every function here no-ops quietly. Nothing
 * breaks; you simply don't get push indexing until the key exists.
 */

const ENDPOINT = 'https://api.indexnow.org/indexnow'

export function getIndexNowKey(): string | null {
  const key = process.env.INDEXNOW_KEY?.trim()
  return key && key.length >= 8 ? key : null
}

export function keyLocation(): string {
  return `${siteConfig.url}/indexnow-key.txt`
}

export interface IndexNowResult {
  submitted: number
  status: number | null
  skipped?: 'no-key' | 'no-urls'
}

/**
 * Submit absolute URLs. Silently capped at IndexNow's 10,000-URL batch limit.
 * Never throws — indexing is a best-effort side effect and must not fail the
 * publish flow that triggered it.
 */
export async function submitToIndexNow(
  urls: string[],
): Promise<IndexNowResult> {
  const key = getIndexNowKey()
  if (!key) return { submitted: 0, status: null, skipped: 'no-key' }

  const unique = [...new Set(urls)].filter((u) => u.startsWith(siteConfig.url))
  if (unique.length === 0) return { submitted: 0, status: null, skipped: 'no-urls' }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        // Derived from siteConfig.url, not siteConfig.domain: IndexNow
        // rejects a submission whose `host` does not match the host of the
        // URLs in `urlList`, and `domain` is the display form (no `www`)
        // while the URLs carry the canonical www host.
        host: new URL(siteConfig.url).host,
        key,
        keyLocation: keyLocation(),
        urlList: unique.slice(0, 10_000),
      }),
      cache: 'no-store',
    })
    // 200 and 202 both mean accepted. 403 means the key file didn't validate —
    // check that /indexnow-key.txt returns exactly the key and nothing else.
    return { submitted: unique.length, status: res.status }
  } catch {
    return { submitted: 0, status: null }
  }
}

/** Every locale variant of a locale-neutral path, e.g. '/blog/my-post'. */
export function localizedUrls(path: string): string[] {
  return routing.locales.map(
    (locale) => `${siteConfig.url}/${locale}${path === '/' ? '' : path}`,
  )
}
