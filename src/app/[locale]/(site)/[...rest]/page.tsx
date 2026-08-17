import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'

// Catch-all for unmatched URLs under a locale (`/en/nonsense`,
// `/mk/consulting/typo`). Without it such a request falls out of the
// `[locale]` tree entirely and is answered by the locale-less root 404.
//
// It sits inside the `(site)` group deliberately: that is what puts the
// sibling `(site)/not-found.tsx` boundary — and with it the Navbar, Footer and
// localized copy — above the `notFound()` thrown here. Moved from
// `[locale]/[...rest]/page.tsx`, where the nearest boundary was the bare
// locale-level one.

// The localized <title> for the common 404. It has to live here rather than on
// the not-found boundary: resolving a locale inside a boundary means reading
// headers, which is fatal on a prerendered route (see NotFoundContent). This
// route is genuinely dynamic — it is absent from the prerender manifest — so
// `getTranslations` is safe, and it is also the title the browser keeps after
// hydration, since the client applies the *matched route's* metadata rather
// than the boundary's. Routes that 404 with their own metadata, such as a bad
// blog slug, keep their own already-localized title.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'notFound.meta' })
  return {
    title: t('title'),
    description: t('description'),
    robots: { index: false, follow: true },
  }
}

export default function LocaleCatchAll() {
  notFound()
}
