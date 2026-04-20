/**
 * AI provider abstraction layer.
 *
 * All AI calls in the project flow through this file. Switching from Claude API
 * to a self-hosted Ollama instance requires only changing the AI_PROVIDER env var —
 * no component or API route changes.
 *
 * See D-07c (AI Infrastructure Strategy) for the migration plan.
 */

export type AiProvider = 'claude' | 'ollama'
export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

const AI_PROVIDER = (process.env.AI_PROVIDER || 'claude') as AiProvider

// Claude config
const CLAUDE_MODEL = 'claude-sonnet-4-6'
const CLAUDE_MAX_TOKENS = 400

// Ollama config (used only when AI_PROVIDER === 'ollama')
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b'

/**
 * Stream an AI response as an async iterable of text chunks.
 * Both Claude and Ollama support token streaming — the return shape is identical.
 */
export async function* streamAIResponse(
  messages: ChatMessage[],
  systemPrompt: string,
): AsyncGenerator<string, void, unknown> {
  if (AI_PROVIDER === 'ollama') {
    yield* streamOllama(messages, systemPrompt)
    return
  }
  yield* streamClaude(messages, systemPrompt)
}

// --- Claude ---

async function* streamClaude(
  messages: ChatMessage[],
  systemPrompt: string,
): AsyncGenerator<string, void, unknown> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const client = new Anthropic()

  const stream = client.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: CLAUDE_MAX_TOKENS,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text
    }
  }
}

// --- Ollama (for future migration) ---

async function* streamOllama(
  messages: ChatMessage[],
  systemPrompt: string,
): AsyncGenerator<string, void, unknown> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: true,
    }),
  })

  if (!response.body) return

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    // Ollama streams line-delimited JSON
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const json = JSON.parse(line)
        if (json.message?.content) {
          yield json.message.content as string
        }
      } catch {
        // Skip malformed lines
      }
    }
  }
}
