# Session — SEO / AEO structured data + LLM discoverability (2026-07-18)

Goal: make the site legible to Google's rich-result and local-pack systems, and
to the LLM crawlers that increasingly answer "who does business consulting in
Strumica" without ever showing a blue link.

Before this session the site had exactly two pieces of structured data —
`FAQPage` on service pages and `BlogPosting` on blog posts. There was no
Organization, no LocalBusiness, no Service, no breadcrumbs, and nothing at all
aimed at AI crawlers.

## What shipped

### New files

| File | Purpose |
|---|---|
| `src/lib/schema.ts` | Every JSON-LD builder, plus `SERVICE_CATALOG` — the single source of truth for the eight services (slug, path, English name, summary, `serviceType`). |
| `src/components/global/JsonLd.tsx` | Server component that renders one `<script type="application/ld+json">`, escaping `<` so translated copy can't break out of the tag. |
| `src/components/global/PageSchema.tsx` | Server component emitting the per-page pair: typed `WebPage` node + `BreadcrumbList`. Reads the locale itself. |
| `src/app/llms.txt/route.ts` | `/llms.txt` — concise link index per the llmstxt.org convention. |
| `src/app/llms-full.txt/route.ts` | `/llms-full.txt` — full site prose (~43 KB) flattened from `messages/en.json`. |

### Modified

- `src/app/robots.ts` — rewritten. 18 AI crawlers named and explicitly allowed
  (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User,
  Claude-SearchBot, PerplexityBot, Google-Extended, Applebot-Extended,
  Bingbot, DuckAssistBot, meta-externalagent, and others). `/studio` and
  `/admin` added to the disallow list — they were publicly crawlable before.
  Added `host`.
- `src/app/[locale]/(site)/layout.tsx` — mounts `buildSiteGraph(locale)`. In the
  `(site)` group specifically, so `/studio` and `/admin` stay out of the graph.
- `ConsultingServicePage.tsx` / `MarketingServicePage.tsx` — now `async`, take
  `slug` + `metaDescription`, emit `Service` + `BreadcrumbList`.
- All 8 service pages — pass `slug={SLUG}` and `metaDescription={t('meta.description')}`.
- `about`, `contact`, `blog`, `consulting`, `marketing` pages — render `<PageSchema>`.
- `src/components/global/index.ts` — exports `JsonLd`, `PageSchema`.

## The entity graph

Everything is keyed off stable `@id` anchors so the emitted nodes resolve as one
connected graph rather than unrelated blobs:

```
{url}/#organization    Organization       ВЕРТЕКС КОНСАЛТИНГ ДООЕЛ
{url}/#localbusiness   ProfessionalService  the visitable business in Strumica
{url}/#website         WebSite
{url}/#goran           Person             founder
{url}/{locale}{path}#service    Service   one per service page
{url}/{locale}{path}#webpage    WebPage   one per content page
```

`Service.provider` and `WebPage.about` point at those `@id`s instead of
repeating the address, hours and contact details on every page.

Decisions worth remembering:

- **ProfessionalService, not plain LocalBusiness.** It's the LocalBusiness
  subtype Google maps to consultancies, and it's what makes the business
  eligible for the local pack.
- **Geo coordinates are Strumica town centre** (41.4375, 22.6431), not the
  office doorstep. Enough for local relevance, no more precision than needed.
- **The placeholder `https://linkedin.com` is filtered out of `sameAs`.** A
  `sameAs` that resolves to a generic homepage weakens entity confidence. It
  will be included automatically once `siteConfig.social.linkedin` points at a
  real company page — no code change needed.
- **No `aggregateRating` / `Review` schema.** Google penalizes self-serving
  review markup. Add it only when real, verifiable reviews exist.
- **No `ai.txt`.** It has no meaningful crawler adoption; `llms.txt` plus named
  robots.txt rules is what the crawlers actually read today.

## Why `llms.txt` is generated, not static

Both routes build their content at request time from `siteConfig`,
`SERVICE_CATALOG`, `messages/en.json` and the live blog index, then cache for
24h (`revalidate = 86_400`). A hand-maintained static file would be stale
within a month; this one cannot describe a version of the site that no longer
exists.

`llms-full.txt` currently renders at ~43 KB: 8 service pages with full body
copy, process steps and FAQ answers, plus the blog index and contact block.

## Verification

- `npx tsc --noEmit` → exit 0
- `npx eslint` on all changed files → clean
- Schema builders transpiled and executed standalone; output inspected. Graph
  emits `Organization, ProfessionalService, WebSite, Person`; `hasOfferCatalog`
  carries all 8 services; breadcrumbs number correctly from position 1.
- Both `.txt` routes executed standalone. 0 `undefined` and 0 `[object Object]`
  in the output.
- **`next build` was NOT run** — it could not be, in this environment. Run it
  locally before deploying.

One real bug was caught this way: `renderSection` assumed bullets were strings,
but `messages/*.json` stores them as `{ term?, description }` objects. Fixed,
with a `paragraphsAfterBullets` field handled too.

## Part 2 — SERP appearance, indexing and the off-site playbook

A second pass the same day, after auditing how the site actually *looks* in a
Google result.

### Bugs found and fixed

- **The homepage had no `generateMetadata` at all.** It inherited the root
  layout's metadata, which carries no canonical URL and no hreflang alternates.
  The most important page on the site could not tell Google that `/en` and
  `/mk` were translations rather than duplicates. Added, with a new
  `home.meta` block in both message files.
- **8 of 15 meta descriptions ran 161–183 characters**, past Google's ~160
  truncation point, so they were being cut mid-sentence in results. All
  rewritten to 133–158 in EN and MK.
- **Titles wasted the space they had** — 24–44 characters including the brand
  suffix, with no location keyword. Rewritten with Strumica/Macedonia where it
  fits, now 41–53 characters.
- **`sitemap.ts` stamped `new Date()` on every row on every request**, telling
  Google the whole site changed each time it fetched the sitemap. That is how
  `lastmod` values get ignored entirely. Static pages now report build time;
  blog posts report their real `publishedAt`. Added `priority` and
  `changeFrequency`.
- **`BlogPosting` had no `publisher`, `image` or `mainEntityOfPage`** — the
  posts read as authorless content unconnected to the Organization. All three
  added, wired to the `@id`s from Part 1, plus `articleSection` and
  `timeRequired`.

### The title template

`src/app/layout.tsx` now uses `template: '%s | Vertex'`, not
`'%s | Vertex Consulting'`. Google truncates around 60 characters and the
longer suffix left no room for the location keywords that win local search.
It is one line to revert if brand spelling matters more.

### New: IndexNow

`src/lib/indexnow.ts` + `src/app/indexnow-key.txt/route.ts`. Push-based
indexing — Bing, Copilot, Yandex, Seznam and Naver get told about a URL within
minutes instead of days. `/api/revalidate` now submits changed blog URLs on
every publish, and accepts an optional `slug` in its payload so it can push the
specific post rather than just the index.

The key lives in `INDEXNOW_KEY` and is served from the route rather than a
committed `{key}.txt` file: the key stays out of git and rotating it is an env
change, not a deploy. Everything no-ops quietly when the var is unset. Google
does not participate in IndexNow — its equivalent is Search Console.

### New: verification via env

`GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`,
`YANDEX_SITE_VERIFICATION` in the root layout's `verification` block. Paste a
value in Vercel, redeploy, tag appears. No code change. All documented in
`.env.example`.

### New: `SEO_PLAYBOOK.md` (repo root)

The non-technical half, written for Goran: Search Console setup, Google
Business Profile (the biggest single lever for "consultant Strumica" searches —
the map pack sits above the blue links), Bing Webmaster Tools, IndexNow
activation, directory citations, content cadence, AEO formatting rules, a
monthly 20-minute routine, and honest timelines.

## Still open

- Run `npm run build` locally, then validate the live pages in Google's Rich
  Results Test and Schema Markup Validator.
- Submit `/sitemap.xml` in Google Search Console; request indexing for the
  8 service pages.
- Set up a Google Business Profile for the Strumica address. The
  `ProfessionalService` node is the on-site half of local ranking; the Business
  Profile is the other half and matters more.
- Replace the LinkedIn placeholder in `siteConfig.social` — it re-enters
  `sameAs` automatically.
- The MK service names in `Service.name` come from the translation files, so
  they're already localized. The `serviceType` values in `SERVICE_CATALOG` are
  English-only by design (schema.org vocabulary is English).
