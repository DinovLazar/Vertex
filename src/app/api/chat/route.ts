import { NextRequest } from 'next/server'
import { streamAIResponse, type ChatMessage } from '@/lib/ai'
import { buildSystemPrompt, type ChatLocale } from '@/lib/chatWidget'

// Force Node.js runtime — the Anthropic SDK needs Node APIs, not the Edge runtime
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Per-session guard against abuse. Client also enforces this; server is a second line of defense.
const MAX_MESSAGES_PER_REQUEST = 40
const MAX_MESSAGE_LENGTH = 2000

interface ChatRequestBody {
  messages: ChatMessage[]
  pageUrl: string
  locale: ChatLocale
}

export async function POST(req: NextRequest) {
  // Kill switch
  if (process.env.NEXT_PUBLIC_CHAT_ENABLED === 'false') {
    return new Response('Chat disabled', { status: 503 })
  }

  let body: ChatRequestBody
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const { messages, pageUrl, locale } = body

  // Validate
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response('messages required', { status: 400 })
  }
  if (messages.length > MAX_MESSAGES_PER_REQUEST) {
    return new Response('Too many messages', { status: 400 })
  }
  for (const m of messages) {
    if (typeof m.content !== 'string' || m.content.length > MAX_MESSAGE_LENGTH) {
      return new Response('Invalid message content', { status: 400 })
    }
    if (m.role !== 'user' && m.role !== 'assistant') {
      return new Response('Invalid message role', { status: 400 })
    }
  }
  if (locale !== 'en' && locale !== 'mk') {
    return new Response('Invalid locale', { status: 400 })
  }
  if (typeof pageUrl !== 'string') {
    return new Response('Invalid pageUrl', { status: 400 })
  }

  const systemPrompt = buildSystemPrompt({ pageUrl, locale })

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamAIResponse(messages, systemPrompt)) {
          controller.enqueue(encoder.encode(chunk))
        }
        controller.close()
      } catch (err) {
        console.error('Chat stream error:', err)
        controller.error(err)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}
