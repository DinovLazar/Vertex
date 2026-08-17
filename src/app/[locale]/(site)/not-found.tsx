import type { Metadata } from 'next'
import { NotFoundContent } from '@/components/sections'

// The site's real 404 for everything under a locale.
//
// It lives inside the `(site)` route group on purpose: a `not-found.tsx` only
// composes with the layouts *above* it, so placing it here is what earns a 404
// the full page chrome — `<html lang>` plus the theme/intl providers from
// `[locale]/layout.tsx`, and the Navbar and Footer from `(site)/layout.tsx`.
// A visitor on a dead URL gets a real way out instead of a bare dead end.
// Its sibling `(site)/[...rest]/page.tsx` funnels unmatched locale URLs into
// this boundary; a `notFound()` thrown by a real page (a bad blog slug, say)
// reaches it directly.
//
// Corrects audit finding C-4, which recorded the locale-level boundary as
// "confirmed dead code" after a production build appeared to resolve every
// `notFound()` to `src/app/not-found.tsx`. That reading came from inspecting
// *curled* HTML: Next streams a 404 body in through the RSC payload, so the
// served markup is a bare `<html id="__next_error__">` shell in dev and prod
// alike while the browser renders this tree. Verified in a browser against
// `next build` — `/en/nonsense`, `/mk/nonsense` and `/en/blog/<bad-slug>` all
// answer 404 with the right `lang`, localized copy, Navbar and Footer.
// `src/app/not-found.tsx` still owns the locale-less paths the proxy never
// rewrites (`/admin/*` and asset-like URLs).

// Static, and English even on /mk — deliberately, because the localized
// alternative is broken. `generateMetadata` here could only resolve the locale
// through next-intl's `getLocale()`, which reads headers inside a not-found
// boundary (see the note in NotFoundContent) and so 500s the prerendered
// `/[locale]/blog/[slug]` route. Only the *served* <title> pays for that: the
// visible page is fully localized via React context, and after hydration the
// browser applies the matched route's metadata, so `(site)/[...rest]` supplies
// a localized title for the tab. Measured, not assumed — dropping this block
// does not promote that localized title into the served HTML, it only falls
// back to the generic site default.
//
// `robots` looks redundant next to the `noindex` Next emits on a not-found
// render, but it is not: without it the root layout's site-wide
// `robots: { index: true, follow: true }` merges in, leaving the 404 serving a
// contradictory `index, follow` (verified by removing it). Declaring it here
// overrides the inherited value; `follow` stays on so the suggested
// destinations keep passing link equity.
export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return <NotFoundContent />
}
