# Full-site audit — findings log

**Audit date:** 2026-08-14 · **Phase:** 17, Part 1

**Method:** 12 parallel auditors, one per codebase slice, each required to quote verbatim source as evidence for every finding; followed by a consolidation/verification pass. Raw findings: 169. After dedupe: 134 bugs + 25 informational verdicts.

| Severity | Count |
|---|---|
| Critical | 3 |
| High | 15 |
| Medium | 75 |
| Low | 41 |


---

## Resolution status — pass 1 (2026-08-14)

Everything below was fixed and verified against a clean `npm run build` +
`npx next start`. Baseline before this pass: `tsc` clean, **`npm run lint` 13
errors + 1 warning**, chat widget broken on every send.

After this pass: `npx tsc --noEmit` clean · `npm run lint` clean (0 errors,
0 warnings) · `npm run build` exit 0 · all 17 spot-checked routes return 200.

### Critical — fixed

| ID | File | What was wrong | Fix |
|---|---|---|---|
| C-1 | `src/app/api/chat/route.ts` | The widget seeds the history with an `assistant` greeting and posts the whole array. Anthropic's Messages API requires the first message to be `user`, so it 400'd — and because the throw happened inside the `ReadableStream` after headers were flushed, the visitor saw a generic error. **The chat widget failed on every single send.** | Strip leading assistant turns server-side before calling `streamAIResponse`; 400 if nothing remains. |
| C-2 | `src/app/studio/layout.tsx` (new) | `/studio` rendered with no `<html>`/`<body>` — the root layout returns bare `children` and Studio had no layout of its own. | Added a Studio layout owning its shell, mirroring `admin/layout.tsx`. Verified: `/studio` now serves `<html lang="en">`. |

### Critical — partially fixed, one thread still open

| ID | File | Status |
|---|---|---|
| C-3 | `src/app/not-found.tsx` (new) | The global 404 now renders branded Vertex content instead of Next's built-in "This page could not be found", and emits exactly one `<html>` element. **Still open:** that wrapper carries a doctype but no `lang` attribute, because Next synthesises it when the root layout supplies no shell. The real fix is to move the document shell into `src/app/layout.tsx` and drop it from `[locale]/layout.tsx` — a load-bearing change to font loading, the pre-hydration theme script and per-locale `lang`, deliberately not attempted without room to verify hydration end-to-end. |
| C-4 | `src/app/[locale]/not-found.tsx` | **Confirmed dead code.** Verified against a production build that Next resolves *every* `notFound()` — including `/en/blog/<bad-slug>`, thrown deep inside the locale tree — to `src/app/not-found.tsx` instead. Left byte-for-byte unchanged; it becomes reachable again only once C-3's root-layout fix lands. |
| C-5 | `next.config.ts` | The legacy OptiMind `redirects()` block 308s `/terms`, `/en/terms` and `/mk/terms` to the locale homepage. `redirects()` runs *before* the filesystem router, so the Terms page Part 6 adds can never be served. **Not yet actioned deliberately:** deleting the two `/terms` entries before the page exists would turn them into 404s. Both must ship in the same deploy. The two `/demo` entries must stay. |

### High — fixed

| ID | File | Fix |
|---|---|---|
| H-1 | `src/app/[locale]/(site)/layout.tsx` | Added `setRequestLocale`. Without it next-intl read the locale from a request header (a dynamic API), forcing **every** locale route to server-render on demand. Build output confirms the routes flipped from `ƒ (Dynamic)` to `● (SSG)`. |
| H-2 | `src/app/[locale]/(site)/page.tsx` | Same fix — the homepage was the last page still missing it, so the site's most-requested page was never statically cached. |
| H-3 | `src/components/global/BackToTop.tsx` | `md:bottom-6` put the 44×44 FAB entirely inside the chat trigger's 56×56 box at a lower z-index, so on every desktop viewport it was invisible and every click opened the chat. Pinned to `bottom-24` at all breakpoints. |
| H-4 | `src/components/sections/HeroSection.tsx` | The two primary homepage CTAs were raw `<a href="/consulting">` — no locale prefix, full document reload, no prefetch. Routed through the locale-aware `Link`; hashes and absolute URLs still use `<a>`. Added the missing `focus-ring`. |
| H-5 | `src/components/chat/ChatPanel.tsx` | Same defect on the panel's `/contact` link. |
| H-6 | `ConsultingServicePage.tsx`, `MarketingServicePage.tsx` | The whole article body sat in one `<AnimateIn>`, whose `amount` is forwarded verbatim as the `IntersectionObserver` threshold. A ratio of 0.2 is unreachable on an element taller than 5 viewports, so on short viewports the body stayed at `opacity: 0` **permanently**. Set `amount={0}` on both. |
| H-7 | `src/components/sections/ContactForm.tsx` | A rejected `fetch` threw a `TypeError` whose raw browser text ("Failed to fetch" / "Load failed") was rendered verbatim, hiding `genericError` — the only string carrying the fallback contact address. Introduced a `SubmissionError` class so only authored messages surface. |
| H-8 | `blog/[slug]/BlogPostClient.tsx` | Hand-rolled `<script type="application/ld+json">` with unescaped `JSON.stringify`, embedding CMS- and LLM-authored title/excerpt/tags. A `</script>` in any of them breaks out of the element. Now routed through `<JsonLd>`, which escapes `<`. |
| H-9 | `src/app/globals.css` | shadcn tokens are bare HSL triplets (`0 0% 96%`) but `@theme inline` mapped them through without `hsl()`, so every generated utility emitted an invalid colour and was discarded. This silently broke `bg-primary`, `hover:bg-muted`, `focus-visible:ring-ring` and `aria-invalid:border-destructive` across **every variant of the shadcn Button**. Wrapped all 18 mappings in `hsl()`. |
| H-10 | `src/app/[locale]/(site)/privacy/page.tsx` | The literal placeholder `[to be set when published]` was live in the effective-date field of a GDPR privacy policy. Set to 14 August 2026. |

### Lint — all 13 errors + 1 warning fixed

| File | Rule | Fix |
|---|---|---|
| `Confetti.tsx` (×6) | `react-hooks/purity` | Replaced `Math.random()` with a pure hash of `(index, channel)`. Same visual scatter, but stable if React discards the `useMemo` cache — previously a dropped cache re-rolled every trajectory mid-flight and the burst visibly restarted. |
| `BackgroundSilk/Plasma/Grid.tsx` (×3) | `react-hooks/set-state-in-effect` | Extracted `useShouldAnimate()` into the new `src/lib/useMediaQuery.ts`, built on `useSyncExternalStore` so `getServerSnapshot` covers the hydration render and SSR markup stays byte-identical. |
| `ThemeToggle.tsx` | `react-hooks/set-state-in-effect` | `useIsHydrated()` from the same module, replacing the `setMounted(true)` mount gate. |
| `Navbar.tsx` | `react-hooks/set-state-in-effect` | Closing the mobile menu on route change moved from an effect to React's render-phase "adjust state when a prop changes" pattern. This also removes a real artifact: an effect runs after paint, so the open overlay flashed over the new page before closing. |
| `Silk.tsx` | unused directive (the warning) | Removed an `eslint-disable` for a rule this config never enables. |

### Also corrected

- **`src/app/[locale]/(site)/privacy/page.tsx` §9 was factually false.** It claimed analytics "only run if you have consented". `<Analytics />` from `@vercel/analytics` is mounted unconditionally in `[locale]/layout.tsx:95`. Section 9 now describes what the code actually does: cookieless Vercel Web Analytics running on every visit, language/theme in local storage rather than cookies, no advertising or tracking cookies, and third-party cookies from the embedded map. The Vercel row in the third-party table was updated to match. **This wording should go to a lawyer before launch.**
- Address corrected to `Str. Mladinska 43, Strumica, 2400, North Macedonia` (was "Macedonia", missing the postal code) in both places it appears in the policy.

### Part 4 additions (2026-08-14)

**Source images over 300KB** (Part 4.5 asks these be flagged, not necessarily
re-encoded). All four are project screenshots in `public/projects/`, all served
through `next/image`:

| File | Size |
|---|---|
| `public/projects/sunset.png` | 1,290 KB |
| `public/projects/northgate.png` | 806 KB |
| `public/projects/daliborac.png` | 706 KB |
| `public/projects/iqup.png` | 487 KB |

Mitigated rather than fixed: `next.config.ts` now sets
`images.formats = ['image/avif', 'image/webp']`, so Next negotiates a modern
format per request and the delivered bytes are a fraction of the source. The
PNGs are left untouched on purpose — they are client work samples, and
re-encoding them lossily to shave repo size trades real visual quality for
bytes that are never actually shipped to a browser. `public/lazar.png`
(248 KB) is under the threshold. No raw `<img>` exists anywhere on the site,
and all seven `next/image` usages already carry explicit dimensions.

**Deliberate deviation — title pattern.** Part 4.3 asks for
`<Page> — Vertex Consulting` AND `≤ 60 characters`. Those two rules conflict on
this site: the existing suffix is `| Vertex`, chosen deliberately (documented
in `src/app/layout.tsx`) because the longer brand suffix ate the room local
keywords need. Switching to `— Vertex Consulting` adds 12 characters and pushes
several titles past 60 — e.g. "Workflow Restructuring for Macedonian Teams"
would land at 64. The ≤60 rule is the one with real SERP consequence
(truncation), so the existing suffix was kept. All 34 measured titles are
unique and ≤ 52 characters.

**Not measurable locally — blog post metadata.** The 3 blog posts live in
Sanity, which is not configured on this machine, so `/blog/[slug]` returns no
posts and its titles/descriptions could not be measured. 34 of the nominal 40
title/description pairs were verified; the remaining 6 (3 posts × 2 locales)
are generated by the same `generatePageMetadata` helper from CMS fields.

### Deferred to their own parts

`siteConfig` still lacks `phoneHref`, `address.postalCode` and structured `openingHours`, and `address.country` is still `"Macedonia"` — these land in Part 7 alongside the consumers that need them, so the visible text and the schema change together. `contact/ContactPageClient.tsx:72` still emits `tel:+389 70 214 033` **with spaces** (an invalid tel URI; the Footer correctly strips them) and is fixed by `phoneHref` in the same pass.

> `Fix applied` is filled in as each finding is resolved. Findings marked **Deferred** are cosmetic and listed at the bottom.


---

## Critical (3)


### C-01 · `next.config.ts:26`

**Legacy /terms 308 redirect makes the planned Terms page permanently unreachable**


next.config.ts 308-redirects /en/terms, /mk/terms and /terms to the locale homepage. Next.js evaluates redirects() BEFORE the filesystem router, so the moment Phase 17 adds src/app/[locale]/(site)/terms/page.tsx, that page can never be served — every request to /en/terms is answered with a 308 to /en before routing is ever consulted. Worse, `permanent: true` emits a 308, which browsers cache indefinitely and Google treats as a permanent signal, so users and crawlers that hit /terms once before the fix will keep skipping the real page even after the redirect is deleted. The /demo entries do not have this problem — no /demo page is planned — and must stay, because optimind000.com still 308s legacy traffic here with the path preserved.


```
{
        source: '/:locale(en|mk)/terms',
        destination: '/:locale',
        permanent: true,
      },
...
      {
        source: '/terms',
        destination: '/en',
        permanent: true,
      },
```


**Fix:** Delete exactly two entries from the redirects() array: the `/:locale(en|mk)/terms` object (lines 26-30) and the `/terms` object (lines 37-41). KEEP both /demo entries — `/:locale(en|mk)/demo` (lines 21-25) and `/demo` (lines 32-36) — unchanged. Do the deletion in the SAME deploy that ships the /terms page so no window exists where /terms 404s. Then add `{ path: '/terms', priority: 0.3, changeFrequency: 'yearly' }` to STATIC_PATHS in src/app/sitemap.ts, and (because a 308 is client-cached) submit https://vertexconsulting.mk/en/terms and /mk/terms through IndexNow via submitToIndexNow() plus a Search Console URL inspection request to force re-crawl.


**Fix applied:** _pending_


### C-02 · `src/app/api/chat/route.ts:62`

**Chat payload starts with an assistant turn — Anthropic rejects every first send**


ChatWidget seeds the conversation with an assistant greeting, then sends the whole history to /api/chat. The route validates roles but never normalises the array, so `messages[0].role === 'assistant'` is forwarded verbatim to `client.messages.stream()`. The Anthropic Messages API requires the first message to use the `user` role and returns a 400 (`messages: first message must use the "user" role`) otherwise. The throw happens inside the ReadableStream `start()` after headers are already flushed, so the client gets HTTP 200 with an aborted body, `reader.read()` rejects, and ChatWidget shows the translated `chat.errors.generic` string. Because the greeting is never removed from state, EVERY subsequent send still leads with the assistant turn — the widget can never produce a single successful reply. This also perfectly explains the symptom the project docs blame on a missing API key.


```
src/components/chat/ChatWidget.tsx:43-45
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', content: greeting }])
    }

src/components/chat/ChatWidget.tsx:100-102
            messages: [...messages, userMsg].filter(
              (m) => m.content.length > 0,
            ),

src/app/api/chat/route.ts:45-47
    if (m.role !== 'user' && m.role !== 'assistant') {
      return new Response('Invalid message role', { status: 400 })
    }

src/app/api/chat/route.ts:62
        for await (const chunk of streamAIResponse(messages, systemPrompt)) {

src/lib/ai.ts:65-70
  const stream = client.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: CLAUDE_MAX_TOKENS,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  })
```


**Fix:** Normalise the array server-side before calling streamAIResponse: drop any leading assistant turns (`while (messages[0]?.role === 'assistant') messages.shift()`) and reject an empty result with a 400. Belt-and-braces: keep the greeting as a display-only message in ChatWidget (a separate `greeting` render slot, or a `display: true` flag) so it is never included in the fetch payload. Add a `pageUrl`-independent smoke test: POST `{messages:[{role:'assistant',content:'hi'},{role:'user',content:'hi'}]}` and confirm a 200 with a non-empty body.


**Fix applied:** _pending_


### C-03 · `src/app/layout.tsx:82`

**Root layout renders no <html>/<body>: every 404 and /studio ship broken HTML**


The root layout returns bare children. next-intl's split-layout pattern requires a companion src/app/not-found.tsx (and a [locale]/[...rest] catch-all) supplying its own html/body. Neither exists. Reproduced against a real next build + next start: (1) GET /mk/no-such-page and GET /en/this-page-does-not-exist return Next's built-in default 404 ('This page could not be found') wrapped in <html id="__next_error__"> with no <!DOCTYPE html>, no lang attribute (grep count of lang= in the body: 0), no navbar/footer/skip-link, and English-only copy on /mk. The custom src/app/[locale]/not-found.tsx is never reached for unmatched URLs, i.e. it is dead code for its primary purpose. (2) GET /studio returns 200 with 14590 bytes of markup containing zero <!DOCTYPE>, zero <html> and zero <body> tags, forcing quirks mode on the Sanity Studio SPA. A normal page (GET /mk) correctly emits <!DOCTYPE html> and <html lang="mk" ...>, isolating the defect to routes rendered under the bare root layout.


```
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
```


**Fix:** Add src/app/not-found.tsx rendering its own <html lang="en"><body> shell around a branded 404, and add src/app/[locale]/[...rest]/page.tsx containing `export default function CatchAll() { notFound() }` so unmatched locale URLs fall into [locale]/not-found.tsx. Also add src/app/studio/layout.tsx with an html/body shell, mirroring src/app/admin/layout.tsx.


**Fix applied:** _pending_


---

## High (15)


### H-01 · `src/app/[locale]/(site)/blog/[slug]/BlogPostClient.tsx:92`

**BlogPosting JSON-LD injected without escaping `<` (script-breakout)**


The post page hand-rolls its `<script type="application/ld+json">` with a raw `JSON.stringify()`, unlike every other schema block on the site which goes through `src/components/global/JsonLd.tsx` — a component that exists specifically to escape `<` and whose docblock says so. The stringified object embeds `post.title`, `post.excerpt`, `post.tags` and `post.author.role`, all CMS-authored. Worse, `src/lib/contentGenerator/createPost.ts:64` writes `_type: 'blogPost'` documents straight through the Sanity HTTP API with LLM-generated `draft.title` / `draft.excerpt` / `draft.tags`, bypassing Studio validation entirely. Any of those strings containing `</script>` terminates the script element early: the remainder of the JSON spills into the DOM as visible text, the BlogPosting structured data is destroyed, and an attacker-or-model-authored `</script><img src=x onerror=...>` executes.


```
BlogPostClient.tsx:90-93
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

Contrast with src/components/global/JsonLd.tsx:14-17 (the project's own mitigation):
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}

And src/lib/contentGenerator/createPost.ts:64-67 (unvalidated LLM text reaching those fields):
    _type: 'blogPost',
    title: { _type: 'localizedString', en: draft.title.en, mk: draft.title.mk },
    slug: { _type: 'slug', current: finalSlug },
    excerpt: { _type: 'localizedText', en: draft.excerpt.en, mk: draft.excerpt.mk },
```


**Fix:** Delete the inline `<script>` and render `<JsonLd data={blogSchema} />` instead (import from '@/components/global'). JsonLd is a server component, but it is rendered as a child of a client component here — either lift the schema block into `blog/[slug]/page.tsx` and render `<JsonLd data={blogSchema} />` there (preferred; it also moves the JSON-LD out of the client bundle), or apply the same `.replace(/</g, '\\u003c')` inline.


**Fix applied:** _pending_


### H-02 · `src/app/[locale]/(site)/layout.tsx:11`

**Missing setRequestLocale in (site) layout makes all 19 locale routes dynamic**


SiteLayout calls getTranslations('common') and getLocale() but never calls setRequestLocale, and does not even accept params. next-intl then resolves the locale from the x-next-intl-locale request header, which is a dynamic API, so the entire (site) subtree opts out of static rendering despite generateStaticParams() existing in [locale]/layout.tsx. Proven: `npm run build` on the current tree marks every locale route as 'f (Dynamic) server-rendered on demand'. Adding setRequestLocale to this one file flips all of them to '(SSG) prerendered as static HTML' in a rebuild (verified, then reverted). Impact: every page view pays a full SSR render instead of being served from Vercel's static/edge cache, hurting TTFB and LCP on the site's whole public surface.


```
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const tCommon = await getTranslations('common')
  const locale = (await getLocale()) as Locale
```


**Fix:** Accept `params: Promise<{ locale: string }>`, await it, and call `setRequestLocale(locale as Locale)` before getTranslations/getLocale, matching the pattern already used in every page under (site).


**Fix applied:** _pending_


### H-03 · `src/app/[locale]/(site)/page.tsx:38`

**Homepage is the only page missing setRequestLocale, staying dynamic**


HomePage takes no params and never calls setRequestLocale, unlike all 18 other pages in src/app (verified by grep: every other page.tsx calls it). Isolated experimentally: after fixing (site)/layout.tsx alone, the build output showed '. /[locale]/about' and '. /[locale]/contact' as SSG while '/[locale]' remained 'f (Dynamic)'. Only when setRequestLocale was also added to this file did the homepage prerender. The site's single most important page therefore never gets statically cached.


```
export default async function HomePage() {
  const t = await getTranslations('home')
  const tMeta = await getTranslations('home.meta')
```


**Fix:** Change the signature to `HomePage({ params }: { params: Promise<{ locale: Locale }> })`, await params, and call setRequestLocale(locale) before the getTranslations calls.


**Fix applied:** _pending_


### H-04 · `src/app/[locale]/(site)/privacy/page.tsx:48`

**Entire privacy policy body is hardcoded English JSX, served under <html lang="mk">**


Every heading, paragraph, list item and table cell from line 48 to line 477 is a hardcoded English literal; not one string goes through t(). The page's only translated string is the MK banner at line 44 (t('pendingTranslationNotice')). Verified against the running server: GET /mk/privacy returns <html lang="mk"> with h1 'Privacy Policy - Vertex Consulting' and an entirely English body. That is a WCAG 3.1.1/3.1.2 failure (screen readers apply Macedonian pronunciation rules to English legal text) on top of the untranslated content itself, and it violates the project rule that user-visible strings route through next-intl.


```
<h1 className="text-h1 text-[var(--division-text-primary)] mb-6">
        Privacy Policy — Vertex Consulting
      </h1>
```


**Fix:** Move the policy body into a privacy.body namespace in messages/{en,mk}.json (or a locale-keyed MDX/Portable Text source) and render via t.rich(). As a stopgap, wrap the English body in <div lang="en"> so the language of parts is declared correctly.


**Fix applied:** _pending_


### H-05 · `src/app/[locale]/(site)/privacy/page.tsx:57`

**Placeholder text '[to be set when published]' is live on the production privacy policy**


The Effective date field ships a literal bracketed placeholder. Confirmed rendered in the live server response for /mk/privacy: the HTML contains 'Effective date:</strong> <!-- -->[to be set when published]'. This is the legally operative date field of a GDPR privacy policy on a public site, and it is unset.


```
<p>
          <strong className="text-[var(--division-text-secondary)] font-medium">
            Effective date:
          </strong>{' '}
          [to be set when published]
        </p>
```


**Fix:** Replace the placeholder with a real ISO date string, and move both the 'Effective date' and 'Last updated' values into messages/{en,mk}.json so they are maintained in one place.


**Fix applied:** _pending_


### H-06 · `src/app/api/chat/route.ts:19`

**Public LLM proxy with no auth and no server-side rate limit — unbounded Anthropic spend**


POST /api/chat is unauthenticated, has no per-IP/per-session rate limiting, and no rate limiting exists anywhere else in the stack (src/proxy.ts is a bare next-intl middleware and there is no vercel.json). The comment calls MAX_MESSAGES_PER_REQUEST a "per-session guard", but it is a per-request array-length cap — nothing tracks sessions, so a script can issue unlimited separate requests, each burning up to 40x2000 chars of input and 400 output tokens billed to the owner's Anthropic key. The client-side 20-message session cap in ChatPanel is trivially bypassed by calling the endpoint directly with curl (CORS does not protect a server-to-server POST). Cost is the direct, immediate impact; the project's own docs list per-IP rate limiting as deferred to "Phase 12B", which is still open.


```
src/app/api/chat/route.ts:9-11
// Per-session guard against abuse. Client also enforces this; server is a second line of defense.
const MAX_MESSAGES_PER_REQUEST = 40
const MAX_MESSAGE_LENGTH = 2000

src/app/api/chat/route.ts:19-23
export async function POST(req: NextRequest) {
  // Kill switch
  if (process.env.NEXT_PUBLIC_CHAT_ENABLED === 'false') {
    return new Response('Chat disabled', { status: 503 })
  }

src/proxy.ts:4
export default createMiddleware(routing)
```


**Fix:** Add a server-side rate limiter keyed on the client IP (`req.headers.get('x-forwarded-for')`) before the Anthropic call — e.g. an in-memory sliding window for localhost plus Vercel KV / Upstash for production, ~10 requests/min and ~50/hour per IP, returning 429 with `Retry-After`. Also cap the total character count across the whole `messages` array (not just per message), and consider a signed session cookie so the 20-turn client cap is enforceable server-side.


**Fix applied:** _pending_


### H-07 · `src/app/api/newsletter/route.ts:60`

**Newsletter endpoint sends mail to arbitrary addresses with no rate limit or confirmation**


POST /api/newsletter accepts any email address from any caller, adds it to the Resend audience, and immediately sends a welcome email from the vertexconsulting.mk domain. There is no rate limiting, no CAPTCHA, and no double opt-in — the honeypot only stops naive bots, since a direct POST simply omits the `website` field. An attacker can therefore (a) mail-bomb a third party by POSTing their address in a loop, each message sent from Vertex's own sending domain, which torches domain reputation and deliverability for the real newsletter, and (b) enrol non-consenting addresses into the marketing audience, which is a GDPR consent problem for an EU-facing business.


```
src/app/api/newsletter/route.ts:18-20
    if (body.website && body.website.trim() !== '') {
      return NextResponse.json({ ok: true }, { status: 200 })
    }

src/app/api/newsletter/route.ts:34-38
    const { error: contactError } = await resend.contacts.create({
      email,
      audienceId: resendConfig.audienceId,
      unsubscribed: false,
    })

src/app/api/newsletter/route.ts:60-63
    const { error: welcomeError } = await resend.emails.send({
      from: `Vertex Consulting <${resendConfig.from}>`,
      to: email,
      subject: 'Welcome to the Vertex newsletter',
```


**Fix:** Rate-limit by IP (e.g. 3 subscribe attempts per hour) before touching Resend, and switch to double opt-in: `contacts.create({ unsubscribed: true })` plus a signed, time-limited confirmation link, sending the welcome mail only after the link is clicked. Both changes together remove the mail-bomb vector and fix the consent gap.


**Fix applied:** _pending_


### H-08 · `src/app/globals.css:419`

**shadcn color tokens are bare HSL triplets mapped without hsl() — every shadcn utility emits an invalid color**


The shadcn tokens are stored as bare HSL component triplets (`0 0% 96%`) in @layer base, the v3 shadcn convention where the Tailwind config wrapped them as `hsl(var(--primary))`. But the Tailwind v4 `@theme inline` block maps them straight through with no hsl() wrapper, so every generated utility emits e.g. `background-color: var(--primary)` which substitutes to the literal `0 0% 96%` — not a valid CSS color. Each such declaration is invalid at computed-value time and is discarded: bg-* falls back to transparent, text-* falls back to the inherited color, border-* falls back to currentColor. I verified this by compiling globals.css with @tailwindcss/cli 4.3.3; the emitted rules are `.bg-primary { background-color: var(--primary); }`, `.border-border { border-color: var(--border); }`, `.bg-background { background-color: var(--background); }`, `.bg-muted`, `.bg-secondary`, `.bg-destructive\/10`, `.ring-ring { --tw-ring-color: var(--ring); }` — all pointing at bare triplets. Concrete consequences: (1) src/components/ui/button.tsx variant `default` is `"bg-primary text-primary-foreground"` and renders with NO background at all — every call site is currently papering over this with an inline `style={{ backgroundColor: 'var(--division-accent)' }}` (ContactForm.tsx:336, CTABanner.tsx:73), which is why the breakage is invisible today and will reappear the moment anyone uses the primitive as designed; (2) the Button's only focus indicator is `outline-none focus-visible:ring-3 focus-visible:ring-ring/50`, and since `--tw-ring-color` resolves to `color-mix(in oklab, 0 0% 96% 50%, transparent)` the whole `box-shadow` declaration is invalid and dropped — Buttons that do not add the custom `.focus-ring` class have no visible keyboard focus ring (WCAG 2.4.7 failure).


```
--color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
...
    --primary: 0 0% 96%;
    --primary-foreground: 0 0% 8%;
...
    --border: 0 0% 25%;
    --ring: 0 0% 96%;
```


**Fix:** Wrap the mappings in the `@theme inline` block at lines 406-432 with hsl(), e.g. `--color-primary: hsl(var(--primary));`, `--color-border: hsl(var(--border));`, and the same for background, foreground, ring, input, destructive, accent(-foreground), muted(-foreground), secondary(-foreground), primary-foreground, popover(-foreground), card(-foreground). Alternatively convert every triplet in the @layer base blocks (lines 437-456, 484-498, 514-528, 566-584) to a complete color value such as `--primary: hsl(0 0% 96%);` and leave the inline mapping as-is. After the fix, audit the inline `style={{ backgroundColor: 'var(--division-accent)' }}` overrides on Button/buttonVariants call sites — they become redundant.


**Fix applied:** _pending_


### H-09 · `src/components/chat/ChatPanel.tsx:243`

**No client-side length cap: one >2000-char message permanently bricks the chat session**


The textarea has no `maxLength`, but `/api/chat` rejects any message over 2000 chars with a 400 (`MAX_MESSAGE_LENGTH = 2000` -> `return new Response('Invalid message content', { status: 400 })`). ChatWidget resends the ENTIRE history on every turn (`messages: [...messages, userMsg].filter((m) => m.content.length > 0)`), and its error handler only strips the empty assistant placeholder — it never removes the offending user message. Failure: user pastes a 3000-char question -> 400 -> generic error banner -> the 3000-char user message stays in `messages` forever -> every subsequent send re-includes it and 400s again. The chat is dead for the rest of the session with no in-UI recovery; only a full page reload fixes it. No character counter and no per-field validation exist either.


```
<textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}

// ChatWidget.tsx:100-102 — the bad message is resent every turn
            messages: [...messages, userMsg].filter(
              (m) => m.content.length > 0,
            ),

// ChatWidget.tsx:136-142 — only the empty placeholder is removed, never the oversized user msg
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (last?.role === 'assistant' && last.content === '') {
            return prev.slice(0, -1)
          }
          return prev
        })
```


**Fix:** Add `maxLength={2000}` to the textarea (plus a visible counter past ~1800 chars), and in the ChatWidget catch block also drop the just-sent user message (or truncate it) when the response status is 400 so the history cannot stay permanently poisoned.


**Fix applied:** _pending_


### H-10 · `src/components/chat/ChatWidget.tsx:175`

**Chat trigger completely covers the Back-to-Top button on desktop (md and up)**


The chat trigger is `fixed z-50 bottom-6 right-6` at `h-14 w-14` (56x56 at 24px/24px offsets, so it occupies x=[24,80], y=[24,80] from the bottom-right corner). BackToTop is `fixed bottom-24 md:bottom-6 right-6 z-40` wrapping an `h-11 w-11` button (44x44). At >=768px BackToTop resolves to the exact same anchor corner and its 44x44 box (x=[24,68], y=[24,68]) sits entirely inside the trigger's 56x56 box at a LOWER z-index. Result: on every desktop viewport the Back-to-Top FAB is invisible and unclickable — all pointer events land on the chat trigger and open the chat instead. Both components are mounted unconditionally in src/app/[locale]/layout.tsx (lines 89-90), so this affects every page. Mobile is fine (BackToTop's bottom-24 = 96px clears the trigger's 80px top edge by 16px).


```
// ChatWidget.tsx:173-176
        className={cn(
          'chat-trigger fixed z-50',
          'bottom-6 right-6',
          'flex h-14 w-14 items-center justify-center rounded-full',

// src/components/global/BackToTop.tsx:42-46
          className="fixed bottom-24 md:bottom-6 right-6 z-40"
        >
          <Button
            size="icon"
            onClick={scrollToTop}
            className="h-11 w-11 rounded-full glass cursor-pointer"
```


**Fix:** Move BackToTop out of the chat trigger's footprint on desktop — change its class to `fixed bottom-24 md:bottom-24 right-6 z-40` (stacked above the trigger at all breakpoints), or shift it left with `right-6 md:right-24`. Do not fix by raising BackToTop's z-index; that would just bury the chat trigger instead.


**Fix applied:** _pending_


### H-11 · `src/components/global/Navbar.tsx:410`

**Mobile menu overlay (z-40) is painted under the chat FAB (z-50) and tied with BackToTop (z-40)**


The full-screen mobile nav overlay is `z-40`. Two other fixed elements are rendered as siblings in the SAME root stacking context and are NOT inside <main> or <footer>: the chat trigger at `fixed z-50` (src/components/chat/ChatWidget.tsx:174) and BackToTop at `z-40` (src/components/global/BackToTop.tsx:42). Neither MotionWrapper (renders only <MotionConfig>, no DOM) nor DivisionProvider (`min-h-screen`, no transform/opacity/filter/isolation) creates a stacking context, so the comparison is direct. Consequence: (1) the chat bubble visually floats ON TOP of the opaque mobile nav; (2) BackToTop ties at z-40 but is later in DOM order in src/app/[locale]/layout.tsx (children -> BackToTop -> ChatWidget), so it also paints on top; (3) the Navbar's inert guard only covers `main` and `footer` (lines 69-72), so both floating controls stay mouse-clickable AND in the tab order while the menu is open — a keyboard user tabbing past the last menu link lands on the chat button, which is supposed to be behind a modal-ish overlay. Reproduce: on a phone viewport scroll past 500px (BackToTop appears), then tap the hamburger.


```
Navbar.tsx:410            className="fixed inset-0 z-40 lg:hidden"
Navbar.tsx:69-72              const main = document.querySelector('main')
              const footer = document.querySelector('footer')
              if (main) main.inert = true
              if (footer) footer.inert = true
BackToTop.tsx:42          className="fixed bottom-24 md:bottom-6 right-6 z-40"
ChatWidget.tsx:174          'chat-trigger fixed z-50',
```


**Fix:** Raise the mobile overlay above the floating controls (e.g. `z-45`/`z-[45]` is not enough — use a value above 50, or drop the chat trigger + BackToTop to z-30), and extend the inert sweep in the mobileOpen effect to the floating siblings, e.g. tag them with `data-chrome-floating` and set `.inert = true` on each alongside main/footer. Alternatively hide them entirely while mobileOpen via a shared context flag.


**Fix applied:** _pending_


### H-12 · `src/components/sections/ConsultingServicePage.tsx:110`

**Whole article body wrapped in one AnimateIn — IO threshold 0.2 unreachable on short viewports**


The entire long-form body of all four consulting service pages sits inside a single <AnimateIn>. AnimateIn defaults to `amount = 0.2` and passes it straight through as `viewport={{ once, amount }}`, and motion maps `amount` verbatim onto the IntersectionObserver `threshold` with no clamping (node_modules/framer-motion/dist/es/motion/features/viewport/index.mjs: `threshold: typeof amount === "number" ? amount : thresholdNames[amount]`). An IntersectionObserver can never report `intersectionRatio >= 0.2` for an element more than 5x taller than the viewport, so the `hidden` variant (`fadeInUp` = `{ opacity: 0, y: 30 }`) is never replaced and the whole body stays invisible forever — the page renders hero + process + FAQ with a multi-thousand-pixel blank hole where the article should be. I measured the wrapper in a real browser at several widths on /consulting/business-consulting: 2737px tall at 375px wide (EN), 2872px (MK), 2982px at 364px wide (MK), 3363px at 320px wide (MK), 1920px at 844px wide (MK). Required visible viewport height = 0.2 x those = 547 / 574 / 596 / 673 / 384 CSS px. iOS Safari on an iPhone SE2/8 (375x667) reports innerHeight ~553 — below the 574px the MK page needs. Any phone in landscape (innerHeight ~320-390 after browser chrome) is below the 384px the 844px-wide layout needs. Note: I could not capture the failure live because the automation browser pane reported document.visibilityState === 'hidden', which suppresses all IntersectionObserver callbacks; the numbers above are measured layout heights plus the verbatim threshold mapping from the installed motion source.


```
ConsultingServicePage.tsx:109-111
      <Section className="pt-0 md:pt-0">
        <AnimateIn>
          <div className="prose-consulting max-w-3xl">

src/components/global/AnimateIn.tsx:36,46
  amount = 0.2,
      viewport={{ once, amount }}

src/lib/animations.ts:34-35
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
```


**Fix:** Do not gate a page-height element on a fractional IntersectionObserver threshold. Either pass `amount={0}` (or `amount="some"`) on this AnimateIn, or move the wrapper inside the `content.map` so each ContentSection animates on its own (each section is well under one viewport tall, so 0.2 is reachable).


**Fix applied:** _pending_


### H-13 · `src/components/sections/ContactForm.tsx:151`

**Network failure shows raw browser error text instead of the translated fallback**


When `fetch()` rejects — the single most common failure mode (offline, DNS failure, CORS block, Formspree unreachable) — the thrown value is a `TypeError` whose `.message` is a raw, untranslated, browser-specific string: 'Failed to fetch' in Chrome, 'Load failed' in Safari, 'NetworkError when attempting to fetch resource.' in Firefox. Because `err instanceof Error` is true for `TypeError`, the ternary takes the `err.message` branch and renders that string verbatim in the error banner. The carefully authored `genericError` message — which is the ONLY place the fallback contact address appears ('Something went wrong. Please try again or email info@vertexconsulting.mk.' / MK: '...пишете на info@vertexconsulting.mk.') — is therefore never shown in exactly the scenario it was written for. A Macedonian visitor with a flaky connection sees the English string 'Failed to fetch' and no way to reach the company. The same line also leaks Formspree backend text verbatim (line 143 `message = data.error`, e.g. 'Form not found', 'Project disabled') to end users, untranslated.


```
} catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : t('genericError'))
    }
```


**Fix:** Distinguish thrown-by-us errors from network rejections. Tag the intentional throw (e.g. `throw new FormspreeError(message)`) and in the catch use `setError(err instanceof FormspreeError ? err.message : t('genericError'))`. Simplest alternative: drop the `data.error` passthrough and always `setError(t('genericError'))`, logging the real detail with `console.error` only.


**Fix applied:** _pending_


### H-14 · `src/components/sections/HeroSection.tsx:69`

**Hero CTA buttons use a raw <a href> instead of the locale-aware Link, dropping the locale prefix**


Every hero CTA renders as a plain HTML anchor rather than the next-intl `Link` from '@/i18n/navigation' that every other link in this slice uses (DivisionSplit.tsx:47, ServicesOverview.tsx:55, CTABanner.tsx:67, ConsultingServicesGrid.tsx:42, MarketingServicesGrid.tsx:42). On the homepage the two hero buttons are given real internal routes, not hashes, so the emitted markup is literally `<a href="/consulting">` and `<a href="/marketing">` with no `/en` or `/mk` segment. Three concrete failures: (1) it is a plain anchor, so the click causes a full document reload instead of client-side navigation and gets no route prefetch — on the site's two primary CTAs; (2) `/consulting` still matches the proxy matcher `'/((?!api|_next|_vercel|studio|admin|opengraph-image|twitter-image|.*\..*).*)'`, so every click costs an extra middleware 307 redirect hop; (3) with localePrefix 'always', the locale for that redirect can only be recovered from the NEXT_LOCALE cookie / Accept-Language header, never from the href. Any cookie-less requester — Googlebot above all — that crawls /mk and follows these links resolves them to https://vertexconsulting.mk/consulting and is redirected to /en/consulting. The MK homepage therefore emits zero internal links to /mk/consulting and /mk/marketing, and its internal link equity is handed to the EN pages. The consulting/marketing landing pages happen to pass hash hrefs ('#services', '#leader', '#team') so they mask the bug; only the homepage exposes it.


```
HeroSection.tsx:67-79
            {buttons.map((btn) => (
              <MagneticButton key={btn.href}>
                <a
                  href={btn.href}
                  className={cn(
                    'inline-flex items-center justify-center min-h-[44px] px-7 py-3.5 rounded-button font-heading text-small font-medium transition-all',

src/app/[locale]/(site)/page.tsx:56-59
        buttons={[
          { label: t('hero.ctaPrimary'), href: '/consulting', variant: 'primary' },
          { label: t('hero.ctaSecondary'), href: '/marketing', variant: 'outline' },
        ]}
```


**Fix:** Import `Link` from '@/i18n/navigation' in HeroSection and render internal routes through it, keeping the plain `<a>` only for hash/external hrefs — e.g. `const isHash = btn.href.startsWith('#') || /^https?:/.test(btn.href)`, then render `isHash ? <a href={btn.href} …> : <Link href={btn.href} …>` with the identical className. Also add the project's `focus-ring` utility to that className (see the separate finding).


**Fix applied:** _pending_


### H-15 · `src/components/sections/MarketingServicePage.tsx:113`

**Whole article body wrapped in one AnimateIn — IO threshold 0.2 unreachable on short viewports**


Identical defect to ConsultingServicePage, affecting all four marketing service pages. The full `.prose-marketing` body (comparable length to the consulting bodies — marketing.aiDevelopment MK is the longest section payload of the eight at 2898 chars) is wrapped in one <AnimateIn> that inherits `amount = 0.2`, which motion forwards unclamped as the IntersectionObserver threshold. On any viewport where the wrapper is more than 5x the visible height, `isIntersecting` never becomes true, the `visible` variant never activates, and the body stays at `opacity: 0` permanently.


```
MarketingServicePage.tsx:112-114
      <Section className="pt-0 md:pt-0">
        <AnimateIn>
          <div className="prose-marketing max-w-3xl">

src/components/global/AnimateIn.tsx:36,46
  amount = 0.2,
      viewport={{ once, amount }}
```


**Fix:** Same fix: `amount={0}` on this AnimateIn, or move AnimateIn inside the `content.map` so each section is its own (short) observed element.


**Fix applied:** _pending_


---

## Medium (75)


### M-01 · `src/app/[locale]/(site)/about/AboutPageClient.tsx:58`

**Section overlines use --division-text-muted (3.9:1) below WCAG 4.5:1**


Three section eyebrow labels (Values line 58, Team line 71, Timeline line 87) render real translated content in --division-text-muted (#737373). Against --division-bg #141414 that is 3.89:1; the Values and Timeline sections sit on bg-[var(--division-surface)] #1C1C1C, which is 3.59:1. Both fail WCAG 1.4.3 AA (4.5:1), and the .overline utility sets font-size to --text-overline: 11px, well under the 18.66px large-text exemption. Uppercase with 0.14em tracking at 11px compounds it.


```
<p className="overline text-[var(--division-text-muted)] mb-3">
            {t('values.overline')}
          </p>
```


**Fix:** Switch these three overlines to text-[var(--division-text-secondary)] (#C9C9C9) or text-[var(--division-accent)], matching the treatment already used on the About hero overline at line 41 and on the homepage section overline.


**Fix applied:** _pending_


### M-02 · `src/app/[locale]/(site)/blog/BlogListingClient.tsx:78`

**Empty-state guidance text at 3.89:1 contrast**


When a filter matches no posts, the only actionable instruction on screen ("Try a different filter or check back soon.") is rendered in `--division-text-muted` #737373 on #141414 = 3.89:1 at `text-small` (14px). This is the one string that tells the user how to recover from the empty state, so it is the worst possible place for sub-AA contrast.


```
BlogListingClient.tsx:74-81
            <div className="text-center py-16 border border-dashed border-[var(--division-border)] rounded-card">
              <h3 className="text-h3 text-[var(--division-text-secondary)]">
                {t('empty.title')}
              </h3>
              <p className="mt-2 text-small text-[var(--division-text-muted)]">
                {t('empty.subtitle')}
              </p>
            </div>
```


**Fix:** Change line 78 to `text-[var(--division-text-secondary)]`.


**Fix applied:** _pending_


### M-03 · `src/app/[locale]/(site)/blog/[slug]/BlogPostClient.tsx:102`

**"Back to all posts" link text at 3.89:1 contrast**


The back link is interactive text — WCAG 1.4.3 applies to it at 4.5:1 the same as body copy, and there is no non-text indicator (no underline, no border) carrying its affordance at rest. It renders `--division-text-muted` #737373 on `--division-bg` #141414 = 3.89:1, at `text-small` (14px). Only on hover does it become `--division-text-primary`, which does not help keyboard or low-vision users scanning the page.


```
BlogPostClient.tsx:100-106
          <Link
            href="/blog"
            className="inline-flex items-center min-h-[44px] gap-2 text-small text-[var(--division-text-muted)] hover:text-[var(--division-text-primary)] transition-colors mb-8 focus-ring"
          >
            <ArrowLeft size={14} />
            <span>{tPost('backLink')}</span>
          </Link>
```


**Fix:** Change `text-[var(--division-text-muted)]` to `text-[var(--division-text-secondary)]` on this link (7.30:1), keeping the hover-to-primary transition.


**Fix applied:** _pending_


### M-04 · `src/app/[locale]/(site)/blog/[slug]/BlogPostClient.tsx:122`

**Post header meta and author role at 3.89:1 contrast**


On the article page itself, the publish date (line 122), the read-time (lines 124-126), the author's initials in the avatar (line 137) and the author's job title (line 145) are all `--division-text-muted` #737373 on #141414 = 3.89:1, at `text-micro` (12px) and `text-small` (14px). The date and author role are exactly the E-E-A-T signals a reader is looking for on a consulting blog — they are content, not chrome. The `·` separators on lines 121/123 are decorative and exempt.


```
BlogPostClient.tsx:121-127
              <span className="text-micro text-[var(--division-text-muted)]">·</span>
              <span className="text-micro text-[var(--division-text-muted)] tabular-nums">{formattedDate}</span>
              <span className="text-micro text-[var(--division-text-muted)]">·</span>
              <div className="flex items-center gap-1 text-micro text-[var(--division-text-muted)] tabular-nums">
                <Clock size={11} />
                <span>{post.readTime} {tPost('readTimeLong')}</span>
              </div>

BlogPostClient.tsx:145
                <p className="text-micro text-[var(--division-text-muted)]">{post.author.role}</p>
```


**Fix:** Move lines 122, 126, 137 and 145 to `text-[var(--division-text-secondary)]`, or raise the `--division-text-muted` token.


**Fix applied:** _pending_


### M-05 · `src/app/[locale]/(site)/blog/[slug]/page.tsx:50`

**Blog post pages emit no WebPage node and no BreadcrumbList**


Every other page in the app drops `<PageSchema …/>` at the top of its tree, which emits a typed WebPage node linked into the site graph plus a BreadcrumbList. The blog post route — the deepest, most-crawled URL class on the site — is the only one that doesn't. Verified live: https://vertexconsulting.mk/en/blog/five-signs-your-business-needs-a-workflow-overhaul ships 2 ld+json blocks (site @graph + BlogPosting), while https://vertexconsulting.mk/en/blog ships 3 (site @graph + CollectionPage + BreadcrumbList). Result: no breadcrumb rich-result trail in Google SERPs for any article, and the article's `mainEntityOfPage` @id points at a WebPage node that is never actually declared anywhere on the page.


```
blog/[slug]/page.tsx:45-51 — no PageSchema anywhere in the returned tree:
  const { slug, locale } = await params
  setRequestLocale(locale)
  const post = await getPostBySlug(slug, locale)
  if (!post) notFound()
  const related = await getRelatedPosts(slug, locale, 2)
  return <BlogPostClient post={post} related={related} />

Compare blog/page.tsx:37-44:
      <PageSchema
        path="/blog"
        type="CollectionPage"
        name={tMeta('title')}
        description={tMeta('description')}
        breadcrumbLabel={tNav('blog')}
      />
      <BlogListingClient posts={posts} />
```


**Fix:** Render `<PageSchema path={`/blog/${post.slug}`} type="WebPage" name={post.title} description={post.excerpt} breadcrumbLabel={post.title} />` in `BlogPostPage` before `<BlogPostClient/>`, and extend `buildBreadcrumbSchema`'s trail to `[{ name: tNav('blog'), path: '/blog' }, { name: post.title, path: `/blog/${post.slug}` }]` so the crumb reads Home › Blog › Post.


**Fix applied:** _pending_


### M-06 · `src/app/[locale]/(site)/consulting/ConsultingLandingClient.tsx:62`

**Services-section overline uses --division-text-muted (#737373) — 3.89:1, fails WCAG AA**


The "services.overline" eyebrow on the /consulting landing page is real content rendered at 11px in #737373 on the #141414 page background — 3.89:1, below the WCAG AA 4.5:1 minimum for normal-size text.


```
line 62:          <p className="overline text-[var(--division-text-muted)] mb-3">
line 63:            {t('services.overline')}

src/app/globals.css:468    --division-text-muted: #737373;
```


**Fix:** Change to `text-[var(--division-text-secondary)]`.


**Fix applied:** _pending_


### M-07 · `src/app/[locale]/(site)/contact/ContactPageClient.tsx:72`

**Contact page tel: href contains raw spaces; Footer strips them, so the two disagree**


`siteConfig.contact.phone` is stored as a display string with spaces ("+389 70 214 033"). The Footer strips whitespace before building the `tel:` URI; the Contact page does not, so it emits `href="tel:+389 70 214 033"`. Spaces are not valid in an RFC 3966 `tel:` URI — the browser percent-encodes them to `tel:+389%2070%20214%20033`, and dialer handling of encoded whitespace is inconsistent across mobile OS versions and in-app browsers. The result is that the primary click-to-call CTA on the Contact page can fail to open the dialer while the identical Footer link works. The root cause is that `site.ts` stores only a display-formatted phone and no dial-safe form, forcing every consumer to re-derive one (and one of the two got it wrong).


```
// src/app/[locale]/(site)/contact/ContactPageClient.tsx:15
  const phone = siteConfig.contact.phone
// src/app/[locale]/(site)/contact/ContactPageClient.tsx:72
                  href={`tel:${phone}`}

// src/components/global/Footer.tsx:314 — the same link, done correctly
                href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`}

// src/config/site.ts:16-20
  contact: {
    phone: "+389 70 214 033",
```


**Fix:** Add `phoneHref: "tel:+38970214033"` to `siteConfig.contact` in src/config/site.ts, then use it verbatim in both places: `href={siteConfig.contact.phoneHref}` at ContactPageClient.tsx:72 and Footer.tsx:314. That removes the per-call-site `.replace()` and the possibility of the two drifting again.


**Fix applied:** _pending_


### M-08 · `src/app/[locale]/(site)/contact/ContactPageClient.tsx:104`

**Division-contact overline uses --division-text-muted (3.9:1) below WCAG 4.5:1**


The 'division contact' section label is real translated content rendered at 11px (.overline sets --text-overline: 11px) in --division-text-muted #737373 on --division-bg #141414 = 3.89:1, failing WCAG 1.4.3 AA. It is the only heading for the two division email addresses beneath it, so it is not decorative.


```
<p className="overline text-[var(--division-text-muted)] mb-4">
                  {t('info.divisionContactOverline')}
                </p>
```


**Fix:** Use text-[var(--division-text-secondary)] here, consistent with the hero overline at line 23 which uses --division-accent.


**Fix applied:** _pending_


### M-09 · `src/app/[locale]/(site)/layout.tsx:36`

**Skip link target <main> is not focusable, so focus never moves in Safari**


The skip link at line 22 points at #main-content, but the <main> element has no tabIndex={-1}. Fragment navigation to a non-focusable element scrolls the viewport but does not move keyboard focus in Safari (and in some Chromium/AT combinations), so the next Tab press returns the user to the navbar link right after the skip link. That defeats WCAG 2.4.1 Bypass Blocks, which this element exists specifically to satisfy.


```
<main id="main-content" className="flex-1 pt-16">{children}</main>
```


**Fix:** Add tabIndex={-1} to the <main> element: <main id="main-content" tabIndex={-1} className="flex-1 pt-16 focus:outline-none">.


**Fix applied:** _pending_


### M-10 · `src/app/[locale]/(site)/marketing/MarketingLandingClient.tsx:73`

**Services and team overlines use --division-text-muted (#737373) — 3.89:1, fails WCAG AA**


Two real-content eyebrow labels on the /marketing landing page render at 11px in #737373: line 73 over the services grid (on #141414, 3.89:1) and line 89 over the team showcase (on `--division-surface` #1C1C1C, 3.59:1). Both are below the WCAG AA 4.5:1 minimum.


```
line 73:          <p className="overline text-[var(--division-text-muted)] mb-3">
line 74:            {t('services.overline')}
line 89:          <p className="overline text-[var(--division-text-muted)] mb-3">
line 90:            {t('team.overline')}

src/app/globals.css:468    --division-text-muted: #737373;
```


**Fix:** Change both to `text-[var(--division-text-secondary)]`.


**Fix applied:** _pending_


### M-11 · `src/app/[locale]/(site)/privacy/page.tsx:52`

**Effective/Last-updated dates rendered in --division-text-muted (3.9:1)**


The wrapper applies --division-text-muted (#737373) to the effective-date and last-updated lines. On --division-bg #141414 that is 3.89:1, below WCAG 1.4.3 AA 4.5:1. These are substantive legal metadata, not decoration, and text-small is well under the large-text threshold. The same problem repeats at line 473 for the closing disclaimer paragraph ('This policy is a plain-language document ...'), which is also real prose.


```
<div className="space-y-1 text-small text-[var(--division-text-muted)] mb-6">
```


**Fix:** Change both line 52 and line 473 to text-[var(--division-text-secondary)] (#C9C9C9, ~11:1 on #141414).


**Fix applied:** _pending_


### M-12 · `src/app/[locale]/(site)/privacy/page.tsx:416`

**Policy claims analytics run only with consent, but no consent mechanism exists**


Section 9 tells visitors that analytics cookies 'only run if you have consented', and Section 4 says consent is given 'by ticking a box, submitting a form, or clicking Accept.' No consent UI exists anywhere in the codebase (grep -ril 'cookie|consent' over src/components and src/app matches only this page, ThemeProvider, and the admin pages). Meanwhile <Analytics /> is mounted unconditionally in src/app/[locale]/layout.tsx line 95, and the Google Maps iframe in ContactPageClient line 137 loads third-party content on page load with no gate. The published policy therefore describes behaviour the site does not implement.


```
<li>
          <strong>Analytics cookies</strong> — if enabled, these help us understand how visitors
          use the site in aggregate. We do not identify individual visitors. These only run if
          you have consented.
        </li>
```


**Fix:** Either ship a consent gate that actually defers <Analytics /> and the Maps iframe until the user opts in, or rewrite Section 9 to describe what really happens (Vercel Web Analytics is cookieless; the Maps embed is third-party and loads on page view).


**Fix applied:** _pending_


### M-13 · `src/app/[locale]/layout.tsx:71`

**Whole message dictionary serialized to the client on every page (277KB MK homepage)**


getMessages() returns the entire bundle and it is handed to NextIntlClientProvider unfiltered, so all 441 keys are embedded in every page's RSC payload regardless of what the page uses. Verified: GET /mk returns 276,938 bytes of HTML, and grepping that homepage response for the Macedonian privacy-policy banner string ('Оваа политика за приватност е моментално достапна') returns 1 hit. messages/mk.json is 135,858 bytes and messages/en.json is 86,850 bytes; that payload is shipped on every navigation. Directly relevant to the open Phase 16 performance audit.


```
const messages = await getMessages()
```


**Fix:** Pick only the namespaces actually needed by client components (chat, navbar, theme toggle, forms) with next-intl's pick helper, e.g. `messages={pick(messages, ['common', 'nav', 'chat', 'contact.form'])}`, and let server components keep using getTranslations directly.


**Fix applied:** _pending_


### M-14 · `src/app/[locale]/not-found.tsx:11`

**404 page hardcodes locale 'en', so /mk visitors get English copy that is already translated**


getTranslations is pinned to 'en'. messages/mk.json already contains a full notFound namespace ({"title":"Страницата не е пронајдена","description":"...","cta":"Назад на почетната"}), so the Macedonian strings exist and are simply never used. Verified live: GET /mk/blog/no-such-post (the one path that does reach this component, via notFound() in the blog slug page) renders '"className":"text-h1 ...","children":"Page not found"' in the flight payload. Macedonian users hit an English error page.


```
const t = await getTranslations({ locale: 'en' as Locale, namespace: 'notFound' }).catch(() => null)
```


**Fix:** Resolve the active locale with `const locale = await getLocale()` (next-intl/server) and pass it, falling back to routing.defaultLocale only if it is not a known locale. Once the [locale]/[...rest] catch-all from the root-layout finding exists, the request locale is always available here.


**Fix applied:** _pending_


### M-15 · `src/app/[locale]/not-found.tsx:19`

**'404' code rendered in --division-text-muted (3.9:1)**


The 404 numeral is the page's primary error identifier and is rendered in --division-text-muted #737373 on --division-bg #141414 = 3.89:1, failing WCAG 1.4.3 AA. The .overline utility pins it to 11px so no large-text exemption applies.


```
<p className="overline tabular-nums text-[var(--division-text-muted)] mb-3">
          404
        </p>
```


**Fix:** Use text-[var(--division-text-secondary)].


**Fix applied:** _pending_


### M-16 · `src/app/admin/generate/GenerateClient.tsx:54`

**Generate dashboard ignores res.ok — a 401 from /api/generate-post fails silently**


The client checks only `res.body`, never `res.ok`. When `/api/generate-post` returns its 401 JSON (`{"ok":false,"error":"Unauthorized"}` — reachable when the 7-day `vertex-admin` cookie expires while the dashboard is open, or after VERTEX_ADMIN_PASSWORD is rotated in Vercel), `res.body` is non-null, so the reader consumes the JSON body, none of it starts with `data: `, every chunk is discarded by the parser, no log line is ever appended, `running` flips back to false, and 1.2s later the page reloads. The operator sees the button flash and the page refresh with zero feedback and no post generated. The same silence swallows any non-SSE 4xx/5xx the route could return.


```
src/app/admin/generate/GenerateClient.tsx:53-54
      })
      if (!res.body) throw new Error('No response body')

src/app/admin/generate/GenerateClient.tsx:64-71
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const obj = JSON.parse(line.slice(6)) as LogLine
              setLogs((prev) => [...prev, obj])
            } catch {
              // ignore malformed line
            }

src/app/api/generate-post/route.ts:27-29
  if (!process.env.VERTEX_ADMIN_PASSWORD || adminCookie !== process.env.VERTEX_ADMIN_PASSWORD) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
```


**Fix:** Check the status before reading the stream: `if (!res.ok) { const body = await res.json().catch(() => null); throw new Error(body?.error ?? `HTTP ${res.status}`) }` — the existing `catch` already renders thrown messages as an error log line. Additionally, skip the `window.location.reload()` on a 401 and redirect to `/admin/login` instead.


**Fix applied:** _pending_


### M-17 · `src/app/api/chat/route.ts:42`

**messages: [null] crashes the handler with an unhandled 500 instead of a 400**


The validation loop dereferences `m.content` without first checking that `m` is a non-null object. A body of `{"messages":[null],"pageUrl":"/","locale":"en"}` passes the `Array.isArray` and length checks, then `typeof m.content` throws `TypeError: Cannot read properties of null (reading 'content')`. The only try/catch in the handler wraps `req.json()`, so the exception escapes the route and Next returns a generic 500 (with a full stack trace in dev). Trivially malformed input should be a 400, and the route currently has no top-level error boundary at all.


```
src/app/api/chat/route.ts:26-30
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

src/app/api/chat/route.ts:41-44
  for (const m of messages) {
    if (typeof m.content !== 'string' || m.content.length > MAX_MESSAGE_LENGTH) {
      return new Response('Invalid message content', { status: 400 })
    }
```


**Fix:** Guard the element shape first: `if (!m || typeof m !== 'object') return new Response('Invalid message', { status: 400 })` at the top of the loop, and wrap the whole handler body in a try/catch that logs server-side and returns a generic 500 without leaking the exception.


**Fix applied:** _pending_


### M-18 · `src/app/api/chat/route.ts:59`

**Client disconnect never aborts the upstream Anthropic stream**


The ReadableStream declares only `start()` — there is no `cancel()` handler — and `req.signal` is never threaded through to `streamAIResponse` / `client.messages.stream()`. When the visitor navigates away or closes the tab, ChatWidget aborts its fetch, but the server keeps consuming the Anthropic SSE stream to completion, generating and paying for output tokens nobody will read. Worse, once the response stream is cancelled the controller is no longer readable, so the next `controller.enqueue()` throws; that throw is swallowed by the `catch` into `controller.error(err)` on an already-dead controller, leaving the abandoned generator to run on. Combined with the missing rate limit above, aborted requests are a free way to multiply spend.


```
src/app/api/chat/route.ts:58-71
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
```


**Fix:** Create an AbortController in the handler, pass its signal down (`streamAIResponse(messages, systemPrompt, { signal })` → `client.messages.stream({...}, { signal })`), forward `req.signal`'s abort to it, and add a `cancel()` handler on the ReadableStream that calls `controller.abort()`. Also break out of the `for await` loop if the signal is already aborted.


**Fix applied:** _pending_


### M-19 · `src/app/api/generate-post/route.ts:55`

**SSE error path re-enqueues on a possibly-closed controller, masking the real error**


Both the `catch` and the `finally` write to the controller with no state guard. If the dashboard tab is closed mid-generation, the response stream is cancelled; the very next `log()` call inside `generateNextPost` throws `TypeError: Invalid state`, which aborts the pipeline partway (e.g. the Sanity post is created but Facebook/Instagram posting and the topic status update never run). Control then reaches the `catch`, where `controller.enqueue(errLine)` throws again, so the original error is discarded; `finally` runs `controller.close()` on the same dead controller and throws a third time, rejecting the `start()` promise as an unhandled rejection. Net effect: a browser-tab close can leave the content pipeline half-executed with no error recorded anywhere.


```
src/app/api/generate-post/route.ts:40-43
      const log: LogFn = (level, msg) => {
        const line = `data: ${JSON.stringify({ level, msg, ts: Date.now() })}\n\n`
        controller.enqueue(encoder.encode(line))
      }

src/app/api/generate-post/route.ts:55-63
      } catch (err: unknown) {
        const errLine = `data: ${JSON.stringify({
          level: 'error',
          msg: err instanceof Error ? err.message : String(err),
        })}\n\n`
        controller.enqueue(encoder.encode(errLine))
      } finally {
        controller.close()
      }
```


**Fix:** Track liveness with a `let closed = false` flag: set it in a new `cancel()` handler on the ReadableStream, make `log()` a no-op (or `console.log` fallback) when `closed` is true so the pipeline runs to completion regardless of the viewer, and wrap the `catch`/`finally` writes in `if (!closed) { ... }` plus a try/catch so a dead controller can never mask the original error.


**Fix applied:** _pending_


### M-20 · `src/app/api/newsletter/route.ts:22`

**No length cap on the submitted email before regex validation**


`body.email` is accepted at any length and passed straight into `.trim().toLowerCase()` and the validation regex. The pattern `[^\s@]+\.[^\s@]+$` allows the character class to match dots, so on a long dot-heavy string the engine backtracks across every possible split point — quadratic in input length. A single POST with a multi-megabyte `email` value burns CPU on the serverless function for no benefit, and with no rate limit (finding above) it can be repeated freely. There is also no type check: a non-string `email` (e.g. `{"email": {}}`) reaches `.trim()` and throws, which the outer catch converts into a 500 rather than a 400.


```
src/app/api/newsletter/route.ts:10-12
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

src/app/api/newsletter/route.ts:22-26
    const email = (body.email || '').trim().toLowerCase()

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }
```


**Fix:** Validate type and length before the regex: `if (typeof body.email !== 'string' || body.email.length > 254) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })` (254 is the RFC 5321 maximum). Apply the same 254-char cap client-side via `maxLength` on the Footer input.


**Fix applied:** _pending_


### M-21 · `src/app/globals.css:468`

**--division-text-muted #737373 fails WCAG AA on both dark surfaces**


The dark-mode muted text token is #737373. Against --division-bg #141414 that is 3.89:1 and against --division-surface #1C1C1C it is 3.59:1 — both below the WCAG 2.1 AA 4.5:1 minimum for normal-size body text. The same token is redefined identically for both divisions (lines 482 and 512). The light-mode branch was explicitly audited and corrected — line 560-564 carries a comment saying #9AA0AD was ~2.5:1 and was raised to #5F6670 for ~5.5:1 — but the dark value was left untouched with the note "Dark-mode value unchanged", so the dark theme (the site's default and only shipped theme per the design system) still fails. Every component that renders real content with `text-[var(--division-text-muted)]` inherits this failure.


```
--division-text-primary: #F5F5F5;
    --division-text-secondary: #A3A3A3;
    --division-text-muted: #737373;
```


**Fix:** Raise the dark-mode --division-text-muted from #737373 to at least #8A8A8A (4.5:1 on #1C1C1C, 4.9:1 on #141414) in all three places it is defined for dark: line 468 (:root), line 482 ([data-division="consulting"]) and line 512 ([data-division="marketing"]). #8A8A8A still reads visibly lighter-weight than --division-text-secondary #A3A3A3, so the three-step hierarchy survives. Leave the light-mode #5F6670 alone.


**Fix applied:** _pending_


### M-22 · `src/app/layout.tsx:72`

**viewport.themeColor #0E0E0E is a hardcoded hex that matches no design token**


The design system's base surface is --division-bg: #141414 (globals.css lines 459/473/503). #0E0E0E is not defined anywhere in globals.css, so the mobile browser chrome renders a different shade than the page it frames. src/app/admin/layout.tsx already declares `themeColor: '#141414'`, confirming this root value is stale rather than intentional. It also stays dark when the user selects the light theme (--division-bg becomes #FFFFFF at globals.css line 551), since themeColor cannot read CSS variables.


```
export const viewport: Viewport = {
  themeColor: '#0E0E0E',
  width: 'device-width',
  initialScale: 1,
}
```


**Fix:** Change to '#141414' to match --division-bg and the admin layout. If light-mode chrome matters, the theme-init script in src/app/[locale]/layout.tsx can also update <meta name="theme-color"> when it writes data-theme.


**Fix applied:** _pending_


### M-23 · `src/app/robots.ts:50`

**robots.txt Disallow on /privacy and /thank-you blocks crawlers from ever reading their noindex**


Both pages already emit `<meta name="robots" content="noindex, nofollow">` (privacy/page.tsx:18 and thank-you/page.tsx:19 -> generatePageMetadata -> `robots: { index: false, follow: false }` at src/lib/metadata.ts:71). Disallowing the same URLs in robots.txt is self-defeating: a crawler that is forbidden to fetch the URL can never read the noindex tag. Google documents this explicitly — a robots.txt-blocked URL that is linked from elsewhere can still be indexed as a bare URL-only result ("Indexed, though blocked by robots.txt"). /privacy is linked from the global footer on every page of the site (src/config/navigation.ts:54: `{ labelKey: 'footer.company.privacy', href: '/privacy' }`), so it is heavily internally linked and is exactly the case that gets URL-only indexed. The Disallow therefore produces the outcome the noindex was added to prevent.


```
'/en/privacy',
  '/mk/privacy',
  '/en/thank-you',
  '/mk/thank-you',
]
```


**Fix:** Remove the four locale-privacy/thank-you entries from the DISALLOW array in src/app/robots.ts (lines 50-53), leaving `'/api/', '/studio', '/studio/', '/admin', '/admin/'`. The noIndex metadata on the two pages is the correct and sufficient mechanism; let crawlers fetch the pages so they can obey it. Update the file's header comment (line 18) accordingly.


**Fix applied:** _pending_


### M-24 · `src/app/sitemap.ts:62`

**sitemap lastModified re-stamps all 30 static URLs on every regeneration**


The file header states the `new Date()` per-request bug was fixed and that static pages now report the build time. They do not. sitemap.ts exports neither `revalidate` nor `dynamic`, but it awaits getAllPosts('en'), whose inner Sanity fetch is tagged `{ next: { revalidate: 60, tags: ['blog'] } }` (src/lib/blog.ts:139). Next.js applies the lowest fetch-level revalidate found in a route to the whole route segment, so sitemap.xml is an ISR route that regenerates as often as every 60 seconds — and every regeneration re-evaluates `new Date()` and stamps that fresh timestamp onto all 15 STATIC_PATHS x 2 locales = 30 URLs. The route is also invalidated by src/app/api/revalidate/route.ts, which calls `revalidateTag(tag, 'max')` on the same `'blog'` tag the sitemap's fetch carries, so publishing a single blog post also re-stamps every unrelated static page. The result is the exact signal the header warns about: lastmod values that move constantly with no corresponding content change, which is how Google learns to ignore your lastmod entirely.


```
const buildTime = new Date()

  const all: Array<PathEntry & { lastModified: Date }> = [
    ...STATIC_PATHS.map((e) => ({ ...e, lastModified: buildTime })),
```


**Fix:** Stop deriving static-page lastmod from wall-clock time. Either add a `lastModified` field to each PathEntry in STATIC_PATHS and hand-maintain it (a hardcoded ISO date per page, bumped when the page's copy actually changes), or drop `lastModified` from the static rows entirely — an omitted lastmod is a neutral signal, whereas a churning one is a discredited signal. Keep `new Date(post.publishedAt)` for blog rows, which is already correct.


**Fix applied:** _pending_


### M-25 · `src/components/backgrounds/Plasma.tsx:240`

**WebGL2 context never released on cleanup — leaks a context per theme toggle**


The effect creates a new `ogl` `Renderer` (and therefore a new WebGL2 context) and its dep array includes `color`. `BackgroundPlasma` computes `resolvedColor` from `useTheme()` (`const resolvedColor = color ?? (theme === 'light' ? PLASMA_COLOR_LIGHT : PLASMA_COLOR_DARK)`), so every theme toggle on /marketing tears the effect down and builds a brand-new renderer. The cleanup stops the rAF, disconnects the observers and removes the canvas from the DOM — but never loses the GL context and never disposes the `Program`/`Geometry`. A detached canvas keeps its live context until GC runs; browsers hard-cap concurrent WebGL contexts (~16 in Chrome) and force-lose the oldest one when the cap is hit. Toggling the theme repeatedly on the marketing page therefore ends with the plasma hero going blank plus a 'Too many active WebGL contexts' console warning. Contrast with Silk, where R3F's <Canvas> owns disposal, so only this file is affected.


```
return () => {
      stop()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      ro.disconnect()
      if (mouseInteractive && containerEl) {
        containerEl.removeEventListener('mousemove', handleMouseMove)
      }
      try {
        containerEl?.removeChild(canvas)
      } catch {
        console.warn('Canvas already removed from container')
      }
    }
  }, [color, speed, direction, scale, opacity, mouseInteractive])
```


**Fix:** Add explicit GPU teardown inside the existing cleanup, after the canvas is removed: `program.remove(); geometry.remove(); gl.getExtension('WEBGL_lose_context')?.loseContext()`. (`program` and `geometry` are already in scope at lines 123 and 125.) That releases the context deterministically instead of waiting on GC.


**Fix applied:** _pending_


### M-26 · `src/components/chat/ChatPanel.tsx:184`

**aria-live="polite" wraps the whole transcript, so screen readers re-announce on every streamed chunk**


The live region is the entire scroll container, and the streaming loop in ChatWidget replaces the last assistant message's content on every `reader.read()` chunk (`updated[lastIndex] = { role: 'assistant', content: accumulated }`). Each of those dozens-to-hundreds of mutations is a change inside an aria-live region, so NVDA/JAWS/VoiceOver queue a polite announcement per chunk. Failure: a single 3-4 sentence Claude reply produces a backlog of overlapping partial announcements that the user must sit through or silence; the blinking caret `<span>` mounting/unmounting inside the same region adds more churn. The result is that the widget is effectively unusable with a screen reader even though every individual ARIA attribute is present.


```
<div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        aria-live="polite"
        aria-atomic="false"
      >

// ChatWidget.tsx:122-129 — one mutation inside the live region per chunk
          setMessages((prev) => {
            const updated = [...prev]
            const lastIndex = updated.length - 1
            if (updated[lastIndex]?.role === 'assistant') {
              updated[lastIndex] = { role: 'assistant', content: accumulated }
            }
            return updated
          })
```


**Fix:** Remove aria-live from the scroll container. Render the streaming bubble with `aria-live="off"`, and add a separate visually-hidden `role="status"` node that is populated once — with the final completed assistant message — when `isStreaming` transitions to false.


**Fix applied:** _pending_


### M-27 · `src/components/chat/ChatPanel.tsx:226`

**Muted text fails WCAG AA (~2.4:1) in light theme for four pieces of real content**


`--color-muted` is #A3A3A3 in dark (fine, ~6.7:1) but `html[data-theme="light"]` in globals.css:381 redefines it to #9AA0AD. Against the light `--color-elevated` #F1F3F5 that is 2.36:1, and against light `--color-surface` #F8F9FA it is 2.49:1 — both far under the 4.5:1 AA threshold. Light theme is user-reachable via ThemeToggle (persisted as `vertex-theme` in localStorage), so this is live. Four uses carry real content, not decoration: line 161 panel subtitle 'Ask us anything', line 226 the role="alert" error text, line 255 the textarea placeholder (which also carries the message-limit copy), line 294 the 11px AI-disclaimer footer. globals.css:559-564 documents this exact failure being fixed for `--division-text-muted` (#9AA0AD -> #5F6670) but `--color-muted`, which the whole chat widget uses, was never corrected.


```
// ChatPanel.tsx:220-229 — error text, real content
          <div
            role="alert"
            className={cn(
              'rounded-xl border border-[var(--color-border)] bg-[var(--color-elevated)]',
              'px-3 py-2 text-xs text-[var(--color-muted)]',
            )}
          >
            {error}

// also lines 161, 255, 294:
          <div className="text-[var(--color-muted)] text-xs leading-tight">
            'text-sm text-[var(--color-bright)] placeholder:text-[var(--color-muted)]',
        <div className="mt-2 text-[11px] text-[var(--color-muted)] text-center">

// src/app/globals.css:377-382 — the light override
html[data-theme="light"] {
  --color-muted: #9AA0AD;
```


**Fix:** In globals.css's `html[data-theme="light"]` block, change `--color-muted` from #9AA0AD to #5F6670 (the value already vetted at ~5.5:1 for `--division-text-muted`), matching the fix already applied to the division token.


**Fix applied:** _pending_


### M-28 · `src/components/chat/ChatPanel.tsx:252`

**Message-limit state is silent to assistive tech: input is disabled, aria-label is stale, no status announcement**


When `userMessageCount >= 20` the textarea is disabled and the only signal is the swapped `placeholder`. Disabled form controls are removed from the tab order and their placeholder text is not reliably exposed, so a keyboard/screen-reader user simply tabs from the message list straight past a control that has vanished, with no explanation. Compounding it, `aria-label` is hard-wired to `t('input.placeholder')` ('Ask a question about Vertex…') regardless of state, so any AT that does reach the field announces the wrong, now-contradictory name instead of 'You've reached the message limit for this session.' There is no `role="status"`/`role="alert"` node carrying `t('errors.messageLimit')` either.


```
placeholder={
              limitReached ? t('errors.messageLimit') : t('input.placeholder')
            }
            disabled={limitReached}
            className={cn(
              'flex-1 resize-none bg-transparent outline-none border-none',
              'text-sm text-[var(--color-bright)] placeholder:text-[var(--color-muted)]',
              'max-h-24 leading-relaxed',
              'disabled:opacity-60',
            )}
            aria-label={t('input.placeholder')}
```


**Fix:** Render `{limitReached && <p role="status" className="...">{t('errors.messageLimit')}</p>}` above the input row, keep the textarea focusable via `readOnly` + `aria-disabled="true"` instead of `disabled`, and make the label state-aware: `aria-label={limitReached ? t('errors.messageLimit') : t('input.placeholder')}`.


**Fix applied:** _pending_


### M-29 · `src/components/chat/ChatPanel.tsx:296`

**Footer contact link is a raw <a href="/contact"> instead of the i18n Link, destroying the conversation and dropping the locale**


Every other internal link in this codebase uses `Link` from '@/i18n/navigation'; this one is a bare anchor to a locale-less path. Two concrete failures. (1) It triggers a full document load, so ChatWidget remounts and the entire `messages` array is wiped — the user clicks 'contact us directly' from inside the chat and loses the conversation they were told to reference. (2) `routing` sets `localePrefix: 'always'`, and src/proxy.ts's catch-all matcher `'/((?!api|_next|_vercel|studio|admin|opengraph-image|twitter-image|.*\\..*).*)'` intercepts `/contact` — so the destination locale is resolved by middleware detection (NEXT_LOCALE cookie / Accept-Language), not by the locale the user is actually browsing, plus an extra redirect hop on every click.


```
{t('footer.poweredBy')}
          <a
            href="/contact"
            className="underline hover:text-[var(--color-bright)] transition-colors"
          >
            {t('footer.contactLink')}
          </a>
```


**Fix:** Import `Link` from '@/i18n/navigation' and use `<Link href="/contact" className="underline hover:text-[var(--color-bright)] transition-colors">` — client-side navigation preserves the chat state and next-intl injects the correct locale prefix.


**Fix applied:** _pending_


### M-30 · `src/components/chat/ChatWidget.tsx:52`

**Escape and close never restore focus to the trigger; no focus containment on the full-screen mobile panel**


Escape IS handled (a window keydown listener with correct cleanup) and the close button works, but neither returns focus anywhere — ChatPanel unmounts while the user's focus is inside it, so focus falls back to `<body>` and the keyboard user's position on the page is destroyed (WCAG 2.4.3 Focus Order). Separately, the panel declares `aria-modal="false"` and installs no focus containment, yet on mobile it renders as `top-0 right-0 bottom-0 left-0` (full-screen, opaque) AND locks body scroll: everything behind it is visually and physically unreachable, but Tab still walks straight out of the panel into the navbar and page content the user cannot see or scroll to. That combination — full-screen + scroll-locked + non-modal — is a keyboard trap in reverse.


```
// ChatWidget.tsx:49-56 — Escape closes but restores focus nowhere
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

// ChatPanel.tsx:120 and 132 — non-modal, yet full-screen on mobile
      aria-modal="false"
        'top-0 right-0 bottom-0 left-0 rounded-none',
```


**Fix:** Hold a ref to the trigger button and call `triggerRef.current?.focus()` in an effect that runs when `open` flips to false. For mobile, either contain focus (a Tab/Shift+Tab wrap handler on the panel, plus `aria-modal="true"` and `inert` on the page behind it under the sm breakpoint) or drop the body-scroll lock so the non-modal claim is honest.


**Fix applied:** _pending_


### M-31 · `src/components/chat/ChatWidget.tsx:167`

**Chat trigger stays in the tab order while the panel is open (invisible focus target)**


When the panel opens the trigger is hidden with animated `opacity: 0` and `pointerEvents: 'none'`. Neither property removes an element from the keyboard tab order — only `display:none`, `visibility:hidden`, `hidden`, `inert`, or `tabIndex={-1}` do. Failure: with the panel open, a keyboard user tabbing past the send button lands on a fully invisible 56x56 button with no visible focus ring anywhere on screen (WCAG 2.4.7 Focus Visible), and screen-reader users still hear 'Open chat with Vertex Assistant, button, expanded'. Activating it does nothing (`setOpen(true)` is a no-op while already open), so the user is stuck at a dead, unseeable stop.


```
animate={{
          opacity: open ? 0 : 1,
          scale: open ? 0.8 : 1,
          pointerEvents: open ? 'none' : 'auto',
        }}
```


**Fix:** Add `tabIndex={open ? -1 : 0}` and `aria-hidden={open}` to the motion.button (or set `inert` on it when `open`), so the hidden trigger leaves both the tab order and the accessibility tree.


**Fix applied:** _pending_


### M-32 · `src/components/chat/ChatWidget.tsx:195`

**Streaming request is not aborted when the panel is closed, only on widget unmount**


`abortRef.current?.abort()` runs only in the unmount cleanup of ChatWidget. But ChatWidget is mounted permanently in src/app/[locale]/layout.tsx (line 90) and never unmounts during the session — closing the panel merely flips `open` to false, which unmounts ChatPanel while ChatWidget (and the in-flight fetch) keeps running. Failure: user sends a question, closes the panel one token in, and the Anthropic stream runs to completion in the background — billed tokens, an open connection, and `setMessages` firing into hidden state. Worse, if that background request then fails (user walks away, wifi drops), the catch block runs `setError(t('errors.generic'))`; the next time the user opens the widget — possibly minutes later, on a different page — a stale 'Something went wrong' role="alert" is already sitting in the transcript with no request behind it.


```
// Cancel any in-flight stream on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

// line 195 — close does not abort
            onClose={() => setOpen(false)}
```


**Fix:** Abort on close as well: `onClose={() => { abortRef.current?.abort(); abortRef.current = null; setIsStreaming(false); setError(null); setOpen(false) }}` — or add an effect `useEffect(() => { if (!open) abortRef.current?.abort() }, [open])`. The existing `err.name === 'AbortError'` early-return in the catch already swallows the resulting rejection cleanly.


**Fix applied:** _pending_


### M-33 · `src/components/global/AnimateIn.tsx:47`

**AnimateIn `delay` prop is silently discarded by every variant in animations.ts**


`delay` is applied as a component-level `transition` prop. In motion v12 the component-level transition is only the *default*: `VisualElement.getDefaultTransition()` returns `this.props.transition`, and `animateTarget` does `transition = transition ? resolveTransition(transition, defaultTransition) : defaultTransition`. `resolveTransition` only merges the parent transition when the variant sets `inherit: true`, which none of the variants in src/lib/animations.ts do. Every entrance variant in that file carries its own `visible.transition` (e.g. `fadeInUp.visible.transition = springSnap`), so the variant transition wins outright and `{ delay }` is thrown away. Result: `<AnimateIn delay={0.1}>` and `<AnimateIn delay={0.15}>` at src/app/[locale]/(site)/contact/ContactPageClient.tsx:45 and :52 animate with zero delay — the intended cascade on the contact page never happens, and the prop is dead for any future caller too.


```
transition={delay ? { delay } : undefined}

// motion-dom/dist/es/animation/interfaces/visual-element-target.mjs:24
//   transition = transition ? resolveTransition(transition, defaultTransition) : defaultTransition;
// motion-dom/dist/es/animation/utils/resolve-transition.mjs:7
//   if (transition?.inherit && parentTransition) { ... }  return transition;
// src/lib/animations.ts:36  fadeInUp: { hidden: {...}, visible: { ..., transition: springSnap } }
```


**Fix:** Merge the delay into the variant instead of passing it as a prop. Drop the `transition` prop and compute: `const resolved = delay ? { ...variants, visible: { ...(variants.visible as TargetAndTransition), transition: { ...((variants.visible as TargetAndTransition).transition ?? {}), delay } } } : variants`, then pass `variants={resolved}`. Memoize with `useMemo` on `[variants, delay]`.


**Fix applied:** _pending_


### M-34 · `src/components/global/BackToTop.tsx:20`

**Scroll handler reads scrollHeight on every scroll tick, forcing synchronous layout**


`useMotionValueEvent(scrollY, 'change', ...)` fires on every scroll update, and the callback reads `window.innerHeight` and `document.documentElement.scrollHeight`. `scrollHeight` is a layout-invalidating read: the browser must flush pending style/layout before returning it, so every scroll event triggers a forced synchronous reflow. On the pages carrying the WebGL heroes (Silk/Plasma) this is exactly the kind of per-frame main-thread work the IntersectionObserver render gating was introduced to eliminate, and it runs unconditionally on every route.


```
useMotionValueEvent(scrollY, 'change', (latest) => {
    if (typeof window === 'undefined') return
    const viewportH = window.innerHeight
    const docH = document.documentElement.scrollHeight
    const nearBottom = latest + viewportH > docH - 200
    setVisible(latest > 500 && !nearBottom)
  })
```


**Fix:** Cache the document height outside the scroll path — measure it once in a `useEffect` and refresh on a `ResizeObserver` on `document.documentElement` plus a `resize` listener — then the scroll callback only compares numbers. Alternatively drop the geometry entirely and gate the FAB with an `IntersectionObserver` sentinel placed above the footer, matching the pattern already used in the background components.


**Fix applied:** _pending_


### M-35 · `src/components/global/Footer.tsx:121`

**Footer ships a live LinkedIn link to the known placeholder https://linkedin.com**


The footer's social row renders a "LinkedIn" icon link built from `siteConfig.social.linkedin`, which is the literal string `"https://linkedin.com"` — LinkedIn's generic homepage, not a Vertex company page. This is not a guess: `src/lib/schema.ts` already special-cases and strips this exact URL from the JSON-LD `sameAs` array precisely because it is a placeholder. The SEO graph was fixed; the user-visible footer link was not, so visitors clicking "LinkedIn" land on linkedin.com/feed.


```
Footer.tsx:121    { labelKey: 'social.linkedin', href: siteConfig.social.linkedin, icon: LinkedinIcon },
src/config/site.ts:    linkedin: "https://linkedin.com",
src/lib/schema.ts:26-34 /** Filter out placeholder social links so we never publish a dead `sameAs`. */
function sameAs(): string[] {
  return Object.values(siteConfig.social).filter(
    (url) =>
      ...
      // `https://linkedin.com` is the current placeholder — drop it until a
      // real company page exists. A `sameAs` that 404s hurts entity trust.
      url !== 'https://linkedin.com',
```


**Fix:** Apply the same placeholder guard in the footer: build `socialLinks` by filtering out entries whose href equals `'https://linkedin.com'` (or export the `sameAs()` predicate from `src/lib/schema.ts` and reuse it), so the icon simply is not rendered until a real company page URL is set.


**Fix applied:** _pending_


### M-36 · `src/components/global/Footer.tsx:153`

**Newsletter submit surfaces a raw JSON SyntaxError to the user when the response isn't JSON**


`await res.json()` is called unconditionally before the `res.ok` check. If the response body is not JSON — a Vercel platform 500/504 HTML page, an edge/WAF 429, or a truncated body — `res.json()` throws a `SyntaxError`, which falls into the `catch` and is rendered verbatim in the form's error paragraph because the handler prefers `err.message`. Users then see literal text like `Unexpected token '<', "<!DOCTYPE "... is not valid JSON` under the subscribe box.


```
const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || t('newsletter.errorGeneric'))
      }
...
    } catch (err) {
      setNewsletterStatus('error')
      setNewsletterError(
        err instanceof Error ? err.message : t('newsletter.errorGeneric')
      )
```


**Fix:** Parse defensively and never echo the raw exception: `const data = await res.json().catch(() => null)`, then branch on `res.ok`; in the `catch` block always set `t('newsletter.errorGeneric')` and `console.error(err)` instead of piping `err.message` into the UI.


**Fix applied:** _pending_


### M-37 · `src/components/global/Footer.tsx:155`

**Newsletter error text comes from the API in English, bypassing next-intl on /mk**


The client prefers the server-supplied `data.error` string over the localized fallback. `src/app/api/newsletter/route.ts` returns only hardcoded English strings — `'Please enter a valid email address.'` (400), `'Newsletter is temporarily unavailable.'` (500), `'Something went wrong. Please try again.'` (500). A Macedonian visitor on /mk who hits any of these gets English error copy inside an otherwise fully translated footer, even though `footer.newsletter.errorGeneric` and `footer.newsletter.errorInvalidEmail` exist in messages/mk.json.


```
Footer.tsx:155        throw new Error(data?.error || t('newsletter.errorGeneric'))
src/app/api/newsletter/route.ts:      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
      return NextResponse.json({ error: 'Newsletter is temporarily unavailable.' }, { status: 500 })
      { error: 'Something went wrong. Please try again.' },
```


**Fix:** Have the route return a stable machine code (`{ code: 'INVALID_EMAIL' | 'UNAVAILABLE' | 'UNKNOWN' }`) and map it to a next-intl key on the client, or simply drop `data?.error` and always render `t('newsletter.errorInvalidEmail')` for 400 and `t('newsletter.errorGeneric')` otherwise.


**Fix applied:** _pending_


### M-38 · `src/components/global/Footer.tsx:161`

**Newsletter error surface prints raw server/parse text into role="alert"**


The catch branch renders `err.message` verbatim. Two concrete failures: (1) /api/newsletter returns hardcoded ENGLISH strings ('Please enter a valid email address.', 'Newsletter is temporarily unavailable.', 'Something went wrong. Please try again.'), so an /mk visitor is shown untranslated English inside a role="alert" — the i18n boundary is bypassed. (2) `await res.json()` on line 153 runs BEFORE the res.ok check, so any non-JSON response (Vercel 502/504 HTML page, gateway timeout, 413) throws a SyntaxError, which IS an `Error`, so the user sees internal parser text such as `Unexpected token '<', "<!DOCTYPE "... is not valid JSON` announced by their screen reader.


```
const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || t('newsletter.errorGeneric'))
      }
...
    } catch (err) {
      setNewsletterStatus('error')
      setNewsletterError(
        err instanceof Error ? err.message : t('newsletter.errorGeneric')
      )
    }
```


**Fix:** Parse defensively (`const data = await res.json().catch(() => null)`) and never surface `err.message`: on any failure set `setNewsletterError(t('newsletter.errorGeneric'))`. If per-case copy is wanted, have the route return a stable machine code (e.g. `{ code: 'invalid_email' }`) and map it to a next-intl key on the client.


**Fix applied:** _pending_


### M-39 · `src/components/global/Footer.tsx:202`

**Newsletter success message is not announced and destroys keyboard focus**


On success the whole input + submit branch is unmounted and replaced by a plain `<p>`. Two failures: (1) the success paragraph has no `role="status"` / `aria-live="polite"`, so screen-reader users get no confirmation that the subscription worked — a WCAG 2.1 SC 4.1.3 (Status Messages) failure; the error path correctly uses `role="alert"` on line 264, so the success path is inconsistent with the file's own convention. (2) The element that had focus (the submit button) is removed from the DOM, so focus resets to `<body>` and the keyboard user loses their place in the footer entirely.


```
{newsletterStatus === 'success' ? (
              <p className="text-small text-[var(--division-accent)] font-medium md:w-64">
                {t('newsletter.success')}
              </p>
            ) : (
...
                  <p
                    id={newsletterErrorId}
                    role="alert"
                    className="text-micro text-red-400"
                  >
```


**Fix:** Add `role="status"` (or `aria-live="polite"`) to the success `<p>`, and either give it `tabIndex={-1}` with a `useEffect` that focuses it when status flips to `'success'`, or keep the form mounted and render the success text in a persistent live region beneath it so focus is never orphaned.


**Fix applied:** _pending_


### M-40 · `src/components/global/Footer.tsx:243`

**Newsletter email placeholder uses muted token — 3.95:1 on the input background**


The subscribe input's placeholder (`footer.newsletter.placeholder` = "Your email") is the only visible affordance describing what the field wants — there is no visible `<label>`, only an `aria-label`. It is painted `--division-text-muted` (#737373) on `--division-bg` (#141414) at `text-small` (14px), giving ~3.95:1, under the 4.5:1 AA threshold. WCAG 1.4.3 applies to placeholder text.


```
placeholder={t('newsletter.placeholder')}
...
                    className="flex-1 md:w-64 px-4 py-2.5 rounded-button text-small bg-[var(--division-bg)] border border-[var(--division-border)] text-[var(--division-text-primary)] placeholder:text-[var(--division-text-muted)] form-input-focus disabled:opacity-60"
globals.css:459    --division-bg: #141414;
globals.css:468    --division-text-muted: #737373;
```


**Fix:** Change to `placeholder:text-[var(--division-text-secondary)]`, and ideally add a visually-hidden `<label htmlFor={newsletterEmailId}>` so the field is not placeholder-dependent at all.


**Fix applied:** _pending_


### M-41 · `src/components/global/Footer.tsx:265`

**Newsletter error text uses hardcoded text-red-400 — 2.7:1 in light mode**


The only error message in the footer is coloured with a raw Tailwind palette class instead of a `var(--division-*)` token. In light mode the footer background is `--division-surface` = #F8F9FA (set on the <footer> at line 171) and Tailwind v4 red-400 (~#ff6467) gives roughly 2.7:1 against it — well under the 4.5:1 required for body text, on the one string the user most needs to read. It also sidesteps the design system entirely, so it will not follow a token change.


```
className="text-micro text-red-400"
```


**Fix:** Add a `--division-danger` token to the @theme/:root blocks in src/app/globals.css with a light-mode override that clears 4.5:1 on #F8F9FA (e.g. #B42318) and a dark value on #1C1C1C, then use `style={{ color: 'var(--division-danger)' }}` here.


**Fix applied:** _pending_


### M-42 · `src/components/global/Footer.tsx:308`

**Footer contact links use --division-text-muted (#737373) — 3.78:1 on the footer surface**


The address, phone and email links are real content rendered at `text-small` (14px) in `--division-text-muted`. In the default dark theme that token is `#737373` and the footer background is `--division-surface: #1C1C1C`, giving a contrast ratio of ~3.78:1 — below the WCAG 2.1 AA 4.5:1 minimum for normal-size text. (Light mode is fine: `#5F6670` on `#F8F9FA` is ~5.5:1, so this is a dark-theme-only failure — and dark is the unconditional default.)


```
Footer.tsx:308                className="flex items-start gap-2.5 text-small text-[var(--division-text-muted)] hover:text-[var(--division-text-primary)] transition-colors focus-ring"
Footer.tsx:315                className="flex items-center gap-2.5 text-small text-[var(--division-text-muted)] hover:text-[var(--division-text-primary)] transition-colors focus-ring"
Footer.tsx:322                className="flex items-center gap-2.5 text-small text-[var(--division-text-muted)] hover:text-[var(--division-text-primary)] transition-colors focus-ring"
globals.css:468    --division-text-muted: #737373;
globals.css:460    --division-surface: #1C1C1C;
```


**Fix:** Switch these three links to `text-[var(--division-text-secondary)]` (#A3A3A3 → ~7.4:1 on #1C1C1C), or lift the dark-theme `--division-text-muted` token to at least #8C8C8C so every muted-text consumer clears 4.5:1.


**Fix applied:** _pending_


### M-43 · `src/components/global/Footer.tsx:414`

**Footer copyright and back-to-top label use muted text at 12px — 3.78:1**


The copyright line and the "Back to top" button label are real content at `text-micro` (12px) in `--division-text-muted` (#737373) on `--division-surface` (#1C1C1C) = ~3.78:1, failing WCAG AA's 4.5:1 for normal text. 12px is unambiguously normal text, so the 3:1 large-text exemption does not apply.


```
Footer.tsx:414          <p className="text-micro text-[var(--division-text-muted)]">
Footer.tsx:415            {t('copyright', { year })}
Footer.tsx:423            className="min-h-[44px] h-auto py-2 px-3 gap-1.5 text-micro text-[var(--division-text-muted)] hover:text-[var(--division-text-primary)] hover:bg-transparent"
globals.css:137  --text-micro: 12px;
```


**Fix:** Use `text-[var(--division-text-secondary)]` for both, or raise the dark-theme `--division-text-muted` token above #8C8C8C.


**Fix applied:** _pending_


### M-44 · `src/components/global/Footer.tsx:423`

**Footer "Back to top" control label uses --division-text-muted — 3.59:1**


This is an interactive control whose visible label is the only affordance. At `--division-text-muted` (#737373) on `--division-surface` (#1C1C1C) it measures 3.59:1, failing WCAG 1.4.3 (4.5:1) for the label and WCAG 1.4.11 is only satisfied incidentally. Buttons' own text is held to the text ratio, not the 3:1 non-text ratio.


```
className="min-h-[44px] h-auto py-2 px-3 gap-1.5 text-micro text-[var(--division-text-muted)] hover:text-[var(--division-text-primary)] hover:bg-transparent"
```


**Fix:** Change to `text-[var(--division-text-secondary)]` so the resting state clears 4.5:1; the hover state already goes to --division-text-primary.


**Fix applied:** _pending_


### M-45 · `src/components/global/Navbar.tsx:104`

**Two links carry aria-current="page" at once on every service sub-page**


`isActive` returns true for any ancestor path via `pathname.startsWith(href + '/')`. On `/consulting/ai-consulting` this makes `isActive('/consulting')` true AND `isActive('/consulting/ai-consulting')` true, so the parent nav link (line 224) and the dropdown child link (line 299) both render `aria-current="page"`. ARIA permits only one element per page to be `aria-current="page"`; assistive tech announces two different links as "current page", which is exactly the ambiguity aria-current exists to remove. The same double-marking happens in the mobile menu (lines 453 and 474).


```
return pathname === href || pathname.startsWith(href + '/')
...
                        aria-current={active ? 'page' : undefined}
...
                                aria-current={childActive ? 'page' : undefined}
```


**Fix:** Keep `isActive` for visual highlighting but derive aria-current from an exact match: add `const isExact = (href: string) => pathname === href` and use `aria-current={isExact(item.href) ? 'page' : undefined}` on the parent/child links, or set `aria-current="true"` (not `"page"`) on ancestor items.


**Fix applied:** _pending_


### M-46 · `src/components/global/Navbar.tsx:240`

**aria-haspopup="menu" points at a container with no role="menu" that does not exist when closed**


Two ARIA defects on the same control. (1) `aria-haspopup="menu"` promises the popup exposes `role="menu"` with `role="menuitem"` children; the popup rendered on line 284-316 is a bare motion.div containing plain links, so screen readers announce "has menu" and then enter a generic group — the menu keyboard model (arrow keys, Home/End) is also absent. (2) `aria-controls={menuId}` is emitted unconditionally, but the target element is inside `<AnimatePresence>{isOpen && ...}` so the referenced ID is absent from the DOM whenever the dropdown is closed — a dangling IDREF that fails axe's aria-valid-attr-value in the default (collapsed) state.


```
aria-haspopup="menu"
                        aria-expanded={isOpen}
                        aria-controls={menuId}
...
                        <motion.div
                          id={menuId}
                          initial={{ opacity: 0, y: 8 }}
...
                          className="absolute top-full left-0 mt-2 w-56 py-2 rounded-lg glass"
```


**Fix:** Simplest correct fix: change `aria-haspopup="menu"` to `aria-haspopup="true"` is still wrong — instead drop aria-haspopup entirely and treat this as a disclosure (aria-expanded alone is the correct pattern for a links panel), and render the panel container permanently with `hidden`/`inert` toggled instead of unmounting it, so `aria-controls={menuId}` always resolves.


**Fix applied:** _pending_


### M-47 · `src/components/global/Navbar.tsx:432`

**Mobile-menu language toggle label uses muted token — 3.95:1**


Inside the mobile overlay the language toggle renders the target locale code ("EN"/"MK") as visible text at `text-sm`, colored `--division-text-muted` (#737373) on the overlay background `--division-bg` (#141414) = ~3.95:1, below AA 4.5:1. This is real content, not decoration — the code is the only thing telling the user which language they will switch to. Note the desktop sibling on line 337 correctly uses `--division-text-secondary`, so the mobile copy is inconsistent with its own desktop twin.


```
Navbar.tsx:431                className="inline-flex items-center min-h-[44px] gap-1.5 h-auto px-3 py-2 text-sm hover:bg-[var(--nav-hover-bg)]"
Navbar.tsx:432                style={{ color: 'var(--division-text-muted)' }}
Navbar.tsx:436                <span className="uppercase">{otherLocale}</span>
Navbar.tsx:337                style={{ color: 'var(--division-text-secondary)' }}
```


**Fix:** Change line 432 to `style={{ color: 'var(--division-text-secondary)' }}` to match the desktop language toggle.


**Fix applied:** _pending_


### M-48 · `src/components/sections/BlogCard.tsx:33`

**No global `timeZone` configured — post dates can hydrate to a different day**


`src/i18n/request.ts` returns only `locale` and `messages`, and `NextIntlClientProvider` in the locale layout is passed only `messages` and `locale`. With no `timeZone` in the request config, use-intl falls back to the ambient environment's zone (`IntlErrorCode.ENVIRONMENT_FALLBACK`, whose message in node_modules/use-intl reads "There is no `timeZone` configured, this can lead to markup mismatches caused by environment differences"). SSR runs in the Vercel region's zone (UTC); hydration runs in the visitor's. The seeded posts are stamped `publishedAt: '2026-03-15T08:00:00.000Z'`, so for any visitor at UTC-9 or further west (Alaska, Hawaii, Midway) the server renders "Mar 15, 2026" and the client renders "Mar 14, 2026" — a React hydration text mismatch, and the same defect on the post page header at BlogPostClient.tsx:43.


```
BlogCard.tsx:33-37
  const formattedDate = format.dateTime(new Date(post.publishedAt), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

src/i18n/request.ts (no timeZone key returned):
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }

src/app/[locale]/layout.tsx:84
          <NextIntlClientProvider messages={messages} locale={locale}>

scripts/seed-blog.ts:387
    publishedAt: '2026-03-15T08:00:00.000Z',
```


**Fix:** Add `timeZone: 'Europe/Skopje'` to the object returned from `getRequestConfig` in `src/i18n/request.ts`. NextIntlClientProvider inherits it automatically when rendered inside a Server Component, so no layout change is needed, and both the SSR pass and hydration then format in the same zone.


**Fix applied:** _pending_


### M-49 · `src/components/sections/BlogCard.tsx:55`

**Card link's entire accessible name is the generic "Read full article"**


`aria-label` on the wrapping `<Link>` overrides the whole subtree's accessible name, so a screen-reader user navigating the blog listing by link hears "Read full article" four times in a row with nothing to distinguish the posts — the `<h3>` title inside the link is discarded from the link name. Verified on the live listing: the string "Read full article" appears 4 times in the HTML of https://vertexconsulting.mk/en/blog, once per card, and there is no other differentiator in the accessible name. This is exactly the WCAG 2.4.4 (Link Purpose in Context, Level A) failure pattern.


```
BlogCard.tsx:52-56
        <Link
          href={`/blog/${post.slug}`}
          className="group block h-full focus-ring overflow-hidden rounded-[12px]"
          aria-label={t('readMoreAria')}
        >

messages/en.json → sections.blog.readMoreAria: "Read full article"
```


**Fix:** Either drop the `aria-label` entirely (the `<h3>{post.title}</h3>` inside the link then supplies a unique, descriptive name), or interpolate the title: change the message to `"readMoreAria": "Read full article: {title}"` and pass `aria-label={t('readMoreAria', { title: post.title })}` (MK equivalent in messages/mk.json).


**Fix applied:** _pending_


### M-50 · `src/components/sections/BlogCard.tsx:84`

**BlogCard meta row (division, date, read time, byline) all at 3.89:1**


The entire meta strip on each card — division label, publish date, read-time, and the "By" byline prefix — is rendered in `--division-text-muted` #737373 on #141414 (3.89:1) at `text-micro` (12px, globals.css:137). All four are real content that carries information no other element on the card conveys; none of it is decorative. Affected lines in this file: 79 (division label), 84 (date), 86-88 (read time), 104 ("By" prefix). The `·` separators on 83/85 are decorative and exempt.


```
BlogCard.tsx:79-88
                <span className="overline text-[var(--division-text-muted)]">
                  {divisionLabel}
                </span>
              </div>
              <span className="text-micro text-[var(--division-text-muted)]">·</span>
              <span className="text-micro text-[var(--division-text-muted)] tabular-nums">{formattedDate}</span>
              <span className="text-micro text-[var(--division-text-muted)]">·</span>
              <div className="flex items-center gap-1 text-micro text-[var(--division-text-muted)] tabular-nums">
                <Clock size={11} />
                <span>{post.readTime} {t('readTimeSuffix')}</span>

BlogCard.tsx:104-105
              <p className="text-micro text-[var(--division-text-muted)]">
                {t('authorBy')} <span className="text-[var(--division-text-secondary)]">{post.author.name}</span>
```


**Fix:** Move lines 79, 84, 88 and 104 to `text-[var(--division-text-secondary)]`, or lift `--division-text-muted` to #8A8A8A globally so every muted-on-dark use clears 4.5:1 in one change.


**Fix applied:** _pending_


### M-51 · `src/components/sections/BlogCard.tsx:93`

**Blog listing skips from <h1> straight to <h3> (no <h2>)**


The listing page's only h1 is the hero headline; the next headings in document order are the BlogCard titles at h3, with nothing at h2 between them. Verified in the production HTML of https://vertexconsulting.mk/en/blog — the heading sequence is h1, h3, h3, h3, h2 (the CTA banner, which comes after the grid), h3, h4, h4, h4. Screen-reader users navigating by heading level get a broken outline where each post reads as a sub-item of a section that doesn't exist. WCAG 1.3.1. The empty state has the same defect from the other direction — it renders an h3 as the only content heading under the h1.


```
BlogCard.tsx:92-95
            {/* Title */}
            <h3 className="text-h3 text-[var(--division-text-primary)]">
              {post.title}
            </h3>

BlogListingClient.tsx:34 (the only h1 on the page)
          <h1 className="text-h1 text-[var(--division-text-primary)] max-w-3xl">

BlogListingClient.tsx:75 (empty state, also h3)
              <h3 className="text-h3 text-[var(--division-text-secondary)]">
```


**Fix:** Give BlogCard a `headingLevel` prop (default 'h3') and pass 'h2' from BlogListingClient — on the post page's related-posts grid the existing h2 ("Related posts") makes h3 correct, so the prop needs both values. Alternatively add a visually-hidden `<h2>` above the grid in BlogListingClient (e.g. `<h2 className="sr-only">{t('filters.' + filter)}</h2>`), which also announces the active filter, and change the empty-state h3 to h2.


**Fix applied:** _pending_


### M-52 · `src/components/sections/BlogCard.tsx:98`

**Card excerpt uses --division-text-muted (#737373) — 3.89:1, below WCAG AA**


The post excerpt is the primary body copy on every blog card and is rendered in `--division-text-muted`, which resolves to #737373 (globals.css:468) on `--division-bg` #141414 — a contrast ratio of 3.89:1, below the 4.5:1 required for normal-size text. `text-small` is 14px (globals.css:133), well under the large-text exemption threshold. This is real content, not decoration: it's the only description of the article on the listing.


```
BlogCard.tsx:97-100
            {/* Excerpt */}
            <p className="mt-3 text-small text-[var(--division-text-muted)] line-clamp-3">
              {post.excerpt}
            </p>

src/app/globals.css:467-468
    --division-text-secondary: #A3A3A3;
    --division-text-muted: #737373;
```


**Fix:** Switch the excerpt to `text-[var(--division-text-secondary)]` (#A3A3A3 → 7.30:1 on #141414), or raise `--division-text-muted` to at least #8A8A8A (4.5:1) across the three token blocks in globals.css (lines ~468, ~482, ~512).


**Fix applied:** _pending_


### M-53 · `src/components/sections/ConsultingServicePage.tsx:96`

**Overline labels use --division-text-muted (#737373) — 3.89:1, fails WCAG AA**


Three real-content overline labels on every consulting service page render in `--division-text-muted`. In the dark palette that token is #737373 (globals.css:468) on `--division-bg` #141414 = 3.89:1, and on `--division-surface` #1C1C1C = 3.59:1 — both below the 4.5:1 AA minimum. The large-text exemption does not apply: `.overline` sets `font-size: var(--text-overline)` = 11px (globals.css:145, 813-819) and defines no color of its own, so the muted token is what paints. These are not decoration — they are the section eyebrows the user reads ("VERTEX CONSULTING", "HOW IT WORKS", "COMMON QUESTIONS"). Affected lines in this file: 96 (hero overline), 145 (process overline), 158 (FAQ overline).


```
line 96:          <p className="overline text-[var(--division-text-muted)] mb-4">
line 145:          <p className="overline text-[var(--division-text-muted)] mb-3">
line 158:          <p className="overline text-[var(--division-text-muted)] mb-3">

src/app/globals.css:468    --division-text-muted: #737373;
src/app/globals.css:145  --text-overline: 11px;
```


**Fix:** Swap these three to `text-[var(--division-text-secondary)]` (#A3A3A3 = 7.30:1 on #141414, 6.75:1 on #1C1C1C), or lift `--division-text-muted` to at least #949494 for text use and keep #737373 for borders/dividers only.


**Fix applied:** _pending_


### M-54 · `src/components/sections/ContactForm.tsx:54`

**No per-field validation on blur — errors only surface after a full submit**


`handleChange` is the only handler attached to any field; there is no `onBlur` anywhere in the file. `validate()` is called exclusively from `handleSubmit`. A user therefore cannot discover that their email is malformed or their message is under the 10-character floor until they press Send and the whole form is rejected at once. `handleChange` only *clears* an existing error for the edited field (it never sets one), so after the first failed submit a user who types a single character into the email box has the error message removed even though the value is still invalid — the field silently reverts to a valid-looking state and then fails again on the next submit. WCAG 3.3.1/3.3.3 expect errors identified close to the point of entry.


```
const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => {
      if (!prev[name as keyof FieldErrors]) return prev
      const next = { ...prev }
      delete next[name as keyof FieldErrors]
      return next
    })
  }
```


**Fix:** Extract a `validateField(name, value)` helper out of `validate()`, add `onBlur={handleBlur}` to the name/email/message inputs to set that field's error, and have `handleChange` re-run the same check for a field that already carries an error instead of unconditionally deleting it.


**Fix applied:** _pending_


### M-55 · `src/components/sections/ContactForm.tsx:155`

**Success state steals focus into the void and is never announced to screen readers**


On success the component returns an entirely different tree, unmounting the `<form>` — including the submit `<Button>` that currently holds keyboard focus. When the focused element is removed from the DOM, browsers reset focus to `<body>`, so a keyboard user is silently dumped back to the top of the tab order with no indication the submission succeeded. The replacement panel has no `role="status"`, no `aria-live`, and receives no programmatic focus, so assistive technology announces nothing at all — a screen reader user hears the form disappear and gets no confirmation. Note the contrast with the validation-failure path a few lines above (85-91), which does correctly move focus to the first invalid field; the success path was simply never given the same treatment. This is the one place in the flow where confirmation matters most.


```
if (status === 'success') {
    return (
      <AnimateIn>
        <div className="rounded-card border border-[var(--division-border)] bg-[var(--division-card)] p-8 text-center">
          <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center bg-[var(--division-accent)]/20">
            <Check size={28} className="text-[var(--division-accent)]" aria-hidden="true" />
          </div>
          <h3 className="text-h3 text-[var(--division-text-primary)]">
```


**Fix:** Add `role="status"` (or `aria-live="polite"`) plus `tabIndex={-1}` and a ref to the success `<div>`, and focus it in a `useEffect` that runs when `status === 'success'`. Mirror the existing focus-management pattern from the validation branch.


**Fix applied:** _pending_


### M-56 · `src/components/sections/ContactForm.tsx:193`

**All five form labels use --division-text-muted (#737373) — 3.89:1, fails WCAG AA**


Every field label in the contact form is rendered in `--division-text-muted`, which resolves to #737373 in the dark theme (globals.css:468). Against the page background #141414 that is 3.89:1; against the elevated surface #1C1C1C it is 3.59:1. The `.overline` class sets font-size to `var(--text-overline)` = 11px (globals.css:145), far below the 18.66px-bold / 24px large-text exemption, so the 4.5:1 threshold applies. Form labels are the most load-bearing 'real content' on the page — a low-vision user who cannot read 'Name *', 'Email *' or 'Message *' cannot complete the form at all. The globals.css comment at line 560-564 proves the team audited and fixed this exact token for the light theme and explicitly left dark mode alone ('Dark-mode value unchanged'). Affected lines: 193 (name), 221 (email), 246 (phone), 266 (division), 294 (message).


```
<label
          htmlFor={`${uniqueId}-name`}
          className="block overline text-[var(--division-text-muted)] mb-2"
        >
          {t('nameLabel')}
        </label>
```


**Fix:** Switch these five labels to `text-[var(--division-text-secondary)]` (#A3A3A3 = 7.30:1 on #141414), or raise the dark-mode `--division-text-muted` token in globals.css:468/482/512 from #737373 to roughly #8A8A8A (4.5:1) and keep muted reserved for genuinely decorative text.


**Fix applied:** _pending_


### M-57 · `src/components/sections/ContactForm.tsx:197`

**Missing autoComplete on name, email and phone inputs (WCAG 2.1 AA 1.3.5)**


None of the three fields that collect the visitor's own identity data declares an `autocomplete` token. WCAG 2.1 Success Criterion 1.3.5 'Identify Input Purpose' (Level AA) requires the appropriate token on inputs collecting information about the user. The only `autoComplete` attribute in the entire file is on the honeypot (`autoComplete="off"`, line 185). Practical impact beyond the standards violation: browser and password-manager autofill will not populate these fields, which measurably depresses completion rates on a lead-capture form, and it is a direct hardship for users with motor or cognitive impairments who rely on autofill.


```
<input
          type="text"
          id={`${uniqueId}-name`}
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          aria-invalid={!!fieldErrors.name}
          aria-describedby={fieldErrors.name ? nameErrorId : undefined}
```


**Fix:** Add `autoComplete="name"` to the name input (line 197), `autoComplete="email"` to the email input (line 225), and `autoComplete="tel"` to the phone input (line 250).


**Fix applied:** _pending_


### M-58 · `src/components/sections/ContactForm.tsx:277`

**Hardcoded hex #6E6D7A in the select chevron, off the grayscale palette**


The `<select>` dropdown arrow is drawn from an inline SVG data URI whose stroke is the URL-encoded literal `%236E6D7A` = #6E6D7A. That colour does not exist anywhere in the design system: the grayscale tokens are #F5F5F5 / #A3A3A3 / #737373 / #404040 / #262626 / #1C1C1C / #141414. #6E6D7A carries a blue-violet tint (B channel 12 points above R) and is a leftover from a pre-grayscale palette, so the chevron reads slightly purple against the neutral surface. Being baked into a data URI it is also immune to the light-theme token override at globals.css:548 — in light mode the whole form re-skins to a white surface while this arrow stays at its dark-mode value.


```
backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236E6D7A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
```


**Fix:** Replace the baked-in stroke with a theme-aware value: use `stroke='currentColor'` in the data URI (SVG-in-CSS cannot inherit currentColor, so instead) drop the background-image approach and render a `<ChevronDown>` from lucide-react absolutely positioned over the select with `className="text-[var(--division-text-secondary)] pointer-events-none"`, matching how every other icon in the codebase is themed.


**Fix applied:** _pending_


### M-59 · `src/components/sections/ContactForm.tsx:351`

**Privacy notice and all four input placeholders use muted #737373 — below 4.5:1**


The privacy/consent notice under the submit button is real, legally meaningful content rendered at `--text-micro` = 12px (globals.css:137) in #737373 on #141414 — 3.89:1, failing WCAG 1.4.3. Separately, every text input carries `placeholder:text-[var(--division-text-muted)]`, putting the placeholder hints ('Your name', 'you@example.com', '+389 ...', 'Tell us a bit about your business...') at the same failing ratio against the input surface #1C1C1C — 3.59:1, which is worse. Placeholder text is explicitly in scope for 1.4.3. Affected lines: 206, 234, 256, 307 (placeholders) and 351 (privacy notice).


```
<p className="text-micro text-[var(--division-text-muted)]">
        {t('privacyNotice')}
      </p>
```


**Fix:** Use `text-[var(--division-text-secondary)]` for the privacy notice and `placeholder:text-[var(--division-text-secondary)]` on the four inputs, or lift the dark-mode `--division-text-muted` token to a value that clears 4.5:1 on #1C1C1C (approximately #8E8E8E).


**Fix applied:** _pending_


### M-60 · `src/components/sections/DivisionSplit.tsx:105`

**Division card CTA label ('Explore Consulting' / 'Explore Marketing') is muted #737373 — 3.19:1**


The CTA row at the bottom of each division card sets its text color to `--division-text-muted` (#737373). The card's idle background is `--division-card` = #262626 (line 54, globals.css:461 — the hover state switches it to `--division-bg`). #737373 on #262626 is 3.19:1, well below 4.5:1. The `<span>` on line 106 renders `t('consulting.cta')` / `t('marketing.cta')`, which resolve to 'Explore Consulting' and 'Explore Marketing' (messages/en.json) — real, actionable content, not decoration. It only reaches an accessible contrast on hover (`group-hover:text-[var(--division-text-primary)]`), which never fires for touch or keyboard users.


```
DivisionSplit.tsx:105-106
                <div className="mt-8 flex items-center gap-2 text-small font-medium text-[var(--division-text-muted)] group-hover:text-[var(--division-text-primary)] transition-colors">
                  <span>{t(`${division.id}.cta`)}</span>
```


**Fix:** Raise the resting color to `text-[var(--division-text-secondary)]` (#A3A3A3 on #262626 = 5.28:1) and keep `group-hover:text-[var(--division-text-primary)]` as the hover lift.


**Fix applied:** _pending_


### M-61 · `src/components/sections/LazarHero.tsx:56`

**Portfolio hero role line at 3.89:1 contrast**


The role sub-headline directly under the h1 on /lazar — "Head of Marketing at Vertex" (EN) / "Раководител за маркетинг во Vertex" (MK) — renders `--division-text-muted` #737373 on `--division-bg` #141414 = 3.89:1. At `text-small` (14px) with `tracking-[0.2em]` uppercase mono, which is a harder-to-read treatment than plain body text, not an easier one. This is the single most important identity claim on the page and it is the lowest-contrast text on it.


```
LazarHero.tsx:54-59
            <motion.p
              variants={heroSubtitle}
              className="font-mono text-small uppercase tracking-[0.2em] text-[var(--division-text-muted)]"
            >
              {t('role')}
            </motion.p>
```


**Fix:** Change to `text-[var(--division-text-secondary)]` (#A3A3A3, 7.30:1). The visual hierarchy against the full-contrast `--division-text-primary` h1 above it is preserved.


**Fix applied:** _pending_


### M-62 · `src/components/sections/LeaderIntro.tsx:45`

**Leader section overline uses muted #737373 — 3.89:1, fails WCAG AA**


The overline above the founder's name on the consulting landing page ('Meet the team', from `sections.leader.overline`) renders in `--division-text-muted` (#737373) at `.overline` size 11px. Its containing `<Section>` on ConsultingLandingClient.tsx line 74 sets `bg-[var(--division-surface)]` = #1C1C1C, so the ratio is 3.59:1 — worse than the 3.89:1 on the base background and well under 4.5:1. This overline is the section's eyebrow label and is announced as content, not decoration.


```
<p className="overline text-[var(--division-text-muted)] mb-3">
          {resolvedOverline}
        </p>
```


**Fix:** Change to `text-[var(--division-text-secondary)]`, or use `text-[var(--division-accent)]` to match the overline treatment already used on ProjectsShowcase line 29 and ContactPageClient line 23.


**Fix applied:** _pending_


### M-63 · `src/components/sections/MarketingServicePage.tsx:99`

**Overline labels use --division-text-muted (#737373) — 3.89:1, fails WCAG AA**


Same contrast failure on all four marketing service pages. `--division-text-muted` is #737373 in the dark palette; at the 11px `.overline` size it yields 3.89:1 on #141414 and 3.59:1 on #1C1C1C, below the 4.5:1 AA threshold for normal text. Affected lines in this file: 99 (hero overline), 148 (process overline), 161 (FAQ overline).


```
line 99:          <p className="overline text-[var(--division-text-muted)] mb-4">
line 148:          <p className="overline text-[var(--division-text-muted)] mb-3">
line 161:          <p className="overline text-[var(--division-text-muted)] mb-3">

src/app/globals.css:468    --division-text-muted: #737373;
```


**Fix:** Use `text-[var(--division-text-secondary)]` for these three overlines, or raise the muted token's lightness for text contexts.


**Fix applied:** _pending_


### M-64 · `src/components/sections/MarketingServicesGrid.tsx:53`

**Marketing service card description uses --division-text-muted (#737373) — 3.59:1, fails WCAG AA**


The description paragraph in each marketing service card uses `--division-text-muted` = #737373 (globals.css:468). The card renders inside `BorderGlow`, whose background is `--borderglow-bg: var(--division-surface)` = #1C1C1C (globals.css:210, 460). #737373 on #1C1C1C is 3.59:1, below the 4.5:1 AA threshold for normal text. This is the primary body copy of the card. The functionally identical ConsultingServicesGrid renders the same paragraph with `text-[var(--division-text-secondary)]`, so the two grids are inconsistent and only the marketing one fails.


```
MarketingServicesGrid.tsx:53-55
                  <p className="mt-2 text-small text-[var(--division-text-muted)]">
                    {service.description}
                  </p>

ConsultingServicesGrid.tsx:62-64 (same element, passing token)
                <p className="mt-2 text-small text-[var(--division-text-secondary)]">
                  {service.description}
                </p>
```


**Fix:** Change line 53 to `className="mt-2 text-small text-[var(--division-text-secondary)]"` so both service grids use the same AA-passing token.


**Fix applied:** _pending_


### M-65 · `src/components/sections/ProjectsShowcase.tsx:90`

**Division label, 'Coming soon' and placeholder caption use muted #737373 — fails WCAG AA**


Three separate pieces of real content in the homepage 'Our Work' cards render in `--division-text-muted` (#737373). Line 90 is the division label at 11px overline — it is the only text identifying which division delivered the project. Line 114 is the 'Coming soon' status text at 14px, the sole signal that a card is not clickable. Both sit on the card surface and fail at roughly 3.6-3.9:1. Line 74 ('Screenshot coming soon') is worst: it is positioned over the placeholder gradient which runs `var(--division-card)` #262626 to `var(--division-surface)` #1C1C1C, so #737373 lands at 3.19:1 on the #262626 end. The decorative dot on line 88 (`aria-hidden`, 6x6px) correctly uses the token and is excluded.


```
<span className="overline text-[var(--division-text-muted)]">
                    {t('divisionLabel')}
                  </span>
```


**Fix:** Switch lines 74, 90 and 114 to `text-[var(--division-text-secondary)]` (#A3A3A3, 7.30:1 on #141414 and 5.1:1 on #262626). Keep the decorative dot on line 88 unchanged.


**Fix applied:** _pending_


### M-66 · `src/components/sections/ProjectsShowcase.tsx:91`

**project.division is never read — every card is hardcoded to say 'Marketing'**


`src/config/projects.ts` declares a `division: ProjectDivision` field and documents it as 'Which division delivered the work. Drives the small division tag on the card.' That comment is false. A repo-wide grep confirms `project.division` is read nowhere: ProjectsShowcase renders the flat translation key `home.projects.divisionLabel`, whose value in messages/en.json is the literal string `"Marketing"` (and the sibling `serviceLabel` is likewise hardcoded to 'Website & SEO management'). All three current entries happen to be `division: "marketing"`, so nothing is visibly wrong today — but the type explicitly permits `"consulting"`, and the config file's step-by-step 'HOW TO PUBLISH' instructions invite a non-developer to add entries. The first consulting project added will be silently mislabelled 'Marketing' on the homepage with no compile error and no runtime warning. `ProjectDivision` is likewise exported and used only by the unread field.


```
<span className="overline text-[var(--division-text-muted)]">
                    {t('divisionLabel')}
                  </span>
```


**Fix:** Either honour the field — `{project.division === 'consulting' ? t('divisionLabel.consulting') : t('divisionLabel.marketing')}` with the two keys split in both message catalogs — or delete `division`/`ProjectDivision` from `src/config/projects.ts` and correct its doc comment so the config stops advertising behaviour it does not have.


**Fix applied:** _pending_


### M-67 · `src/components/sections/ServicesOverview.tsx:65`

**Division label overline uses muted #737373 at overline size — 3.59:1**


The 'CONSULTING' / 'MARKETING' label above each service card title is rendered in `--division-text-muted` (#737373) on the `--division-surface` (#1C1C1C) card background = 3.59:1, below 4.5:1. The `.overline` utility (globals.css:813-820) applies `font-size: var(--text-overline)` with `text-transform: uppercase`, so this is small text and does not qualify for the 3:1 large-text exception. It carries meaning — it is the only thing telling the user which division a service belongs to (the comment on line 59 says exactly that: 'division is signaled by the label'), so it cannot be treated as decoration.


```
ServicesOverview.tsx:59-67
                {/* Division indicator dot — neutral, division is signaled by the label */}
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'var(--division-text-muted)' }}
                  />
                  <span className="overline text-[var(--division-text-muted)]">
                    {t(`divisionLabels.${service.division}`)}
                  </span>
```


**Fix:** Use `text-[var(--division-text-secondary)]` on line 65. Leave the 2×2px dot on line 63 as-is — it is decorative and exempt.


**Fix applied:** _pending_


### M-68 · `src/components/sections/ServicesOverview.tsx:82`

**Service card description uses --division-text-muted (#737373) — 3.59:1, fails WCAG AA**


The description paragraph of every one of the eight homepage service cards is rendered in `--division-text-muted`, which globals.css:468 defines as #737373 in dark mode. These cards sit inside `BorderGlow` (globals.css:210 `--borderglow-bg: var(--division-surface)`) inside a `<Section className="bg-[var(--division-surface)]">` (page.tsx:80), i.e. on #1C1C1C. #737373 on #1C1C1C is 3.59:1, below the 4.5:1 required for normal-size body text (WCAG 2.1 SC 1.4.3). This is real content — the sales copy describing each service — not decoration. The sibling ConsultingServicesGrid.tsx:62 renders the exact same element with `text-[var(--division-text-secondary)]` (#A3A3A3, 6.0:1), which confirms the muted token here is unintentional drift.


```
<p className="mt-2 text-small text-[var(--division-text-muted)]">
                  {t(`services.${service.key}.description`)}
                </p>
```


**Fix:** Change `text-[var(--division-text-muted)]` to `text-[var(--division-text-secondary)]` on line 82, matching ConsultingServicesGrid.tsx:62. (#A3A3A3 on #1C1C1C = 6.0:1, passes AA.)


**Fix applied:** _pending_


### M-69 · `src/components/sections/SocialProof.tsx:101`

**Stat labels and quote attribution use muted #737373 — 3.89:1, fails WCAG AA**


Two pieces of real homepage content render in `--division-text-muted` (#737373) on the `#proof` section background #141414, giving 3.89:1 against a 4.5:1 requirement. Line 101 is the label for every statistic — 'Years of Experience', 'Projects Delivered', 'Expert Divisions', 'Client-First Approach' — at `.overline` size 11px (globals.css:145). Without those labels the giant numbers above them are meaningless, so this is not decorative text. Line 120 is the attribution of the founder pull-quote at `--text-small` = 14px (globals.css:133), same 3.89:1.


```
<p className="mt-2 overline text-[var(--division-text-muted)]">{label}</p>
```


**Fix:** Change both to `text-[var(--division-text-secondary)]` (#A3A3A3 = 7.30:1 on #141414), or raise the dark-mode `--division-text-muted` token globally.


**Fix applied:** _pending_


### M-70 · `src/components/sections/SocialProof.tsx:121`

**Double em dash rendered before the homepage quote attribution**


The JSX hardcodes a literal em dash and a space before interpolating `quote.attribution`, but both message catalogs already begin that string with its own em dash. messages/en.json: `"attribution": "— Goran Dinov, Founder & Director"`; messages/mk.json: `"attribution": "— Горан Динов, основач и директор"`. JSX strips the leading newline+indent of the text node but preserves the `— ` that follows, so the homepage renders `— — Goran Dinov, Founder & Director` in both locales. This is visible on the production homepage under the pull-quote in the `#proof` section. It is also a latent i18n bug independent of the doubling: a hardcoded punctuation prefix in JSX cannot be adapted per-locale.


```
<p className="mt-4 text-small text-[var(--division-text-muted)]">
          — {t('quote.attribution')}
        </p>
```


**Fix:** Delete the hardcoded dash from the JSX so the line reads `{t('quote.attribution')}` and let the translation own its punctuation (the catalogs already do). Do not instead strip the dash from the catalogs — that would push locale-specific punctuation back into code.


**Fix applied:** _pending_


### M-71 · `src/components/sections/TeamGrid.tsx:76`

**Team member bios and division badges use muted #737373 — fails WCAG AA**


On the About page, each team card's biography — the primary body copy of the section — renders in `--division-text-muted` (#737373) at `--text-small` = 14px. The cards sit on the page background #141414 (Section adds no background), giving 3.89:1 against the 4.5:1 requirement. Line 46 puts the division badge label ('Consulting' / 'Marketing') in the same colour at 11px overline size; that label is the only thing distinguishing which division a person belongs to — the code comment on line 40 states outright 'label text signals the division', so it carries meaning and is not decoration. (The 2x2px dot on line 44 that also uses the muted token IS decorative and is correctly excluded.)


```
<p className="mt-3 text-small text-[var(--division-text-muted)]">
              {member.bio}
            </p>
```


**Fix:** Use `text-[var(--division-text-secondary)]` for both the bio (line 76) and the division badge span (line 46). Leave the decorative dot on line 44 as-is.


**Fix applied:** _pending_


### M-72 · `src/components/sections/TeamShowcase.tsx:64`

**Team member bios use muted #737373 — 3.89:1, fails WCAG AA**


The marketing landing page's team section renders every member biography in `--division-text-muted` (#737373) at `--text-small` = 14px on the page background #141414, yielding 3.89:1 against the required 4.5:1. This is the substantive descriptive copy of the section, not decoration. Compounding it, the whole card is wrapped in a `<Link>` when `member.href` is set (line 80), so this failing text is also part of a link's accessible name.


```
<p className="mt-3 text-small text-[var(--division-text-muted)]">
              {member.bio}
            </p>
```


**Fix:** Change to `text-[var(--division-text-secondary)]` (#A3A3A3 = 7.30:1), matching the fix applied to the sibling TeamGrid component.


**Fix applied:** _pending_


### M-73 · `src/config/site.ts:14`

**address.country is "Macedonia" — the country's name is North Macedonia**


`siteConfig.address.country` holds the pre-2019 name. This single value is interpolated into user-visible copy in five places: the footer address on every page (Footer.tsx:103), the Contact page office block (ContactPageClient.tsx:13), `/llms.txt` (route.ts:61), `/llms-full.txt` (route.ts:157 and 201), and the chat widget's system prompt (chatWidget.ts:21). It also contradicts the rest of the codebase, which says "North Macedonia" everywhere it is hardcoded — llms.txt:52, llms-full.txt:146, and schema.ts's `areaServed`/`description` — so the same page can render "Strumica, Macedonia" in the footer while the JSON-LD graph asserts `{'@type': 'Country', name: 'North Macedonia'}`. For a company whose entire pitch is local credibility, and for an entity graph Google reconciles against real-world data, the mismatch is a correctness and trust defect.


```
// src/config/site.ts:11-15
  address: {
    street: "Str. Mladinska 43",
    city: "Strumica",
    country: "Macedonia",
  },

// src/lib/schema.ts:102-105 (same file, correct name hardcoded)
    areaServed: [
      { '@type': 'Country', name: 'North Macedonia' },
      { '@type': 'City', name: 'Strumica' },
    ],
```


**Fix:** Change to `country: "North Macedonia"`. No consumer needs a code change — all five call sites interpolate the field. While editing, add `countryCode: "MK"` so `schema.ts`'s `addressCountry: 'MK'` (line 65) stops being a second hardcoded literal.


**Fix applied:** _pending_


### M-74 · `src/config/site.ts:23`

**social.linkedin is the bare placeholder "https://linkedin.com", rendered as a live footer link on every page**


The value is LinkedIn's generic homepage, not a Vertex company page. `schema.ts` explicitly filters it out of the JSON-LD `sameAs` array (with a comment saying a dead sameAs hurts entity trust), but nothing filters it out of the UI. There is exactly one render site — the Footer's `socialLinks` array, output in the bottom bar — and because the Footer is in the site layout, this ships on every page in both locales. A user who clicks the LinkedIn icon (aria-labelled with the localized `footer.social.linkedin` string) lands on linkedin.com's logged-out homepage. Full trace of every place it is rendered as a link: src/components/global/Footer.tsx:121 (array entry) → Footer.tsx:394-408 (the `<a>` element). No other component, route handler, or metadata file reads `siteConfig.social.linkedin`.


```
// src/config/site.ts:22-26
  social: {
    linkedin: "https://linkedin.com",
    instagram: "https://www.instagram.com/vertxsystems.mk",
    facebook: "https://www.facebook.com/share/1CEaD21Asq/",
  },

// src/components/global/Footer.tsx:121 — the only render site
    { labelKey: 'social.linkedin', href: siteConfig.social.linkedin, icon: LinkedinIcon },

// src/components/global/Footer.tsx:394-402 — where it becomes an <a>
            {socialLinks.map((social) => {
              const isMailto = social.href.startsWith('mailto')
              ...
                <a
                  key={social.labelKey}
                  href={social.href}

// src/lib/schema.ts:29-34 — JSON-LD already guards against it, the UI does not
      // `https://linkedin.com` is the current placeholder — drop it until a
      // real company page exists. A `sameAs` that 404s hurts entity trust.
      url !== 'https://linkedin.com',
```


**Fix:** Either set `linkedin` to the real company-page URL, or set it to `null` and filter the Footer's `socialLinks` array on a truthy `href` (`.filter((s) => Boolean(s.href))`) so the icon is omitted until a real page exists. If you take the null route, widen the type and drop the now-redundant `url !== 'https://linkedin.com'` special case in `sameAs()` (src/lib/schema.ts:33) so there is one placeholder rule rather than two.


**Fix applied:** _pending_


### M-75 · `src/lib/contentGenerator/index.ts:139`

**validateDraft() call is unguarded and throws on a truncated draft, bypassing markTopicFailed()**


`generateDraft` only shape-checks `title` and `body` before returning (its own comment says Claude can truncate tool_use output when the post plus reasoning tokens exceed max_tokens). `validateDraft` then dereferences `draft.slug`, `draft.excerpt.en`, `draft.tags.en`, `draft.readTime`, `draft.pexelsQuery`, and `draft.imageAlt.en` with no guards. A truncated response that carries title + body but no `excerpt` throws `TypeError: Cannot read properties of undefined (reading 'en')` at validateDraft.ts:57. Unlike the `generateDraft` and `createPost` calls on either side of it, the `validateDraft` call at index.ts:139 is not inside a try/catch, so the throw escapes `generateNextPost` entirely: `markTopicFailed(topic._id, msg)` never runs and the Telegram failure alert is never sent. The topic stays `status: "pending"` and is picked again as the highest-priority topic on every subsequent run — exactly the retry loop the `failed` status was introduced to prevent (validateDraft.ts:38-39 states this intent). The SSE route catches the throw and streams an error line, so the operator sees a one-off error message with no record in Sanity and no notification.


```
// src/lib/contentGenerator/index.ts:138-139 — no try/catch, unlike lines 114 and 155
  log('info', 'Running quality gates...')
  const validation = validateDraft(draft)

// src/lib/contentGenerator/validateDraft.ts:52-58 — unguarded dereferences
  if (draft.slug.length < 5 || draft.slug.length > 80) {
    errors.push('Slug length out of range')
  }

  // Excerpt
  if (draft.excerpt.en.length < 60 || draft.excerpt.en.length > 300) {

// src/lib/contentGenerator/generateDraft.ts:93-95 — the acknowledged failure mode
  // schema, but Claude can occasionally truncate when the post + reasoning
  // tokens exceed max_tokens. We log enough context to tell those cases apart.

// src/lib/contentGenerator/generateDraft.ts:98-106 — only title and body are checked
  if (!generated.title?.en || !generated.title?.mk) {
  ...
  if (!generated.body?.en?.length || !generated.body?.mk?.length) {
```


**Fix:** Two changes. (1) In validateDraft.ts, make the field access defensive so a missing field becomes a validation error instead of a throw — e.g. `if (!draft.excerpt?.en || !draft.excerpt?.mk) { errors.push('Missing excerpt'); } else if (draft.excerpt.en.length < 60 ...)`, and the same optional-chaining pattern for `slug`, `tags`, `readTime`, `pexelsQuery`, and `imageAlt`. (2) Wrap the `validateDraft(draft)` call at index.ts:139 in the same try/catch shape used for `generateDraft` and `createPost`, so any residual throw still routes through `markTopicFailed` + the Telegram alert.


**Fix applied:** _pending_


---

## Low (41)


### L-01 · `src/_project-state/current-state.md:96`

**current-state.md contradicts itself and the code about the chat routes and model**


The project's authoritative memory file is wrong in two ways that will mislead the next agent. Line 96 states both chat routes are `{ ok: true }` stubs with no Claude calls — false for /api/chat, and directly contradicted by line 32 of the same file, which describes the live streaming widget. Line 32 in turn names the model as `claude-sonnet-4-6`, while src/lib/ai.ts:25 pins `claude-haiku-4-5`. Per AGENTS.md the precedence rule is live code > current-state.md, so both lines should be corrected rather than trusted.


```
src/_project-state/current-state.md:96
- **AI chat API routes** (`/api/chat`, `/api/chat/lead`) still return `{ ok: true }` stubs with no Claude calls — reserved for Phase 12.

src/_project-state/current-state.md:32
... streams back a `claude-sonnet-4-6` response token by token as a `ReadableStream` of raw UTF-8 text chunks ...

src/lib/ai.ts:25
const CLAUDE_MODEL = 'claude-haiku-4-5'
```


**Fix:** Rewrite line 96 to say /api/chat is live (Phase 12) and only /api/chat/lead remains a stub, and correct the model name on line 32 to `claude-haiku-4-5`. file-map.md lines 124-125 are already accurate and need no change.


**Fix applied:** _pending_


### L-02 · `src/app/[locale]/(site)/about/AboutPageClient.tsx:21`

**File named *PageClient has no 'use client' and is an async Server Component**


AboutPageClient is an async server component using getTranslations from next-intl/server, yet it carries the Client suffix used elsewhere in the repo for genuine client components (contact/ContactPageClient.tsx line 1 does start with 'use client'). Adding a hook to this file on the assumption that it is a client component would fail at build time. The wrapper also adds no boundary of any kind over inlining it into page.tsx.


```
export default async function AboutPageClient() {
  const t = await getTranslations('about')
```


**Fix:** Rename to AboutPageContent.tsx (or inline the JSX into about/page.tsx) so the filename stops implying a client boundary that does not exist.


**Fix applied:** _pending_


### L-03 · `src/app/[locale]/(site)/blog/[slug]/page.tsx:26`

**Hardcoded English "Post Not Found" metadata served on /mk routes**


`generateMetadata` bypasses next-intl for the not-found branch, so a missing slug on the Macedonian locale still emits English metadata. Verified live: GET https://vertexconsulting.mk/mk/blog/does-not-exist-xyz returns 404 with `title: "Post Not Found | Vertex Consulting"`, `og:title` and `twitter:title` identical, and the English description — on a page whose `<html lang>` is `mk`. Every other user-facing string in the app routes through `t()`. Impact is bounded (the page carries `noindex`), but the browser tab and any shared link preview show English to a Macedonian visitor.


```
blog/[slug]/page.tsx:23-31
  if (!post) {
    return generatePageMetadata({
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
      path: `/blog/${slug}`,
      locale,
      noIndex: true,
    })
  }

Live response body for /mk/blog/does-not-exist-xyz:
  {\"children\":\"Post Not Found | Vertex
  {\"property\":\"og:title\",\"content\":\"Post Not Found | Vertex Consulting\"}
```


**Fix:** The `notFound.*` namespace already exists in messages/{en,mk}.json (added in Phase 15F). Add `notFound.postTitle` / `notFound.postDescription` keys and use `const t = await getTranslations({ locale, namespace: 'notFound' })` in this branch, matching the pattern in the success branch.


**Fix applied:** _pending_


### L-04 · `src/app/api/newsletter/route.ts:16`

**Malformed JSON body returns 500 instead of 400**


`req.json()` sits inside the single catch-all try block, so a body that is not valid JSON (or the literal `null`, which makes `body.website` throw) is reported to the client as a 500 with "Something went wrong. Please try again." A client error is being presented as a server error, which both misleads the caller and pollutes error monitoring. Compare /api/chat, which correctly wraps `req.json()` in its own try and returns 400.


```
src/app/api/newsletter/route.ts:14-18
export async function POST(req: NextRequest) {
  try {
    const body: NewsletterPayload = await req.json()

    if (body.website && body.website.trim() !== '') {

src/app/api/newsletter/route.ts:81-87
  } catch (err) {
    console.error('[newsletter] unexpected error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
```


**Fix:** Parse first with its own guard: `let body: NewsletterPayload | null; try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) } if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })`, then run the existing logic.


**Fix applied:** _pending_


### L-05 · `src/app/api/newsletter/route.ts:44`

**Welcome email is English-only on a bilingual site and locale is never transmitted**


On a site whose entire public surface is EN/MK, a visitor who subscribes from the Macedonian footer receives a hardcoded English welcome email — subject, HTML body, and plaintext body. The locale is not merely unused, it is never sent: Footer.tsx posts only `{ email, website }`, so the route has no way to localise even if it wanted to. Every other user-visible string on the site routes through next-intl.


```
src/app/api/newsletter/route.ts:46
        <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 16px;">Welcome to the Vertex newsletter</h1>

src/app/api/newsletter/route.ts:63
      subject: 'Welcome to the Vertex newsletter',

src/components/global/Footer.tsx:148-152
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website: newsletterHoneypot }),
      })
```


**Fix:** Send the active locale from the Footer (`useLocale()` → `body: JSON.stringify({ email, website, locale })`), validate it server-side against 'en' | 'mk', and select subject/html/text from a small per-locale record in the route. Log the MK phrasing decisions in TRANSLATION_NOTES.md per the project convention.


**Fix applied:** _pending_


### L-06 · `src/app/globals.css:5`

**@custom-variant dark is bound to a .dark class no element ever receives**


The `dark:` variant is wired to `&:is(.dark *)`, but this project drives theming through `data-theme` on <html> (src/app/[locale]/layout.tsx:31: `document.documentElement.setAttribute('data-theme', 'dark')`), never through a `.dark` class. Any `dark:`-prefixed utility therefore compiles to a selector that matches nothing and silently no-ops. This already bit the codebase once — src/components/ui/button.tsx:6-9 documents that shadcn's shipped `dark:` variants "were dead code; stripped" for exactly this reason. Leaving the variant declared is a live trap: the next person to paste a shadcn snippet or write a `dark:bg-...` class gets no error and no effect.


```
@custom-variant dark (&:is(.dark *));
```


**Fix:** Rebind the variant to the attribute the app actually sets: `@custom-variant dark (&:where(html:not([data-theme="light"]) *));` — or delete the @custom-variant line entirely so any stray `dark:` utility fails loudly at build time instead of silently.


**Fix applied:** _pending_


### L-07 · `src/app/globals.css:170`

**Dead CSS: ~12 custom properties, 3 animation tokens with keyframes, and the .noise utility are never consumed**


Verified with a grep across every .ts/.tsx under src/ (excluding _project-state docs). None of the following has a single consumer: (1) --vt-theme-duration / --magnetic-pull / --magnetic-max / --magnetic-squish (lines 169-174) — referenced only inside JS *comments* in ThemeProvider.tsx:27 and MagneticButton.tsx:9-11, where the real values are hardcoded constants; (2) --borderglow-glow (lines 209, 213) — only --borderglow-bg is read, at BorderGlow.tsx:163; (3) --glass-bg-strong / --glass-border-strong (lines 228-229 and 236-237) — zero hits, and the block comment admits "not consumed yet"; (4) --color-accent-gold / --color-accent-terracotta / --color-accent-success (lines 86-88) — zero hits, and they are the last chromatic values left in a design system the project describes as dark-only unified grayscale; (5) --animate-glow-pulse / --animate-fade-in / --animate-slide-up (lines 156-158) plus their @keyframes glow-pulse / fade-in / slide-up (lines 388-401) — no `animate-glow-pulse`, `animate-fade-in` or `animate-slide-up` class appears anywhere; (6) the `.noise::before` utility (lines 644-653), including an inlined SVG turbulence data URI — no element carries `className="noise"`.


```
:root {
  --vt-theme-duration: 520ms;
  --magnetic-pull: 0.30;
  --magnetic-max: 12px;
  --magnetic-squish: 0.94;
}
...
  --color-accent-gold: #D4A017;
  --color-accent-terracotta: #E2725B;
  --color-accent-success: #10B981;
...
.noise::before {
```


**Fix:** Delete from src/app/globals.css: the :root micro-interaction block (lines 161-174), --borderglow-glow (lines 209 and 213), --glass-bg-strong and --glass-border-strong (lines 228-229, 236-237), --color-accent-gold/-terracotta/-success (lines 86-88), the three --animate-* tokens (lines 155-158) together with @keyframes glow-pulse/fade-in/slide-up (lines 385-401), and the .noise::before rule (lines 644-653). Keep --color-accent-error, which is used at src/app/admin/login/page.tsx:48. Keep the typing-dot and chat-trigger-pulse keyframes, which are live.


**Fix applied:** _pending_


### L-08 · `src/app/globals.css:825`

**.tabular-nums redefinition shadows and breaks Tailwind v4's composable numeric utility**


Tailwind v4 already ships `tabular-nums`; the custom copy in @layer utilities emits a second `.tabular-nums` rule that wins by source order. Tailwind's own version sets `--tw-numeric-spacing: tabular-nums` and composes it into `font-variant-numeric` alongside --tw-ordinal, --tw-slashed-zero, --tw-numeric-figure and --tw-numeric-fraction; the custom version hard-sets `font-variant-numeric: tabular-nums`, wiping any sibling numeric utility. Compiling globals.css with @tailwindcss/cli confirms two `.tabular-nums` rules in the output (line 1682: `--tw-numeric-spacing: tabular-nums;` and line 2925: `font-variant-numeric: tabular-nums;`). Combining `tabular-nums` with `lining-nums`, `ordinal` or `slashed-zero` silently drops the second utility. The comment at line 600-602 even acknowledges Tailwind provides it.


```
.tabular-nums {
    font-variant-numeric: tabular-nums;
  }
```


**Fix:** Delete the `.tabular-nums` block from @layer utilities in src/app/globals.css (lines 822-827, including its comment) and rely on Tailwind v4's built-in utility, which behaves identically on its own and composes correctly with the other font-variant-numeric utilities.


**Fix applied:** _pending_


### L-09 · `src/app/indexnow-key.txt/route.ts:16`

**force-static contradicts the documented "rotate without a deploy" behaviour**


The JSDoc claims "rotating it is an environment-variable change rather than a deploy", but `export const dynamic = 'force-static'` prerenders this route's body at build time from the build-time value of process.env.INDEXNOW_KEY. On Vercel, environment-variable edits are only picked up by a new build anyway, so changing INDEXNOW_KEY without redeploying leaves the old key (or the 404 body, if the key was absent at build) served at /indexnow-key.txt for up to `revalidate` seconds and in practice until the next deploy. Since IndexNow validates by fetching keyLocation() and byte-comparing it to the submitted key, a rotation done the documented way yields silent 403s from api.indexnow.org — precisely the failure mode the file's own closing paragraph warns about, with no signal pointing back at the stale prerender.


```
export const dynamic = 'force-static'
export const revalidate = 86_400

export function GET() {
  const key = getIndexNowKey()
  if (!key) {
    return new Response('IndexNow key not configured', { status: 404 })
  }
```


**Fix:** Either drop `export const dynamic = 'force-static'` so the handler reads process.env per request (the response is a sub-100-byte string; there is nothing to gain from prerendering it), or correct the JSDoc to state that rotating INDEXNOW_KEY requires a redeploy. Prefer the former — it also removes the risk of a 404 body being baked into the deployment when the key is added after the first build.


**Fix applied:** _pending_


### L-10 · `src/app/layout.tsx:46`

**Root openGraph/twitter declare summary_large_image with no images**


The root metadata sets its own openGraph and twitter blocks but supplies no images array. src/lib/metadata.ts lines 35-46 documents exactly this footgun ('Next.js treats the child object as a full replacement and drops the framework-added images') and works around it for pages that call generatePageMetadata. The root block has the same defect and no workaround, so any route that inherits root metadata (the not-found shell, /studio) advertises a large-image Twitter card with no image.


```
openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'mk_MK',
    url: siteConfig.url,
    siteName: 'Vertex Consulting',
```


**Fix:** Add `images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: '...' }]` to the root openGraph block and `images: ['/twitter-image']` to the root twitter block, mirroring src/lib/metadata.ts.


**Fix applied:** _pending_


### L-11 · `src/components/backgrounds/BackgroundGrid.tsx:8`

**28 hardcoded English strings computed and shipped but never rendered**


`consultingItems` is a hardcoded English array with no next-intl routing. It is passed as `items` into `GridMotion`, which computes `combinedItems` from it (GridMotion.tsx:31) and then reads `combinedItems[rowIndex * 7 + itemIndex]` into `content` — but the `variant === 'panels'` branch returns a bare `<div className="metallic-panel" aria-hidden="true" />` and never uses `content`. `BackgroundGrid` defaults to `variant = 'panels'`, and its only call site (src/app/[locale]/(site)/consulting/ConsultingLandingClient.tsx:44) is a bare `<BackgroundGrid />` with no props. So all 28 strings are dead weight in the consulting-page bundle. Had the `text` variant ever been reachable, they would also be an un-translated English wall on /mk/consulting.


```
const consultingItems = [
  'Strategy', 'Operations', 'AI Tools', 'Workflow',
  'Systems', 'Growth', 'Efficiency', 'Planning',
  'Analysis', 'Structure', 'Process', 'Integration',

// GridMotion.tsx:166
                if (variant === 'panels') {
                  return (
                    <div key={itemIndex} style={{ position: 'relative' }}>
                      <div className="metallic-panel" aria-hidden="true" />
```


**Fix:** Delete `consultingItems` and the `items` prop plumbing from BackgroundGrid, or — if the text variant is being kept alive — move the labels into messages/{en,mk}.json under a `consulting.heroGrid` key and read them with `useTranslations`.


**Fix applied:** _pending_


### L-12 · `src/components/backgrounds/GridMotion.tsx:183`

**Four hardcoded hex colors instead of --division-* tokens in GridMotion**


The `variant='text'` cell styling hardcodes `backgroundColor: '#1C1C1C'` (the elevated-surface token), `color: '#737373'` (the muted-text token) and `border: '1px solid #262626'`, and the `gradientColor` prop defaults to `'#141414'` (the base token) in both GridMotion.tsx:23 and BackgroundGrid.tsx:31. These duplicate design-token values in JS, so a token change in the `@theme` block of globals.css silently desyncs them. They also do not flip with the light theme, unlike the sibling panels branch which correctly uses `var(--hero-grid-bg)` at line 132. Currently unreachable (every call site resolves to `variant='panels'`), hence Low rather than Medium.


```
backgroundColor: '#1C1C1C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#737373',
                        fontSize: '0.875rem',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 500,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        border: '1px solid #262626',
```


**Fix:** Delete the unreachable `variant='text'` branch along with the `gradientColor` prop (already marked `@deprecated` at GridMotion.tsx:8). If it is kept, swap to `var(--division-surface)`, `var(--division-text-secondary)` and `var(--division-border)` — note that #737373 on #1C1C1C is 3.65:1, below the 4.5:1 AA floor, so text-secondary rather than text-muted is the correct token.


**Fix applied:** _pending_


### L-13 · `src/components/chat/ChatWidget.tsx:61`

**Body scroll lock is evaluated once at open and never re-evaluated on resize or rotation**


`window.matchMedia('(max-width: 639px)').matches` is sampled a single time, in an effect keyed only on `[open]`, while the panel's own layout switches at Tailwind's `sm:` (640px) on every reflow. Two divergences result. Open on a phone in portrait (lock applied) then rotate to landscape (~844px wide): the panel shrinks to the 380px floating desktop card, but `document.body.style.overflow = 'hidden'` stays applied, so the page behind is frozen and the user cannot scroll while a small corner panel is open. Open on a narrow desktop window (lock skipped) then resize below 640px: the panel goes full-screen with no lock, so scroll-chaining drags the invisible page underneath.


```
// Lock body scroll on mobile only (when panel is full-screen)
  useEffect(() => {
    if (!open) return
    const isMobile = window.matchMedia('(max-width: 639px)').matches
    if (!isMobile) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [open])
```


**Fix:** Hold the MediaQueryList and subscribe to it: `const mq = window.matchMedia('(max-width: 639px)'); const apply = () => { document.body.style.overflow = mq.matches ? 'hidden' : original }; apply(); mq.addEventListener('change', apply); return () => { mq.removeEventListener('change', apply); document.body.style.overflow = original }`.


**Fix applied:** _pending_


### L-14 · `src/components/chat/ChatWidget.tsx:165`

**aria-controls points at an element id that does not exist while the panel is closed**


The trigger permanently declares `aria-controls={panelId}`, but ChatPanel (the element that receives `id={panelId}`) is rendered only inside `{open && ...}`. For the entire time the widget is closed — its normal state on every page load — the ARIA reference dangles at a non-existent id. This fails the axe `aria-valid-attr-value` rule and some screen readers will report a broken relationship for the button. Non-breaking, but it is a real ARIA violation flagged by automated audits.


```
aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}

// lines 189-200 — the target only exists when open
      <AnimatePresence>
        {open && (
          <ChatPanel
            id={panelId}
```


**Fix:** Make the attribute conditional: `aria-controls={open ? panelId : undefined}`. `aria-expanded` and `aria-haspopup` can stay unconditional.


**Fix applied:** _pending_


### L-15 · `src/components/global/Footer.tsx:111`

**new Date().getFullYear() in a client component — build-time value plus a New-Year hydration mismatch**


`Footer` is `'use client'` but is still server-rendered into the static HTML for each locale (the route tree is statically generated via `generateStaticParams`). Two consequences: (1) the copyright year is frozen at build time in the prerendered HTML, so a site not redeployed across a year boundary serves a stale year to crawlers and no-JS clients; (2) the SSR value is computed in the server's timezone (UTC on Vercel) while hydration recomputes it in the visitor's local timezone, so between 00:00 and 02:00 local time on 1 January in Europe/Skopje (UTC+1/+2) the server says the old year and the client says the new one — a React hydration text mismatch. `suppressHydrationWarning` is set on `<html>` in src/app/[locale]/layout.tsx but that flag does not cascade to descendants, so the warning is not suppressed here.


```
Footer.tsx:111  const year = new Date().getFullYear()
Footer.tsx:415            {t('copyright', { year })}
src/app/[locale]/layout.tsx:      suppressHydrationWarning
```


**Fix:** Compute the year once after mount (`const [year, setYear] = useState<number|null>(null); useEffect(() => setYear(new Date().getFullYear()), [])`) and render a static fallback until then, or move the copyright string into the server layout so it is unambiguously one value, or pin it: `{t('copyright', { year: Math.max(2026, new Date().getFullYear()) })}` is not a real fix — prefer the mount-time computation.


**Fix applied:** _pending_


### L-16 · `src/components/global/Footer.tsx:223`

**Newsletter email field has no length cap on either the client or the server**


The input declares `type="email"` and `required` but no `maxLength`, and the handler's only check is a permissive regex. `src/app/api/newsletter/route.ts` likewise applies `isValidEmail` with no length bound before handing the string to `resend.contacts.create`. A multi-megabyte string of the form `aaaa…@a.a` passes both validators and is forwarded to the Resend API on every request. RFC 5321 caps an address at 254 characters, so nothing legitimate is lost by enforcing it.


```
<input
                    type="email"
                    id={newsletterEmailId}
                    required
                    value={newsletterEmail}
src/app/api/newsletter/route.ts:function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
src/app/api/newsletter/route.ts:    if (!email || !isValidEmail(email)) {
```


**Fix:** Add `maxLength={254}` to the input, and in the route reject early with a 400 when `email.length > 254` (and cap the raw request body) before any Resend call.


**Fix applied:** _pending_


### L-17 · `src/components/global/Navbar.tsx:74`

**Mobile-menu effect clobbers body overflow instead of saving and restoring it**


The Navbar unconditionally writes `document.body.style.overflow = ''` in the not-open branch and in its cleanup, rather than capturing and restoring the prior value. `ChatWidget` locks the same property but does save/restore (`const original = document.body.style.overflow` … `document.body.style.overflow = original`). If the chat panel holds the scroll lock and the user opens then closes the mobile menu, the Navbar's else-branch clears the lock and the page scrolls behind the still-open chat panel. The effect also runs its else-branch on first mount, so it silently stomps any lock a component that mounted earlier had already set.


```
} else {
      document.body.style.overflow = ''
...
    return () => {
      document.body.style.overflow = ''
    }
src/components/chat/ChatWidget.tsx:63-66    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
      document.body.style.overflow = original
```


**Fix:** Capture the previous value when locking and restore exactly that on unlock/cleanup, mirroring ChatWidget; better still, extract a single `useScrollLock()` hook with a reference count so Navbar and ChatWidget cannot fight over the property.


**Fix applied:** _pending_


### L-18 · `src/components/global/Navbar.tsx:87`

**mobileOpen effect cleanup restores body overflow but never clears inert on main/footer**


The effect sets `main.inert = true` and `footer.inert = true` on open (lines 71-72) but the returned cleanup only resets `document.body.style.overflow`. If Navbar unmounts while `mobileOpen` is true — a locale swap remounts the layout subtree, and React StrictMode double-invokes effects in dev — <main> and <footer> are left permanently `inert`: the entire page becomes unfocusable and unclickable with no visible overlay explaining why. The overflow lock is cleaned up; the far more damaging inert flag is not.


```
wasMobileOpen.current = mobileOpen
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen, hamburgerId])
```


**Fix:** Move the un-inert logic into the cleanup: `return () => { document.body.style.overflow = ''; const m = document.querySelector('main'); const f = document.querySelector('footer'); if (m) m.inert = false; if (f) f.inert = false }`.


**Fix applied:** _pending_


### L-19 · `src/components/global/ScrollProgress.tsx:20`

**Highest-z fixed bar spans the full viewport width with no pointer-events-none**


This is the topmost layer in the whole app (z-[60], tied only with the skip link) and it stretches edge-to-edge across the top of the viewport, yet it is a normal hit-testable element — `aria-hidden="true"` removes it from the accessibility tree but not from pointer hit testing. Any click landing in the top 2 CSS pixels of the viewport is swallowed by this bar instead of reaching the navbar underneath. Low impact today because nothing interactive currently sits in those 2px, but it silently caps the top edge of the fixed header.


```
className="fixed top-0 left-0 right-0 h-[2px] z-[60]"
      aria-hidden="true"
```


**Fix:** Add `pointer-events-none` to the className.


**Fix applied:** _pending_


### L-20 · `src/components/global/ThemeProvider.tsx:16`

**Dead exports: ThemeContext.setTheme is never consumed, and the ThemeToggle barrel export is unused**


`setTheme` is declared on `ThemeContextValue`, implemented, and published on the provider value, but no consumer anywhere in src/ destructures it — every `useTheme()` call site (`Confetti.tsx:26`, `BorderGlow.tsx:175`, `BackgroundSilk.tsx:46`, `BackgroundPlasma.tsx:42`, `ThemeToggle.tsx:34`) reads only `theme` and, in one case, `toggleTheme`. Separately, `index.ts` re-exports `ThemeToggle`, but the component's only two usages (Navbar.tsx:329 and 423) import it directly via `from './ThemeToggle'`, so the barrel entry has zero importers.


```
ThemeProvider.tsx:14-21 interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: (origin?: { x: number; y: number }) => void
}
index.ts:12 export { default as ThemeToggle } from './ThemeToggle'
Navbar.tsx:18 import ThemeToggle from './ThemeToggle'
```


**Fix:** Either drop `setTheme` from the public `ThemeContextValue` (keep it module-private and expose only `theme` + `toggleTheme`), or keep it and document it as the intentional escape hatch. Remove the unused `ThemeToggle` line from index.ts, or switch Navbar to import it from the barrel so the export has a consumer.


**Fix applied:** _pending_


### L-21 · `src/components/sections/ConsultingServicePage.tsx:75`

**Service pages emit no WebPage node, unlike every other page on the site**


Both service-page templates emit only Service + BreadcrumbList (plus the FAQPage that FAQAccordion contributes). Neither uses PageSchema, so the eight highest-intent pages on the site are the only ones with no typed `WebPage` node and therefore no `isPartOf` link into `{url}/#website` or `about` link into `{url}/#organization`. Confirmed by fetching all 16 URLs: every service page's ld+json set is exactly [siteGraph | Service | BreadcrumbList | FAQPage], while /consulting and /marketing render PageSchema and do get a WebPage node. The emitted FAQPage also carries no `@id` and no `url`/`mainEntityOfPage`, so it is an unanchored node in the graph. Same gap at MarketingServicePage.tsx:77.


```
ConsultingServicePage.tsx:75-92
      <JsonLd
        data={buildServiceSchema({
          slug,
          locale,
          name: title,
          description: metaDescription,
        })}
      />
      <JsonLd
        data={buildBreadcrumbSchema({

compare src/app/[locale]/(site)/consulting/page.tsx:35-41
      <PageSchema
        path="/consulting"
        type="WebPage"
```


**Fix:** Add a WebPage node for service pages — either mount `<PageSchema path={`/consulting/${slug}`} name={title} description={metaDescription} />` (dropping its duplicate breadcrumb) or extend buildServiceSchema to emit a `@graph` of `[WebPage, Service]` with `mainEntity` pointing at the Service `@id`, and give the FAQPage an `@id`/`mainEntityOfPage` so it anchors to the page.


**Fix applied:** _pending_


### L-22 · `src/components/sections/ConsultingServicesGrid.tsx:74`

**Dead export: lucide icons re-exported from ConsultingServicesGrid with zero importers**


The module re-exports four lucide-react icon components as a named export. Nothing imports them: `grep -rn "from '@/components/sections/ConsultingServicesGrid'" src/` returns nothing, and the barrel at src/components/sections/index.ts:9 only forwards the default (`export { default as ConsultingServicesGrid } from './ConsultingServicesGrid'`), so they are unreachable via '@/components/sections' too. The one consumer, ConsultingLandingClient.tsx:2, imports the icons straight from 'lucide-react'. Dead surface area that keeps four icon modules pinned to this component's chunk graph.


```
export { Briefcase, Settings, Monitor, Brain }
```


**Fix:** Delete line 74. `Briefcase, Settings, Monitor, Brain` can then be dropped from the line 2 import, leaving `import { ArrowRight, type LucideIcon } from 'lucide-react'` — which is all the component body actually uses.


**Fix applied:** _pending_


### L-23 · `src/components/sections/ContactForm.tsx:111`

**No maxLength caps on any input before the cross-origin POST**


`validate()` enforces only lower bounds (non-empty name/email, a 10-character message floor) and none of the four inputs carries a `maxLength` attribute. Since the POST goes directly from the browser to Formspree with no server of Vertex's in the path (see the transport verdict), nothing caps the payload — a pasted multi-megabyte message is serialised into the request body and sent, burning the Formspree plan's submission size allowance and producing an opaque failure whose raw error text is then shown to the user via line 151. Low severity because an attacker would simply POST the endpoint directly rather than use the form, so this is a UX/quota guard rather than a security control.


```
const payload: Record<string, string> = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      'Interested in': DIVISION_LABELS[formData.division] ?? DIVISION_LABELS[''],
      message: formData.message.trim(),
```


**Fix:** Add `maxLength={100}` to name, `maxLength={254}` to email, `maxLength={30}` to phone and `maxLength={2000}` to the textarea, and add matching upper-bound checks in `validate()` so the limits are surfaced as field errors rather than silent truncation.


**Fix applied:** _pending_


### L-24 · `src/components/sections/HeroSection.tsx:71`

**Hero CTA anchors are the only links in this slice without the project's focus-ring utility**


Every other interactive element in this slice attaches the project's `.focus-ring` utility (DivisionSplit.tsx:51, ServicesOverview.tsx:57, CTABanner.tsx:71, ConsultingServicesGrid.tsx:44, MarketingServicesGrid.tsx:44), which globals.css:791-793 defines as `outline outline-2 outline-offset-2` in the full-opacity `--division-accent` (#F5F5F5). The hero anchors' className omits it, so they fall back to the global `* { @apply border-border outline-ring/50 }` at globals.css:587-589 — the UA `outline-style: auto` ring recolored to `--ring` (#F5F5F5, globals.css:447) at 50% alpha with no outline-offset. The result is a thinner, half-transparent ring hugging the button edge instead of the offset accent ring used everywhere else, on the site's two most prominent CTAs, over an animated WebGL hero background.


```
HeroSection.tsx:71-76
                  className={cn(
                    'inline-flex items-center justify-center min-h-[44px] px-7 py-3.5 rounded-button font-heading text-small font-medium transition-all',
                    btn.variant === 'primary'
                      ? 'bg-[var(--division-accent)] text-[var(--division-bg)] hover:brightness-110 cta-sheen'
                      : 'border border-[var(--division-border)] text-[var(--division-text-primary)] hover:bg-[var(--nav-hover-bg)]'
                  )}
```


**Fix:** Add `focus-ring` to the shared class string on line 72, e.g. `'inline-flex items-center justify-center min-h-[44px] px-7 py-3.5 rounded-button font-heading text-small font-medium transition-all focus-ring'`.


**Fix applied:** _pending_


### L-25 · `src/components/sections/MarketingServicePage.tsx:127`

**renderInlineMarkdown applied to paragraphs but not to bullets**


MarketingServicePage runs every paragraph and every paragraphsAfterBullets entry through `renderInlineMarkdown` (lines 119 and 137) but renders `bullet.description` raw. Any `**...**` a translator adds to a bullet will ship to the page as literal asterisks. Not currently firing: I scanned both messages files and the only `**` markers in the eight service namespaces are marketing.webDesign.sections[2].paragraphs[1] and marketing.aiDevelopment.sections[2].paragraphs[0] (plus their MK counterparts), all of which are paragraphs. This is a latent inconsistency in the template, not a live rendering bug.


```
line 119:                  <p key={`p-${pIdx}`}>{renderInlineMarkdown(paragraph)}</p>
line 127:                            <strong>{bullet.term}</strong> — {bullet.description}
line 137:                  <p key={`pa-${pIdx}`}>{renderInlineMarkdown(paragraph)}</p>
```


**Fix:** Wrap the bullet branches: `{renderInlineMarkdown(bullet.description)}` in both the `bullet.term` and no-term cases.


**Fix applied:** _pending_


### L-26 · `src/components/sections/MarketingServicesGrid.tsx:66`

**Dead export: lucide icons re-exported from MarketingServicesGrid with zero importers**


Same dead re-export as ConsultingServicesGrid.tsx:74. `grep -rn "from '@/components/sections/MarketingServicesGrid'" src/` returns no hits, and index.ts:12 forwards only the default. Worse here: the component body never renders any of these four icons at all — it only uses the `Icon` passed in via `service.icon` — so `Globe, Share2, Server, Cpu` on line 2 are imported purely to be re-exported into the void.


```
MarketingServicesGrid.tsx:2
import { Globe, Share2, Server, Cpu, type LucideIcon } from 'lucide-react'

MarketingServicesGrid.tsx:66
export { Globe, Share2, Server, Cpu }
```


**Fix:** Delete line 66 and reduce line 2 to `import { type LucideIcon } from 'lucide-react'`.


**Fix applied:** _pending_


### L-27 · `src/components/sections/TeamGrid.tsx:57`

**Portrait alt text duplicates the name printed directly beneath it**


The avatar image uses the member's name as its alt text, and the very next sibling element is an `<h3>` containing that same name. A screen reader therefore announces the name twice in immediate succession. Because both components wrap the entire card in a `<Link>` when `member.href` is set (TeamGrid line 92, TeamShowcase line 80), the duplication also lands inside the link's computed accessible name, e.g. 'Marketing Lazar Dinov Lazar Dinov Head of Marketing …'. The portrait adds no information the adjacent heading does not already carry, so it is decorative in context. The same pattern exists at TeamShowcase.tsx line 44.


```
<Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
```


**Fix:** Set `alt=""` on both `<Image>` elements (TeamGrid line 57, TeamShowcase line 44) so the decorative portrait is skipped and the adjacent `<h3>` supplies the name exactly once.


**Fix applied:** _pending_


### L-28 · `src/components/sections/TeamShowcase.tsx:7`

**Dead export: TeamMember interface is never imported anywhere**


`TeamMember` is exported but a repo-wide grep for the identifier returns only two hits, both inside TeamShowcase.tsx itself — the declaration on line 7 and its own use in `TeamShowcaseProps` on line 19. Nothing outside the module consumes it. Contrast with the parallel `TeamGridMember` in TeamGrid.tsx line 7, which IS legitimately exported and imported by `src/app/[locale]/(site)/about/AboutPageClient.tsx` line 4. MarketingLandingClient builds its `members` array inline without importing the type, so the export is pure surface area.


```
export interface TeamMember {
  name: string
  role: string
  bio: string
  initials: string
```


**Fix:** Drop the `export` keyword (`interface TeamMember { … }`), or — for symmetry with the About page — import it in MarketingLandingClient.tsx and annotate its `members` array with `TeamMember[]` so the prop contract is checked at the call site.


**Fix applied:** _pending_


### L-29 · `src/components/ui/BorderGlow.tsx:186`

**Design-token hex values duplicated in the BorderGlow mesh palette**


`resolvedColors` restates the same six token hexes as Confetti. Unlike `glowColor` — where the inline comment at lines 153-157 correctly explains that `parseHSL` needs a literal HSL triplet — these values are only interpolated into CSS gradient strings by `buildGradientVars` (`radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`), where a `var()` reference resolves fine. So the JS duplication of the token values is avoidable, and it desyncs silently if the tokens move.


```
const resolvedColors =
    colors ??
    (theme === 'light'
      ? ['#0A0B12', '#4B5563', '#9AA0AD']
      : ['#F5F5F5', '#C9C9C9', '#A3A3A3'])
```


**Fix:** Replace both branches with a single `['var(--division-text-primary)', 'var(--division-text-secondary)', 'var(--division-text-tertiary)']` and drop the `theme` read for this value (`theme` is still needed for `resolvedGlowColor` and `effectiveIntensity`).


**Fix applied:** _pending_


### L-30 · `src/components/ui/BorderGlow.tsx:269`

**`animated` sweep starts 4 uncancellable rAF/setTimeout chains and ignores prefers-reduced-motion**


`animateValue` schedules `setTimeout(() => requestAnimationFrame(tick), delay)` and then self-schedules `requestAnimationFrame(tick)` until `t >= 1`. Nothing is stored or returned, and the effect at line 269 has no cleanup function, so the four chains (the last one starts at delay 2500 and runs 1500ms) keep ticking after unmount, writing `card.style.setProperty(...)` on a detached node and finally calling `card.classList.remove('sweep-active')` on it. Separately, the sweep is pure JS rAF property-writing, so neither `<MotionConfig reducedMotion="user">` nor the global `@media (prefers-reduced-motion: reduce)` block at globals.css:1024 (which only clamps `animation-duration`/`transition-duration`) suppresses it. Currently latent rather than live: all 8 call sites (TeamGrid:89, TeamShowcase:77, ServicesOverview:53, ConsultingServicesGrid:40, MarketingServicesGrid:40, BlogCard:50, ProjectsShowcase:134, LazarWork:91) pass `animated={false}`, so the effect returns at its guard. Hence Low, but it will fire the moment anyone flips the prop.


```
function animateValue({ ... }: AnimateValueOptions): void {
  const t0 = performance.now() + delay
  function tick() {
    const elapsed = performance.now() - t0
    const t = Math.min(elapsed / duration, 1)
    onUpdate(start + (end - start) * ease(t))
    if (t < 1) requestAnimationFrame(tick)
    else if (onEnd) onEnd()
  }
  setTimeout(() => requestAnimationFrame(tick), delay)
}

  useEffect(() => {
    if (!animated || !cardRef.current) return
    const card = cardRef.current
```


**Fix:** Make `animateValue` return a canceller (`let raf = 0; const to = setTimeout(...)`; return `() => { clearTimeout(to); cancelAnimationFrame(raf) }`), collect the four cancellers in the effect and return `() => cancellers.forEach(c => c())`. Also gate the effect on reduced motion: `const prefersReduced = useReducedMotion()` from 'motion/react' and change the guard to `if (!animated || prefersReduced || !cardRef.current) return`.


**Fix applied:** _pending_


### L-31 · `src/components/ui/Confetti.tsx:9`

**Design-token hex values duplicated in the Confetti palette**


`PALETTES` restates the six grayscale token values in JS. They are consumed as `backgroundColor: p.color` in an inline style (line 68), which accepts `var()` perfectly well — unlike the shader colors in BackgroundSilk/BackgroundPlasma, which genuinely must be JS-parseable hex because `hexToRgb`/`hexToNormalizedRGB` parse them. So there is no technical reason for the duplication here, and the palette will silently drift if the `@theme` tokens in globals.css change. The `theme === 'light'` branch also duplicates the theme selection that the CSS variables already perform via `html[data-theme="light"]`.


```
const PALETTES = {
  dark: ['#F5F5F5', '#C9C9C9', '#A3A3A3'],
  light: ['#0A0B12', '#4B5563', '#9AA0AD'],
} as const
```


**Fix:** Replace the two arrays and the `useTheme()` call with a single token array — `const COLORS = ['var(--division-text-primary)', 'var(--division-text-secondary)', 'var(--division-text-tertiary)']` — since those tokens already flip per theme in globals.css. This also removes `colors` from the `useMemo` dep array.


**Fix applied:** _pending_


### L-32 · `src/lib/ai.ts:98`

**streamOllama never checks response.ok — an upstream error yields a silent empty reply**


The Ollama branch checks only that a body exists. A 404 (wrong model), 500, or any JSON error envelope still has a body, so the loop parses lines that contain no `message.content`, the generator ends having yielded nothing, and the route closes the stream normally. The client sees HTTP 200 with zero bytes and renders a permanently empty assistant bubble — no error state, nothing logged. Currently latent because AI_PROVIDER defaults to 'claude', but this is the documented migration path. The reader is also never released when a consumer exits the `for await` early, leaking the connection.


```
src/lib/ai.ts:88-101
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
```


**Fix:** Throw on a non-OK response so the route's existing catch surfaces it: `if (!response.ok) throw new Error(`Ollama HTTP ${response.status}: ${await response.text().catch(() => '')}`)` before the body check. Wrap the read loop in `try { ... } finally { reader.releaseLock() }` so an early generator return does not leak the connection.


**Fix applied:** _pending_


### L-33 · `src/lib/animations.ts:17`

**Ten exported animation constants have zero consumers**


Verified by grepping each export name across src/**/*.ts(x) excluding src/_project-state and animations.ts itself. Zero external references for: `springGentle` (line 17), `easeOut` (23), `fadeInUpSlow` (46), `fadeInLeft` (56), `fadeInRight` (66), `fadeIn` (76), `scaleIn` (85), `hoverLift` (145), `hoverScale` (151), `hoverGlow` (157). `easeOutSlow` (28) is referenced only by the dead `fadeInUpSlow`. The one apparent `fadeInLeft` hit is a JSDoc comment in AnimateIn.tsx:26, and the two `easeOut` hits are the string literal `ease: 'easeOut'` in Navbar.tsx:289 / ThemeToggle.tsx:77, not this export. All of it ships in the client bundle to every page that imports anything from this module.


```
export const springGentle: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
}

export const easeOut: Transition = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1],
}
```


**Fix:** Delete `springGentle`, `easeOut`, `easeOutSlow`, `fadeInUpSlow`, `fadeInLeft`, `fadeInRight`, `fadeIn`, `scaleIn`, `hoverLift`, `hoverScale`, `hoverGlow`, and fix the stale `fadeInLeft` reference in the AnimateIn.tsx:26 JSDoc example. Keep `springSnap` — it is consumed internally by `fadeInUp`, `staggerItem` and the live hero variants.


**Fix applied:** _pending_


### L-34 · `src/lib/animations.ts:161`

**Hardcoded lavender boxShadow violates the dark-only unified grayscale system**


`hoverGlow` hardcodes `rgba(180, 144, 240, 0.15)` — a purple. The design system is unified grayscale with all colors sourced from `var(--division-*)` tokens. This is a leftover from the pre-unification marketing theme. It has no consumer (grep for `hoverGlow` outside src/lib/animations.ts and src/_project-state returns 0 hits), so it cannot currently render, but it is a live export any future caller could pick up and it would immediately break the palette.


```
export const hoverGlow = {
  whileHover: {
    y: -6,
    scale: 1.02,
    boxShadow: '0 0 30px rgba(180, 144, 240, 0.15)',
    transition: springPop,
  },
  whileTap: { scale: 0.98, transition: { duration: 0.1 } },
}
```


**Fix:** Delete the `hoverGlow` export (it is unreferenced). If a glow hover is wanted later, drive it from `var(--division-glow)` via a CSS class rather than an inline motion boxShadow, since motion cannot interpolate `var()`.


**Fix applied:** _pending_


### L-35 · `src/lib/blog.ts:154`

**Dead export: getPostsByDivision has zero call sites**


`getPostsByDivision` is exported and fully implemented (it drives `postsByDivisionQuery` in src/lib/sanity/queries.ts), but nothing in src/ imports it — the only hits outside its own definition are historical notes in src/_project-state/. Division filtering on the listing is done client-side in BlogListingClient via `posts.filter((p) => p.division === filter)`. The function and its query are ~15 lines of unreachable code that a future reader will assume is load-bearing.


```
src/lib/blog.ts:154-165
export async function getPostsByDivision(
  division: Division,
  locale: Locale
): Promise<BlogPost[]> {
  if (blogUnavailable()) return []
  const raws = await sanityClient.fetch<BlogPostRaw[]>(
    postsByDivisionQuery,
    { division },
    { next: { revalidate: 60, tags: ['blog'] } }
  )
  return raws.map((r) => collapse(r, locale))
}

`grep -rn "getPostsByDivision" src/` returns only src/lib/blog.ts:154 and src/_project-state/*.md.
```


**Fix:** Delete `getPostsByDivision` from src/lib/blog.ts and `postsByDivisionQuery` from src/lib/sanity/queries.ts, plus the now-unused import on line 5 of blog.ts. If it is being kept for a planned server-side filtered route, add a comment saying so.


**Fix applied:** _pending_


### L-36 · `src/lib/contentGenerator/createPost.ts:53`

**Slug de-duplication is single-shot — a second same-day collision creates an unreachable duplicate slug**


The uniqueness check queries only the base slug. On a hit it appends today's date and writes the document without re-checking. If the dated slug is also taken — two generations of the same topic on the same day, which the topic backlog makes possible because a `failed` topic can be re-added or the operator can rerun after a Sanity edit — `sanityWriteClient.create` succeeds anyway, since the `slug` field in the blogPost schema has `validation: (r) => r.required()` but no uniqueness rule. The result is two published posts sharing a slug. `postBySlugQuery` takes `[0]` of the ordered match set, so one post becomes permanently unreachable at its own URL while still appearing in the blog index and the sitemap — a 200-that-serves-the-wrong-post rather than a 404.


```
// src/lib/contentGenerator/createPost.ts:52-60
  let finalSlug = draft.slug
  const existing = await sanityWriteClient.fetch<string | null>(
    `*[_type == "blogPost" && slug.current == $slug][0]._id`,
    { slug: finalSlug }
  )
  if (existing) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    finalSlug = `${draft.slug}-${datePart}`
  }

// src/lib/sanity/queries.ts:37-41 — [0] silently hides the duplicate
export const postBySlugQuery = groq`
  *[_type == "blogPost" && slug.current == $slug && status == "published"][0] {
```


**Fix:** Loop instead of branching once: keep querying `*[_type == "blogPost" && slug.current == $slug][0]._id` and appending a suffix (`-YYYYMMDD`, then `-YYYYMMDD-2`, `-3`, …) until the query returns null, with a small attempt cap that throws rather than writing a known-duplicate slug.


**Fix applied:** _pending_


### L-37 · `src/lib/contentGenerator/generateDraft.ts:40`

**anthropic-beta: output-128k-2025-02-19 is a no-op on Opus 4.x, and its justifying comment is wrong**


The client sets `defaultHeaders: { 'anthropic-beta': 'output-128k-2025-02-19' }` on every request, with a comment stating that without it `max_tokens > 8192` returns an API error. That was true for Claude 3.7-era models; extended output is built in to Claude 4+ models, and `claude-opus-4-7` accepts up to 128K `max_tokens` with no beta header at all. The header is therefore inert. It is not currently breaking anything, but it is misleading config: the comment will lead the next person to believe `MAX_TOKENS = 16_000` depends on it, and it keeps a stale beta flag on every outbound request.


```
// src/lib/contentGenerator/generateDraft.ts:36-41
  // Long-output beta lets Opus 4.x generate up to 64k output tokens. Without it,
  // max_tokens > 8192 returns an API error. Safe with regular API keys.
  return new Anthropic({
    apiKey,
    defaultHeaders: { 'anthropic-beta': 'output-128k-2025-02-19' },
  })
```


**Fix:** Drop `defaultHeaders` and the two comment lines: `return new Anthropic({ apiKey })`. Also correct the `MAX_TOKENS` comment on lines 12-17, which repeats the same claim ("Opus 4.x supports >8192 only with the long-output beta header — applied below").


**Fix applied:** _pending_


### L-38 · `src/lib/divisions.ts:12`

**divisionConfig is an unused export carrying six hardcoded hex values**


`divisionConfig` is exported but has zero consumers anywhere in src/ — the only match in the whole tree is its own declaration. (`getDivisionFromPath`, in the same file, is genuinely used by DivisionProvider.tsx and chatWidget.ts.) The dead object also hardcodes the design-system colors as Tailwind arbitrary values — `text-[#F5F5F5]`, `bg-[#141414]`, `border-[#404040]`, repeated identically across all three divisions — instead of the `var(--division-*)` tokens the rest of the codebase uses. If anyone ever revives it, it silently bypasses the theme layer; #404040 in particular is not one of the documented palette values.


```
// src/lib/divisions.ts:12-24
export const divisionConfig = {
  consulting: {
    label: 'Vertex Consulting',
    accentClass: 'text-[#F5F5F5]',
    bgClass: 'bg-[#141414]',
    borderClass: 'border-[#404040]',
  },
  marketing: {
    label: 'Vertex Marketing',
    accentClass: 'text-[#F5F5F5]',
    bgClass: 'bg-[#141414]',
    borderClass: 'border-[#404040]',
  },
```


**Fix:** Delete the `divisionConfig` export (lines 9-31) and its explanatory comment. Keep `Division` and `getDivisionFromPath`. If a division-keyed label map is still wanted later, reintroduce it with `text-[var(--division-text-primary)]` / `bg-[var(--division-bg)]` / `border-[var(--division-border)]` rather than literals.


**Fix applied:** _pending_


### L-39 · `src/lib/meta.ts:166`

**waitForContainerReady swallows Meta API errors and reports a misleading timeout**


The polling loop reads `json.status_code ?? 'IN_PROGRESS'` without ever checking `res.ok` or `json.error`. If the status poll fails for a real reason — expired page token, revoked permission, invalid creation_id — Meta returns a non-2xx body with an `error` object and no `status_code`, so the loop treats it as still-in-progress, burns all 10 attempts and 20 seconds of sleeps, then throws `Instagram container did not finish processing within 20 seconds`. The actual Meta error message and code are discarded. Every other fetch in this file (postToFacebook line 63, container create line 110, publish line 131) does check `!res.ok || json.error` and surfaces the real message, so this is an inconsistency rather than a deliberate choice. The consequence is a wrong diagnosis surfaced to the operator via the Telegram alert and the /admin/generate log.


```
// src/lib/meta.ts:161-175
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${GRAPH_BASE}/${creationId}?fields=status_code&access_token=${encodeURIComponent(token)}`,
      { cache: 'no-store' }
    )
    const json = await res.json()
    const status: string = json.status_code ?? 'IN_PROGRESS'
    if (status === 'FINISHED') return
    if (status === 'ERROR' || status === 'EXPIRED') {
      throw new Error(`Instagram container failed with status ${status}`)
    }
    await new Promise((r) => setTimeout(r, delayMs))
  }
  throw new Error('Instagram container did not finish processing within 20 seconds')
```


**Fix:** After `const json = await res.json()`, add the same guard the rest of the file uses: `if (!res.ok || json.error) { throw new Error(\`Instagram container status poll failed: ${json.error?.message ?? \`HTTP ${res.status}\`}\`) }`. Also move the `await new Promise(...)` sleep behind an `if (i < maxAttempts - 1)` check so the final iteration does not sleep 2s before throwing.


**Fix applied:** _pending_


### L-40 · `src/lib/telegram.ts:29`

**Telegram fetch has no timeout — a hung request stalls the whole publish pipeline**


`sendTelegramMessage` is awaited inside generateNextPost (src/lib/contentGenerator/index.ts:130, 145, 168, 293) with no AbortSignal and no timeout. Node's fetch has no default request timeout, so if api.telegram.org accepts the connection and never responds, the await blocks indefinitely: on Vercel it consumes the entire 60s function budget and the run is killed, and on localhost (where this pipeline is actually run per AGENTS.md) the generation hangs forever with no output. The file's own header promises failures are non-fatal, but a hang is not a failure it can catch.


```
src/lib/telegram.ts:4-6
 * Failures are non-fatal — main publish flow always continues.

src/lib/telegram.ts:29-39
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
      cache: 'no-store',
    })
```


**Fix:** Add `signal: AbortSignal.timeout(10_000)` to the fetch options (Node 26 supports it natively); the existing catch already converts the AbortError into `{ ok: false, error }`, preserving the non-fatal contract. Telegram also rejects messages over 4096 characters, so truncate `text` before sending.


**Fix applied:** _pending_


### L-41 · `src/types/index.ts:43`

**Deprecated NavItem type in src/types is dead — nothing imports it**


`src/types/index.ts` exports a `NavItem` marked `@deprecated` in favour of the one in `@/config/navigation`. Every importer of `@/types` (the eight service pages plus ConsultingServicePage.tsx and MarketingServicePage.tsx) pulls only `ContentSection`, `Bullet`, `FAQItem`, `ProcessStep`, and `RelatedServiceLink`. `NavItem` is imported nowhere; the canonical `NavItem` in src/config/navigation.ts:1 is the one Navbar and Footer use. It is a duplicate name in the public type surface that can be autocompleted into by mistake and shadow the real one.


```
// src/types/index.ts:43-47
/** @deprecated Use the canonical NavItem from `@/config/navigation`. */
export type NavItem = {
  label: string
  href: string
}

// src/config/navigation.ts:1-6 — the real one, with children support
export interface NavItem {
  ...
  children?: NavItem[]
}
```


**Fix:** Delete lines 43-47 of src/types/index.ts. No import changes are needed anywhere.


**Fix applied:** _pending_


---

## Informational verdicts


Answers to the explicit questions the audit was asked to settle. Not bugs.


### VERDICT: z-index map


_Source: `src/components/global/Navbar.tsx:117`_


Complete inventory of fixed/sticky layers, all of which resolve in the ROOT stacking context (body → ThemeProvider/NextIntlClientProvider/MotionWrapper render no DOM; DivisionProvider's div is `min-h-screen` only, no position/transform/opacity, so it creates no stacking context). Ties therefore break by DOM order, which in src/app/[locale]/layout.tsx is: ScrollProgress → {children: skip-link, Navbar header, Navbar mobile overlay, main, Footer} → BackToTop → ChatWidget.

z-[60] — ScrollProgress bar, fixed top-0 left-0 right-0 h-[2px] (src/components/global/ScrollProgress.tsx:20). NOTE: it has no `pointer-events-none`, so it intercepts clicks on the top 2px strip of the navbar.
z-[60] — Skip-to-content link, fixed left-4 top-4 (src/app/[locale]/(site)/layout.tsx:24). Later in DOM than ScrollProgress, so it wins the tie when focused.
z-50 — Navbar header, fixed top-0 left-0 right-0 (Navbar.tsx:117). Also carries a motion `transform`, so it forms its own stacking context for its children.
z-50 — Navbar hamburger, `relative z-50` scoped INSIDE the header's context (Navbar.tsx:384); no global effect.
z-50 — ChatWidget trigger bubble, fixed bottom-6 right-6 (src/components/chat/ChatWidget.tsx:174).
z-50 — ChatPanel (src/components/chat/ChatPanel.tsx:128).
z-40 — Navbar mobile menu overlay, fixed inset-0 (Navbar.tsx:410).
z-40 — BackToTop FAB, fixed bottom-24 md:bottom-6 right-6 (src/components/global/BackToTop.tsx:42).

Highest occupied tier is 60. New fixed UI that must sit above everything needs z-[70]+. New UI that must sit above the mobile menu but below the navbar has no clean slot today — see the separate High finding: the mobile overlay is mis-tiered at 40 and loses to both z-40 BackToTop (DOM order) and z-50 chat.


### VERDICT: chat routes — /api/chat is a real implementation, /api/chat/lead is a dead stub


_Source: `src/app/api/chat/lead/route.ts:3`_


Answering the explicit question. `/api/chat/route.ts` is a REAL, complete implementation: Node runtime, kill switch, input validation (≤40 messages, ≤2000 chars, role and locale checks), system-prompt construction via buildSystemPrompt(), and a genuine token-by-token ReadableStream fed by streamAIResponse() → the Anthropic SDK. It is not a stub — though see the Critical finding above, which means it cannot currently return a successful response. `/api/chat/lead/route.ts` IS an unimplemented stub: 5 lines, no auth, no validation, no body parsing, returns a constant 200. Nothing in the codebase calls it — `grep -rn 'chat/lead' src scripts` matches only the file itself and project-state docs — so it is a publicly reachable dead endpoint reserved for the still-open Phase 12B. On the doc conflict: `file-map.md` is correct on both routes (line 124 accurately describes the live chat route, line 125 correctly calls lead a stub); `current-state.md` is the one that is wrong, and it contradicts itself — line 32 correctly describes the live widget, while line 96 claims both routes "still return { ok: true } stubs with no Claude calls".


### VERDICT: contact form posts directly to Formspree — there is no /api/contact route


_Source: `src/components/sections/ContactForm.tsx:122`_


Answering the explicit question. There is no server route for the contact form: `ls src/app/api` returns only chat, generate-post, newsletter, revalidate. ContactForm.tsx is a client component that POSTs JSON straight to a third-party Formspree endpoint read from the public env var NEXT_PUBLIC_VERTEX_FORMSPREE_ENDPOINT, using Formspree's own `_gotcha` honeypot and `_subject` conventions. current-state.md line 96 confirms `/api/contact` was deliberately removed on 2026-07-13. Consequences worth noting: submissions never touch Vertex infrastructure (no server-side validation, no rate limit, no logging, no Resend record), and if the env var is unset the form fails closed with a translated generic error and a console.error — degradation is graceful, which is correct. The form's a11y is otherwise solid: per-field validation, aria-invalid, aria-describedby wiring, role="alert" errors, focus moved to the first invalid field, and a submit button disabled with aria-busy while in flight.


### VERDICT: chat z-index and offset


_Source: `src/components/chat/ChatWidget.tsx:174`_


NUMBERS FOR FUTURE FIXED UI. Trigger: `fixed z-50`, `bottom-6 right-6`, `h-14 w-14` — occupies 24-80px from the bottom edge and 24-80px from the right edge, IDENTICAL at every breakpoint (there is no mobile-specific offset and no `env(safe-area-inset-bottom)` on the trigger, so on notched iPhones the 24px bottom offset puts the button partly inside the home-indicator strip; the panel's input row does use `pb-[max(0.75rem,env(safe-area-inset-bottom))]`). Panel: `fixed z-50`; mobile `top-0 right-0 bottom-0 left-0` full-screen; desktop `sm:bottom-24 sm:right-6 sm:w-[380px] sm:h-[560px]` (96px from bottom, 16px clear of the trigger). SITE Z-LADDER: ScrollProgress `z-[60]`, skip link `z-[60]`, Navbar `z-50`, chat trigger + panel `z-50`, Navbar mobile overlay `z-40`, BackToTop `z-40`. RULES FOR NEW FIXED UI: (a) a cookie notice or sticky mobile CTA must use z-40 or lower to layer UNDER the chat, and must reserve the bottom-right 24-80px box — bottom-anchored bars need `padding-right: 88px` on >=sm or `bottom: 88px` to clear the trigger; (b) do NOT reuse z-50 — the chat panel wins ties only because ChatWidget is the last child in src/app/[locale]/layout.tsx, which is fragile; (c) note the existing bug at z-[60]: ScrollProgress paints its 2px bar ACROSS the top of the full-screen mobile chat panel, since 60 > 50. See the separate High finding for the BackToTop collision at the same corner.


### VERDICT: z-index map


_Source: `src/components/global/BackToTop.tsx:42`_


Complete inventory of fixed/sticky layers, all of which resolve in the ROOT stacking context — MotionWrapper renders only <MotionConfig> (no DOM node), DivisionProvider's wrapper is `min-h-screen` with no transform/opacity/filter/isolation, and (site)/layout's wrapper is `flex flex-col min-h-screen`. So these numbers compare directly, and ties break on DOM order.

z-[60]  ScrollProgress bar — fixed top-0, full width, h-2px — src/components/global/ScrollProgress.tsx:20
z-[60]  Skip-to-content link — fixed left-4 top-4 — src/app/[locale]/(site)/layout.tsx:24
z-50    Navbar header — fixed top-0 left-0 right-0 — src/components/global/Navbar.tsx:117
z-50    Navbar hamburger — relative, inside the header — src/components/global/Navbar.tsx:384
z-50    Chat trigger FAB — fixed bottom-6 right-6 — src/components/chat/ChatWidget.tsx:174
z-50    Chat panel — fixed — src/components/chat/ChatPanel.tsx:128
z-40    Navbar mobile menu overlay — fixed inset-0 lg:hidden — src/components/global/Navbar.tsx:410
z-40    BackToTop FAB — fixed bottom-24 md:bottom-6 right-6 — src/components/global/BackToTop.tsx:42

DOM paint order inside the shared context (src/app/[locale]/layout.tsx): ScrollProgress -> {children: (site) layout = skip link, Navbar+overlay, main, Footer} -> BackToTop -> ChatWidget. Therefore at equal z-index the chat/BackToTop layers win over anything in `children`.

Guidance for new fixed UI: a modal/overlay must be > 50 to sit above the chat FAB and the navbar; a floating action control belongs at 40 and MUST also be added to Navbar's inert sweep (currently only `main` + `footer`, Navbar.tsx:69-78). Nothing should be placed at 60 except full-viewport-top chrome, and anything at 60 must carry `pointer-events-none` unless it is meant to be clicked.

The map itself is the answer; the z-40 overlay vs z-50 chat FAB collision it exposes is filed separately as the High finding on Navbar.tsx:410.


### VERDICT: no useEffect / listener / timer / observer leaks exist anywhere in this slice


_Source: `src/components/sections/FAQAccordion.tsx:3`_


Checked hunt items 1, 2 and 7 (effect cleanup, stale closures, dependency arrays, unaborted fetches, setState-after-unmount). A grep for useEffect|setTimeout|setInterval|addEventListener|IntersectionObserver|requestAnimationFrame|AbortController across all eight component files returns zero hits (exit status 1). Only two of the nine files hold state at all — FAQAccordion (useId + useState) and DivisionSplit.tsx:32 (`useState<string | null>(null)` for hover) — and neither subscribes to anything. ServicesOverview, ProcessSteps, ConsultingServicesGrid and MarketingServicesGrid are server components with no hooks whatsoever. There is nothing here to leak, and consequently no dependency array to get wrong. Not a bug.


### VERDICT: no hydration mismatches and no index-based keys in this slice


_Source: `src/components/sections/FAQAccordion.tsx:29`_


Checked hunt items 3 and 6. No `new Date()`, `Date.getFullYear()`, `Math.random()`, or `window`/`document` access appears in any of the nine files — the only useState initializer in the slice is the literal `0` quoted below, and DivisionSplit's is `null`, both deterministic across server and client. `useId()` on line 31 is the hydration-safe id source and correctly feeds both `triggerId` and `panelId`. On keys: every list uses a stable content or route key, never an array index — FAQAccordion `key={item.question}`, ProcessSteps.tsx:29 `key={step.title}`, HeroSection.tsx:68 `key={btn.href}`, ServicesOverview.tsx:46 / ConsultingServicesGrid.tsx:33 / MarketingServicesGrid.tsx:33 `key={service.href}`, DivisionSplit.tsx:41 `key={division.id}` and :92 `key={service}`. DivisionSplit.tsx:36 does destructure `index`, but only to compute `delay: index * 0.15` on line 45, not as a key. All source lists are module-level `as const` arrays or fixed props, so none reorder or filter. Not a bug.


### VERDICT: no hardcoded hex colors and no untranslated user-visible strings in this slice


_Source: `src/components/sections/ProcessSteps.tsx:36`_


Checked hunt items 12 and 13. A grep for `#[0-9a-fA-F]{3,8}` across all nine files returns zero hits (exit status 1) — every color resolves through a `--division-*` / `--color-*` custom property, either as a Tailwind arbitrary value or as an inline style like the block quoted below. For i18n: no literal English user-visible string appears inside JSX anywhere in the slice. ServicesOverview, DivisionSplit and CTABanner route all copy through `getTranslations`/`useTranslations` (and CTABanner.tsx:29-31 correctly falls back to `t('defaultHeadline')`/`t('defaultSubtext')`/`t('defaultCta')` when the optional override props are omitted); HeroSection, ProcessSteps, FAQAccordion, ConsultingServicesGrid and MarketingServicesGrid are fully prop-driven, and I verified all their callers pass `t(...)` values. I also verified every key these components read actually exists in both dictionaries — including `home.servicesOverview.divisionLabels.{consulting,marketing}` and the `home.divisionSplit.{consulting,marketing}.services` arrays that DivisionSplit.tsx:38 reads via `t.raw(...) as string[]`, which would throw on `.map` if the key were missing. Related check on hunt item 15: no link in this slice has an accessible name of 'click here'/'read more'/'learn more' — the card links wrap the full heading + description, and the division CTA text is 'Explore Consulting'/'Explore Marketing'. Not a bug.


### VERDICT: Next 16 async params are correctly awaited everywhere in this slice


_Source: `src/app/[locale]/not-found.tsx:10`_


Informational answer to hunt item 4. Every generateMetadata and every page in the slice types params as Promise and awaits it before use: (site)/page.tsx:28, about/page.tsx:13 and 28, contact/page.tsx:13 and 28, privacy/page.tsx:12 and 27, thank-you/page.tsx:12 and 28, [locale]/layout.tsx:67. No synchronous params or searchParams access exists. not-found.tsx correctly does not declare params at all, since Next does not pass them to not-found boundaries. Not a bug.


### VERDICT: no useEffect, timers, observers or hydration-unsafe APIs in this slice


_Source: `src/app/[locale]/(site)/contact/ContactPageClient.tsx:9`_


Informational answer to hunt items 1, 2, 3, 6 and 7. ContactPageClient is the only 'use client' file in the slice and it contains no hooks other than useTranslations, no effects, no timers, no observers, no fetch and no state, so there is nothing to clean up, no dependency array to get wrong, and no double-submit path. Every other file is a Server Component. There is no new Date(), getFullYear(), Math.random(), or window/document access during render anywhere in the slice; the only browser-API access is the pre-hydration theme script in [locale]/layout.tsx lines 23-34, which runs in <head> before React and is guarded by try/catch. Not a bug.


### VERDICT: homepage PageSchema path='/' does not produce a double-slash URL


_Source: `src/app/[locale]/(site)/page.tsx:45`_


Informational answer to a plausible-looking mismatch: generateMetadata passes path: '' (line 33) while PageSchema passes path="/" (line 46). src/lib/schema.ts line 42 normalises this with `${siteConfig.url}/${locale}${path === '/' ? '' : path}`, so both emit https://vertexconsulting.mk/en with no trailing slash and the JSON-LD @id matches the canonical. Not a bug.


### VERDICT: lint fix for react-hooks/set-state-in-effect in the 3 background wrappers


_Source: `src/components/backgrounds/BackgroundGrid.tsx:39`_


Three of the 13 errors are the same shape: BackgroundGrid.tsx:39, BackgroundPlasma.tsx:46 and BackgroundSilk.tsx:50 all read `matchMedia` and `setShouldAnimate` synchronously in an effect body. Current behaviour that must be preserved: `false` during SSR and the hydration render (so server and first client markup match), then the real value, then live updates when the media query flips. `useState` with a lazy initializer is NOT a valid fix here — these are 'use client' components that are still server-rendered (only the inner shader is `dynamic(ssr:false)`), so a `window.matchMedia` call in the initializer would throw on the server. The correct primitive is `useSyncExternalStore`, whose `getServerSnapshot` is also used for the hydration render, giving byte-identical behaviour with zero cascading render.


### VERDICT: lint fix for react-hooks/set-state-in-effect on route change


_Source: `src/components/global/Navbar.tsx:58`_


Closing the mobile menu and dropdown in a `[pathname]` effect is flagged because it is a cascading render. It is also a real (if brief) visual artifact: `useEffect` runs after paint, so on a route change the open mobile overlay paints once over the new page before closing. React's documented replacement is the 'adjusting state when a prop changes' pattern — a render-phase comparison against a stored previous value, which React restarts immediately without committing the intermediate DOM.


### VERDICT: lint fix for react-hooks/set-state-in-effect in the mount gate


_Source: `src/components/global/ThemeToggle.tsx:39`_


`setMounted(true)` in a mount effect is the classic hydration gate. The comment at lines 42-47 is explicit that server and first-client render must produce byte-identical outer markup, so the fix must keep the value `false` for the SSR render AND for the hydration render, then flip to `true`. `useSyncExternalStore` with a no-op subscriber does exactly that and is React's blessed `useIsHydrated` idiom — `getServerSnapshot` supplies the hydration-render value, then React re-renders with `getSnapshot`.


### VERDICT: lint fix for the 6 react-hooks/purity Math.random() errors


_Source: `src/components/ui/Confetti.tsx:32`_


Six of the 13 errors are `Math.random()` calls at Confetti.tsx:32, 33, 36, 37, 38 and 40, all inside the `useMemo` at line 29. In practice the memo is stable — `count` is a number and `colors` is a module-level `as const` reference — so the burst does not currently re-randomise on ordinary re-renders. But React explicitly reserves the right to discard `useMemo` caches, and under StrictMode the initializer already runs twice; if the cache is dropped mid-flight every piece jumps to a new trajectory and the burst visually restarts. The behaviour-preserving fix is a seeded PRNG: same visual scatter, deterministic, pure, and all six errors clear without an eslint-disable.


### VERDICT: lint fix for the unused eslint-disable directive (the 1 warning)


_Source: `src/components/backgrounds/Silk.tsx:3`_


The 14th lint problem — the only warning, and the only one auto-fixable with `--fix`. The file suppresses `react/no-unknown-property` for R3F's lowercase JSX intrinsics (`<mesh>`, `<planeGeometry>`, `<shaderMaterial>`), but that rule is not enabled in this project's flat config, so the directive suppresses nothing.


### VERDICT: prefers-reduced-motion genuinely does disable the shader backgrounds and entry animations


_Source: `src/components/backgrounds/BackgroundSilk.tsx:48`_


Confirmed on all three layers, with one caveat.

(1) SHADER BACKGROUNDS — genuinely disabled. All three wrappers gate the dynamic import behind a live `matchMedia('(prefers-reduced-motion: reduce)')` subscription and render an inert solid-color div instead: BackgroundSilk.tsx:48-54 + 70-83, BackgroundPlasma.tsx:44-50 + 56-70, BackgroundGrid.tsx:37-43 + 50-54. Because the shader modules are `dynamic(..., { ssr: false })` and only referenced inside the truthy branch, a reduced-motion user never even downloads three.js / ogl / gsap. The subscription is live, so toggling the OS setting swaps in real time.

(2) MOTION ENTRY ANIMATIONS — genuinely disabled. `<MotionConfig reducedMotion="user">` is mounted in src/app/[locale]/layout.tsx:85 wrapping the whole tree, so AnimateIn / StaggerContainer / StaggerItem / the hero variants all drop their transform animations (`animateTarget` passes `{ type: false }` for positional keys when `shouldReduceMotion` is set) while still animating opacity — so nothing is ever left stuck invisible.

(3) CSS — a global catch-all at globals.css:1024-1030 clamps `animation-duration` and `transition-duration` to 0.01ms, with targeted `animation: none` overrides for `.typing-dot` / `.chat-trigger::before` (903), `.footer-link::after` (951), `.cta-sheen:hover::after` (1017) and the view-transition root (189).

CAVEAT — two hand-rolled JS animations bypass all three mechanisms because they write CSS custom properties from rAF rather than using CSS animations or motion: BorderGlow's `animated` sweep (reported separately above; latent, every call site passes `animated={false}`) and BorderGlow's `onPointerMove` glow tracking. MagneticButton, by contrast, gets this right — it explicitly checks `useReducedMotion()` before attaching its pointer listener and before applying `whileTap`.


### VERDICT: FAQPage coverage


_Source: `src/components/sections/FAQAccordion.tsx:32`_


All 8 service pages emit FAQPage schema, in both locales, all with >=4 items and all with plain-text acceptedAnswer.text. Verified by fetching all 16 URLs from a running dev server and parsing every <script type="application/ld+json"> block. Per-page item counts (identical EN and MK): consulting/business-consulting 5; consulting/workflow-restructuring 4; consulting/it-systems 4; consulting/ai-consulting 5; marketing/web-design 5; marketing/social-media 4; marketing/it-infrastructure 4; marketing/ai-development 5. Zero answers contain HTML tags, entities, or markdown — regex scan for /<[a-z\/]|&lt;|&amp;/ over every acceptedAnswer.text returned 0 hits on all 16 pages, and a separate scan of messages/{en,mk}.json for `<tag>`, `&entity;`, `**bold**` and `[md](links)` across all 8 faq.items arrays also returned 0. `inLanguage` is correctly en-US / mk-MK per locale. The schema is emitted by FAQAccordion (a client component), and it is present in the SSR HTML, so non-JS crawlers see it. Each page's node set is exactly [site @graph | Service | BreadcrumbList | FAQPage], and each page has exactly one <h1>. One caveat, filed separately: the FAQPage node has no @id and no url/mainEntityOfPage.


### VERDICT: service internal links


_Source: `src/components/sections/ConsultingServicePage.tsx:175`_


The related-services block on each service page renders `relatedServices` from `<namespace>.related.links` in the messages files; every page ships exactly 3 links, and all 24 hrefs resolve to real routes. Per page (href | anchor text): consulting/business-consulting -> /consulting/workflow-restructuring, /consulting/it-systems, /consulting/ai-consulting. consulting/workflow-restructuring -> /consulting/business-consulting, /consulting/it-systems, /consulting/ai-consulting. consulting/it-systems -> /consulting/business-consulting, /consulting/workflow-restructuring, /consulting/ai-consulting. consulting/ai-consulting -> /consulting/business-consulting, /consulting/it-systems, /marketing/ai-development (one cross-division link). marketing/web-design -> /marketing/social-media, /marketing/it-infrastructure, /marketing/ai-development. marketing/social-media -> /marketing/web-design, /marketing/ai-development, /marketing/it-infrastructure. marketing/it-infrastructure -> /marketing/web-design, /marketing/ai-development, /consulting/it-systems (cross-division). marketing/ai-development -> /marketing/web-design, /consulting/ai-consulting (cross-division), /marketing/it-infrastructure. DIVISION LANDING BACKLINK: none of the 8 pages links to /consulting or /marketing from its own body. Confirmed by dumping every <a href> in the rendered HTML of /en/consulting/business-consulting — the only /en/consulting occurrence comes from the global Navbar, not the page. The division landing is present in the BreadcrumbList JSON-LD but there is no visible breadcrumb component, so for a user (and for on-page anchor-text signal) the parent hub is reachable only via the nav. Anchor text is always the localized service title — no "learn more"/"click here" links anywhere in the slice. Every related link is `min-h-[44px] px-5 py-2.5` with `focus-ring`, so touch target and focus visibility are fine.


### VERDICT: contact form transport


_Source: `src/components/sections/ContactForm.tsx:23`_


The contact form does NOT use a Next.js API route. It is a pure client-side AJAX POST straight from the browser to a Formspree endpoint whose URL is inlined into the client bundle at build time from `NEXT_PUBLIC_VERTEX_FORMSPREE_ENDPOINT`. Confirmed: there is no `src/app/api/contact/` route (only `chat`, `chat/lead`, `generate-post`, `newsletter`, `revalidate`), and `src/lib/resend.ts` is not touched by this component. Spam protection is delegated entirely to Formspree via the `_gotcha` reserved field — the honeypot IS wired up (it is populated from the hidden `website` input and forwarded), so it is not a 'declared but never checked' case; Formspree drops the submission server-side when `_gotcha` is non-empty. The env var is correctly catalogued in `.env.example` line 3. Consequence of this architecture: there is zero server-side validation, zero rate limiting under Vertex's control, and the raw Formspree endpoint is publicly readable in the JS bundle (acceptable per the code comment, but it means anyone can POST to it directly, bypassing the client validation in `validate()`).


### VERDICT: site.ts required-field audit — phoneHref, postalCode, and structured openingHours are missing; country is wrong


_Source: `src/config/site.ts:11`_


Status of the six fields you asked about, as of today's code. PRESENT and correct: `legalName` (line 3, "ВЕРТЕКС КОНСАЛТИНГ ДООЕЛ", consumed by schema.ts:89, llms.txt:58, llms-full.txt:152) and `contact.phone` (line 17, "+389 70 214 033"). MISSING: `phoneHref` — no dial-safe form exists, which is the direct cause of the broken Contact-page tel: link reported separately. MISSING: `address.postalCode` — the address object has only street/city/country, so schema.ts's `PostalAddress` (lines 60-66) emits no `postalCode`, which is a named property of the LocalBusiness/ProfessionalService node Google uses for local-pack matching; 2400 appears nowhere in the repo. WRONG: `address.country` is "Macedonia", not "North Macedonia" (reported separately). MISSING: structured `openingHours` — hours exist only as the English prose string on line 21, and the opening times are duplicated across three unlinked sources that must be hand-synced: this string (consumed by llms.txt:64, llms-full.txt:160/201, chatWidget.ts:33), the translation keys `contact.info.hoursValue` in messages/en.json and messages/mk.json, and the hardcoded `opens: '09:00' / closes: '17:00'` in schema.ts:157-164. They agree today; nothing enforces that.


### VERDICT: BlogPosting schema


_Source: `src/app/[locale]/(site)/blog/[slug]/BlogPostClient.tsx:62`_


PASS on every field you asked about, verified against the live HTML of https://vertexconsulting.mk/en/blog/five-signs-your-business-needs-a-workflow-overhaul. Present and correct: datePublished '2026-03-15T08:00:00.000Z' (ISO-8601, with dateModified mirrored); author as a Person with name, jobTitle and worksFor @id-linked to the Organization; headline 'Five signs your business needs a workflow overhaul' (capped at 110 chars per Google's limit); image as an array of one absolute URL; inLanguage 'en-US' (and 'mk-MK' on the MK route); mainEntityOfPage as a WebPage with @id equal to the locale-aware canonical. publisher and isPartOf resolve correctly — `${siteConfig.url}/#organization` and `/#website` match the @ids emitted by buildSiteGraph in the (site) layout (confirmed: the page's first ld+json block is a @graph of Organization, ProfessionalService, WebSite, Person). Bonus fields keywords, articleSection and timeRequired are all valid. Two real weaknesses, both non-breaking: (1) `image` falls back to the site-wide OG card for all three seeded posts, because scripts/seed-blog.ts sets no featuredImage — every article therefore declares the identical 1200x630 image (the URL does resolve: 200 image/png, 84044 bytes, and /opengraph-image is correctly excluded from the proxy matcher). Generator-created posts do get per-post Pexels images via createPost.ts, so this affects only the three seeds. (2) `dateModified` is hardcoded to `publishedAt`, so genuine edits never register as freshness signals.


### VERDICT: blog to service links


_Source: `scripts/seed-blog.ts:191`_


PASS — all three published posts link to at least one service page, in both locales, and every target route exists on disk. Post 1 (five-signs-your-business-needs-a-workflow-overhaul) → /consulting/workflow-restructuring. Post 2 (website-costing-customers) → /marketing/web-design. Post 3 (ai-tools-2026) → two links, /consulting/ai-consulting and /marketing/ai-development. Each MK body carries the same link with translated anchor text (lines 221, 287, 363). The anchors are descriptive service names, not 'click here' / 'read more'. The links are authored as Markdown in the seed and converted to Portable Text `link` markDefs by mdToPortableText, then rendered by the `marks.link` component in BlogPostClient, whose `href.startsWith('/')` branch routes them through the locale-aware `<Link>` — so /consulting/workflow-restructuring correctly resolves to /mk/consulting/workflow-restructuring for a Macedonian reader. Confirmed all four targets exist: src/app/[locale]/(site)/consulting/{workflow-restructuring,ai-consulting}/ and src/app/[locale]/(site)/marketing/{web-design,ai-development}/. One gap worth noting: nothing enforces this for future posts — src/lib/contentGenerator/validateDraft.ts governs generator output, and posts authored directly in the Studio have no such rule at all.


### VERDICT: exactly what robots.ts allows and disallows


_Source: `src/app/robots.ts:56`_


Two rule groups are emitted. GROUP 1 — `User-agent: *`: Allow `/`; Disallow `/api/`, `/studio`, `/studio/`, `/admin`, `/admin/`, `/en/privacy`, `/mk/privacy`, `/en/thank-you`, `/mk/thank-you`. GROUP 2 — eighteen individually named AI/LLM crawlers, each receiving Allow `/`, `/llms.txt`, `/llms-full.txt` and the identical nine-entry Disallow list: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, Claude-User, Claude-SearchBot, anthropic-ai, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, Bingbot, DuckAssistBot, meta-externalagent, Amazonbot, cohere-ai, YouBot. Plus `Sitemap: https://vertexconsulting.mk/sitemap.xml` and `Host: https://vertexconsulting.mk`. Notes: `/studio/` and `/admin/` are redundant — robots.txt Disallow is a prefix match, so `/studio` already covers `/studio/anything`. `/lazar` is deliberately crawlable (it is in the sitemap at priority 0.3). `Host` is a deprecated Yandex-only extension that Google and Bing ignore; harmless. `/llms.txt` and `/llms-full.txt` are reachable because src/proxy.ts's matcher excludes any path containing a dot (`.*\\..*`), so next-intl never rewrites them to a locale prefix. The only defect in this file is the /privacy + /thank-you Disallow, reported separately above.


### VERDICT: sitemap route inventory, and the noindex/sitemap cross-check


_Source: `src/app/sitemap.ts:30`_


ROUTES EMITTED — 15 static paths, each emitted once per locale (en, mk) with an alternates.languages map covering en, mk and x-default, for 30 static rows: / (1.0 weekly), /consulting (0.9), /marketing (0.9), /consulting/business-consulting (0.8), /consulting/workflow-restructuring (0.8), /consulting/it-systems (0.8), /consulting/ai-consulting (0.8), /marketing/web-design (0.8), /marketing/social-media (0.8), /marketing/it-infrastructure (0.8), /marketing/ai-development (0.8), /contact (0.7), /about (0.6), /blog (0.6), /lazar (0.3). Plus /blog/{slug} at priority 0.5 for every published Sanity post, again x2 locales — and the /mk variants are valid because the Sanity schema stores `slug: string` as a single locale-neutral field (src/lib/blog.ts BlogPostRaw) with only title/excerpt/body localized, so /mk/blog/{en-slug} resolves. NOINDEX CROSS-CHECK — /privacy and /thank-you are the only two noindex pages on the site, and both are correctly ABSENT from the sitemap. I confirmed the noindex is real, not just claimed: privacy/page.tsx:18 and thank-you/page.tsx:19 both pass `noIndex: true` to generatePageMetadata, which returns `robots: { index: false, follow: false }` (src/lib/metadata.ts:70-72). No noindex page is wrongly included, and no indexable route under src/app/[locale]/(site)/ is missing — the sitemap accounts for every one. The only future gap is /terms, which must be added to STATIC_PATHS when Phase 17 ships it (see the Critical finding).
