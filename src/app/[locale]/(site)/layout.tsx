import { getTranslations } from 'next-intl/server'
import { Navbar, Footer } from '@/components/global'

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const tCommon = await getTranslations('common')

  return (
    <div className="flex flex-col min-h-screen">
      {/* Skip-to-content link — first tab-stop on every page. Hidden above
          the viewport at rest, slides in on keyboard focus (WCAG 2.4.1). */}
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[60] -translate-y-[200%] focus-visible:translate-y-0 transition-transform px-4 py-2 rounded-button text-sm font-heading font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          backgroundColor: 'var(--division-accent)',
          color: 'var(--division-bg)',
          outlineColor: 'var(--division-bg)',
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
