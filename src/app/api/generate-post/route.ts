import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { generateNextPost, type LogFn } from '@/lib/contentGenerator'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Vercel Hobby caps functions at 60s. On localhost the runtime ignores this;
 * Phase 13C keeps the budget at 60s on the assumption we stay on Hobby.
 * Opus generation can brush this limit — if we go to Pro, bump to 300.
 */
export const maxDuration = 60

/**
 * POST /api/generate-post
 *
 * Picks the next pending topic, runs the generator end-to-end, and streams the
 * log back to the dashboard via Server-Sent Events so Goran can watch it live.
 *
 * Auth: the `vertex-admin` cookie set by /admin/login must match ADMIN_PASSWORD.
 * Body: `{ publish?: boolean }` — default false (draft mode).
 */
export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const adminCookie = cookieStore.get('vertex-admin')?.value
  if (!process.env.VERTEX_ADMIN_PASSWORD || adminCookie !== process.env.VERTEX_ADMIN_PASSWORD) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const publish = body.publish === true
  const postToFacebook = body.postToFacebook === true
  const postToInstagram = body.postToInstagram === true
  const sendTelegramNotification = body.sendTelegramNotification !== false

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const log: LogFn = (level, msg) => {
        const line = `data: ${JSON.stringify({ level, msg, ts: Date.now() })}\n\n`
        controller.enqueue(encoder.encode(line))
      }

      try {
        const result = await generateNextPost({
          publish,
          postToFacebook,
          postToInstagram,
          sendTelegramNotification,
          log,
        })
        const done = `data: ${JSON.stringify({ level: 'done', result })}\n\n`
        controller.enqueue(encoder.encode(done))
      } catch (err: unknown) {
        const errLine = `data: ${JSON.stringify({
          level: 'error',
          msg: err instanceof Error ? err.message : String(err),
        })}\n\n`
        controller.enqueue(encoder.encode(errLine))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      Connection: 'keep-alive',
    },
  })
}
