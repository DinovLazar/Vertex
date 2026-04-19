# Phase 6 — Navbar Component

## What was built
Fully interactive top navigation mounted in `(site)/layout.tsx`. Fixed-position header that becomes a `glass` overlay after scroll, auto-hides on scroll-down / reveals on scroll-up, opens desktop dropdowns on hover (Consulting / Marketing), underlines the active route with a shared-layout spring animation, and on mobile expands into a full-screen staggered overlay with a body-scroll lock. Language toggle and primary CTA buttons are rendered; the language toggle is wired up only visually (no `next-intl` integration yet).

## Files created
| File | Purpose |
|------|---------|
| `src/components/global/Navbar.tsx` | Entire nav implementation — 342 lines, single client component |

## Files modified
| File | What changed |
|------|-------------|
| `src/components/global/index.ts` | Added `export { default as Navbar } from './Navbar'` |
| `src/app/(site)/layout.tsx` | Imported `Navbar` from `@/components/global` and mounted it above `<main>` (with `pt-16` on main to offset the fixed header) |

## Key technical decisions
- **Single `'use client'` component for simplicity.** Dropdowns, scroll-reactive visibility, mobile overlay, and active-route tracking all share state; splitting them would force prop drilling through three wrappers.
- **Scroll behavior uses `useScroll` + `useMotionValueEvent`** instead of a raw `window` listener so Motion's RAF-batched value pipeline drives the `hidden` / `atTop` booleans.
- **`layoutId="nav-underline"`** on the active-item underline makes the underline slide between items instead of hard-cutting. Single `layoutId` is shared across both plain links and parent-links with dropdowns.
- **Body-scroll lock** on mobile overlay open — sets `document.body.style.overflow = 'hidden'` in `useEffect`, restores on close. Cleanup handles both unmount and state change.
- **Route-change auto-close** — `useEffect` on `[pathname]` closes the mobile menu, so client-side navigation inside the overlay works correctly.
- **Active-route match** via helper `isActive()`: exact match for `/`, prefix match for everything else. Dropdown parents highlight when a child route is active.
- **Colors use `var(--division-*)` inline styles**, not Tailwind classes, so the entire navbar restyles when `DivisionProvider` flips the data attribute.

## Component inventory
- **`Navbar`** (`src/components/global/Navbar.tsx`) — no props. Reads `mainNavItems` from `@/config/navigation` and `siteConfig` from `@/config/site`. Internal state: `hidden`, `atTop`, `mobileOpen`, `activeDropdown`.

## Behavior matrix
| State | Visual |
|-------|--------|
| At top, not scrolled | Transparent background |
| Scrolled, latest ≥ 10px | `glass` background |
| Scroll-down past 100px | Header slides out (`y: -100%`) |
| Scroll-up any amount | Header slides back in |
| Hover parent nav item | `ChevronDown` rotates 180°, dropdown fades in from `y: 8px` |
| Route active (plain link) | Text uses `var(--division-accent)`; underline `layoutId` lands on this item |
| Route active (parent link) | Same as above, underline is shorter (`left-3 right-6`) to leave room for the chevron |
| Hamburger tap | Full-screen overlay with `var(--division-bg)` background fades in; nav items stagger up at `0.08s` intervals; body scroll locked |
| Any in-overlay link tap | Closes overlay, then route change fires |

## Accessibility
- `aria-label` on logo (`${siteConfig.name} home`) and on both language buttons
- `aria-expanded` on the hamburger
- `aria-label` on the hamburger flips between "Open menu" and "Close menu"
- Dropdowns open on `onMouseEnter` / close on `onMouseLeave` only — **no keyboard focus handling for dropdowns yet.** Accessibility gap to address in a later phase.
- Active links have visible color contrast; decorative underline is `aria-hidden` implicitly (no text content).

## CSS / utilities consumed
- `glass` (from `globals.css`)
- `var(--division-bg)`, `var(--division-text-primary)`, `var(--division-text-secondary)`, `var(--division-accent)`
- `rounded-button` (from `@theme`)
- `font-heading` via Tailwind token

## Exports and barrel files
`src/components/global/index.ts` now exports `Navbar` alongside `AnimateIn`, `StaggerContainer`, `MotionWrapper`, `DivisionProvider`, `ScrollProgress`, `BackToTop`, `Section`.

## Known issues / follow-ups
- **Language toggle is UI-only.** Both desktop button (`EN`) and mobile button (`EN / MK`) have no `onClick` handler.
- **Dropdown is mouse-only.** No keyboard (`Enter`/`Space`/Arrow) support; no touch-tap toggle on mobile (mobile overlay is a separate path so this only affects tablets with hover + touch).
- **CTA links to `/contact`**, which is still a one-line stub.
- **`z-50` for the header vs `z-60` for `ScrollProgress`** — progress bar intentionally sits above the header. Do not bump header above `z-60`.
- **`scrollY.getPrevious() ?? 0`** — fallback is important because Motion 12 returns `undefined` on the very first event.

## What the next phase should know
- **Footer (Phase 7)** should follow the same import pattern: create `src/components/global/Footer.tsx`, export it from `src/components/global/index.ts`, replace the `<footer>` block in `src/app/(site)/layout.tsx`, and drive its link lists from `footerNavItems` in `src/config/navigation.ts`. Use `new Date().getFullYear()` for copyright.
- **AI chat widget (Phase 12)** will sit at `bottom-4 right-4` or `bottom-24 right-4` — coordinate with `BackToTop` (`bottom-24 right-6`, `z-40`) to avoid overlap.
- **When `next-intl` is wired up (Phase 15),** the two language-toggle buttons in `Navbar.tsx` are the hookup points. Handler should call the `next-intl` locale switcher and persist via the locale cookie.
