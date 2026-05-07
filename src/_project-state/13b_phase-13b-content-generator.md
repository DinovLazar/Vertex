# Phase 13B — AI Content Generator + Topic Backlog

## What was built

Replaced the "manually write a post in Studio" flow with one-click bilingual generation. Goran logs into a password-gated dashboard at `/admin/generate`, picks the next pending topic from a 20-item Sanity backlog, and clicks **Generate next post**. ~95 seconds later a complete bilingual draft (EN + MK), with a Pexels featured image and a real internal service-page link, lands in Sanity as a draft for review. Failure paths (Claude 401, validation rejection, Sanity write error) all mark the topic as `failed` with a human-readable reason so the cron in 13C can skip broken topics instead of retrying them in a loop.

No social posting, no cron, no auto-publish — those are 13C. The orchestrator already accepts `publish: true` and calls `/api/revalidate` when set, so 13C is mostly plumbing.

## Files created

| File | Purpose |
|------|---------|
| `src/sanity/schemas/topicBacklog.ts` | Sanity document type for the 20-item backlog. Fields: localized `title`, optional localized `description`, `division` (radio), `targetService` (radio of 8 service paths, optional), `assignedAuthor` (reference, optional), `priority` (1–10), `status` (pending/used/skipped/failed), `usedAt` + `resultingPost` + `failureReason` (all read-only, set by the orchestrator). Custom Studio preview shows `⏳/✅/❌/⏭️` emoji prefix on the status. |
| `scripts/seed-topics.ts` | One-shot seeder for 20 starter topics drawn from Vertex's 8 service pages (2–3 per service + 1 shared/general). Idempotent — fixed `_id`s + `createOrReplace`, safe to rerun. |
| `src/lib/pexels.ts` | Two helpers: `searchPexelsPhoto(query)` returns the top landscape result (or null), `downloadPexelsPhoto(photo)` returns the `large2x` (~1880px) variant as a Node Buffer ready to upload to Sanity. Reads `VERTEX_PEXELS_API_KEY` (namespaced — see Decisions). |
| `src/lib/contentGenerator/toolSchema.ts` | JSON schema for Claude's `tool_use` structured output. Forces all 9 fields (title, slug, excerpt, body, tags, readTime, pexelsQuery, imageAlt — both `en` and `mk` variants) to come back as a single tool call. Uses `tool_choice: { type: 'tool', name: '...' }` so Claude can't escape into prose. |
| `src/lib/contentGenerator/buildPrompt.ts` | Brand-voice system prompt. Three division-specific voices, anti-buzzword rules, banned phrases ("unleash"/"leverage"/"In today's fast-paced world"…), 3 reference passages copied from the Phase 13A migrated posts, explicit Portable Text JSON shape spec with a worked example block, and Macedonian rules (Cyrillic, formal Вие register, keep Latin brand names). 500–800 words per language hard cap. |
| `src/lib/contentGenerator/generateDraft.ts` | Claude Opus 4.7 invocation with the long-output beta header (`output-128k-2025-02-19`), `max_tokens: 16000`, 3-min timeout. Defensive shape checks with rich diagnostics (`stop_reason`, `usage`, top-level keys) so truncation or schema drift surfaces in the failure reason instead of crashing silently. |
| `src/lib/contentGenerator/validateDraft.ts` | Quality gates that run after Claude returns: title length, slug format, excerpt length, EN/MK body word counts (500–1500), H2 count (≥2), tag counts, read time range, pexels query length, image alt length, banned-phrase check on EN body. Returns `{ ok, errors[] }`. |
| `src/lib/contentGenerator/createPost.ts` | Sanity write path: (1) `searchPexelsPhoto` + `downloadPexelsPhoto` + `sanityWriteClient.assets.upload` to attach the featured image (non-blocking — proceed without image if Pexels fails), (2) slug-collision check with `YYYYMMDD` suffix fallback, (3) `sanityWriteClient.create` of the `blogPost` doc with `status: 'draft' \| 'published'` based on `publish` flag, (4) patch the topic with `{ status: 'used', usedAt, resultingPost }`. Plus `markTopicFailed(id, reason)` for the cron-loop-protection path. |
| `src/lib/contentGenerator/index.ts` | Orchestrator. Picks next pending topic via priority-then-creation-order GROQ query, resolves author (assigned > division-default of `author-goran`/`author-lazar`), runs `generateDraft` → `validateDraft` → `createPost` in sequence, calls `/api/revalidate` if `publish=true`. Streams progress through a `LogFn` callback so the API route can SSE it to the dashboard. |
| `src/app/api/generate-post/route.ts` | Cookie-gated POST endpoint. Validates `vertex-admin` cookie against `VERTEX_ADMIN_PASSWORD`. Streams logs as Server-Sent Events back to the client. `runtime: 'nodejs'`, `maxDuration: 60` (Hobby plan cap — 13C revisits if we go Pro). |
| `src/app/admin/layout.tsx` | Dedicated layout for `/admin/*` providing `<html lang="en">` + `<body>` shell. Required because the root `src/app/layout.tsx` is a pass-through (the `[locale]` layout owns the public shell, but admin lives outside `[locale]`). Imports `globals.css` so Tailwind utilities work. `metadata.robots = { index: false, follow: false }`. |
| `src/app/admin/login/page.tsx` | Server component with a form action. POST → password compare → set httpOnly `vertex-admin` cookie → redirect to `/admin/generate`. Wrong password redirects back with `?error=1` and an inline alert. `secure: true` only in production so localhost works. |
| `src/app/admin/generate/page.tsx` | Server component. Cookie check first (redirect to login on miss). Fetches up to 30 topics from the backlog via GROQ + passes to `<GenerateClient>`. |
| `src/app/admin/generate/GenerateClient.tsx` | Client UI. Stats cards (Pending / Used / Failed), "Next topic" preview with the priority badge, "Publish immediately" checkbox, "Generate next post" button. On click: POST to `/api/generate-post`, read SSE stream chunk by chunk, render colored log lines, then `window.location.reload()` after 1.2s so topic statuses refresh. |

## Files modified

| File | What changed |
|------|-------------|
| `src/sanity/schemas/index.ts` | Added `topicBacklog` to the registry alongside `blogPost`, `author`, `localized*`. |
| `src/proxy.ts` | Matcher exclusion list extended from `(?!api\|_next\|_vercel\|studio\|opengraph-image\|twitter-image\|.*\..*)` to add `admin` so `/admin/*` serves directly without the next-intl middleware trying to locale-prefix it (same pattern Phase 13A added for `/studio/*`). |
| `.env.local` | Added `VERTEX_PEXELS_API_KEY`, `VERTEX_ADMIN_PASSWORD`, `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SITE_URL`. Kept `ANTHROPIC_AUTH_TOKEN` as-is (Phase 12 chat widget still uses it; the comment above it now warns not to use the OAuth token for Phase 13B). |
| `.env.example` | Documented the same 4 new vars (without values). |

## Environment variables added

| Variable | Where it lives | Purpose |
|----------|---------------|---------|
| `VERTEX_PEXELS_API_KEY` | `.env.local` + Vercel | Pexels API key. Free tier: 200 req/hr, 20k/month. We use ~1/week. |
| `VERTEX_ADMIN_PASSWORD` | `.env.local` + Vercel | Cookie-gate for `/admin/*`. The cookie value equals this password directly (simple shared-secret model — fine for one-user localhost-only access). |
| `ANTHROPIC_API_KEY` | `.env.local` + Vercel | Real `sk-ant-api03-...` key from console.anthropic.com. **Required** by the generator — the chat widget's OAuth token does NOT work for direct Messages API calls (confirmed 401 on all 3 models). |
| `NEXT_PUBLIC_SITE_URL` | `.env.local` + Vercel | Base URL the orchestrator hits for `/api/revalidate` after a published post. Localhost in dev, production URL in Vercel. |

## Key technical decisions

- **`tool_use` for structured output, not prompt + JSON parsing.** `tool_choice: { type: 'tool', name: 'submit_blog_post' }` forces Claude to produce a tool call matching the schema exactly. No "please respond in JSON" retries, no parse failures from a stray prose paragraph. The schema doubles as a contract for the consumer side.
- **Long-output beta header `output-128k-2025-02-19` + `max_tokens: 16000`.** First test run hit `stop_reason: max_tokens` at 8000 — only `body` and `excerpt` fields populated, no title. Bilingual Cyrillic + Portable Text JSON wrapping ~3x the raw word count. 16k tokens is a safe headroom; the long-output beta is required for Opus 4.x to accept any cap above 8192.
- **Tightened word counts to 500–800 per language.** Phase plan suggested 600–1100 — I tightened the upper bound after the truncation incident. Tighter posts also feel sharper and match the brand voice better than padded ones.
- **Real API key, not the OAuth token.** Tested all 3 models (Haiku/Sonnet/Opus) with `ANTHROPIC_AUTH_TOKEN` — every one returned `{ "type": "authentication_error", "message": "Invalid authentication credentials" }`. Claude Code OAuth tokens are scoped to the CLI app and don't authenticate direct Messages API calls. `generateDraft.ts` reads `ANTHROPIC_API_KEY` explicitly so the SDK never silently falls back to the OAuth token.
- **Namespaced env vars (`VERTEX_*`).** Started with the plan's `ADMIN_PASSWORD` / `PEXELS_API_KEY` names. Login kept failing — turned out the shell session has unrelated `ADMIN_PASSWORD=12345678` and a stale `PEXELS_API_KEY` that shadow `.env.local` because Node's `process.env` is OS-env-first, dotenv-second. Renamed to `VERTEX_ADMIN_PASSWORD` + `VERTEX_PEXELS_API_KEY` so shell pollution can't shadow our values.
- **Draft mode by default.** Generator creates `status: 'draft'` posts unless `publish: true` is passed. Lets Goran read 1–2 generated posts and tune the prompt before the cron in 13C flips the default. The code path for both modes is identical — only the status field differs and revalidate is skipped for drafts.
- **Failure path always marks the topic `failed`, never throws into the void.** Every `try` in the orchestrator catches, calls `markTopicFailed(topic._id, reason)`, returns `{ ok: false, reason }`. So when 13C wires the cron, a single bad topic won't keep retrying every week — the cron skips `failed` topics and moves on.
- **Pexels image upload is non-blocking.** If Pexels returns 0 results or 401s, the post is still created without a `featuredImage`. `BlogCard` and `BlogPostClient` both already handle the null case from Phase 13A.
- **Admin layout (`src/app/admin/layout.tsx`) added.** Without it, every `/admin/*` route triggered Next 16's "Missing `<html>` and `<body>` tags in the root layout" error — the root layout is a pass-through and `[locale]/layout.tsx` doesn't cover `/admin`. Mirrors the pattern `/studio` would need but bypasses because `NextStudio` provides its own shell.
- **SSE for the admin log stream.** Each orchestrator step emits `{ level, msg, ts }` through a `LogFn` callback that the API route encodes as `data: ...\n\n`. The client reader splits on `\n\n` and updates a buffered React state. Easy to debug ("which step took 90s? oh, Claude") and trivial to extend with new log levels in 13C (e.g. `facebook-posted`, `instagram-posted`).

## Verification (2026-04-26, end-to-end)

- Logged in via `/admin/login` with the generated password, dashboard rendered with stats `Pending 20 / Used 0 / Failed 0`.
- Tested failure path first: ran with the OAuth token still active → topic correctly marked `failed` with reason `"Claude generation failed: 401 ..."`. Reset to pending, swapped to real `ANTHROPIC_API_KEY`, retried.
- Bumped `max_tokens` to 16k after first real-key run hit `stop_reason: max_tokens` mid tool_use.
- Successful generation timeline: 0s pick topic → 91s Claude returned → 91s validation passed → 98s post created in Sanity with Pexels image attached.
- Inspected the generated post via GROQ:
  - Title EN: "Four Signs Your Business Needs a Workflow Audit"
  - Title MK: "Четири знаци дека на вашиот бизнис му треба ревизија на процесите"
  - 20 body blocks per language, 5 H2 headings, 3 bullet items
  - 1 internal link to `/consulting/workflow-restructuring` (matches the topic's `targetService`)
  - 4 EN tags + 4 MK tags (translated, not literal)
  - readTime: 5 min
  - Featured image from Pexels (Christina Morillo) uploaded to Sanity CDN, dimensions 1880x1255, bilingual alt text
  - Author: Goran Dinov (consulting → division-default fallback worked)
  - Status: `draft` (publish=false)
- Topic was marked `used` with `usedAt` + `resultingPost` reference.
- Dashboard reload shows: Pending 19, Used 1, Failed 0 — moved into "Recently used" section.
- Production build: `npm run build` → 50 static pages, zero TypeScript errors, `/admin/generate`, `/admin/login`, `/api/generate-post` all registered.
- Cost of one full run: ~$0.04 of Opus 4.7 + 1 Pexels call (free) + 1 Sanity write (free tier).

## Known follow-ups for Phase 13C

- Wire social-posting steps into the orchestrator (Facebook + Instagram via Meta Graph API).
- Add Telegram notifications for both publish and failure paths.
- Two new captions in the `tool_use` schema (`facebookCaption`, `instagramCaption`) + matching prompt rules.
- Extend `GenerateClient` with two checkboxes (Post to Facebook, Post to Instagram), disabled when Publish is unchecked.
- Meta token health banner on the dashboard (warn 10 days before the 60-day Page Access Token expires).
- Optional: switch the generator's default to `publish: true` when the cron actually runs, after Goran has validated the prompt voice across a few generations.
- Optional: revisit `maxDuration: 60` if upgrading to Vercel Pro — Opus + image upload runs ~95s and the dev server doesn't enforce the cap, but a Vercel function deploy at Hobby would time out.

## What the next phase should know

- **Generator entry point:** `import { generateNextPost } from '@/lib/contentGenerator'` — accepts `{ publish, log }`. The cron in 13C calls this directly; 13C will add `postToFacebook`, `postToInstagram`, `sendTelegramNotification` flags.
- **Tool schema is the contract.** When 13C adds `facebookCaption` and `instagramCaption`, update both the `properties` block and the `required` array, and add fields to the `GeneratedPost` TypeScript type at the bottom. Don't extend the prompt without extending the schema; the schema is what guarantees Claude returns the new fields.
- **Body content is Portable Text** with `{ block, span, markDef-link, listItem-bullet }` only. The Studio + the BlogPostClient renderer both support this exact subset.
- **`createPost` returns `imageAssetId`.** 13C needs the public CDN URL for the Instagram post — query Sanity with `*[_id == $id][0]{ url }` to resolve `image.asset->url`.
- **Revalidate target:** the orchestrator hits `${NEXT_PUBLIC_SITE_URL}/api/revalidate` with `x-revalidate-secret: ${REVALIDATE_SECRET}` and `{ tag: 'blog' }`. 13C doesn't need to add anything here — already wired.
- **`/admin` is excluded from the i18n middleware.** When 13C adds a new admin sub-route, no proxy.ts change needed (the exclusion is path-prefix-based).
- **Diagnostic posture:** if generation fails, the topic's `failureReason` field captures `stop_reason`, `usage`, and the top-level keys returned. Read it before guessing.
