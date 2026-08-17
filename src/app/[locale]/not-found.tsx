import { NotFoundContent } from '@/components/sections'

// Inner 404 fallback, one level above `(site)/not-found.tsx`.
//
// In practice the `(site)` boundary wins every request a visitor can actually
// make, because every public route lives inside that group. This file stays as
// the boundary for a `notFound()` raised between the locale layout and the
// site layout — most concretely the `hasLocale()` guard in
// `[locale]/layout.tsx`. It renders without Navbar or Footer, since neither
// exists at this level.
//
// It previously hardcoded English copy with a comment explaining that no
// locale was resolvable here. That is not so: `[locale]/layout.tsx` has
// already called `setRequestLocale`, so the shared component's `getLocale()`
// returns the right locale and a Macedonian request gets Macedonian copy.
// Sharing NotFoundContent is also what keeps this fallback from drifting out
// of sync with the real 404 again.

export default function LocaleNotFound() {
  return <NotFoundContent />
}
