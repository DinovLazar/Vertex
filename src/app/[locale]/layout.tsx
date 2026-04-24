import { notFound } from 'next/navigation'
import { Archivo, Source_Serif_4 } from 'next/font/google'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale, getMessages } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import {
  MotionWrapper,
  DivisionProvider,
  ScrollProgress,
  BackToTop,
  ThemeProvider,
} from '@/components/global'
import { ChatWidget } from '@/components/chat'

// Phase L1 — pre-hydration theme init. Runs synchronously in <head>
// BEFORE React hydrates. Reads localStorage + system preference and
// writes `data-theme` on <html> so the correct theme is painted on
// the very first frame (no flash-of-wrong-theme on conflicting OS
// vs stored preference).
const themeInitScript = `
(function() {
  try {
    var stored = null;
    try { stored = localStorage.getItem('vertex-theme'); } catch (e) {}
    var theme;
    if (stored === 'light' || stored === 'dark') {
      theme = stored;
    } else {
      theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`.trim()

// Archivo (neogrotesque sans for headings) + Source Serif 4 (humanist serif
// for body). The pairing is intentional: a sturdy industrial sans against a
// considered editorial serif gives the genuine geometric/humanist contrast
// the brand brief calls for, instead of two near-identical geometric sans.
// Both ship full Cyrillic + Cyrillic-ext on Google Fonts, so Macedonian
// (/mk) content renders in brand type instead of the OS fallback.
const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale as Locale)

  const messages = await getMessages()

  return (
    <html
      lang={locale}
      className={`${archivo.variable} ${sourceSerif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen font-body antialiased overflow-x-hidden">
        <ThemeProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <MotionWrapper>
              <DivisionProvider>
                <ScrollProgress />
                {children}
                <BackToTop />
                <ChatWidget />
              </DivisionProvider>
            </MotionWrapper>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
