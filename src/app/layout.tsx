import type { Metadata, Viewport } from 'next'
import { siteConfig } from '@/config/site'
import './globals.css'

// Root layout is intentionally minimal — the `<html>` and `<body>` shell,
// font loading, and locale-aware `lang` attribute all live in
// `src/app/[locale]/layout.tsx`. This is the standard next-intl App Router
// pattern and is what lets us set `<html lang={locale}>` correctly per
// request (WCAG 3.1.1) without forcing a hydration mismatch between the
// locale-neutral root shell and the locale-specific body.

export const metadata: Metadata = {
  title: {
    default: 'Vertex Consulting — We help businesses grow smarter',
    template: '%s | Vertex Consulting',
  },
  description:
    'Business consulting, workflow restructuring, IT systems, AI consulting, web design, and digital marketing services in Strumica, Macedonia. Founded 2018.',
  metadataBase: new URL(siteConfig.url),
  keywords: [
    'business consulting Macedonia',
    'бизнис консалтинг Македонија',
    'web design Strumica',
    'AI consulting',
    'digital marketing Macedonia',
    'Vertex Consulting',
    'Goran Dinov',
  ],
  authors: [{ name: 'Goran Dinov', url: siteConfig.url }],
  creator: 'Vertex Consulting',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'mk_MK',
    url: siteConfig.url,
    siteName: 'Vertex Consulting',
    title: 'Vertex Consulting — We help businesses grow smarter',
    description:
      'Business consulting and digital marketing services in Strumica, Macedonia.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vertex Consulting',
    description:
      'Business consulting and digital marketing services in Strumica, Macedonia.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#0E0E0E',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
