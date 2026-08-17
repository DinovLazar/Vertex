# Phase 18 — Branded, localized 404 page

Date: 2026-08-18 · Branch: `main` (direct, per project convention)

## What shipped

A real 404 page for every public URL: localized EN/MK copy, the site's own
Navbar and Footer, theme-aware surfaces, four suggested destinations and a
mailto fallback — replacing a locale-less English dead end with no way out.

| File | Change |
|---|---|
| `src/components/sections/NotFoundContent.tsx` | **New.** The shared 404 body. Client component (see "Why a client component"). |
| `src/app/[locale]/(site)/not-found.tsx` | **New.** The real 404 boundary — gains Navbar/Footer from the `(site)` layout. Owns the static `metadata`. |
| `src/app/[locale]/(site)/[...rest]/page.tsx` | **Moved** from `src/app/[locale]/[...rest]/page.tsx`, and gained `generateMetadata` for the localized tab title. |
| `src/app/[locale]/not-found.tsx` | Rewritten to render the shared component; was hardcoded English. |
| `src/app/not-found.tsx` | Comment block corrected — it is the locale-*less* boundary, not the only one. |
| `src/components/global/ThemeProvider.tsx` | Now repairs a missing `data-theme` from localStorage (bug found during this work). |
| `messages/{en,mk}.json` | `notFound` namespace extended: `meta`, `suggestionsTitle`, `suggestions.*`, `helpTitle`, `helpBody`, `helpCta`. |

## The routing problem, and what was actually true

A `not-found.tsx` only composes with the layouts **above** it. The old boundary
sat at `src/app/not-found.tsx`, above the `[locale]` segment — so it rendered
outside `NextIntlClientProvider` and outside the document shell, which is why
it was English-only, unthemed, and chrome-less.

The August audit had recorded (C-4) that the locale-level boundary was
"confirmed dead code", verified against a production build. **That was wrong,
and the way it was wrong is worth remembering:** Next streams a 404 body in
through the RSC payload, so `curl` shows a bare
`<html id="__next_error__"><body>` shell for *any* 404, in dev and prod alike,
while the browser renders the real tree. The conclusion had been drawn from
curled markup. Re-checked in a browser, the locale tree was rendering the whole
time. C-3/C-4 are corrected in `audit-2026-08-findings.md`.

So the fix was not a root-layout rewrite (considered, and rejected: moving the
`<html>` shell up would force a dynamic locale read in the root layout and
deopt the whole site out of SSG). It was simply to put the boundary — and the
catch-all that feeds it — inside the `(site)` group, where the Navbar and
Footer layout already lives. `experimental.globalNotFound` was also trialled
and reverted; it was unnecessary once the real behaviour was understood.

## Why a client component

The obvious server version reads the locale with `getLocale()`. It works in dev
and on `/en/nonsense`, and returns **500 in production** on
`/en/blog/<bad-slug>`:

```
Error: Page changed from static to dynamic at runtime, reason: headers
```

A not-found boundary renders in its own pass, so the `setRequestLocale` store
the surrounding layout populated is not visible to it — even though
`blog/[slug]/page.tsx` calls `setRequestLocale` *before* its own `notFound()`.
next-intl then falls back to `requestLocale`, which reads headers, and a
dynamic read inside a prerendered route is fatal. Resolving the locale from
React context (`useTranslations`, and the localized `Link`) touches no dynamic
API and keeps `/[locale]/blog/[slug]` static.

## Metadata: split on purpose

- **Boundary** (`(site)/not-found.tsx`) — static, English. Supplies the served
  `<title>` and, critically, `robots: { index: false, follow: true }`. Without
  that override the root layout's site-wide `index, follow` merges in and the
  404 serves a contradiction next to Next's own `noindex`. Verified by removing
  it: the served title degrades to the generic site default and the
  contradictory `index, follow` returns. It cannot be localized — that needs
  `getLocale()`, which reintroduces the 500 above.
- **Catch-all** (`(site)/[...rest]/page.tsx`) — localized, and safe because
  that route is genuinely dynamic (absent from the prerender manifest). After
  hydration the browser applies the *matched route's* metadata, so this is the
  title the user actually sees in the tab.

Net: crawlers get an accurate English title + `noindex`; users get a localized
tab title. Known residual limitation — the *served* title is English on `/mk`.

## Theme bug found and fixed

The pre-hydration theme script lives in the `<head>` rendered by
`[locale]/layout.tsx`. On a 404 React client-renders that subtree, and scripts
rendered by React never execute — so a hard load of any 404 arrived with no
`data-theme` at all. `ThemeProvider` only ever *read* that attribute, so a
visitor who had saved `light` got a dark 404. It now falls back to reading
localStorage and applying the theme itself. This only became visible because
the new 404 is themed with `var(--division-*)`; the old one was hardcoded dark.

## Verification (production build, `next start`)

| URL | Status | Result |
|---|---|---|
| `/en/nonsense`, `/mk/nonsense` | 404 | localized copy, `lang` correct, Navbar + Footer |
| `/en/blog/no-such-post`, `/mk/blog/no-such-post` | 404 | was **500** before the client-component fix |
| `/en/consulting/typo` | 404 | same boundary |
| `/admin/bogus` | 404 | locale-less root boundary |
| `/en/consulting`, `/en`, `/mk` | 200 | `index, follow` intact — no regression |

Also checked: every 404 emits `noindex` with no contradictory `index, follow`;
light-mode preference honoured on a hard-loaded 404; no horizontal overflow at
375px; `npm run lint` and `tsc --noEmit` clean; all `(site)` routes still SSG.

## Open / not done

- The root `not-found.tsx` wrapper still has no `lang` attribute (C-3). It now
  affects only `/admin/*` and asset-like URLs. The real fix remains moving the
  document shell into the root layout, still deliberately not attempted.
- MK copy is LLM-drafted and awaits native review — logged in `TRANSLATION_NOTES.md`.
