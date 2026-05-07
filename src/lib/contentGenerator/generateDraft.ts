import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt } from './buildPrompt'
import { toolSchema, TOOL_NAME, type GeneratedPost } from './toolSchema'

/**
 * Opus 4.7 for long-form bilingual output. Upgrade-friendly — change this one line.
 * Haiku would be too dumb for nuanced brand voice; Sonnet is fine but slightly lower
 * quality on 1000-word bilingual posts than Opus.
 */
const MODEL = 'claude-opus-4-7'

/**
 * 16k tokens because PT-JSON structural overhead + bilingual Cyrillic + tool-use
 * framing roughly triple the raw word count. An empirical run with `max_tokens=8000`
 * hit the cap mid-output (only `body` + `excerpt` populated, no `title`). Opus 4.x
 * supports >8192 only with the long-output beta header — applied below.
 */
const MAX_TOKENS = 16_000

/** Opus is slower than Sonnet. 3 minutes is ample for a long-form bilingual post. */
const TIMEOUT_MS = 180_000

/**
 * The blog generator REQUIRES a real API key (`sk-ant-api03-...`). The Claude Code
 * OAuth token in `ANTHROPIC_AUTH_TOKEN` 401s on direct Messages API calls — that
 * token is reserved for the chat widget (`src/lib/ai.ts`, Phase 12). We pass
 * `apiKey` explicitly so the SDK never silently falls back to the OAuth token.
 */
function createAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY is not set. The blog generator needs a real API key from console.anthropic.com — the OAuth token (ANTHROPIC_AUTH_TOKEN) does not work for programmatic Messages API calls.'
    )
  }
  // Long-output beta lets Opus 4.x generate up to 64k output tokens. Without it,
  // max_tokens > 8192 returns an API error. Safe with regular API keys.
  return new Anthropic({
    apiKey,
    defaultHeaders: { 'anthropic-beta': 'output-128k-2025-02-19' },
  })
}

interface GenerateArgs {
  topicTitleEn: string
  topicTitleMk: string
  topicDescriptionEn?: string
  topicDescriptionMk?: string
  division: 'consulting' | 'marketing' | 'shared'
  targetService?: string
  authorName: string
  authorRoleEn: string
}

export async function generateDraft(args: GenerateArgs): Promise<GeneratedPost> {
  const anthropic = createAnthropicClient()
  const systemPrompt = buildSystemPrompt(args)

  const response = await anthropic.messages.create(
    {
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      tools: [toolSchema as unknown as Anthropic.Tool],
      tool_choice: { type: 'tool', name: TOOL_NAME },
      messages: [
        {
          role: 'user',
          content: `Write the blog post now. Call the ${TOOL_NAME} tool exactly once with the final post.`,
        },
      ],
    },
    { timeout: TIMEOUT_MS }
  )

  const toolUseBlock = response.content.find(
    (block): block is Anthropic.ToolUseBlock =>
      block.type === 'tool_use' && block.name === TOOL_NAME
  )

  if (!toolUseBlock) {
    const blockTypes = response.content.map((b) => b.type).join(',') || '(empty)'
    const firstTextSnippet = response.content
      .find((b) => b.type === 'text')
      ?.text?.slice(0, 300)
    throw new Error(
      `Claude did not call the ${TOOL_NAME} tool. stop_reason=${response.stop_reason}; usage=${JSON.stringify(response.usage)}; blocks=[${blockTypes}]; firstText=${firstTextSnippet ?? 'none'}`
    )
  }

  const generated = (toolUseBlock.input ?? {}) as Partial<GeneratedPost>

  // Defensive shape checks. tool_use *should* give us valid JSON matching the
  // schema, but Claude can occasionally truncate when the post + reasoning
  // tokens exceed max_tokens. We log enough context to tell those cases apart.
  const diag = `stop_reason=${response.stop_reason}; usage=${JSON.stringify(response.usage)}; topKeys=[${Object.keys(generated).join(',') || '(none)'}]`

  if (!generated.title?.en || !generated.title?.mk) {
    const sample = generated.title === undefined ? 'undefined' : JSON.stringify(generated.title).slice(0, 200)
    throw new Error(`Generated post missing title. ${diag}; title=${sample}`)
  }
  if (!generated.body?.en?.length || !generated.body?.mk?.length) {
    throw new Error(
      `Generated post missing body. ${diag}; enBlocks=${generated.body?.en?.length ?? 'undef'}; mkBlocks=${generated.body?.mk?.length ?? 'undef'}`
    )
  }

  return generated as GeneratedPost
}
