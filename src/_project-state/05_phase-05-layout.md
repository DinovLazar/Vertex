# Phase 5 — Layout Structure

## What was built
Full App Router layout skeleton: root layout with fonts/metadata, `(site)` route group with navbar + placeholder footer, `DivisionProvider` that sets `data-division` on a wrapper `<div>`, `Section` helper, and stub pages for every route in `mainNavItems` + `footerNavItems`. Hero pages (`/`, `/consulting`, `/marketing`) are visually complete with backgrounds + gradient headlines; leaf pages are one-line placeholders. API routes are stubbed to return `{ ok: true }`.

## Files created

### Route-group layouts & pages
| File | Purpose |
|------|---------|
| `src/app/(site)/layout.tsx` | Site-group layout: `<Navbar />`, `<main className="flex-1 pt-16">`, placeholder footer (`© 2026 Vertex Consulting`). Marked `Phase 7: <Footer />` in a comment. |
| `src/app/(site)/page.tsx` | Homepage — Silk background hero + demo `Section` with three `glass` service cards using `AnimateIn` and `StaggerContainer` |
| `src/app/(site)/consulting/page.tsx` | Consulting landing — `BackgroundGrid` + "Strategic clarity for growing businesses." headline. Uses `generatePageMetadata` |
| `src/app/(site)/marketing/page.tsx` | Marketing landing — `BackgroundPlasma` + "Creative digital presence that converts." headline |
| `src/app/(site)/consulting/business-consulting/page.tsx` | **One-line stub:** `<div>Business Consulting</div>` |
| `src/app/(site)/consulting/workflow-restructuring/page.tsx` | **One-line stub** |
| `src/app/(site)/consulting/it-systems/page.tsx` | **One-line stub** |
| `src/app/(site)/consulting/ai-consulting/page.tsx` | **One-line stub** |
| `src/app/(site)/marketing/web-design/page.tsx` | **One-line stub** |
| `src/app/(site)/marketing/social-media/page.tsx` | **One-line stub** |
| `src/app/(site)/marketing/it-infrastructure/page.tsx` | **One-line stub** |
| `src/app/(site)/marketing/ai-development/page.tsx` | **One-line stub** |
| `src/app/(site)/about/page.tsx` | **One-line stub** |
| `src/app/(site)/blog/page.tsx` | **One-line stub** |
| `src/app/(site)/blog/[slug]/page.tsx` | **One-line stub** (dynamic segment exists but no `generateStaticParams`, no loader) |
| `src/app/(site)/contact/page.tsx` | **One-line stub** |
| `src/app/(site)/privacy/page.tsx` | Real page — `h1 + p`, uses `generatePageMetadata({ noIndex: true })` |
| `src/app/(site)/thank-you/page.tsx` | Real page — "Thank you!" centered confirmation, `noIndex: true` |

### API routes (all stubs)
| File | Returns |
|------|---------|
| `src/app/api/chat/route.ts` | `POST` → `{ ok: true, route: "chat" }` |
| `src/app/api/chat/lead/route.ts` | `POST` → `{ ok: true, route: "chat/lead" }` |
| `src/app/api/contact/route.ts` | `POST` → `{ ok: true, route: "contact" }` |

### Layout-adjacent components
| File | Purpose |
|------|---------|
| `src/components/global/Section.tsx` | Server component. Renders `<section className="py-20 md:py-28"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div></section>`. `fullWidth` prop skips the inner div. |
| `src/components/global/DivisionProvider.tsx` | Client component. Reads `usePathname()`, calls `getDivisionFromPath()`, renders `<div data-division={division} className="min-h-screen">` |

### Stubbed libs for future phases
| File | Content |
|------|---------|
| `src/lib/ai.ts` | `export type AiProvider = "claude" \| "ollama"` only |
| `src/lib/chatWidget.ts` | `buildSystemPrompt()` returns `""` |
| `src/lib/sanity/client.ts` | Empty `export {}` |
| `src/lib/sanity/queries.ts` | Empty `export {}` |

## Files modified
| File | What changed |
|------|-------------|
| `src/components/global/index.ts` | Added exports for `Section`, `Navbar`, `DivisionProvider` |

## Key technical decisions
- **`(site)` route group isolates marketing/public routes** from future non-site routes (admin, auth, studio). The parentheses in the folder name mean the segment is not in the URL.
- **`DivisionProvider` wraps the entire root-layout subtree (inside `MotionWrapper`)**, not just `(site)`. This means division theming works on API-less pages and on anything added outside `(site)` later.
- **Division detection is path-prefix based.** `/consulting*` → consulting, `/marketing*` → marketing, everything else → shared. `/blog` is a shared page, not a division page.
- **Hero pages skip `Section`** and render `relative min-h-screen flex items-center justify-center` directly, because they need to host a full-bleed background. Scroll-target content below a hero uses `Section`.
- **`(site)/layout.tsx` uses `pt-16`** to offset the fixed `Navbar` (`h-14 md:h-16`). A shorter navbar on mobile (`h-14`) will leave a small gap, which is a known minor visual issue.

## Component inventory
- **`Section`** — server component, max-w-7xl, py-20/28. `fullWidth={true}` drops the max-width/padding. `id` prop is passed straight through for anchor targets.
- **`DivisionProvider`** — client component. Only side effect is setting `data-division`. It does NOT mount any context providers, despite the name.

## CSS classes and utilities added
None in this phase.

## Exports and barrel files
`src/components/global/index.ts` now exports eight items: `AnimateIn`, `StaggerContainer`, `MotionWrapper`, `DivisionProvider`, `ScrollProgress`, `BackToTop`, `Section`, `Navbar`.

## Known issues / technical debt from this phase
- **Footer is literally a one-liner** in `(site)/layout.tsx`. Comment says `Phase 7: <Footer />`.
- **All 4 consulting + 4 marketing service sub-pages are `<div>Service Name</div>`** with no metadata, no `'use client'`, no background. They render but look broken.
- **`/about`, `/blog`, `/blog/[slug]`, `/contact` are also one-liner divs.**
- **`blog/[slug]/page.tsx`** has no `generateStaticParams` or data loader — it will 404 at build time if SSG is attempted.
- **Year mismatch:** footer says `© 2026`, `siteConfig.founded` is `2018`. Fix the footer template to use `new Date().getFullYear()` when building the real footer.
- **API routes are `POST`-only stubs.** No validation, no email sending, no Claude calls.

## What the next phase should know
- When you implement the Footer (Phase 7), drop it into `(site)/layout.tsx` in place of the existing `<footer>` block and import it from `@/components/global`.
- When you implement service pages (Phases 9–10), copy the structure from `consulting/page.tsx` / `marketing/page.tsx` — including `generatePageMetadata` usage and the `relative min-h-screen` hero.
- `blog/[slug]/page.tsx` as a dynamic segment will cause Next to try to render it. If you aren't ready to implement blog loading yet, consider adding `export const dynamic = 'force-dynamic'` or implementing `generateStaticParams` returning `[]`.
