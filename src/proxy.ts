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
    // and the locale-neutral file-convention routes (opengraph-image,
    // twitter-image) — these live at `src/app/` above the [locale] segment
    // and must serve directly without a locale prefix injection.
    '/((?!api|_next|_vercel|opengraph-image|twitter-image|.*\\..*).*)',
  ],
}
