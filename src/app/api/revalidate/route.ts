import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { submitToIndexNow, localizedUrls } from '@/lib/indexnow'

/**
 * Tag-based revalidation webhook. Phase 13B/13C automation POSTs here after
 * creating or updating a blog post in Sanity so the public pages refresh
 * immediately instead of waiting for ISR's 60-second window.
 *
 * Auth: shared secret via `x-revalidate-secret` header.
 * Payload: `{ tag?: string }` — defaults to `'blog'`.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret')
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  let tag = 'blog'
  let slug: string | null = null
  try {
    const body = (await req.json()) as { tag?: string; slug?: string } | null
    if (body && typeof body.tag === 'string' && body.tag.length > 0) {
      tag = body.tag
    }
    if (body && typeof body.slug === 'string' && body.slug.length > 0) {
      slug = body.slug
    }
  } catch {
    // empty body is fine — fall back to 'blog'
  }

  // Next 16 `revalidateTag` requires a second arg. `'max'` invalidates
  // immediately (the old single-arg behavior) — matches our intent since
  // automation calls this only after it has already written a new post.
  revalidateTag(tag, 'max')

  // Push the changed URLs to IndexNow so Bing and Copilot pick them up in
  // minutes rather than days. Best-effort: `submitToIndexNow` never throws and
  // no-ops entirely when INDEXNOW_KEY is unset, so revalidation still succeeds.
  const urls = slug
    ? [...localizedUrls(`/blog/${slug}`), ...localizedUrls('/blog')]
    : localizedUrls('/blog')
  const indexNow = await submitToIndexNow(urls)

  return NextResponse.json({ ok: true, revalidated: tag, indexNow })
}
