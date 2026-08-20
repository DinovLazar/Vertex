import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Navbar, Footer, JsonLd } from '@/components/global'
import { buildSiteGraph } from '@/lib/schema'
import type { Locale } from '@/i18n/routing'

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  // Without setRequestLocale, next-intl resolves the locale from the
  // x-next-intl-locale request header — a dynamic API — which opted the whole
  // (site) subtree out of static rendering and forced a full SSR render on
  // every page view, despite generateStaticParams() existing one level up.
  const locale = (await params).locale as Locale
  setRequestLocale(locale)

  const tCommon = await getTranslations('common')

  return (
    <div className="flex flex-col min-h-screen">
      {/* Site-wide entity graph — Organization, ProfessionalService (local
          business), WebSite and founder Person, linked by @id. Lives in the
          (site) layout so /studio and /admin stay out of the knowledge graph. */}
      <JsonLd data={buildSiteGraph(locale)} />
      {/* Skip-to-content link — first tab-stop on every page. Hidden above
          the viewport at rest, slides in on keyboard focus (WCAG 2.4.1). */}
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[60] -translate-y-[200%] focus-visible:translate-y-0 transition-transform px-4 py-2 rounded-button text-sm font-heading font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        /* outlineColor was --division-bg. With outline-offset:2px the ring is
           drawn OUTSIDE the chip, on the page ground — which is exactly
           --division-bg — so it rendered at 1:1 in both themes: a focus ring
           that was never visible. --division-accent gives a halo that clears
           ~19:1 against the page in either theme. */
        style={{
          backgroundColor: 'var(--division-accent)',
          color: 'var(--division-bg)',
          outlineColor: 'var(--division-accent)',
        }}
      >
        {tCommon('skipToContent')}
      </a>

      <Navbar />

      <main id="main-content" className="flex-1 pt-16">{children}</main>

      <Footer />
    </div>
  )
}
