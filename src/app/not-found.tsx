import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

// The site's ONLY live 404 boundary.
//
// Verified against a production build: Next resolves every `notFound()` on
// this site to THIS file — including ones thrown deep inside a locale route
// such as `/en/blog/<bad-slug>`. `src/app/[locale]/not-found.tsx` is never
// reached and is dead code today; see the audit findings log for the root
// cause (the root layout renders no `<html>`, so the locale-level boundary
// cannot be composed with its layout).
//
// Consequences that shape this file:
//   * No `<html>`/`<body>` here. Next wraps a shell around this content when
//     the root layout supplies none, and emitting our own would nest a second
//     <html> inside it. The wrapper carries the doctype but NOT a `lang`
//     attribute — a known open defect recorded in the findings log, whose real
//     fix is to move the document shell into the root layout.
//   * Locale-neutral English copy and a hardcoded `/en` CTA: this boundary
//     renders outside NextIntlClientProvider, so there is no locale to read
//     and the locale-aware `Link` from '@/i18n/navigation' is unavailable.
//   * Inline colors rather than `var(--division-*)`: the theme tokens are
//     applied to `body` by the locale layout, which is not in this tree.

export const metadata: Metadata = {
  title: 'Page not found | Vertex',
  robots: { index: false, follow: false },
}

export default function GlobalNotFound() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: '#141414', color: '#F5F5F5' }}
    >
      <div className="text-center max-w-md">
        <p
          className="text-xs font-semibold uppercase tracking-[0.14em] tabular-nums mb-3"
          style={{ color: '#A3A3A3' }}
        >
          404
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-4 text-base" style={{ color: '#A3A3A3' }}>
          The page you&rsquo;re looking for doesn&rsquo;t exist — or has moved.
        </p>
        <Link
          href="/en"
          className="inline-block mt-8 px-6 py-3 rounded-lg font-semibold transition-[filter] hover:brightness-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ backgroundColor: '#F5F5F5', color: '#141414', outlineColor: '#F5F5F5' }}
        >
          Back to home
        </Link>
      </div>
    </main>
  )
}
