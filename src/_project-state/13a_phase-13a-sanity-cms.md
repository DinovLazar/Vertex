# Phase 13A — Sanity CMS Setup & Blog Migration

## What was built

Replaced the `src/lib/blog.ts` mock with Sanity CMS. Added a `/studio` route (desktop + tablet friendly) so Goran can edit posts via a web UI. Migrated the 3 original posts (EN + MK) into Sanity via a seed script. Swapped the regex-based Markdown renderer in `BlogPostClient` for `@portabletext/react`. Added an `/api/revalidate` endpoint that Phase 13B/13C will call after creating or updating posts so the site refreshes instantly instead of waiting for ISR's 60-second window.

No AI content generation, Pexels integration, or social posting was built — those are Phase 13B and 13C.

## Files created

| File | Purpose |
|------|---------|
| `sanity.config.ts` | Sanity project config — mounts `structureTool` + `visionTool`, loads schemas, sets `basePath: '/studio'`. Reads project ID + dataset from env. |
| `sanity.cli.ts` | Sanity CLI config — needed if Goran ever runs `npx sanity ...` locally (dataset export, schema deploy, etc.). |
| `src/sanity/schemas/index.ts` | Schema registry — exports `[blogPost, author, localizedString, localizedText, localizedPortableText]`. |
| `src/sanity/schemas/blogPost.ts` | `blogPost` document type. Fields: title, slug (shared EN/MK), excerpt, body (Portable Text, localized), author (reference), division (radio: consulting / marketing / shared), publishedAt, readTime, tags (en/mk arrays), featuredImage (optional, with hotspot + localized alt), status (draft / published). Newest-first ordering. |
| `src/sanity/schemas/author.ts` | `author` document type. Fields: name, initials (≤3 chars), role (localizedString), division, image (optional). |
| `src/sanity/schemas/localized.ts` | Reusable object types: `localizedString`, `localizedText`, `localizedPortableText`. Every content field is wrapped in one of these so EN + MK live side-by-side on the same document. `localizedPortableText` block config allows `normal` + `h2` styles, `strong` + `em` decorators, `link` annotations, and `bullet` lists. |
| `src/app/studio/[[...tool]]/page.tsx` | Server component. Exports `metadata` + `viewport` from `next-sanity/studio` + `dynamic = 'force-static'`. Renders the client `<Studio />`. |
| `src/app/studio/[[...tool]]/Studio.tsx` | `'use client'` component wrapping `<NextStudio config={config} />`. Split from the page so Next can statically generate the route's metadata — exporting `metadata` from a file that carries `'use client'` is a Next compile error. |
| `src/lib/sanity/client.ts` | Two clients (previously an empty stub). `sanityClient` is CDN-cached read-only with `perspective: 'published'`. `sanityWriteClient` uses the editor token and is reserved for server-side automation (seed, Phase 13B generator). `urlFor(source)` wraps `createImageUrlBuilder(sanityClient)` for CDN image URLs. |
| `src/lib/sanity/queries.ts` | 5 GROQ queries (previously empty): `allPublishedPostsQuery`, `postBySlugQuery`, `postsByDivisionQuery`, `relatedPostsQuery`, `allSlugsQuery`. All share the same projection via `blogPostFields` so the TypeScript shape `BlogPostRaw` fits every response. Author is dereferenced; featured image metadata (lqip + dimensions) is pulled for `next/image` blur placeholders. |
| `src/app/api/revalidate/route.ts` | POST-only tag-based revalidation. Reads `x-revalidate-secret` header, checks against `REVALIDATE_SECRET`, then calls `revalidateTag(tag, 'max')` (Next 16's new 2-arg signature; `'max'` invalidates immediately). Default tag = `'blog'`. |
| `scripts/seed-blog.ts` | Idempotent seed of 2 authors + 3 posts into Sanity. Uses fixed `_id`s + `createOrReplace` so re-running updates in place rather than duplicating. Includes a minimal Markdown → Portable Text converter for the structures present in the original mock (`## h2`, paragraphs, `- bullet lines`, `**bold**`, `[text](url)`). Not kept around for Phase 13B — those posts are authored directly in PT via the Studio or via Claude's structured-output. |

## Files modified

| File | What changed |
|------|-------------|
| `src/lib/blog.ts` | All helpers are now `async` and query Sanity via `sanityClient.fetch`. Added a `collapse(raw, locale)` helper that turns `{ en, mk }`-shaped Sanity documents into the locale-flat `BlogPost` shape the UI expects. `BlogPost` gained an `_id` field + `featuredImage` + a nested `author: { name, initials, role, division, image }` (previously `author: string` + `authorRole: string`). `content: string` became `body: PortableTextBlock[]`. |
| `src/app/sitemap.ts` | `export default` is now `async function sitemap(): Promise<MetadataRoute.Sitemap>` because `getAllSlugs()` is async. |
| `src/app/[locale]/(site)/blog/page.tsx` | `await getAllPosts(locale)` instead of calling it synchronously. |
| `src/app/[locale]/(site)/blog/[slug]/page.tsx` | Fetches `post` + `related` in the server component and passes both as props. `getAllSlugs()` + `getPostBySlug()` + `getRelatedPosts()` are all awaited. |
| `src/app/[locale]/(site)/blog/[slug]/BlogPostClient.tsx` | Renders `post.body` via `<PortableText value={post.body} components={portableTextComponents} />`. Dropped the old `renderContent` / `renderInline` regex helpers. Accepts `related: BlogPost[]` as a prop instead of calling `getRelatedPosts()` from the client. Author pill reads `post.author.name` + `post.author.initials` + `post.author.role` (new nested shape). JSON-LD updated for the new shape. Internal PT links go through `@/i18n/navigation`'s locale-aware `Link` so `/consulting/ai-consulting` correctly becomes `/en/consulting/ai-consulting` or `/mk/consulting/ai-consulting`. |
| `src/components/sections/BlogCard.tsx` | Renders `post.featuredImage` as a 16:9 cover image above the content block when present (with `lqip` blur placeholder). Falls back to the existing division-dot + content-only layout when `featuredImage` is `null` — which is the case for all 3 migrated posts until Phase 13C adds Pexels image pulls. Author label reads `post.author.name` (new nested shape). Added `useLocale()` for the bilingual alt text. |
| `next.config.ts` | Added `images.remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }]` so `next/image` can load CDN-served Sanity images. Nothing else in the config changed. |
| `src/proxy.ts` | Matcher exclusion list extended from `(?!api\|_next\|_vercel\|opengraph-image\|twitter-image\|.*\..*)` to `(?!api\|_next\|_vercel\|studio\|opengraph-image\|twitter-image\|.*\..*)` so `/studio` and `/studio/**` serve directly without the next-intl middleware trying to locale-prefix them. |
| `.env.example` | Documented all 5 new env vars (`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_READ_TOKEN`, `SANITY_API_WRITE_TOKEN`, `REVALIDATE_SECRET`) plus `ANTHROPIC_AUTH_TOKEN` that was previously undocumented. |
| `.env.local` | Real values added for the same 5 vars. Gitignored via `.env*` — not committed. |

## Environment variables added

| Variable | Where it lives | Purpose |
|----------|---------------|---------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `.env.local` + Vercel (all 3 envs) | Sanity project ID (public — exposed in the Studio bundle). |
| `NEXT_PUBLIC_SANITY_DATASET` | `.env.local` + Vercel | Dataset name (`production`). |
| `SANITY_API_READ_TOKEN` | `.env.local` + Vercel | Viewer-role token. Not currently used at runtime (CDN reads are public), kept for future drafts preview in Phase 13C. |
| `SANITY_API_WRITE_TOKEN` | `.env.local` + Vercel | Editor-role token. Used by the seed script and reserved for Phase 13B's Claude-driven post generator. |
| `REVALIDATE_SECRET` | `.env.local` + Vercel | Shared secret for `/api/revalidate`. Any 32-char random string. |

## Key technical decisions

- **Field-level i18n, not document-level.** Every translated field is wrapped in `localizedString` / `localizedText` / `localizedPortableText`. One document per post holds both EN + MK; the Studio renders side-by-side English and Macedonian inputs. Simpler than two separate documents linked by slug, and matches the `{ en, mk }` shape the front-end already expects. When Goran edits a post, both languages stay in sync in one place.
- **Collapse at fetch time, not render time.** `src/lib/blog.ts` pulls the full `{ en, mk }` raw shape from Sanity then flattens to the current-locale `BlogPost` shape before returning. Keeps the consumer components (`BlogCard`, `BlogPostClient`) unchanged for the locale dimension — they receive plain strings, not `{ en, mk }` objects.
- **ISR with 60-second revalidate + on-demand `/api/revalidate`.** The steady-state cache is 60s so new posts appear without manual intervention. Phase 13B/13C automation will POST to `/api/revalidate` right after creating a post so editors see the change instantly. Next 16's `revalidateTag(tag, 'max')` two-arg form is required — single-arg is deprecated with a console warning.
- **Studio route uses a 2-file split (`page.tsx` server + `Studio.tsx` client).** Next 16 rejects `export { metadata, viewport } from 'next-sanity/studio'` in a `'use client'` file. The plan's original single-file snippet would not compile — I split it.
- **`/studio` is excluded from the next-intl middleware.** Without the exclusion, `createMiddleware` 307-redirects `/studio` → `/en/studio`, which 404s because the folder lives at `src/app/studio/` (above `[locale]`). The matcher in `src/proxy.ts` now opts studio out, same pattern as `/api/*` and `/opengraph-image`.
- **Seed script uses fixed `_id`s + `createOrReplace`.** Rerunning the seed never creates duplicates. If we discover a typo in post 2, we edit the script, rerun, and the existing Sanity document is overwritten. Same pattern for the 2 authors (`author-goran`, `author-lazar`).
- **Read token kept even though not currently used at runtime.** The CDN read client doesn't need auth for published content, so `sanityClient` operates anonymously. But drafts preview in Phase 13C will need the read token. Keeping it wired in `.env.local` + Vercel now avoids a second deployment-env pass later.

## Verification (2026-04-24)

- `/studio` loads (HTTP 200, renders Sanity Studio shell with login screen + `<div id="sanity">` mount point).
- `/en/blog` + `/mk/blog` each render 3 cards with correct titles in the correct language.
- `/en/blog/<slug>` + `/mk/blog/<slug>` render full Portable Text content: h2 headings, paragraphs, bold, internal links that preserve the locale prefix (`/consulting/ai-consulting` → `/en/consulting/ai-consulting` and `/mk/consulting/ai-consulting`), bullet list (post 3 — "Work that requires deep contextual judgment...", "Creative direction...", etc.).
- JSON-LD `inLanguage` is `en-US` on EN pages, `mk-MK` on MK pages. Author block is `{ "@type": "Person", "name": "...", "jobTitle": "..." }` with the translated jobTitle.
- `POST /api/revalidate` with wrong secret → 401. With correct secret → 200 `{ ok: true, revalidated: 'blog' }`.
- `npm run build` succeeds in ~2 minutes: zero TypeScript errors, 49 static pages generated (includes 6 blog post pages — 3 slugs × 2 locales — plus the Studio static shell).

## What the next phase should know

- **The data layer is async end-to-end now.** Any new query helper must fetch via `sanityClient.fetch`, return a `Promise`, and use `{ next: { revalidate: 60, tags: ['blog', ...] } }` if the result should participate in ISR.
- **Never import from `@/lib/blog` in a client component.** Data must be fetched in the server `page.tsx` and passed down as a prop. The one "client component imports blog helper" pattern that existed (`BlogPostClient` calling `getRelatedPosts`) was refactored — the page now passes `related` as a prop.
- **After writing a post, call `POST /api/revalidate` with `x-revalidate-secret: $REVALIDATE_SECRET` and a JSON body of `{ tag: 'blog' }`.** Otherwise the new post won't appear on the public site for up to 60 seconds. Phase 13B/13C automation must do this.
- **Body content is Portable Text, not Markdown.** When the Phase 13B generator calls Claude, it must either emit PT blocks directly (preferred — let Claude structure the output) or go through a Markdown → PT conversion like `scripts/seed-blog.ts#mdToPortableText` (keep as a reference if needed — the script stays in `scripts/` for now).
- **`/studio` is currently unauthenticated at the URL level** — anyone who visits it gets the Sanity login screen, but only users Goran has invited to the Sanity project can actually log in and edit. For extra hardening before launch, consider adding Vercel-level basic auth on `/studio/*` or moving the Studio to a separate Sanity-hosted URL.
- **Featured images are `null` on all 3 migrated posts.** `BlogCard` and `BlogPostClient` both handle this gracefully — the card falls back to its pre-Phase-13A division-dot layout. Phase 13C will backfill images via Pexels and the `featuredImage` field + its `alt` localized object.

## Known follow-ups for Phase 13B

- Topic backlog schema (queued topics the AI picks from each week).
- Pexels integration for auto-fetching + uploading featured images.
- AI content generator calling Claude API (Opus for the weekly post; output is PT blocks, not Markdown).
- Manual trigger dashboard for Goran to run "generate next post now" before the cron is wired.

## Known follow-ups for Phase 13C

- Meta for Developers app setup (Facebook + Instagram).
- Facebook + Instagram auto-posting on publish.
- Weekly Vercel Cron schedule wired to the 13B generator.
- Telegram notification on publish (reuse chat-widget pattern).
- Token-expiration monitoring for the long-lived Meta Graph API tokens.
- Consider `/studio` hardening (basic auth / IP allowlist) at the same time.
- Add `/studio` to `robots.txt` `Disallow:` (currently inherits the site-wide Allow).
