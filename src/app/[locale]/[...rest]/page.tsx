import { notFound } from 'next/navigation'

// Catch-all for unmatched URLs under a locale segment (`/en/nonsense`,
// `/mk/consulting/typo`). It guarantees such a request is routed *inside* the
// `[locale]` tree and answered with an explicit 404 rather than falling
// through the router.
//
// Honest note on what this does NOT do today: it does not cause
// `src/app/[locale]/not-found.tsx` to render. Verified against a production
// build — Next resolves this `notFound()` to `src/app/not-found.tsx`, the same
// boundary it uses for every other 404 on the site, because the root layout
// supplies no document shell for a locale-level boundary to compose with.
// This file becomes meaningful once that root-layout fix lands (see the
// audit findings log, C-3/C-4); until then it is a correctness guard, not a
// rendering change.
export default function LocaleCatchAll() {
  notFound()
}
