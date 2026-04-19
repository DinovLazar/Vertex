import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root.
    '/',
    // Match all pathnames under a known locale prefix.
    '/(en|mk)/:path*',
    // Match everything else except API, Next internals, and asset-like paths.
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}
