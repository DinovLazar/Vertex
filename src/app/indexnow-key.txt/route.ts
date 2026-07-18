import { getIndexNowKey } from '@/lib/indexnow'

/**
 * Serves the IndexNow key file at `/indexnow-key.txt`.
 *
 * The spec lets you host the key anywhere on the same host as long as you pass
 * that URL as `keyLocation` with each submission, which is what
 * `src/lib/indexnow.ts` does. Serving it from an env var beats committing a
 * `{key}.txt` file: the key never enters git, and rotating it is an
 * environment-variable change rather than a deploy.
 *
 * The response body must be the key and nothing else — no newline, no BOM, no
 * whitespace. A 403 from IndexNow almost always means this file didn't match.
 */

export const dynamic = 'force-static'
export const revalidate = 86_400

export function GET() {
  const key = getIndexNowKey()
  if (!key) {
    return new Response('IndexNow key not configured', { status: 404 })
  }
  return new Response(key, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
