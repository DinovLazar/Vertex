# Phase 7 — Footer Component

## What was built
Full-width, division-aware footer component replacing the one-line copyright placeholder in `(site)/layout.tsx`. It ships a gradient accent line at the top, a newsletter CTA strip, a 4-column link grid (logo + contact / consulting / marketing / company), and a bottom bar with social icons, dynamic-year copyright, and a smooth-scroll back-to-top button. Columns animate in on scroll with a stagger.

## Files created
| File | Purpose |
|------|---------|
| `src/components/global/Footer.tsx` | Full footer — single client component. Defines three inline brand-icon SVG components (`LinkedinIcon`, `InstagramIcon`, `FacebookIcon`) alongside the main `Footer` default export. |

## Files modified
| File | What changed |
|------|-------------|
| `src/components/global/index.ts` | Added `export { default as Footer } from './Footer'` |
| `src/app/(site)/layout.tsx` | Removed the placeholder `<footer>` block + `{/* Phase 7: ... */}` comment. Imported `Footer` from `@/components/global` and rendered it after `<main>`. |

No changes were made to `src/config/site.ts` — `tagline` and `address` were already present. The existing `address` is an object (`{ street, city, country }`) and `contact` is nested (`{ phone, emailInfo, emailMarketing }`), so the component composes them inline.

## Key technical decisions

### Inline SVG brand icons
`lucide-react@1.8.0` is pinned in `package.json`, and that version ships **zero brand icons** — no `Facebook`, no `Linkedin`, no `Instagram` (confirmed by grepping `node_modules/lucide-react/dist/esm/lucide-react.js`). Runtime error was `Export Facebook doesn't exist in target module. Did you mean to import Webhook?`. Three options were considered:
1. Upgrade `lucide-react` → risks breaking the Navbar which also imports from it.
2. Use generic icons (`Share2`, etc.) → not faithful to the D-15 spec.
3. **Write inline SVG components that match the lucide API (`size`, `className`, `currentColor` stroke).** Chosen — zero dep change, visually consistent with the 4 non-brand icons (`Mail`, `Phone`, `MapPin`, `ArrowUp`) that still come from lucide.

The three inline brand icons live at the top of `Footer.tsx`. They share a `BrandIconProps` type and render 24×24 `viewBox`, `stroke="currentColor"`, `strokeWidth="2"` — same visual weight as the lucide icons.

### Surface color
Footer bg is `var(--division-surface)`, which is *slightly* lighter than `--division-bg` on all three themes (e.g., shared: `#11131D` footer on `#0A0B12` page). This creates a subtle layering effect without a hard border. The newsletter input uses `var(--division-bg)` instead, giving it visible contrast against the footer surface.

### Gradient accent line
A 1px-tall `<div>` at the very top of the footer has `background: linear-gradient(to right, transparent, var(--division-accent), transparent)`. The CSS variable resolves per division, so the line is blue on shared, white/gray on consulting, lavender on marketing — verified in the live DOM (`linear-gradient(to right, rgba(0, 0, 0, 0), rgb(180, 144, 240), rgba(0, 0, 0, 0))` on `/marketing`).

### Sticky-bottom layout
Relies on existing layout scaffolding in `(site)/layout.tsx`: outer `flex flex-col min-h-screen`, `<main className="flex-1 pt-16">`, footer with `mt-auto`. Short pages push footer to viewport bottom; long pages let it sit naturally.

### Animations
Column stagger uses inline variants (not imported from `animations.ts`) — specifically scoped to the footer's 4-column reveal:
- `footerVariants` — parent, `staggerChildren: 0.1`, `delayChildren: 0.1`.
- `columnVariants` — children, `opacity 0→1`, `y 20→0`, `duration 0.5`, eased with `[0.16, 1, 0.3, 1]` (same cubic-bezier used in the global `easeOut` transition).
- `whileInView="visible"` + `viewport={{ once: true, amount: 0.2 }}` — plays once when 20% of the footer enters the viewport.

### Newsletter subscribe is a real `<form>` with `preventDefault`
Using `<form onSubmit={(e) => e.preventDefault()}>` rather than bare `<div>` + `<button type="button">`. Reason: when the user types in the email input and hits Enter, nothing happens (no accidental page reload) — and when the real handler lands in a later phase, wiring is just `onSubmit={handleSubmit}`. The submit button is `type="submit"`.

### Phone `tel:` link strips whitespace
`href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`}` because `+389 70 214 033` in `tel:` should be `+38970214033` — most dialer apps are fine with spaces but some desktop browsers choke.

### Address → Google Maps link
`href={`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`}` with `target="_blank" rel="noopener noreferrer"`. The address is composed at module scope from `siteConfig.address.street + city + country`.

## Component inventory
- **`Footer`** (`src/components/global/Footer.tsx`) — Client component. No props. Reads `footerNavItems` from `@/config/navigation` and `siteConfig` from `@/config/site`. No internal state beyond the smooth-scroll handler on the back-to-top button. Adapts to division theme automatically via CSS variables; no React context consumption.

## Behavior matrix
| Breakpoint | Grid | Newsletter | Bottom bar |
|------------|------|------------|------------|
| < 640px (mobile) | 1 column, logo column takes full width | Stacked (heading above form) | Stacked (social / copyright / back-to-top vertically centered) |
| 640–1023px (tablet) | 2 columns; logo col spans both | Row (md breakpoint is 768px, so mostly row here) | Row at ≥640px (sm breakpoint) |
| ≥ 1024px (desktop) | 4 columns, logo col spans 1 | Row (heading left, form right) | Row |

Verified in live DOM: `gridTemplateColumns` resolves to 1 / 2 / 4 slots at 375 / 768 / 1280 widths.

## Accessibility
- `<footer role="contentinfo">` — verified in DOM.
- Logo link has `aria-label={`${siteConfig.name} home`}`.
- All three address/phone/email links have icons with `aria-hidden="true"` so screen readers read the text only once.
- Form has `aria-label="Newsletter sign-up"`. Email input has `aria-label="Email for newsletter"`.
- Each social icon link has a descriptive `aria-label` (`LinkedIn`, `Instagram`, `Facebook`, `Email`).
- Back-to-top button has `aria-label="Back to top"` and its visible text.
- Gradient accent line div has `aria-hidden="true"` (decorative).

## CSS / utilities consumed
- `var(--division-surface)` — footer background
- `var(--division-bg)` — newsletter input background
- `var(--division-border)` — borders around newsletter strip and bottom bar
- `var(--division-accent)` — subscribe button bg, gradient line, link hover color
- `var(--division-text-primary)` / `secondary` / `muted` — text tiers
- `rounded-button` — from `@theme`
- `font-heading` — Sora for logo + column headings + subscribe button
- `text-h3` — newsletter heading size
- Standard Tailwind utilities for grid/flex/spacing

## Exports and barrel files
`src/components/global/index.ts` now exports (in order of appearance):
`AnimateIn`, `StaggerContainer`, `MotionWrapper`, `DivisionProvider`, `ScrollProgress`, `BackToTop`, `Section`, `Navbar`, `Footer`.

## Verification evidence
- **Dev compile**: `✓ Compiled in 100ms` after the Facebook import was replaced with inline SVGs.
- **Prod build**: `✓ Compiled successfully in 3.8s` / `Finished TypeScript in 3.5s` / 22 static pages generated, zero errors.
- **Division theming (live DOM)**:
  - `/` → `data-division="shared"`, footer bg `rgb(17, 19, 29)` = `#11131D`, accent `#60a5fa`.
  - `/consulting` → `data-division="consulting"`, footer bg `rgb(28, 28, 28)` = `#1C1C1C`, accent `#f5f5f5`, subscribe button bg `#f5f5f5`.
  - `/marketing` → `data-division="marketing"`, footer bg `rgb(21, 15, 34)` = `#150F22`, accent `#b490f0`, gradient line resolves to `rgb(180, 144, 240)`.
- **Responsive grid**: `gridCols` = 1 at 375px, 2 at 768px, 4 at 1280px. Newsletter/bottom bar flex-direction = `column` mobile, `row` desktop.
- **Copyright year**: dynamic via `new Date().getFullYear()` — rendered as `2026` today.
- **Link navigation**: clicking `/about` from the footer on `/marketing` navigated successfully; division correctly swapped from marketing to shared.
- **DOM content audit**: 20 links total, 13 internal (all 4 consulting, all 4 marketing, About/Blog/Contact/Privacy, plus logo → `/`), 4 headings (Stay in the loop, Consulting, Marketing, Company), all 4 social `aria-label`s present.

## Known issues / follow-ups
- **Newsletter form has no handler.** Pure `preventDefault`. Wire up to `/api/contact` (or a dedicated newsletter route) when Resend is integrated.
- **Social URLs are homepages**, not real Vertex accounts (`https://linkedin.com`, `https://instagram.com`, `https://facebook.com`). Replace when accounts exist.
- **`lucide-react@1.8.0`** — if a future phase upgrades the package to the modern 0.x-series, the three inline brand-icon components can be replaced with `Linkedin`, `Instagram`, `Facebook` imports. Search `Footer.tsx` for "Brand icons" to find the block.
- **Facebook SVG is a simplified glyph** — not the official "f" mark. If brand fidelity matters, swap for an official SVG from each platform's brand kit.

## What the next phase should know
- **Page shell is complete.** Navbar (Phase 6) + Footer (Phase 7) are both real components in `(site)/layout.tsx`. There are no more placeholder wrappers to replace.
- **Phase 8 (Homepage sections)** should build content inside the `<main>` area of `src/app/(site)/page.tsx`. The existing hero + three demo cards can stay or be replaced; the page should expand into the full D-15 spec (services, divisions split, proof/logos, CTA block).
- When building new sections, reuse `<Section>` (server component, `py-20 md:py-28`, `max-w-7xl`), `<AnimateIn>`, and `<StaggerContainer>` from `@/components/global`.
- Footer sits at the bottom of every `(site)` route automatically — no per-page wiring needed.
