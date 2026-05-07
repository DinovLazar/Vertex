import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

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
  try {
    const body = (await req.json()) as { tag?: string } | null
    if (body && typeof body.tag === 'string' && body.tag.length > 0) {
      tag = body.tag
    }
  } catch {
    // empty body is fine — fall back to 'blog'
  }

  // Next 16 `revalidateTag` requires a second arg. `'max'` invalidates
  // immediately (the old single-arg behavior) — matches our intent since
  // automation calls this only after it has already written a new post.
  revalidateTag(tag, 'max')
  return NextResponse.json({ ok: true, revalidated: tag })
}
