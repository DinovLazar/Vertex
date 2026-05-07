# Phase 13C — Social Auto-Posting + Telegram Notifications

## What was built

The `/admin/generate` button click is now the full publish-and-promote motion in a single keystroke. On top of the Phase 13B flow (pick topic → Claude → validate → Pexels image → Sanity write → revalidate), the orchestrator now also:

1. Asks Claude for a Macedonian Facebook caption + a Macedonian Instagram caption with hashtags as part of the same `tool_use` call.
2. Posts the link + Facebook caption to the Vertex Facebook Page via the Graph API (`/{page-id}/feed`). Meta auto-builds the link-preview card from the blog page's OG tags.
3. Posts the Sanity-CDN featured image + Instagram caption to the Vertex Instagram Business account via the three-step Graph flow (container create → poll until `FINISHED` → publish).
4. Pings Goran's phone via Telegram with a single message: blog URL on top, Facebook + Instagram sub-links underneath, or `❌` lines if anything in the social leg failed.
5. Sends a Telegram message on every failure path too — Claude crash, validation rejection, Sanity write error — so Goran always knows whether the click landed.

Hobby-plan-compatible by design. The cron is intentionally NOT wired (Vercel Hobby cron usage is restricted by their ToS for monetised sites). Goran continues to click the button manually each week from `npm run dev` on localhost. ~2-3 minutes hands-off after the click.

## Files created

| File | Purpose |
|------|---------|
| `src/lib/meta.ts` | Meta Graph API helper. `postToFacebook({message, link})` posts to the Page's `/feed` with the long-lived Page Access Token. `postToInstagram({imageUrl, caption})` runs container-create → poll-until-FINISHED → publish, then best-effort fetches the permalink. `getTokenHealth()` reads `VERTEX_META_TOKEN_ISSUED_AT` and returns `{status, daysUntilExpiry, message}` based on a 60-day calendar heuristic. All env-var reads go through one `loadMetaEnv()` helper that throws a single readable error on missing vars. Graph API version pinned to `v21.0`. |
| `src/lib/telegram.ts` | Telegram Bot API helper. `sendTelegramMessage(text)` POSTs to `/sendMessage` with HTML parse mode and never throws (returns `{ok, error?}` so callers can decide whether to surface the failure). `escapeHtml(s)` for safe embedding of user-provided text inside HTML-mode messages. |
| `src/_project-state/13c_phase-13c-social-posting.md` | This file. |

## Files modified

| File | What changed |
|------|-------------|
| `src/lib/contentGenerator/toolSchema.ts` | Added 2 fields to the `submit_blog_post` schema — `facebookCaption` (string, 40-400 chars; description forces 1-3 sentences in Macedonian Cyrillic, no hashtags/emojis) and `instagramCaption` (string, 200-2000 chars; description forces 2-4 paragraphs + the literal "Повеќе на vertexconsulting.mk — линкот е во био." line + 5-10 hashtags including ≥1 Macedonian, max 1 emoji, hard 2200-char cap). Both appended to the `required` array. The `GeneratedPost` TypeScript type at the bottom got the same 2 fields. |
| `src/lib/contentGenerator/buildPrompt.ts` | New `# Social media captions` block inserted between the existing Bilingual rules and the Output format block. Separate Facebook and Instagram subsections with explicit tone examples (don't-copy-verbatim Macedonian sentences), hashtag policy (mix EN+MK, ≥1 strictly Macedonian like `#македонскибизнис`/`#скопје`/`#струмица`), emoji cap (max 1, ideally 0), and the literal CTA line for Instagram. |
| `src/lib/contentGenerator/index.ts` | New imports: `metaPostToFacebook` / `metaPostToInstagram` from `../meta`, `sendTelegramMessage` + `escapeHtml` from `../telegram`, `siteConfig` from `@/config/site`. `GenerateNextPostArgs` gained `postToFacebook?`, `postToInstagram?`, `sendTelegramNotification?` (default true). `GenerateNextPostResult` gained `facebookUrl?` + `instagramUrl?`. All 3 existing failure-return paths (Claude crash, validation reject, Sanity write fail) now also `await sendTelegramMessage(...).catch(() => {})` before returning, gated on `sendTelegramNotification !== false`. After the existing revalidate block, a new social-posting + Telegram block: Facebook only fires when `publish && postToFacebook`; Instagram fires when `publish && postToInstagram` AND `result.imageAssetId` exists (resolves the public CDN URL via `*[_id == $id][0]{url}` GROQ then calls `metaPostToInstagram`). Both wrap in try/catch so a Meta error is captured but never blocks the rest. The closing Telegram message composes lines based on what happened (✅ published / 📝 draft + 📘 FB sub-link / 📸 IG sub-link / ❌ fb-or-ig-failed lines). |
| `src/app/api/generate-post/route.ts` | Body parse extended from `{publish}` to `{publish, postToFacebook, postToInstagram, sendTelegramNotification}`. The orchestrator call passes all four flags. `maxDuration: 60` left UNCHANGED — Hobby plan compatible by design. |
| `src/app/admin/generate/page.tsx` | Imports `getTokenHealth` from `@/lib/meta`, calls it after the topic fetch, passes the result as a `tokenHealth` prop to `<GenerateClient>`. |
| `src/app/admin/generate/GenerateClient.tsx` | New `import type { TokenHealth }` from `@/lib/meta`. Component prop type extended. Two new state hooks — `postToFacebook` + `postToInstagram` (both default `true`). The fetch body sends `{publish, postToFacebook: publish && postToFacebook, postToInstagram: publish && postToInstagram}` so the social flags are gated on publish on both client and server. Token health banner rendered above the stats grid when `tokenHealth.status !== 'ok'` (amber for warning, red for expired). Two new checkboxes immediately after "Publish immediately" — disabled and visually muted (`text-[#737373]`) when publish is unchecked, so the gating is visually obvious. |
| `.env.example` | Documented all 6 new `VERTEX_*` env vars at the bottom of the file (Meta Graph API + Telegram). |
| `src/_project-state/current-state.md` | Added 5 new "What works right now" bullets (Facebook posting, Instagram posting, Telegram on every path, dashboard token banner, Hobby-plan deliberate-cron-skip). Replaced the "13C not built yet" placeholder bullet with 4 forward-looking placeholder/follow-up entries (60-day token rotation, LinkedIn deferred, captions in-flight not stored, cron deferred). Updated the "Generator is localhost-only" entry's timing note from "~95s" to "~2-3 min with FB+IG+Telegram". |
| `src/_project-state/file-map.md` | Added entries for `src/lib/meta.ts` and `src/lib/telegram.ts`. Updated the existing entries for `contentGenerator/index.ts`, `contentGenerator/toolSchema.ts`, `contentGenerator/buildPrompt.ts`, `api/generate-post/route.ts`, `admin/generate/page.tsx`, and `admin/generate/GenerateClient.tsx` with their 13C deltas (kept the 13B history inline; added "extended Phase 13C" date stamps). |
| `src/_project-state/README.md` | Phase 13C marked `[x]` complete in the phase status list, with a note clarifying the Hobby-plan-compatible scope (cron deferred). The "Notes on actual vs. expected state" paragraph extended with a 13C sentence explaining the FB/IG/Telegram flow and the dashboard's token health banner. |

## Environment variables added

| Variable | Source step in plan | Purpose |
|----------|---------------------|---------|
| `VERTEX_META_PAGE_ID` | B6 | Vertex Facebook Page numeric ID — `/{this}/feed` is the FB post target. |
| `VERTEX_META_IG_USER_ID` | B7 | Instagram Business Account ID linked to the Page — `/{this}/media` + `/{this}/media_publish` are the IG targets. |
| `VERTEX_META_PAGE_ACCESS_TOKEN` | B6 | Long-lived Page Access Token (~60 days). Authenticates BOTH FB Page posts AND IG Business posts. NOT the User Access Token from B5 — must be the Page-scoped one. |
| `VERTEX_META_TOKEN_ISSUED_AT` | D | ISO date stamp (`YYYY-MM-DD`) of when the token was generated. Read by `getTokenHealth()` for the dashboard banner. Update when rotating the token. |
| `VERTEX_TELEGRAM_BOT_TOKEN` | C5 | BotFather-issued bot token. Authenticates POSTs to `/sendMessage`. |
| `VERTEX_TELEGRAM_CHAT_ID` | C7 | Goran's personal chat-with-the-bot ID. Discovered via `/getUpdates` after Goran sends the first message to the bot. |

All 6 namespaced with `VERTEX_*` to match the 13B convention — avoids OS-env shadowing where the shell session has stale generic values like `ADMIN_PASSWORD`.

## Key technical decisions

- **Social posting runs AFTER Sanity publish AND revalidation, not before.** Otherwise Meta's OG-tag scrape on the Facebook link would 404 (the public site wouldn't have the post yet) or hit a stale ISR cache and pull the wrong image. The order is: Sanity write → POST `/api/revalidate` (which calls `revalidateTag('blog', 'max')` — invalidates immediately) → Facebook → Instagram → Telegram. By the time Meta's crawler hits the URL, the post is fully live.
- **Social failures are non-blocking.** A Meta 401 / Instagram container error never aborts the orchestrator. The blog post is still on Sanity + the live site, the dashboard log shows the specific failure (`(#10) Application does not have permission`, `Instagram container failed with status ERROR`, etc.), and Goran sees a partial-success Telegram with `❌ Facebook failed: ...` lines. He can manually post to whichever platform failed without re-running the generator.
- **Instagram is skipped automatically if no featured image.** `result.imageAssetId` from `createPost` is the gating condition — when Pexels itself fails (the only realistic way to land without an image), the orchestrator logs "Skipping Instagram — no featured image" and records `{ok: false, error: 'No featured image available'}` for the Telegram summary. Facebook in this case still works (FB link posts don't require an image; Meta builds the preview card from OG tags, including the OG image declared in the blog page's metadata).
- **Captions hardcoded Macedonian, primary audience.** Vertex's Facebook + Instagram audiences are Macedonian SMB owners. Posting EN content there would be off-message for ~95% of followers. If Goran ever wants an English manual post, FB/IG's native UIs handle that — the auto-flow stays MK-only.
- **Token health based on env-var date stamp, not a Graph API call.** Meta has `/debug_token` but it's app-secret-scoped and inconsistent. The 60-day calendar heuristic from `VERTEX_META_TOKEN_ISSUED_AT` is good enough — Goran rotates the token + updates the date stamp at the same time, the banner gives him 10-day warning. If a token IS revoked early (account compromise, app deletion), the actual FB/IG post fails with the real Meta error and Telegram surfaces it — not silent.
- **VERTEX_* namespace continues from 13B.** Same shadow-avoidance reason: the user's shell session might have generic `META_*` or `TELEGRAM_*` env vars set for unrelated tools.
- **All Telegram calls wrapped in `.catch(() => {})`.** A Telegram outage (their service is down, or the bot was kicked from the chat, or the chat_id was wrong) must never break publishing. The orchestrator logs the Telegram error in the SSE stream but treats it as best-effort.
- **`maxDuration: 60` UNCHANGED.** Vercel Hobby caps function execution at 60s — this endpoint is `/api/generate-post`. The full pipeline takes ~2-3 min, so it CAN'T run as a Vercel function on Hobby. By design — Goran runs it from `npm run dev` on his laptop, where Node has no timeout. If/when upgrading to Pro, bump to 300s and (optionally) wire `vercel.json` cron.
- **`tool_choice` still forces a single-call schema.** Adding 2 fields to the `properties` block + 2 to the `required` array means Claude can't ship without them — same guarantee 13B uses for the existing 8 fields. No "what if the LLM doesn't include the captions" branch in the orchestrator.
- **Empty Instagram permalink is acceptable.** `permalink` is fetched best-effort with a separate Graph call after `media_publish`. If THAT fails (rate limits, transient network), the orchestrator logs "Instagram posted: (permalink pending)" and Telegram shows "📸 Instagram: posted" without a clickable link. The post is live regardless — Goran can find it by opening the IG profile.

## Verification (2026-05-01)

**Code-level (automated):**
- `npm run build` passes cleanly: 50 static pages, zero TypeScript errors, all routes registered including `/admin/generate` and `/api/generate-post`. Turbopack compile in 32.7s, TypeScript pass in 10.2s.
- `npm run dev` boots without errors. No console errors, no server errors.
- All public routes return correct status codes: `/` (locale redirect), `/en/blog` (200), `/mk/blog` (200), `/admin/generate` (307 to login when no cookie), `/studio` (200), `/api/revalidate` (405 GET — POST-only, correct).
- Login page renders with the password input and Sign-in button (snapshot confirmed).

**Runtime + UI (Goran's hands-on, post-handoff):**
The plan's Steps 8.4–8.17 are intentionally hands-on because they exercise real Meta Graph + Telegram credentials and would otherwise burn API tokens / send real notifications during an automated harness run. Goran will walk through the verification list himself:
- Draft-only run → Telegram arrives with "📝 draft" message
- Facebook-only run → live FB post + Telegram with FB link
- Full FB+IG run → both live + Telegram with all 3 links
- Bad-token failure → post still on site, social ❌ in Telegram (Sanity not marked failed)
- No-image failure → IG correctly skipped, FB still posts
- Token health banner: appears (amber/red) when `VERTEX_META_TOKEN_ISSUED_AT` is older than 50/60 days respectively, hides at full health.

**No regressions:** existing routes (`/en/*`, `/mk/*`, `/studio`, `/admin/login`, `/admin/generate`, `/api/revalidate`, `/api/contact`, `/api/newsletter`, `/api/chat`) all build and respond as before. The 13B generator's draft-only path (publish unchecked) behaves identically — it just additionally fires the Telegram draft notification when `sendTelegramNotification !== false`.

## What the next phase should know

- **Generator entry point unchanged:** `import { generateNextPost } from '@/lib/contentGenerator'`. The shape of `GenerateNextPostArgs` and `GenerateNextPostResult` are stable — adding more flags later (cron, LinkedIn) just appends.
- **Tool schema is still the contract.** When 13D adds, e.g., a `linkedinCaption` field, update both the `properties` block and the `required` array, and add the field to the `GeneratedPost` TypeScript type. Don't extend the prompt without extending the schema.
- **`siteConfig.url` is the canonical blog-host base.** Keep it as `https://vertexconsulting.mk` (no trailing slash) — the orchestrator concatenates `${siteConfig.url}/mk/blog/${slug}` for both Facebook link and Telegram message body.
- **Both FB and IG are gated on `publish`.** A draft never social-posts even if both checkboxes are checked. The `publish && opts.postToX` predicate enforces this in the orchestrator and the dashboard's `JSON.stringify` enforces it again on the client side as belt-and-braces.
- **Token rotation is a 5-minute drill.** Graph API Explorer → regenerate the User Token (B4) with all 5 permissions → exchange for long-lived (B5) → fetch Page Access Token (B6) → update `VERTEX_META_PAGE_ACCESS_TOKEN` + `VERTEX_META_TOKEN_ISSUED_AT` in `.env.local` AND Vercel → restart dev. The dashboard banner clears immediately on next load.
- **Rotation is the ONLY ongoing maintenance the system needs.** Once set up, the weekly click → bilingual blog post → both social platforms → phone notification cycle is fully hands-off until the 60-day token expiry.

## Known follow-ups

- **Vercel Cron (when project upgrades to Pro):** add `vercel.json` with a weekly schedule pointing at `/api/generate-post` with the right body — the orchestrator already accepts the publish + social flags as inputs, no code change needed. Estimated work: 10 minutes + plan upgrade.
- **LinkedIn integration:** Vertex's LinkedIn page doesn't exist yet (per `siteConfig.social.linkedin` placeholder). When it does, LinkedIn Graph API requires a separate Marketing Developer Platform app review (~weeks). Not a 13D blocker — purely on the marketing side.
- **Instagram image aspect-ratio optimization:** Pexels images are 16:9 (landscape), Instagram re-crops to 4:5 (portrait) by default. Looks fine for business-blog imagery but a future iteration could either (a) swap to a 4:5 Pexels search filter, (b) post-process the image into a 4:5 crop before upload, or (c) attach a different `aspect_ratio` parameter on the IG container.
- **Persist FB/IG captions on the Sanity post:** the `blogPost` schema doesn't currently store the Facebook + Instagram captions Claude generated — they're consumed in-flight and discarded. If Goran ever wants to repost manually, or analyze caption performance over time, add `facebookCaption` + `instagramCaption` fields to the `blogPost` schema and have `createPost.ts` write them through.
- **Per-post override for the link target locale:** the Facebook link is hardcoded to `/mk/blog/${slug}` because the audience is Macedonian. If a future post is EN-first (e.g. for a global topic), a topic-level `linkLocale` field on `topicBacklog` could override.
- **Studio hardening:** `/studio` is still publicly reachable (though only invited Sanity users can log in). Still open as a follow-up from 13A — Vercel-level basic auth on `/studio/*` and adding `/studio` to `robots.txt`'s `Disallow:` list. Not a 13C concern but worth bundling with the next ops pass.
