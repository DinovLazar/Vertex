import type { Metadata, Viewport } from 'next'
import '../globals.css'

// Admin routes live above `[locale]` so they get no locale prefix and no
// i18n provider. This layout owns the `<html>` / `<body>` shell that the
// root layout intentionally skips (next-intl's locale layout owns it for
// public routes). Also blocks indexing — this panel is never for visitors.

export const metadata: Metadata = {
  title: 'Vertex Admin',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#141414',
  width: 'device-width',
  initialScale: 1,
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  )
}
