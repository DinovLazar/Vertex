import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

// The locale-less 404 boundary.
//
// It answers the paths the proxy never rewrites into a locale — `/admin/*`,
// `/studio/*` and asset-like URLs — plus anything that 404s above the
// `[locale]` segment. Every *public* 404 is handled instead by
// `src/app/[locale]/(site)/not-found.tsx`, which is localized and carries the
// Navbar and Footer.
//
// Supersedes the note this file used to carry, which claimed to be the site's
// only live 404 boundary and `[locale]/not-found.tsx` confirmed dead code
// (audit C-3/C-4). That was drawn from curled HTML, which shows a bare
// `<html id="__next_error__">` shell for *any* 404 because Next streams the
// body in through the RSC payload. Checked in a browser against a production
// build, `/en/nonsense` and `/mk/nonsense` render the localized page with full
// chrome; only the routes listed above reach this file.
//
// Constraints that still shape it, and that are real:
//   * No `<html>`/`<body>` here. The root layout supplies no document shell,
//     so Next wraps one around this content; emitting our own would nest a
//     second <html> inside it. That wrapper carries a doctype but no `lang`
//     attribute — still an open defect for these non-public routes, whose
//     real fix is moving the shell into the root layout.
//   * Locale-neutral English copy and a hardcoded `/en` CTA: this boundary
//     renders outside NextIntlClientProvider, so there is no locale to read
//     and the locale-aware `Link` from '@/i18n/navigation' is unavailable.
//     Unlike the locale-level fallback, that reasoning does hold here — no
//     `setRequestLocale` has run on these paths.
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
