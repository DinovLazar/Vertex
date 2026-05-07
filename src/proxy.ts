import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root.
    '/',
    // Match all pathnames under a known locale prefix.
    '/(en|mk)/:path*',
    // Match everything else except API, Next internals, asset-like paths,
    // the locale-neutral file-convention routes (opengraph-image,
    // twitter-image), the Sanity Studio (`/studio/**`), and the admin
    // dashboard (`/admin/**`, Phase 13B) — all of these live at `src/app/`
    // above the [locale] segment and must serve directly without a locale
    // prefix injection.
    '/((?!api|_next|_vercel|studio|admin|opengraph-image|twitter-image|.*\\..*).*)',
  ],
}
