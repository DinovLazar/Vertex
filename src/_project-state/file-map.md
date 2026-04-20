# File Map — Vertex Consulting

Last updated: 2026-04-20 (Phase 12 — AI Chat Widget Core)

## Root
| File | Description |
|------|-------------|
| `package.json` | Deps + `dev`/`build`/`start`/`lint` scripts |
| `package-lock.json` | npm lockfile |
| `tsconfig.json` | Strict TS, ES2017, `@/*` → `./src/*`, Next plugin |
| `tsconfig.tsbuildinfo` | TS incremental-build cache (gitignored) |
| `next.config.ts` | `NextConfig` scaffold wired through `withNextIntl`. As of Session H (2026-04-19), carries `experimental: { optimizePackageImports: ['motion', 'lucide-react', 'gsap'] }` — retained as zero-risk future-proofing (measured bundle delta was +0.3 KB noise per route because those three packages' canonical import patterns in this codebase already tree-shake under Next 16's default config). |
| `next-env.d.ts` | Next-generated types (gitignored) |
| `eslint.config.mjs` | Flat config extending eslint-config-next |
| `postcss.config.mjs` | Registers `@tailwindcss/postcss` |
| `components.json` | shadcn config — `base-nova` style, `neutral` base, lucide icons |
| `.gitignore` | Standard ignores + env + tsbuildinfo |
| `README.md` | Default Next.js bootstrap README |
| `D-15_Website_Design_Document.md` | Full product/design spec for the Vertex site |
| `.env.example` | Placeholders for the 4 Resend env vars (no real values). Session B — 2026-04-17. |
| `.env.local` | **Gitignored.** Local dev values for the Resend env vars (Session B) + the Phase 12 chat vars (`ANTHROPIC_API_KEY`, `AI_PROVIDER`, `OLLAMA_*`, `NEXT_PUBLIC_CHAT_ENABLED`). Never commit. |
| `.env.local.example` | **Phase 12 (2026-04-20).** Documents the 5 chat-widget env vars. `.gitignore` exempts this filename (`!.env.local.example`) so it's committable alongside `.env.example`. |
| `TRANSLATION_NOTES.md` | Phase 15B — working decisions on MK phrasing, plus font / date-format follow-ups. **Phase 12 (2026-04-20) added §12-A**: the `chat.*` namespace was LLM-drafted and wants a native-speaker pass (5–10 min review — five context-specific greetings, "Vertex асистент" mixed-script title, "интеграција со ИИ" Cyrillic AI). |

## messages/ (Phases 15A–15E — 2026-04-17)
| File | Description |
|------|-------------|
| `messages/en.json` | English translation dictionary. Namespaces: `common.*` (now including `skipToContent` — Session G); full `nav.*` (+ `nav.dropdown.*` + `nav.submenuToggleAria` — Session G); full `footer.*`; full `home.*`; `sections.*`; full `consulting.*` (meta, landing, serviceCommon, 4 service namespaces); full `marketing.*` (meta, landing — including `team.members.*` for Lazar/Petar/Andrej — serviceCommon, 4 service namespaces); `about.*` (meta, hero, values, team × 4 members, timeline, ctaBanner); `contact.*` (meta, hero, form × 20+ keys, info panel, map title); `privacy.*` (meta + pendingTranslationNotice only); `thankYou.*` (meta, headline, subtitle, cta); `blog.*` (meta, listing.hero + filters + empty, post.backLink + readTimeLong + relatedHeading). |
| `messages/mk.json` | Macedonian dictionary. Same structure as `en.json`; Phases 15B–15E translated every value. Session G added `common.skipToContent: "Прескокни до содржина"` and `nav.submenuToggleAria: "Отвори/затвори подмени за {label}"`. ~7,300 total words of MK prose. Flagged phrasing decisions in `TRANSLATION_NOTES.md`. |

## .claude/
| File | Description |
|------|-------------|
| `launch.json` | Preview server configs — **(1)** `vertex-dev` on port 3000, `npm run dev`, autoPort (Turbopack dev server with HMR). **(2)** `vertex-prod` on port 3001, `npx next start -p 3001`, autoPort (production-build server; used for perf measurement without colliding with the dev server — added Session H 2026-04-19). Don't run both simultaneously: they conflict on `.next` directory writes during concurrent builds. |

## public/
| File | Description |
|------|-------------|
| `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` | Default Next.js starter icons — not used anywhere yet |

## src/app/
| File | Description |
|------|-------------|
| `layout.tsx` | **Root layout, now minimal pass-through (Session G — 2026-04-19).** Returns `children` directly — no `<html>`, no `<body>`, no fonts, no providers. Exports only `metadata` + `viewport` (Next.js merges metadata across the whole segment tree regardless of where in the layout tree the export lives). The HTML shell + font loading + all client providers moved down into `src/app/[locale]/layout.tsx` so `<html lang={locale}>` can be set per request — WCAG 3.1.1. `/api/*` routes never invoke layouts, so they bypass everything below this file. |
| `globals.css` | Tailwind v4 tokens, shadcn HSL tokens, three division theme blocks, keyframes, utility classes (`glass`, `noise`, `glow-hover`, prose-* rules), `@layer utilities` block holding `.focus-ring` and `.form-input-focus` (Session C — accessibility), reduced-motion fallback. Font tokens live in a dedicated `@theme inline` block at the top (Session F — 2026-04-17) so Tailwind generates `.font-heading { font-family: var(--font-heading), system-ui, sans-serif; }` directly from next/font's `<html>` class injection without a circular `:root` emission. `.gradient-text` + `.gradient-text-brand` removed in Session E. 6 `.prose-*` h2+h3 rules updated in Session F from `var(--font-sora)` → `var(--font-heading)`. **As of Session J (2026-04-19): dead shadcn sidebar tokens removed.** 8 `--color-sidebar-*` aliases pulled from the `@theme inline` block and 9 lines (comment + 8 `--sidebar*: oklch(...)` OKLCH definitions) pulled from `:root`. The block was inherited from the shadcn `base-nova` scaffold but this codebase ships no sidebar component. Confirmed safe via `grep --sidebar-` across `src/` — pre-removal only hits were inside this file; post-removal grep returns zero. No visual or functional change. |
| `favicon.ico` | Default favicon |
| `opengraph-image.tsx` | **Session K (2026-04-19).** Next.js file-convention OG image generator. Edge-compatible `ImageResponse` producing a 1200×630 branded PNG (`#141414` background, white "V" tile + wordmark, "We help businesses grow smarter." headline with subtle white→`#A3A3A3` gradient on "smarter.", division-dot row, `vertexconsulting.mk` URL). Exports `alt` / `size` / `contentType` route-segment config. Uses system-ui font fallback — explicit Google Fonts loading was tried and dropped because satori (the renderer powering `ImageResponse`) only supports ttf/otf and Google Fonts v2 API serves woff2 (`Unsupported OpenType signature wOF2` at render). Lives at `src/app/` (above `[locale]/`) so it cascades site-wide. Static-prerendered at build time (`○ /opengraph-image` in the route table). |
| `twitter-image.tsx` | **Session K (2026-04-19).** One-line re-export of `opengraph-image` — `export { default, alt, size, contentType } from './opengraph-image'`. Keeps Twitter/X card in sync with OG via a single source of truth. |
| `proxy.ts` | **next-intl edge handler (Phase 15A).** `createMiddleware(routing)` with three matcher entries (`/`, `/(en\|mk)/:path*`, catch-all exclusion). Next 16 renamed `middleware` → `proxy`; a file called `middleware.ts` works but emits a deprecation warning. **Session K (2026-04-19): matcher exclusion list extended** from `(?!api\|_next\|_vercel\|.*\..*)` to `(?!api\|_next\|_vercel\|opengraph-image\|twitter-image\|.*\..*)` so the locale-neutral OG file-convention routes (URLs without dots) serve directly without being 307-redirected to `/en/opengraph-image` (which 404s because the file lives at `src/app/`, not `[locale]/`). Sitemap/robots routes already bypassed the matcher via the `.xml`/`.txt` extensions. |
| `sitemap.ts` | **Phase 15F.** Emits `/sitemap.xml`. Iterates every static path × every locale with `<xhtml:link hreflang>` entries for `en`, `mk`, `x-default`. Excludes noIndex pages (`/privacy`, `/thank-you`). Includes blog slugs from `getAllSlugs()`. |
| `robots.ts` | **Phase 15F.** Emits `/robots.txt`. `Allow: /` + disallow the 4 noIndex paths + `/api/`. Points at sitemap URL. |

## src/i18n/ (Phase 15A — 2026-04-17)
| File | Description |
|------|-------------|
| `routing.ts` | `defineRouting({ locales: ['en','mk'], defaultLocale: 'en', localePrefix: 'always' })` + `Locale` type export. |
| `request.ts` | `getRequestConfig` — validates `requestLocale` with `hasLocale`, dynamically imports `messages/${locale}.json`. Wired into `next.config.ts` via `createNextIntlPlugin('./src/i18n/request.ts')`. |
| `navigation.ts` | `createNavigation(routing)` exports — `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname`. Use these instead of `next/link` / `next/navigation` for anything locale-aware. |

## src/app/[locale]/ (Phase 15A — 2026-04-17)
| File | Description |
|------|-------------|
| `layout.tsx` | **Locale-scoped layout, now owns the HTML shell + fonts (Session G — 2026-04-19).** `generateStaticParams` returns all locales. Awaits `params`, validates with `hasLocale`, calls `setRequestLocale`, loads messages via `getMessages`. Loads Manrope (headings, 400/500/600/700/800) + Onest (body, 400/500/600/700) via `next/font/google` with `subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext']` on both, exposing CSS variables `--font-heading` / `--font-body`. Renders `<html lang={locale} className={manrope.variable + onest.variable} suppressHydrationWarning>` → `<body className="min-h-screen font-body antialiased overflow-x-hidden">` → `NextIntlClientProvider` → `MotionWrapper` → `DivisionProvider` → `ScrollProgress` → children → `BackToTop`. The old `<div lang={locale} data-locale={locale}>` wrapper div was deleted — `lang` now lives on `<html>` where WCAG 3.1.1 evaluates it. |
| `not-found.tsx` | **Phase 15F.** Localized 404 page. Translated title / description / CTA from the `notFound.*` namespace. Falls back to EN copy if locale can't be resolved at the root level. |

## src/app/[locale]/(site)/
| File | Description |
|------|-------------|
| `layout.tsx` | Site layout — now `async` server component (Session G — 2026-04-19). Uses `getTranslations('common')` to pull the skip-link label. Renders the skip-to-content `<a href="#main-content">` (fixed position, -translate-y off-screen at rest, `focus-visible:translate-y-0` to slide in on keyboard focus, colored via `var(--division-accent)` / `var(--division-bg)`) before `<Navbar />`. `<main>` gained `id="main-content"` so the anchor target resolves. `<Footer />` unchanged. |
| `page.tsx` | Homepage — 5 sections: `HeroSection` (Silk bg), `DivisionSplit`, `ServicesOverview`, `SocialProof`, `CTABanner`. Copy still hardcoded English; Phase 15B translates. **Server component (Session H Part 3 — 2026-04-19)** — previously `'use client'`; now async with `await getTranslations('home')`. Locale flows in via the parent `[locale]/layout.tsx`'s `setRequestLocale(locale)` call, so no params needed. `ServicesOverview` (also now server) renders directly; other sections stay client. |

## src/app/[locale]/(site)/consulting/
| File | Description |
|------|-------------|
| `page.tsx` | Consulting landing — **server component** exporting metadata and rendering `<ConsultingLandingClient />` |
| `ConsultingLandingClient.tsx` | Full landing content: `HeroSection` (with `BackgroundGrid`, plain-white headline), `ConsultingServicesGrid`, `LeaderIntro` for Goran, `CTABanner`. **Server component (Session H Part 3 — 2026-04-19)** — `useTranslations` swapped for `await getTranslations` on both `consulting.landing` and `nav.dropdown` namespaces, filename kept to minimise churn but the "Client" suffix is now a naming carryover. BackgroundGrid renders inside HeroSection (client) via props; server parent → client child is fine under RSC. |
| `business-consulting/page.tsx` | Full service page — metadata + `<ConsultingServicePage>` with 5 `<h2>` prose, 4 process steps, 5 FAQ items |
| `workflow-restructuring/page.tsx` | Full service page — metadata + `<ConsultingServicePage>` with long-form content, 4 process steps, 4 FAQ items |
| `it-systems/page.tsx` | Full service page — metadata + `<ConsultingServicePage>` with long-form content, 4 process steps, 4 FAQ items |
| `ai-consulting/page.tsx` | Full service page — metadata + `<ConsultingServicePage>`; related-services link crosses into `/marketing/ai-development` |

## src/app/[locale]/(site)/marketing/
| File | Description |
|------|-------------|
| `page.tsx` | Marketing landing — **server component** exporting metadata and rendering `<MarketingLandingClient />` |
| `MarketingLandingClient.tsx` | Full landing: `HeroSection` (with `BackgroundPlasma`, inherits HeroSection's inline-style `--division-text-primary` color), `MarketingServicesGrid`, `TeamShowcase` on surface-tinted section, `CTABanner`. Session E removed the `headlineClassName="gradient-text"` prop and the two `text-[#A3A3A3]` overlines are now `text-[var(--division-text-muted)]`. **Server component (Session H Part 3 — 2026-04-19)** — async with `await getTranslations` on `marketing.landing` + `nav.dropdown`; BackgroundPlasma renders inside HeroSection (client) via props. |
| `web-design/page.tsx` | Full service page — metadata + `<MarketingServicePage>` with long-form content, 4 process steps, 5 FAQ items |
| `social-media/page.tsx` | Full service page — metadata + `<MarketingServicePage>` with long-form content, 4 process steps, 4 FAQ items |
| `it-infrastructure/page.tsx` | Full service page — cross-links related-services to `/consulting/it-systems` |
| `ai-development/page.tsx` | Full service page — cross-links related-services to `/consulting/ai-consulting` |

## src/app/[locale]/(site)/ (shared pages)
| File | Description |
|------|-------------|
| `about/page.tsx` | Server component — metadata + renders `<AboutPageClient />` |
| `about/AboutPageClient.tsx` | 4 `<Section>`s (story/values/team/timeline) + custom `CTABanner`. **Server component (Session H Part 3 — 2026-04-19)** — async with `await getTranslations('about')`; `t.raw('hero.paragraphs')` still works under server context. Renders server sections (ValuesGrid, TeamGrid, CompanyTimeline) directly; CTABanner is client but that's fine. Filename kept (not renamed). |
| `contact/page.tsx` | Server component — metadata + renders `<ContactPageClient />` |
| `contact/ContactPageClient.tsx` | Client component — header, 5-col form+info grid, embedded Google Maps iframe with dark-theme filter |
| `blog/page.tsx` | Server component — metadata + renders `<BlogListingClient />` |
| `blog/BlogListingClient.tsx` | Client component — header, 4 filter pills, responsive `BlogCard` grid with keyed stagger on filter change, empty state, default `CTABanner` |
| `blog/[slug]/page.tsx` | Server component — `generateStaticParams` for all 3 mock slugs + async `generateMetadata` + `BlogPostPage` awaits `params: Promise<{slug:string}>` (Next 16 async) and calls `notFound()` on missing post |
| `blog/[slug]/BlogPostClient.tsx` | Client component — back link, header with author block, prose content (simple Markdown renderer: `## h2`, `**bold**`, `[link](href)`), optional related posts (2 same-division), default `CTABanner`, inline `BlogPosting` JSON-LD. `Link` now comes from `@/i18n/navigation`. |
| `privacy/page.tsx` | Full 13-section privacy policy (EN) on the shared theme — `max-w-3xl` reading width, `prose-blog` body, `<hr>` dividers, bordered third-party-services `<table>` (Vercel/Cloudflare/Resend/Google Maps), italicized disclaimer, `noIndex: true`. Session A — 2026-04-17. |
| `thank-you/page.tsx` | Post-contact confirmation — centered message, `noIndex: true` |

## src/app/api/
| File | Description |
|------|-------------|
| `chat/route.ts` | **Phase 12 (2026-04-20).** Node runtime (`export const runtime = 'nodejs'`), `dynamic = 'force-dynamic'`. POST accepts `{messages, pageUrl, locale}`, validates (≤40 messages, ≤2000 chars per message, valid role, valid locale), builds the system prompt via `buildSystemPrompt()` and pipes `streamAIResponse()` through a `ReadableStream` of raw UTF-8 text chunks. Headers: `text/plain; charset=utf-8`, `no-cache`, `X-Accel-Buffering: no` (prevents Vercel proxy from buffering the stream). Kill switch via `NEXT_PUBLIC_CHAT_ENABLED=false` → 503. |
| `chat/lead/route.ts` | **Stub** POST → `{ok:true, route:"chat/lead"}`. Reserved for Phase 12B lead capture |
| `contact/route.ts` | POST — honeypot-checks, validates name/email/message, renders HTML+text email, sends via Resend to `CONTACT_TO_EMAIL` with `replyTo` set to the sender's email. 400 on validation failure, 500 on Resend error. Session B — 2026-04-17. |
| `newsletter/route.ts` | POST — honeypot-checks, validates email, adds to Resend Audience `RESEND_AUDIENCE_ID` via `resend.contacts.create`, sends a welcome email to the subscriber. Duplicate adds return success without leaking list membership. Session B — 2026-04-17. |

## src/components/backgrounds/
| File | Description |
|------|-------------|
| `index.ts` | Exports `BackgroundSilk`, `BackgroundPlasma`, `BackgroundGrid` |
| `BackgroundSilk.tsx` | Wrapper — dynamic-imports `Silk`, reduced-motion fallback |
| `Silk.tsx` | R3F Canvas running GLSL silk/wave shader on a plane mesh. **As of Session H (2026-04-19): Canvas is wrapped in a ref'd `<div>` + a `useState<'always'\|'never'>('always')` drives `<Canvas frameloop>`.** A viewport-gating `useEffect` installs `IntersectionObserver({ threshold: 0 })` on the wrapper plus a `document.visibilitychange` listener; both AND-ed through an `apply()` that flips `frameloop` to `'never'` when the wrapper is offscreen OR the tab is hidden — R3F's `useFrame` tick fully halts (zero CPU/GPU). Initial state `'always'` so the above-fold hero renders on first frame. The pre-existing three-step resize-dispatch timers (R3F use-measure workaround) are untouched. |
| `BackgroundPlasma.tsx` | Wrapper — dynamic-imports `Plasma`, reduced-motion fallback |
| `Plasma.tsx` | Raw OGL renderer + fragment shader, optional mouse interaction. **As of Session H (2026-04-19): rAF loop is gated and uses a local `simSeconds` time accumulator.** The loop body tracks `let lastFrame = 0; let simSeconds = 0` inside the effect; each frame computes `dt = lastFrame === 0 ? 0 : (t - lastFrame) * 0.001` then advances `simSeconds += dt` — sim-time only advances while the loop is active, so a pause followed by resume doesn't skip-jump the shader forward by however long the tab was hidden (`lastFrame = 0` on start zeroes the first resume frame). `start()`/`stop()` closures guard the rAF with a `raf === 0` sentinel. An `IntersectionObserver({ threshold: 0 })` on `containerEl` + a `document.visibilitychange` listener drive `start`/`stop` via a shared `apply()`; initial `inView = true` so the marketing hero renders immediately on first frame. Pre-existing mouse-interactive uniforms, ResizeObserver on `containerEl`, pingpong direction logic, and canvas teardown are all preserved. |
| `BackgroundGrid.tsx` | Wrapper — default 28-item consulting vocabulary list |
| `GridMotion.tsx` | GSAP-driven parallaxing DOM grid, mousemove-driven inertia. **As of Session H (2026-04-19): the `gsap.ticker.add(updateMotion)` callback is attached/detached via IntersectionObserver + visibilitychange.** A `tickerAttached` boolean guards double-attach; `attach()`/`detach()` call `gsap.ticker.add`/`.remove` respectively — when paused, gsap does zero per-frame work for this component (not just skips the body, fully detaches). On resume, in-flight `gsap.to(row, {...})` tweens continue or overwrite naturally because gsap manages its own tween timelines independent of the ticker callback. IO observes `gridRef.current`; visibilitychange listens on `document`. Initial `inView = true` so the consulting hero grid animates from first frame. |

## src/components/global/
| File | Description |
|------|-------------|
| `index.ts` | Barrel — exports `AnimateIn`, `StaggerContainer`, `MotionWrapper`, `DivisionProvider`, `ScrollProgress`, `BackToTop`, `Section`, `Navbar`, `Footer` |
| `MotionWrapper.tsx` | `<MotionConfig reducedMotion="user">` wrapper (client) |
| `DivisionProvider.tsx` | Reads pathname, sets `data-division` attr on a wrapper div |
| `AnimateIn.tsx` | `whileInView` single-element animator, default `fadeInUp`. Client component. Now used by server-component sections (`LeaderIntro`) to compose a scroll entrance without importing `motion` directly (Session H Part 3 — 2026-04-19). |
| `StaggerContainer.tsx` | `whileInView` parent for `staggerItem` children. Client component. |
| `StaggerItem.tsx` | **New Session H Part 3 (2026-04-19).** Client component — `motion.<as>` wrapper with the shared `staggerItem` variant by default. Supports `as` of `'div' \| 'li' \| 'article' \| 'section' \| 'span'`. Exists so server-rendered sections can compose stagger animations without importing `motion` directly — pairs with the existing `StaggerContainer` wrapper. |
| `ScrollProgress.tsx` | 2px spring-smoothed top progress bar, color = `--division-accent` |
| `BackToTop.tsx` | Circular back-to-top button, appears after 500px scroll |
| `Section.tsx` | Server component section shell — `py-20 md:py-28` + `max-w-7xl` |
| `Navbar.tsx` | **Fully implemented** — scroll-hide, glass on scroll, **desktop dropdowns now W3C disclosure pattern (Session G — 2026-04-19)**: each parent with children renders `<Link>` + a dedicated `<button aria-haspopup="menu" aria-expanded aria-controls aria-label={t('submenuToggleAria', { label })}>` chevron trigger; Escape closes + returns focus to trigger via `disclosureRefs`; `onBlur`/`onMouseLeave` keep the menu open if keyboard focus is still inside; child Links are plain links (no `role="menuitem"`) so Tab traverses. **Mobile full-screen overlay now focus-trapped via `inert`**: `useEffect` on `mobileOpen` toggles `main.inert` + `footer.inert` imperatively via `document.querySelector`, Escape closes menu + returns focus to the hamburger (`document.getElementById(hamburgerId).focus()`). All decorative icons (ChevronDown / Menu / X / Globe / new disclosure chevron) carry `aria-hidden="true"`. Active-link underline (`layoutId="nav-underline"`) moved from inside the Link to the wrapper so it spans both Link and disclosure button. Language toggle button, CTA button, `useId()`-derived stable ids for hamburger + menus. |
| `Footer.tsx` | **Fully implemented** (Phase 7) — gradient accent line, newsletter CTA strip (stateful — POSTs to `/api/newsletter` with honeypot, shows submitting/success/error states; Session B — 2026-04-17). **Newsletter input now carries `aria-invalid={newsletterStatus === 'error'}` + `aria-describedby` pointing to a `<p id role="alert">` error element; submit button carries `aria-busy={newsletterStatus === 'submitting'}`; error clears on edit (Session G — 2026-04-19).** 4-column grid (logo+contact / consulting / marketing / company), social icons row, dynamic-year copyright, back-to-top. Division-aware via CSS vars. Three inline brand-icon SVGs (Linkedin/Instagram/Facebook) because `lucide-react@1.8.0` ships no brand marks. `socialLinks` array reads hrefs from `siteConfig.social` (Session A — 2026-04-17). |

## src/components/sections/ (Phase 8 + Phase 9 + Phase 10 + Phase 11)
| File | Description |
|------|-------------|
| `index.ts` | Barrel — 18 total: Phase 8–10 thirteen + Phase 11 five (`ContactForm`, `TeamGrid`, `CompanyTimeline`, `ValuesGrid`, `BlogCard`) |
| `HeroSection.tsx` | Reusable hero — takes `headline`, `subtitle`, `buttons[]`, `headlineClassName`, and `children` (for a background component). Uses `heroHeadline`/`heroSubtitle`/`heroCTA` animation variants |
| `DivisionSplit.tsx` | Homepage-only. Two interactive hover cards for Consulting and Marketing. `useState` tracks hovered division; inline styles swap card bg to division theme color on hover. Uses `Briefcase` + `Megaphone` + `ArrowRight` from lucide |
| `ServicesOverview.tsx` | All 8 services in a single stagger grid. Each card has a division indicator dot, icon, title, description. Consulting cards glow white on hover, Marketing cards glow lavender. Icons: `Briefcase`, `Settings`, `Monitor`, `Brain`, `Globe`, `Share2`, `Server`, `Cpu`. **Server component (Session H Part 3 — 2026-04-19)** — async, uses `await getTranslations('home.servicesOverview')`, composes `<StaggerContainer>` + `<StaggerItem>` + `<BorderGlow>` instead of inline `motion` elements. |
| `SocialProof.tsx` | 4 stat counters with `AnimatedCounter` child component + founder quote. Uses a raw `IntersectionObserver` (threshold 0.3) to trigger a 2-second `setInterval` count-up — Motion's `useInView` was unreliable with React 19 / Next 16 / motion 12. **Grid ladder is `grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12` (Session I — 2026-04-19)** — 2-col on narrow phones (counters comfortably fit in 156px cells at 375px), flips to 4-col at `md:` (768px) so the full 768–1023px tablet range gets the desktop-style stats row instead of the old awkward 2×2 layout. |
| `CTABanner.tsx` | Full-width section with gradient background (reads `--division-accent-muted` + `--division-bg` + `--division-accent`). Optional props `headline`, `subtext`, `buttonText`, `buttonHref` all default to the "Ready to grow your business?" / `/contact` combo |
| `ProcessSteps.tsx` | Numbered (01-NN) timeline component. Props: `steps: { title, description }[]`. 2-col grid on desktop. **Server component (Session H Part 3 — 2026-04-19)** — uses `<StaggerContainer as="ol" variants={staggerContainerSlow}>` + `<StaggerItem as="li">` to preserve `<ol>`/`<li>` semantics. |
| `FAQAccordion.tsx` | Expandable FAQ with `ChevronDown` indicator. Only one item open at a time (first open by default). **Uses `grid-template-rows: 0fr ↔ 1fr` CSS transition** (not Motion `height: 'auto'`) for the expand/collapse panel — pure compositor-driven, zero layout thrash (Session D — 2026-04-17). Content stays always-mounted inside the outer `grid transition-[grid-template-rows,opacity]` wrapper + inner `overflow-hidden` wrapper; `aria-hidden` flips with state for screen-reader correctness. **Each trigger gets `id={triggerId}` + `aria-controls={panelId}`; each panel gets matching `id={panelId}` + `role="region"` + `aria-labelledby={triggerId}` (Session G — 2026-04-19).** ChevronDown + its wrapping `motion.span` both `aria-hidden="true"`. Chevron still rotates via `motion.span`. Emits inline `<script type="application/ld+json">` with `FAQPage` schema — no separate schema component needed. IDs built from `useId()` so multiple accordions on the same page don't collide. |
| `ConsultingServicesGrid.tsx` | Consulting-only 2×2 grid of the 4 consulting services. Monochrome palette. Icons: `Briefcase`, `Settings`, `Monitor`, `Brain`, plus `ArrowRight` on each card. **Server component (Session H Part 3 — 2026-04-19)** — prop-driven, no translations needed; uses `<StaggerContainer variants={staggerContainerSlow}>` + `<StaggerItem>` + `<BorderGlow>`. |
| `LeaderIntro.tsx` | Founder/leader introduction with initials avatar (derived from name). Props: `name`, `role`, `bio`. **Server component (Session H Part 3 — 2026-04-19)** — async with `await getTranslations('sections.leader')`, wraps content in `<AnimateIn amount={0.2}>` instead of inline `motion.div`. |
| `ConsultingServicePage.tsx` | Template for consulting service subpages. Props: `title`, `subtitle`, `content` (ReactNode), `processSteps`, `faqItems`, `relatedServices`. Composes: hero section → prose body (`.prose-consulting`) → process steps → FAQ → related services → CTABanner. Client component |
| `MarketingServicesGrid.tsx` | Marketing-only 2×2 grid of the 4 marketing services. Lavender/purple palette with purple glow hover (box-shadow rgba(180,144,240,0.12)) and radial gradient overlay. Icons: `Globe`, `Share2`, `Server`, `Cpu`. **Server component (Session H Part 3 — 2026-04-19)** — prop-driven; uses `<StaggerContainer variants={staggerContainerFast}>` + `<StaggerItem>` + `<BorderGlow>`. |
| `TeamShowcase.tsx` | Marketing-only 3-card team showcase for Lazar/Petar/Andrej. Initials avatars (20×20 rounded border-2 `#B490F030`) — photos TBD. No props. **Server component (Session H Part 3 — 2026-04-19)** — composes `<StaggerContainer>` + `<StaggerItem>` + `<BorderGlow>`. **Grid ladder is `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` (Session I — 2026-04-19)** — 1-col through the phone range, 2-col across the iPad range (2+1 layout with Andrej on row 2), 3-col from 1024px. The old `sm:grid-cols-3` jumped straight to 3-col at 640px and crammed the bios into ~195px columns on iPad mini. |
| `MarketingServicePage.tsx` | Template for marketing service subpages. Same shape as `ConsultingServicePage` but "Vertex Marketing" overline in `#B490F0`, purple hover states on related pills, `.prose-marketing` body class (lavender bold + links). Client component |
| `ContactForm.tsx` | Client component. 5 visible fields (name, email, phone optional, division select, message) plus a hidden off-screen `website` honeypot with client-side validation (non-empty, email regex, 10-char min message). **Field-level error handling (Session G — 2026-04-19):** `fieldErrors: Partial<Record<'name'\|'email'\|'message', string>>` state drives inline `<p id role="alert">` errors below each required field; each input carries `aria-invalid` + `aria-describedby` pointing to its error id; errors clear on edit; on submit with errors, focus moves to the first invalid field. Submission-level banner (API / network failures) also `role="alert"`; submit button carries `aria-busy={status === 'submitting'}`. All ids built from `useId()`. POSTs to `/api/contact`; on success flips to confirmation card, on error renders the API's error message in the red error banner. Uses lucide `Loader2` + `Check` (both `aria-hidden="true"`). Button color adapts via `--division-accent` / `--division-bg`. Form has `noValidate` since validation is handled in JS. Session B wired the real API call — 2026-04-17. |
| `TeamGrid.tsx` | 4-member grid showing Goran (consulting, gray indicator) + Lazar/Petar/Andrej (marketing, `#B490F0` indicator). Initials avatars, per-member division color drives indicator dot, avatar ring, role label, and hover glow. **Server component (Session H Part 3 — 2026-04-19)** — async with `await getTranslations('sections.team')`; composes `<StaggerContainer>` + `<StaggerItem>` + `<BorderGlow>`. |
| `CompanyTimeline.tsx` | Vertical dotted timeline with 4 milestones (2018, 2020, 2023, 2026). Dots use `--division-accent`. **Server component (Session H Part 3 — 2026-04-19)** — async with `await getTranslations('sections.timeline.milestones')`; composes `<StaggerContainer amount={0.2}>` + `<StaggerItem>`. |
| `ValuesGrid.tsx` | 2×2 grid of 4 values with lucide `Handshake` / `Target` / `Zap` / `Shield` in accent-muted rounded-lg icon containers. **Server component (Session H Part 3 — 2026-04-19)** — async with `await getTranslations('sections.values')`; composes `<StaggerContainer amount={0.1}>` + `<StaggerItem>`. |
| `BlogCard.tsx` | Client component. Takes `post: BlogPost`. `motion.article` with `whileHover={{ y: -4 }}`. Division indicator dot (gray/purple/blue), locale-formatted date, read-time with `Clock`, title, 3-line-clamp excerpt, author, `ArrowRight` on hover. Marketing posts get purple hover glow |

## src/components/chat/ (Phase 12 — 2026-04-20)
| File | Description |
|------|-------------|
| `index.ts` | Barrel — exports `ChatWidget` |
| `BotIcon.tsx` | Inline SVG icon set — `BotIcon` / `CloseIcon` / `SendIcon`. All accept `SVGProps<SVGSVGElement>`. Inlined because `lucide-react@1.8.0` ships no useful icons (same reason as Footer's brand-icon SVGs) |
| `TypingIndicator.tsx` | 3-dot staggered pulse shown while waiting for Claude's first streamed token. `role="status"` + translated `aria-label` from `chat.status.generating`. Dots use `.typing-dot` + `@keyframes typing-dot-pulse` from `globals.css`; reduced-motion-safe |
| `ChatMessage.tsx` | Single-bubble renderer. Props: `message: ChatMessage`, `isStreaming?`. User = bright pill right-aligned with `rounded-br-md`; assistant = elevated-surface bubble left-aligned with `rounded-bl-md` and optional 2px pulsing streaming cursor at the tail. Spring fade-in entrance |
| `ChatPanel.tsx` | The open chat dialog. Props: `messages`, `onSend`, `onClose`, `isStreaming`, `error`, `userMessageCount`. Header (bot avatar + title + subtitle + close × button) → scrollable message list (`aria-live="polite"`) with typing indicator while waiting for first token → auto-resizing textarea (1–4 rows, 96px cap) + send button + footer disclaimer. Client-side 20-message cap enforced via `userMessageCount`. Positioning uses explicit per-side classes (`top-0 right-0 bottom-0 left-0` on mobile; `sm:top-auto sm:left-auto sm:bottom-24 sm:right-6` desktop) to survive `twMerge` — `sm:inset-auto` alongside `sm:bottom-24 sm:right-6` collapses as a conflict |
| `ChatWidget.tsx` | State-owning root. Owns `messages` / `isStreaming` / `error` / `open`. Renders the 56×56 `chat-trigger` fixed bottom-right `motion.button` (fades to opacity 0 / scale 0.8 when panel is open) + `<AnimatePresence>`-wrapped `<ChatPanel>`. Seeds conversation with the context-appropriate greeting the first time `open` flips to true (5 variants matched on pathname stripped of locale prefix). Mounts Escape-to-close and mobile body-scroll-lock effects. POSTs history to `/api/chat`, reads the response body with `getReader()` + `TextDecoder`, appends chunks to the last assistant message. Abort controller cancels in-flight stream on unmount. Kill switch via `process.env.NEXT_PUBLIC_CHAT_ENABLED === 'false'` returns null |

## src/components/ui/
| File | Description |
|------|-------------|
| `button.tsx` | shadcn Button wrapping `@base-ui/react`'s Button — `cva` variants (default/outline/secondary/ghost/destructive/link) and sizes (default/xs/sm/lg/cta/pill/icon/icon-xs/icon-sm/icon-lg). `cta` + `pill` added Session C; the underlying primitive does NOT support `asChild`, so for link-as-button use `cn(buttonVariants({ size: '...' }), '...')` on the Link directly. Adopted sitewide as of Session C — used in CTABanner, ContactForm submit, Footer (newsletter submit + back-to-top text), Navbar (hamburger + desktop language toggle + mobile-overlay language toggle), BackToTop FAB, FAQAccordion triggers, BlogListingClient filter pills. |
| `BorderGlow.tsx` / `BorderGlow.css` | Pointer-follow glow card wrapper — React component + co-located stylesheet. Tracks pointer position and sets `--edge-proximity` + `--cursor-angle` CSS vars to drive the `::before` colored-mesh border, `::after` colored-mesh fill, and `.edge-light` outer radial glow. Used by every card-grid component on the site (ServicesOverview, ConsultingServicesGrid, MarketingServicesGrid, TeamGrid, TeamShowcase, BlogCard). **Session E removed the static `border: 1px solid rgb(255 255 255 / 15%)` from `.border-glow-card`** — idle state is now borderless, pointer-follow glow owns the edge. Hover behavior and glow layers unchanged. **As of Session H (2026-04-19): `handlePointerMove` (lines 200–216) rewritten as rAF-batched.** Two refs (`pendingPointer` for the latest `{ clientX, clientY }`, `rafIdRef` for the scheduled frame id or `null`) let the event handler just write the pending coords and, if no rAF is in flight, schedule one `requestAnimationFrame(flushPointer)`. `flushPointer` clears `rafIdRef.current`, reads the pending coords + a fresh `getBoundingClientRect()`, computes edge + angle, writes the two CSS variables. A cleanup useEffect cancels any pending rAF on unmount. Result: at 1000 Hz gaming-mouse input the handler now drives ~60 CSS-var writes/second instead of ~1000 — 16× fewer layout-affecting writes. The pre-existing `animated` sweep useEffect (one-shot mount animation driven by `animateValue`) is untouched — it writes CSS vars directly, bypassing `handlePointerMove`. **As of Session J (2026-04-19): default `colors` prop flipped from the AI-palette rainbow (`['#c084fc', '#f472b6', '#38bdf8']` — purple / pink / cyan) to grayscale (`['#F5F5F5', '#C9C9C9', '#A3A3A3']`) matching the Session E unified palette.** The parallel HSLA rainbow fallbacks in `BorderGlow.css` — 7 gradient positions × 2 stack layers (`::before` border-box and `::after` padding-box), plus the `--gradient-base` linear-gradient fallback in each — were rewritten to the same grayscale values following the `COLOR_MAP = [0, 1, 2, 0, 1, 2, 1]` index mapping. Purely defensive: all 5 current callers override with the same grayscale, so runtime rendering is byte-identical; the fix prevents any future `<BorderGlow>` omitting the `colors` prop from instantiating the exact aesthetic the brand brief rejects. |

## src/config/
| File | Description |
|------|-------------|
| `site.ts` | `siteConfig` — name, legal name, domain, url, owner, founded, address, contact, hours, `social` (linkedin/instagram/facebook — added Session A 2026-04-17), two `divisions` objects with manager + team + description |
| `navigation.ts` | `NavItem` type, `mainNavItems` (with dropdown children for Consulting + Marketing), `footerNavItems` (grouped consulting/marketing/company) |

## src/lib/
| File | Description |
|------|-------------|
| `utils.ts` | `cn()` — clsx + tailwind-merge |
| `renderInlineMarkdown.tsx` | Tiny React helper — splits strings on `**…**` markers and renders `<strong>` elements. Used by `MarketingServicePage` for paragraphs that carry inline emphasis. Safe (no HTML interpretation). |
| `resend.ts` | Constructs a single `Resend` client from `RESEND_API_KEY` + exports a `resendConfig` object (`from`, `contactTo`, `audienceId`). Imported by both API routes. Session B — 2026-04-17. |
| `animations.ts` | All Motion `Variants` + `Transition` constants (springSnap, fadeInUp, staggerContainer, heroHeadline, hoverLift, …) |
| `divisions.ts` | `Division` type, `getDivisionFromPath()`, `divisionConfig` mapping |
| `metadata.ts` | `generatePageMetadata`, `consultingMetadata`, `marketingMetadata` — canonical URL, OG, Twitter, robots. **Session K (2026-04-19): added explicit `images` field to the `openGraph` and `twitter` blocks** referencing `/opengraph-image` and `/twitter-image` (relative URLs, resolved against `metadataBase`). When a page exports its own `openGraph` (as this helper does for per-page title/url/locale), Next.js treats the child block as a full replacement and drops the framework-auto-injected file-convention image — so without this explicit `images` field, every page using this helper (every consulting / marketing / about / contact / blog page) had no OG image. |
| `blog.ts` | **Locale-aware (Phase 15F).** `BlogPost` interface; `mockPostsBySlug` keyed by slug, each entry is `Record<Locale, BlogPost>` with EN + MK variants (title, excerpt, body, authorRole, tags all translated; publishedAt + readTime invariant). Helpers: `getAllSlugs()` (locale-neutral), `getAllPosts(locale)`, `getPostBySlug(slug, locale)`, `getPostsByDivision(division, locale)`, `getRelatedPosts(slug, locale, limit=2)`. Data source swaps to Sanity in Phase 13 — the per-locale shape maps cleanly. |
| `ai.ts` | **Phase 12 (2026-04-20).** Provider abstraction. Exports `AiProvider` / `ChatRole` / `ChatMessage` types + `streamAIResponse(messages, systemPrompt)` — an `AsyncGenerator<string>` that dispatches to Claude (via dynamic `@anthropic-ai/sdk` import) or Ollama (line-delimited JSON from `/api/chat`). Module-level constants: `CLAUDE_MODEL='claude-sonnet-4-6'`, `CLAUDE_MAX_TOKENS=400`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL`. Provider selection via `AI_PROVIDER` env. Dynamic SDK import keeps the Anthropic bundle out of any future edge-migrated routes. |
| `chatWidget.ts` | **Phase 12 (2026-04-20).** Context-aware system-prompt builder. `buildSystemPrompt({pageUrl, locale})` composes a static base (from `siteConfig`: name, legal name, owner, contact, hours, pricing rule) + a `CURRENT PAGE CONTEXT` persona block (5 variants: contact, blog, consulting, marketing, shared) + a `LANGUAGE` block (EN or MK). Path detection reuses `getDivisionFromPath()` after stripping the `^/(en\|mk)` prefix. Exports `ChatLocale` type. |
| `sanity/client.ts` | **Stub** — empty `export {}` |
| `sanity/queries.ts` | **Stub** — empty `export {}` |

## src/hooks/ (Session D — 2026-04-17)
| File | Description |
|------|-------------|
| `README.md` | Placeholder README establishing the folder. Makes the `@/hooks` alias in `components.json` (and `tsconfig.json`'s `@/*` → `./src/*`) resolve cleanly for future hook extractions. Conventions: one hook per file, named `use<Thing>.ts`, default export the hook. Currently empty — no hooks extracted yet. |

## src/types/
| File | Description |
|------|-------------|
| `index.ts` | Stub `NavItem` type (duplicates `config/navigation.ts`'s version — the config one is canonical) |
| `ogl.d.ts` | Hand-rolled ambient module for `ogl` — declares `Renderer`, `Program`, `Mesh`, `Triangle` |

## src/_project-state/
| File | Description |
|------|-------------|
| `README.md` | Usage instructions + phase checklist |
| `00_stack-and-config.md` | Full tech stack, deps, config files, fonts, color system |
| `01_phase-01-setup.md` | Phase 1 write-up |
| `02_phase-02-design.md` | Phase 2 write-up |
| `03_phase-03-backgrounds.md` | Phase 3 write-up |
| `04_phase-04-animations.md` | Phase 4 write-up |
| `05_phase-05-layout.md` | Phase 5 write-up |
| `06_phase-06-navbar.md` | Phase 6 write-up |
| `07_phase-07-footer.md` | Phase 7 write-up |
| `08_phase-08-homepage.md` | Phase 8 write-up |
| `09_phase-09-consulting.md` | Phase 9 write-up |
| `10_phase-10-marketing.md` | Phase 10 write-up |
| `11_phase-11-shared-pages.md` | Phase 11 write-up |
| `12_phase-15a-i18n-infrastructure.md` | Phase 15A write-up — next-intl wired, locale routing live, folder move, language toggle |
| `13_phase-15b-global-ui-homepage.md` | Phase 15B write-up — message namespaces, Option A nav refactor, component migrations, MK translations |
| `14_phase-15c-consulting-translations.md` | Phase 15C write-up — consulting namespace, ConsultingServicePage structured-content refactor, per-service page.tsx async server components, ~3,500-word MK prose block |
| `15_phase-15d-marketing-translations.md` | Phase 15D write-up — marketing namespace, MarketingServicePage/Grid/TeamShowcase refactors, inline `**bold**` support via `renderInlineMarkdown`, ~3,000-word MK prose block |
| `16_phase-15e-shared-pages.md` | Phase 15E write-up — shared page namespaces, ContactForm + TeamGrid refactors, blog post inline-Markdown renderer rebuild to use locale-aware Link, privacy body stays EN with MK notice, Thank-you CTA added |
| `17_phase-15f-blog-seo-final.md` | Phase 15F write-up — locale-aware blog data layer, 3 MK post translations, inLanguage on JSON-LD, sitemap + robots + not-found, Phase 15 closure |
| `12_phase-12-chat-widget.md` | Phase 12 write-up — AI chat widget (core). `@anthropic-ai/sdk` wired behind `src/lib/ai.ts`, Node-runtime streaming route at `/api/chat`, 5-component `src/components/chat/` tree, `chat.*` translation namespace (EN + MK), grayscale bot trigger + 380×560 panel, context-aware greetings + system prompt per URL/locale. Lead capture + Telegram deferred to Phase 12B |
| `session-a_social-privacy.md` | Session A write-up — social URLs wired from `siteConfig.social` + full 13-section privacy policy (EN) |
| `session-b_contact-newsletter.md` | Session B write-up — contact form + newsletter backend via Resend, honeypot spam protection, `.env.local` handling |
| `session-c_accessibility.md` | Session C write-up — `.focus-ring` + `.form-input-focus` utilities, shadcn Button primitive sitewide adoption, 44×44 mobile touch targets, Footer logo aria-label unified via `common.logoAriaSuffix` |
| `session-d_performance.md` | Session D write-up — FAQAccordion rebuild from Motion `height: 'auto'` to pure-CSS `grid-template-rows: 0fr ↔ 1fr` transition (zero layout thrash), plus `src/hooks/` folder stub so the `@/hooks` import alias resolves |
| `session-e_polish.md` | Session E write-up — hardcoded hex → `--division-*` / `--color-*` tokens in 7 component files (MarketingServicePage, CTABanner, DivisionSplit, ServicesOverview, TeamGrid, BlogCard, MarketingLandingClient), legacy `.gradient-text` + `.gradient-text-brand` CSS classes deleted with usage sites migrated to HeroSection inline-style color, static 1px border dropped from BorderGlow card wrapper so the pointer-follow glow owns the edge. |
| `session-f_fonts.md` | Session F write-up — Sora → Manrope (headings) + DM Sans → Onest (body) swap with full cyrillic + cyrillic-ext subset loading, CSS variable rename (`--font-sora` → `--font-heading`, `--font-dm-sans` → `--font-body`), font tokens moved into `@theme inline` block to resolve the naming collision. Closes the Phase 15F Cyrillic blocker. |
| `session-g_a11y-hardening.md` | Session G write-up — eight audit findings closed: root layout pass-through + `<html lang={locale}>` moved to `[locale]/layout.tsx` (WCAG 3.1.1); Navbar desktop dropdown rewritten as W3C disclosure pattern (Escape closes + focus return, mouse-hover as PE); ContactForm + Footer newsletter field-level `aria-invalid` + `aria-describedby` + `role="alert"` error associations; FAQAccordion trigger/panel `aria-controls`/`aria-labelledby` pair; mobile menu `inert` on `<main>`+`<footer>` + focus return to hamburger on close; skip-to-content link; decorative-icon `aria-hidden` sweep; `aria-busy` on submit buttons. Two new translation keys — `common.skipToContent`, `nav.submenuToggleAria`. |
| `session-h_performance.md` | Session H write-up — WebGL viewport + tab-visibility gating on Silk / Plasma / GridMotion (IntersectionObserver + `document.visibilitychange`, fully halts the render loop when offscreen or tab-hidden; Plasma adds a local `simSeconds` accumulator so the shader doesn't skip-jump forward after a hidden tab resumes), BorderGlow `handlePointerMove` rewritten as rAF-batched (pending-coords ref + single `requestAnimationFrame(flushPointer)` per frame — 16× fewer CSS-var writes at 1000 Hz gaming-mouse input), `next.config.ts` gained `experimental.optimizePackageImports` for motion / lucide-react / gsap (null bundle delta +0.3 KB noise; retained as future-proofing), `.claude/launch.json` gained `vertex-prod` entry for production-build perf measurement. Measured: marketing-mobile Lighthouse TBT 168,102 ms → 530 ms (-99.7%), perf 0.38 → 0.82 on the sample where Lighthouse caught the gate engaging; other routes inside Lighthouse's ±0.3 variance. |
| `session-i_responsive-adapt.md` | Session I write-up — two breakpoint-progression bugs closed, one touch-target verification. `TeamShowcase.tsx:31` `grid-cols-1 sm:grid-cols-3` → `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (fixes iPad-mini cramp). `SocialProof.tsx:78` `grid-cols-2 lg:grid-cols-4` → `grid-cols-2 md:grid-cols-4` (fixes 768–1023px 2×2 awkwardness). Navbar hamburger measured at 375×667 — `offsetWidth × offsetHeight = 44×44`, floor met, no `min-h-[44px]` bump applied. Verified at 375/640/768/1024/1280 for TeamShowcase, 375/640/768/1024 for SocialProof, 16 `/en/*` routes at 375+1280 with zero horizontal overflow, `npm run build` passes. One-time `rm -rf .next/dev/cache` required mid-session to recover from Turbopack SST corruption. |
| `current-state.md` | **Master snapshot** — read first |
| `file-map.md` | This file |
