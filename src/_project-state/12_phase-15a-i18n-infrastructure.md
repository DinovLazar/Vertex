# Phase 15A — i18n Infrastructure (next-intl setup, locale routing, language toggle)

## What was built
next-intl is now configured end-to-end. The site serves every page under `/en/...` and `/mk/...`, the locale-neutral URL `/` 307-redirects to the preferred locale based on `Accept-Language` (falling back to `en`), and the navbar's language-toggle button now actually switches locale while preserving the current path. No user-visible copy has been translated yet — both locales render the existing English strings except for the footer copyright and the navbar labels, which read through the `nav` and `footer` translation namespaces. The language toggle button reads the opposite locale (`EN` → `MK` and vice versa) and the toggle's `aria-label` is pulled from `nav.languageToggleAria`. The metadata helper emits `<link rel="alternate" hreflang="…">` tags for both locales plus an `x-default`.

Every route under the old `src/app/(site)/` tree has been moved under `src/app/[locale]/(site)/` in one pass. 45 static routes are prerendered at build time (19 logical pages × 2 locales + variants).

## Files created
| File | Purpose |
|------|---------|
| `src/i18n/routing.ts` | Exports `routing` via `defineRouting({ locales: ['en','mk'], defaultLocale: 'en', localePrefix: 'always' })` and the `Locale` type. |
| `src/i18n/request.ts` | `getRequestConfig` that resolves the locale via `await requestLocale`, validates with `hasLocale`, and dynamically imports `messages/${locale}.json`. |
| `src/i18n/navigation.ts` | `createNavigation(routing)` exports — `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname`. These are the locale-aware replacements for the `next/link` / `next/navigation` equivalents. |
| `src/proxy.ts` | next-intl edge handler (see "Key decisions" — Next 16 renamed `middleware` → `proxy`). Configured with three matcher entries so the root `/` path is caught. |
| `messages/en.json` | Minimal EN dictionary: `common.*`, `nav.*` (home/consulting/marketing/about/blog/contact/cta + aria labels), `footer.copyright`. |
| `messages/mk.json` | MK dictionary — structure identical to EN; Phase 15A left the strings in English (only `common.localeLabel` differs: `MK`). Real translations land in 15B. |
| `src/app/[locale]/layout.tsx` | New locale-scoped layout. Resolves the locale via `await params`, calls `setRequestLocale`, loads messages with `getMessages`, wraps children in `NextIntlClientProvider` + `MotionWrapper` + `DivisionProvider` + `ScrollProgress` + `BackToTop`. Sets `lang` on a `<div>` (not `<html>`) to avoid hydration mismatch. Exports `generateStaticParams` so all `[locale]` values prerender. |

## Files moved
The entire `src/app/(site)/` tree moved to `src/app/[locale]/(site)/`. No files inside the tree changed structure — just the parent path. Full list:

| Old path | New path |
|----------|----------|
| `src/app/(site)/layout.tsx` | `src/app/[locale]/(site)/layout.tsx` |
| `src/app/(site)/page.tsx` | `src/app/[locale]/(site)/page.tsx` |
| `src/app/(site)/about/page.tsx` | `src/app/[locale]/(site)/about/page.tsx` |
| `src/app/(site)/about/AboutPageClient.tsx` | `src/app/[locale]/(site)/about/AboutPageClient.tsx` |
| `src/app/(site)/blog/page.tsx` | `src/app/[locale]/(site)/blog/page.tsx` |
| `src/app/(site)/blog/BlogListingClient.tsx` | `src/app/[locale]/(site)/blog/BlogListingClient.tsx` |
| `src/app/(site)/blog/[slug]/page.tsx` | `src/app/[locale]/(site)/blog/[slug]/page.tsx` |
| `src/app/(site)/blog/[slug]/BlogPostClient.tsx` | `src/app/[locale]/(site)/blog/[slug]/BlogPostClient.tsx` |
| `src/app/(site)/consulting/page.tsx` | `src/app/[locale]/(site)/consulting/page.tsx` |
| `src/app/(site)/consulting/ConsultingLandingClient.tsx` | `src/app/[locale]/(site)/consulting/ConsultingLandingClient.tsx` |
| `src/app/(site)/consulting/{business-consulting,workflow-restructuring,it-systems,ai-consulting}/page.tsx` | `src/app/[locale]/(site)/consulting/…` |
| `src/app/(site)/marketing/page.tsx` | `src/app/[locale]/(site)/marketing/page.tsx` |
| `src/app/(site)/marketing/MarketingLandingClient.tsx` | `src/app/[locale]/(site)/marketing/MarketingLandingClient.tsx` |
| `src/app/(site)/marketing/{web-design,social-media,it-infrastructure,ai-development}/page.tsx` | `src/app/[locale]/(site)/marketing/…` |
| `src/app/(site)/contact/page.tsx` | `src/app/[locale]/(site)/contact/page.tsx` |
| `src/app/(site)/contact/ContactPageClient.tsx` | `src/app/[locale]/(site)/contact/ContactPageClient.tsx` |
| `src/app/(site)/privacy/page.tsx` | `src/app/[locale]/(site)/privacy/page.tsx` |
| `src/app/(site)/thank-you/page.tsx` | `src/app/[locale]/(site)/thank-you/page.tsx` |

`src/app/layout.tsx`, `src/app/globals.css`, `src/app/favicon.ico`, and `src/app/api/` were intentionally left where they are.

## Files modified
| File | What changed |
|------|-------------|
| `next.config.ts` | Wrapped the exported config in `createNextIntlPlugin('./src/i18n/request.ts')`. |
| `src/app/layout.tsx` | Dropped the `MotionWrapper` / `DivisionProvider` / `ScrollProgress` / `BackToTop` mount (those moved into `[locale]/layout.tsx`). Removed the `lang="en"` attribute on `<html>` — the locale is now set on a nested `<div>` inside `[locale]/layout.tsx`. `metadataBase` now reads from `siteConfig.url` instead of a hardcoded string. Sora and DM Sans `subsets` remain `['latin']` only — see "Known issues" below. |
| `src/lib/metadata.ts` | Added `locale` + `alternates.languages` support. `generatePageMetadata({ ..., locale? })` now builds `canonicalUrl = ${siteConfig.url}/${locale}${path}`, enumerates every entry in `routing.locales` to populate `alternates.languages`, and adds `x-default` → the EN URL. `openGraph.locale` flips to `mk_MK` / `en_US` based on the locale. |
| `src/components/global/DivisionProvider.tsx` | `usePathname` import switched from `next/navigation` to `@/i18n/navigation` so `getDivisionFromPath` sees the locale-stripped path. |
| `src/components/global/Navbar.tsx` | Switched `Link` + `usePathname` to `@/i18n/navigation`; added `useLocale`, `useTranslations('nav')`, and `useRouter` from next-intl. New `toggleLocale()` callback calls `router.replace(pathname, { locale: otherLocale })`. Main nav labels now resolve via `t(item.label.toLowerCase())`. The CTA, aria-labels, and both (desktop + mobile) language-toggle buttons are wired up. Dropdown child labels intentionally stayed hardcoded — Phase 15B translates them. |
| `src/components/global/Footer.tsx` | `Link` swapped to `@/i18n/navigation`; added `useTranslations('footer')`; copyright line now uses `t('copyright', { year })`. Every other footer string is still hardcoded English (Phase 15B). |
| `src/components/sections/CTABanner.tsx` | `Link` import swap only. |
| `src/components/sections/DivisionSplit.tsx` | `Link` import swap only. |
| `src/components/sections/ServicesOverview.tsx` | `Link` import swap only. |
| `src/components/sections/BlogCard.tsx` | `Link` import swap only. |
| `src/components/sections/ConsultingServicesGrid.tsx` | `Link` import swap only. |
| `src/components/sections/MarketingServicesGrid.tsx` | `Link` import swap only. |
| `src/components/sections/ConsultingServicePage.tsx` | `Link` import swap only. |
| `src/components/sections/MarketingServicePage.tsx` | `Link` import swap only. |
| `src/app/[locale]/(site)/blog/[slug]/BlogPostClient.tsx` | `Link` import swap only. |

## Key technical decisions
- **Next 16 renamed `middleware` → `proxy`.** I initially created `middleware.ts` at the project root as the plan specified. The dev server emitted a deprecation warning (`The "middleware" file convention is deprecated. Please use "proxy" instead`) and `/` stubbornly 404'd — the middleware wasn't firing. The fix was to rename the file to `proxy.ts` and move it under `src/`. That got next-intl wired in. For anyone migrating from older Next: `middleware.ts` still works with a warning in 16.2, but `proxy.ts` is the non-deprecated name.
- **Matcher: three entries, not one.** The plan's single-regex matcher left `/` uncaught in Next 16. Switched to the next-intl multi-pattern form (`/`, `/(en|mk)/:path*`, and the catch-all exclusion regex) which explicitly includes the root.
- **`lang` attribute on a `<div>`, not `<html>`.** Root `<html>` stays locale-neutral to avoid hydration mismatches; the locale's `<div lang={locale} data-locale={locale}>` lives inside `[locale]/layout.tsx`. Screen readers still pick this up.
- **Mounted globals (MotionWrapper, DivisionProvider, ScrollProgress, BackToTop) moved from root to `[locale]/layout.tsx`.** The root layout is now purely structural (`<html>`/`<body>` + metadata). The root is not a reserved-locale layout — `/api/...` routes also pass through it, and they don't need these client-side wrappers.
- **`usePathname` in `DivisionProvider` must come from `@/i18n/navigation`.** Otherwise `pathname` is `/en/consulting`, not `/consulting`, and `getDivisionFromPath('startsWith("/consulting"))` always returns `'shared'`. The locale-aware hook strips the prefix.
- **Dynamic translation keys via `t(item.label.toLowerCase())`.** A pragmatic shortcut — `mainNavItems` has single-word labels ("Consulting", "Marketing", "About", "Blog", "Contact") that lowercase to the exact keys in `nav.*`. Phase 15B's Option A refactor will replace this with an explicit `translationKey` field on each nav item.
- **Dev server restart required after the middleware→proxy rename.** Turbopack had cached the old location under `.next/dev/server/edge/` and kept trying to load a file that no longer existed. `rm -rf .next` + preview restart cleared it.

## Known issues / follow-ups for Phase 15B
- **Sora and DM Sans have no Cyrillic subset on Google Fonts.** `next/font/google` types only allow `'latin' | 'latin-ext'` for both families. I removed the initial `'cyrillic'` entry to get the build to pass. This means Macedonian text (when it lands in Phase 15B) will render in the browser's fallback sans-serif — not in the brand typography. **Phase 15B must decide:** swap Sora for a Cyrillic-capable heading face (Manrope, Inter, Onest, Golos Text) *before* writing Macedonian copy, or accept the fallback for this release.
- **`messages/mk.json` is still the English dictionary with `localeLabel: "MK"`.** This is intentional for 15A — the infrastructure can be verified against identical dictionaries. 15B does the actual translation work.
- **Dropdown child labels in Navbar** (`Business Consulting`, `Web Design`, etc.) still come from `item.label` in `src/config/navigation.ts`. Phase 15B's plan calls for an Option A refactor — add `translationKey` fields to `mainNavItems` and `footerNavItems`, drop the hardcoded labels, resolve with `useTranslations('nav.dropdown')` / `useTranslations('footer.company')` at render time.
- **`src/config/navigation.ts` still uses hardcoded English `label` fields.** Same reason — Phase 15B's refactor.
- **`Footer.tsx` other strings** (newsletter headline / placeholder / button, column headings, contact info labels, social `aria-label`s, back-to-top) are all still English literals. Phase 15B moves them under `footer.*`.
- **Homepage and all section components** still have hardcoded strings. Phase 15B migrates the homepage + shared sections; 15C/15D handle division landings; 15E handles About/Contact/Blog bodies.

## Verification
- `npm run build` — **compiled successfully in ~5.5s**; TypeScript OK; **45 static pages prerendered** (19 unique routes × 2 locales + variants). Proxy (Middleware) route compiled. All SSG (`●`) except the 4 API stubs (`ƒ`).
- `/` with `Accept-Language: en-US` — 307 → `/en` (via curl).
- `/` with `Accept-Language: mk-MK` — 307 → `/mk`.
- `/contact` with `Accept-Language: fr-FR` — 307 → `/en/contact` (default-locale fallback).
- `/en/consulting` — 200. Nav links prefixed `/en/…`; toggle button shows `mk`; `aria-label="Switch language"`; `<link rel="alternate" hreflang="en|mk|x-default">` all present.
- Clicking the language toggle on `/en/consulting` → browser navigates to `/mk/consulting`. Toggle label flips to `en`, `data-locale` flips to `mk`, nav links re-prefix to `/mk/…`, footer copyright still reads "© 2026 Vertex Consulting. All rights reserved.".
- Clicking the toggle again round-trips back to `/en/consulting` — path preserved in both directions.
- No console errors on either locale, only Fast Refresh / HMR informational logs.

## What the next phase should know
- The translation infrastructure is live. To add a string, expand the appropriate namespace in `messages/en.json` + `messages/mk.json`, then swap the hardcoded string in the component for `t('namespace.key')` via `useTranslations('namespace')`.
- `useTranslations` works in server components too (no `'use client'` needed) as long as `setRequestLocale(locale)` has been called earlier in the render — that is done once per page render by `[locale]/layout.tsx`.
- For programmatic navigation that needs to be locale-aware, use `useRouter` / `usePathname` from `@/i18n/navigation`. For plain `<a>`-style links, use `Link` from `@/i18n/navigation`. Only import `notFound` / `redirect` / `unstable_noStore` from `next/navigation`.
- `generatePageMetadata`, `consultingMetadata`, `marketingMetadata` now take an optional `locale` prop (defaults to `'en'`). Phase 15F will wire every page's `generateMetadata` to pull the locale from the route params and pass it through — for now every page still generates EN canonicals, which is acceptable since search engines won't index these routes until launch.
- The Cyrillic font gap needs to be resolved at the top of Phase 15B, before any Macedonian copy is written. Otherwise the mk build will render the brand typography for Latin chars and the OS font for Cyrillic chars mid-sentence, which looks broken.
- `src/config/navigation.ts` is the cleanest place to start Phase 15B's Option A refactor. Keep the current shape (`label`, `href`, `children`, optional `division`) and add a parallel `translationKey` field; once every consumer reads from that, the `label` field can be removed.
