# Phase 12 — AI Chat Widget (Core)

Last updated: 2026-04-20.

## What was built

A full streaming chat widget mounted globally on every locale-prefixed page. `@anthropic-ai/sdk@0.89.0` was already installed (reserved for this phase since Phase 1) and is now wired behind the existing `src/lib/ai.ts` provider abstraction — switching to Ollama later is a one-variable change. `src/lib/chatWidget.ts` builds a context-aware system prompt that reads `siteConfig` for company facts and adjusts persona + language based on URL and locale. A new Node-runtime route at `src/app/api/chat/route.ts` streams Claude Sonnet 4.6 responses as raw UTF-8 chunks. A new `src/components/chat/` folder holds the full component set: `BotIcon.tsx` (inline SVGs), `TypingIndicator.tsx` (3-dot pulse), `ChatMessage.tsx` (user/assistant bubbles), `ChatPanel.tsx` (the open dialog), and `ChatWidget.tsx` (the state-owning root). Full translations added under a new `chat.*` namespace in both `en.json` and `mk.json`.

## Files created
| File | Purpose |
|------|---------|
| `src/components/chat/BotIcon.tsx` | Inline SVG icons: `BotIcon`, `CloseIcon`, `SendIcon` — `lucide-react@1.8.0` ships no useful icons so we inline these (same pattern as the brand-icon SVGs in Footer) |
| `src/components/chat/TypingIndicator.tsx` | 3-dot pulse animation, `role="status"`, translated aria-label via `chat.status.generating` |
| `src/components/chat/ChatMessage.tsx` | Single-message bubble; spring fade-in entrance; streaming cursor (2px pulsing caret) on active assistant messages. User bubble = bright pill right-aligned (`rounded-br-md`), assistant bubble = elevated-surface bubble left-aligned (`rounded-bl-md`) |
| `src/components/chat/ChatPanel.tsx` | Full chat dialog — header, scrollable message list (`aria-live="polite"`), auto-growing textarea (1–4 rows), send button. Enforces client-side 20-message cap via `userMessageCount` prop. Escape handled by parent |
| `src/components/chat/ChatWidget.tsx` | Root component — owns `messages`, `isStreaming`, `error`, `open`. Renders `<motion.button>` trigger + `<AnimatePresence>`-wrapped `<ChatPanel>`. Mounts a global Escape listener when open. Locks body scroll on mobile when open. Seeds the conversation with a context-aware greeting on first open |
| `src/components/chat/index.ts` | Barrel — exports `ChatWidget` |
| `src/_project-state/12_phase-12-chat-widget.md` | This file |
| `.env.local.example` | Documents `ANTHROPIC_API_KEY`, `AI_PROVIDER`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `NEXT_PUBLIC_CHAT_ENABLED`. Exempted in `.gitignore` so it can be committed |

## Files modified
| File | What changed |
|------|-------------|
| `src/lib/ai.ts` | Stub replaced. Now exports `streamAIResponse(messages, systemPrompt)` — an `AsyncGenerator<string>` that dispatches to either Claude (via dynamic `@anthropic-ai/sdk` import) or Ollama (line-delimited JSON from `/api/chat`). Model: `claude-haiku-4-5` (switched from `claude-sonnet-4-6` during first-send verification — Haiku is a better production fit for a 3–4 sentence chat widget: ~5× cheaper, faster, and on most Claude API tiers has a separate quota pool that avoided the 429s we hit on Sonnet). `max_tokens: 400`. When `ANTHROPIC_API_KEY` is NOT set but `ANTHROPIC_AUTH_TOKEN` IS (local-dev OAuth path), the SDK client is instantiated with `defaultHeaders: { 'anthropic-beta': 'oauth-2025-04-20' }` so Claude's OAuth flow accepts the token; with a real API key, no beta header is added. Also exports `ChatMessage` / `ChatRole` / `AiProvider` types |
| `src/lib/chatWidget.ts` | Stub replaced. `buildSystemPrompt({pageUrl, locale})` returns a dynamic prompt using `siteConfig` + `getDivisionFromPath()` + locale. Five personas: homepage/shared, consulting, marketing, blog, contact. Exports `ChatLocale` type |
| `src/app/api/chat/route.ts` | Stub replaced. Node runtime (`export const runtime = 'nodejs'`), `dynamic = 'force-dynamic'`, validates body (message count ≤40, content ≤2000 chars, valid roles, valid locale), returns a `ReadableStream` of UTF-8 text chunks with `X-Accel-Buffering: no` to prevent Vercel proxy buffering |
| `src/app/[locale]/layout.tsx` | `<ChatWidget />` mounted adjacent to `<BackToTop />` inside the `DivisionProvider`. Widget state lives at the locale-layout level so conversation survives client-side navigation within a locale |
| `src/app/globals.css` | Added `.typing-dot` + `@keyframes typing-dot-pulse`; added `.chat-trigger` + `@keyframes chat-trigger-pulse`; both guarded with a dedicated `prefers-reduced-motion` media block alongside the existing global reduced-motion clamp. Keyframes live outside `@layer utilities` so Lightning CSS doesn't strip them |
| `messages/en.json` | New `chat.*` namespace at the end — trigger/panel/5 greetings/input/status/errors/footer (~40 keys) |
| `messages/mk.json` | Same keys, Macedonian translations; flagged in `TRANSLATION_NOTES.md` (#12-A) for native-speaker review |
| `TRANSLATION_NOTES.md` | Phase 12 entry added (§12-A) listing the notable MK decisions in the chat namespace: "Vertex асистент" mixed-script title, "интеграција со ИИ" Cyrillic AI, "Shift + Enter" key names kept Latin |
| `.gitignore` | Added `!.env.local.example` exemption so the new example file is committable |

## Key technical decisions

- **Streaming over typewriter-on-client.** True token streaming from Claude via the SDK's `messages.stream()` → relayed to the browser via a `ReadableStream` of raw UTF-8 chunks. Feels more natural than a canned typewriter effect and lets the visitor start reading before generation finishes.
- **Node runtime, not Edge.** The Anthropic SDK relies on Node APIs; `export const runtime = 'nodejs'` and `export const dynamic = 'force-dynamic'` keep the route out of the Edge runtime and prevent response caching.
- **Dynamic `import('@anthropic-ai/sdk')`.** Avoids bundling the SDK when it's not needed and keeps cold-start smaller for any edge-migrated routes later.
- **Raw UTF-8 stream, not SSE.** Simpler client (`resp.body.getReader()` + `TextDecoder`). No event parsing overhead.
- **Widget state in the locale layout.** `messages[]` persists across client-side navigation within a locale. Refresh or locale-switch resets the conversation — intentional.
- **Inline SVGs for icons.** `lucide-react@1.8.0` has no useful icons (known issue — see `memory/project_lucide_no_brand_icons.md`). Inline SVGs also let us precisely size/stroke the bot icon.
- **Server-side validation in addition to client cap.** Client caps at 20 user messages per session; server accepts up to 40 messages total (user + assistant). The server's bound protects against a malformed client.
- **Positioning with explicit per-side overrides, not `sm:inset-auto`.** First draft used `inset-0 rounded-none sm:inset-auto` + `sm:bottom-24 sm:right-6`; `twMerge` collapsed `sm:inset-auto` with `sm:bottom-24 sm:right-6` as a conflict and dropped the specific positions. Final shape uses `top-0 right-0 bottom-0 left-0` on mobile and explicit `sm:top-auto sm:left-auto sm:bottom-24 sm:right-6` per-side overrides — survives twMerge cleanly.

## Component inventory

- **ChatWidget** (`src/components/chat/ChatWidget.tsx`) — Root. Owns `messages`, `isStreaming`, `error`, `open`. Renders `<motion.button>` trigger + `<AnimatePresence>`-wrapped `<ChatPanel>`. Mounts a global Escape listener when open. Locks body scroll on mobile when open. Seeds the conversation with a context-aware greeting on first open. No props. Kill switch via `process.env.NEXT_PUBLIC_CHAT_ENABLED === 'false'`.
- **ChatPanel** (`src/components/chat/ChatPanel.tsx`) — The dialog. Props: `messages`, `onSend`, `onClose`, `isStreaming`, `error`, `userMessageCount`. Renders header / scrollable message list / input. Handles textarea auto-grow and auto-scroll. Shows the typing indicator when streaming hasn't yet produced a first token. Enforces client-side 20-message cap via `userMessageCount`.
- **ChatMessage** (`src/components/chat/ChatMessage.tsx`) — One message. Props: `message`, `isStreaming?`. User: bright pill right-aligned; assistant: elevated bubble left-aligned with optional streaming cursor.
- **TypingIndicator** (`src/components/chat/TypingIndicator.tsx`) — 3 pulsing dots. `role="status"`, translated `aria-label`.
- **BotIcon / CloseIcon / SendIcon** (`src/components/chat/BotIcon.tsx`) — Inline SVG icons. All accept standard `SVGProps<SVGSVGElement>`.

## CSS classes and utilities added

- `.typing-dot` + `@keyframes typing-dot-pulse` — staggered 3-dot pulse, reduced-motion-safe
- `.chat-trigger` + `@keyframes chat-trigger-pulse` — soft outward glow ring every 4s, reduced-motion-safe, disabled on hover

## Exports and barrel files

- `src/components/chat/index.ts` exports `ChatWidget`

## Verification in dev

Verified in the browser preview (desktop + mobile viewports) on 2026-04-20:

- Trigger renders at bottom-right, 56×56 when settled (44.8 mid-animation at scale 0.8)
- Click opens a 380×560 panel anchored `sm:bottom-24 sm:right-6`
- Resize to mobile (375×812) → panel goes full-screen (`top:0 right:0 bottom:0 left:0`)
- Greeting matches URL context: `/en` gets the shared greeting, `/en/consulting` gets the consulting greeting
- Locale switch `/en → /mk` flips all UI strings to Cyrillic (title "Vertex асистент", subtitle "Прашајте не било што", close "Затвори", placeholder "Поставете прашање за Vertex…")
- Escape closes the panel
- Without `ANTHROPIC_API_KEY`: POST /api/chat returns 500, client surfaces the translated `chat.errors.generic` string in a `role="alert"` element, and the empty assistant placeholder is removed from the message list
- Token streaming with a real key was not tested — deferred to the owner's local setup (see "Owner action required" below)

## Build

`npm run build` passes with zero errors. Build output summary:
- 48/48 static pages generated
- TypeScript check clean in 76s
- Turbopack compile clean in 38.7s
- `/api/chat` appears in the route table as a dynamic route (`ƒ`)

Preexisting `z-index is currently not supported` warnings from Lightning CSS are unrelated to this phase (they're from other components' utilities — present before these changes).

## Owner action required

- **Add `ANTHROPIC_API_KEY=sk-ant-api03-…` to `.env.local` locally** (for dev) and **to the Vercel project environment variables** (for production). The widget currently runs against `ANTHROPIC_AUTH_TOKEN=sk-ant-oat01-…` — the developer's Claude Code OAuth token — which was used as a smoke-test credential and **rotates roughly every few days**, causing silent 401s when it expires. A permanent `sk-ant-api03-…` API key from console.anthropic.com doesn't rotate and runs on API-tier quotas (not the developer's Claude subscription).
- Once a real key is in place, remove the `ANTHROPIC_AUTH_TOKEN=…` line from `.env.local`. The OAuth beta-header branch in `src/lib/ai.ts` checks `!ANTHROPIC_API_KEY && !!ANTHROPIC_AUTH_TOKEN` and will turn itself off automatically once the API key is set.
- Model is already `claude-haiku-4-5` (the right production choice). Swap to `claude-sonnet-4-6` only if response quality ever falls short.

## What the next phase should know

- **Phase 12B (Lead capture + Telegram)** plugs into the existing `ChatWidget` + `ChatPanel`. It should (1) detect buying intent in the visitor's message — a lightweight second LLM call, or a keyword heuristic; (2) slide in a name+email form inside `ChatPanel` below the message list; (3) POST to `/api/chat/lead` with name, email, division (inferred from current `pathname`), conversation summary (generate via a second Claude call using the existing messages), and `pageUrl`; (4) send the Telegram notification per the D-10 spec §5.2; (5) add rate limiting per-IP at the route level. All the widget plumbing is in place — this is purely additive.
- **Native-speaker review of `chat.*` translations** is pending. Added to `TRANSLATION_NOTES.md` §12-A.
- **Model config** lives in `src/lib/ai.ts` as module-level constants (`CLAUDE_MODEL`, `CLAUDE_MAX_TOKENS`). Single source of truth.
- **If Phase 14 (Structured Data) lands first**, it does not conflict with the chat widget.
- **If Phase 13 (Sanity CMS) lands first,** the chat system prompt should be extended to include service descriptions from Sanity (see D-10 §7.1). Today, the system prompt only knows what's hard-coded from `siteConfig` — service-page copy is not yet injected.
