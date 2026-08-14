import type { Metadata, Viewport } from 'next'

// Sanity Studio lives above `[locale]`, so — exactly like `admin/layout.tsx` —
// it needs to own the `<html>` / `<body>` shell that the root layout skips.
// Without this file `/studio` rendered with no doctype and no `lang`.
//
// `globals.css` is deliberately NOT imported: the Studio ships its own
// complete styling, and the site's `@theme` tokens (which force a dark
// grayscale palette onto `body`) fight it.

export const metadata: Metadata = {
  title: 'Vertex Studio',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#141414',
  width: 'device-width',
  initialScale: 1,
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
