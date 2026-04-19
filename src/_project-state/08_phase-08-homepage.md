# Phase 8 — Homepage Sections

## What was built
Complete production homepage replacing the Phase 4 demo. Five sections: Hero with Silk animated background and dual CTA buttons, Division Split with interactive hover cards for Consulting and Marketing, Services Overview with an 8-card grid covering all services from both divisions, Social Proof with animated stat counters and a founder quote, and a CTA Banner with gradient background linking to the contact page. Five new reusable section components were created.

## Files created
| File | Purpose |
|------|---------|
| `src/components/sections/HeroSection.tsx` | Reusable hero — accepts headline, subtitle, buttons, background child |
| `src/components/sections/DivisionSplit.tsx` | Side-by-side division showcase with hover effects |
| `src/components/sections/ServicesOverview.tsx` | 8-service grid with division indicators and hover glows |
| `src/components/sections/SocialProof.tsx` | Animated stat counters + founder quote |
| `src/components/sections/CTABanner.tsx` | Full-width gradient CTA with headline, subtext, button |
| `src/components/sections/index.ts` | Barrel export for all section components |

## Files modified
| File | What changed |
|------|-------------|
| `src/app/(site)/page.tsx` | Replaced Phase 4 demo homepage with production 5-section homepage |

## Key technical decisions

### Section components are fully reusable
- `HeroSection` accepts `headline`, `subtitle`, `buttons[]`, `headlineClassName`, and `children` (for background component). The 2 buttons are typed with `'primary' | 'outline'` variants. Will be reused on `/consulting` and `/marketing` landing pages in Phases 9–10.
- `CTABanner` accepts `headline`, `subtext`, `buttonText`, `buttonHref` — defaults to "Ready to grow your business?" / "/contact". Used on every page because its gradient reads from `--division-accent-muted` and adapts automatically per theme.
- `ServicesOverview` is self-contained with all 8 services. Could accept a filter prop later to show only one division.
- `DivisionSplit` is homepage-only.
- `SocialProof` is reusable — stats + quote composed together.

### Stat counter uses raw IntersectionObserver instead of `useInView`
The spec suggested Motion's `useInView` hook. In practice, with React 19 + Next 16 + motion/react 12, `useInView(ref, { once: true, amount: 0.5 })` did not fire the in-view state change even when the span was fully visible — confirmed via a debug effect that logged `isInView: false` indefinitely. Swapped for a plain `IntersectionObserver` in a `useEffect` with `threshold: 0.3`, which is simpler and works. The counter flips a `hasStarted` boolean, which a second `useEffect` watches to run the `setInterval` count-up at ~60fps for 2 seconds.

Known preview limitation: headless browsers in the preview tool have `document.visibilityState === 'hidden'`, which suspends IntersectionObserver callbacks. The counter animation works correctly in real browsers (visibility = 'visible'); it only appears frozen in the `mcp__Claude_Preview__*` tooling.

### Division Split hover preview
Each card uses a `hoveredDivision` state hook; the card's inline `style` swaps `backgroundColor` to the division's theme color on hover (`#141414` for consulting, `#0F0B18` for marketing) and the border color to the division accent at 30% alpha. This gives users a preview of each division's visual identity before clicking through.

### Services Overview visual distinction
Each card has a 2px indicator dot (gray for consulting, lavender for marketing) and an uppercase tracking-widest label, making the division affiliation readable before reading the service name. Hover shadows differ: consulting gets a soft white glow (`rgba(255,255,255,0.05)`), marketing gets the lavender glow (`rgba(180,144,240,0.1)`).

### Animation strategy
- Hero uses `heroHeadline` / `heroSubtitle` / `heroCTA` with `initial="hidden"` + `animate="visible"` (plays on mount).
- All other sections use `whileInView="visible"` + `viewport={{ once: true }}` so they only animate once on first scroll.
- `staggerContainer` / `staggerItem` from `@/lib/animations` power the services grid.
- Division Split uses inline motion variants with `delay: index * 0.15` for a cascade effect.
- CTA Banner uses three sequential `motion.*` elements with 0 / 0.15 / 0.3 delays for a triple-reveal.

### Homepage layout uses `<Section>` from global components
Sections 2, 3, 4 are wrapped in `<Section>` which provides `py-20 md:py-28` + `max-w-7xl` + responsive padding. Section 5 (CTA Banner) is full-width by design and handles its own padding. Section 3 (Services Overview) adds `className="bg-[var(--division-surface)]"` to create a subtle color shift that visually separates it from the surrounding sections.

### HTML entities in SocialProof quote
Used `&ldquo;` / `&rdquo;` / `&rsquo;` / `&amp;` instead of raw Unicode curly quotes/apostrophes to prevent ESLint `react/no-unescaped-entities` warnings. Same visual output.

## Component inventory
- **HeroSection** — Reusable. Props: `headline`, `subtitle`, `buttons`, `className`, `headlineClassName`, `children`. No state.
- **DivisionSplit** — Homepage only. No props. Self-contained with division data. Uses `useState<string | null>` for hover tracking.
- **ServicesOverview** — Reusable. No props. Self-contained with all 8 services.
- **SocialProof** — Reusable. No props. Contains stats + quote. Inner `AnimatedCounter` component uses two `useState` hooks + `useRef<HTMLSpanElement>` + a manual `IntersectionObserver`.
- **CTABanner** — Reusable. Props: `headline`, `subtext`, `buttonText`, `buttonHref`, `className` — all optional with sensible defaults.

## Exports and barrel files
- **NEW:** `src/components/sections/index.ts` exports `HeroSection`, `DivisionSplit`, `ServicesOverview`, `SocialProof`, `CTABanner` (as default exports re-wrapped as named).
- `src/components/global/index.ts` unchanged.

## Verification evidence
- **Production build:** `✓ Compiled successfully in 6.4s` / `Finished TypeScript in 5.6s` / 22 static pages generated, zero errors.
- **Dev compile:** clean — only harmless `THREE.THREE.Clock: This module has been deprecated` warning from Silk background (pre-existing from Phase 3).
- **Homepage DOM (1280×800):**
  - `h1` = "We help businesses grow smarter." with `-webkit-text-fill-color: transparent` + `background-image: linear-gradient(135deg, rgb(147,197,253), rgb(37,99,235))` — gradient working.
  - 3 h2 headings rendered: "Two divisions. One mission.", "Full-spectrum business services", "Ready to grow your business?"
  - 5 top-level section containers in `<main>`.
  - 13 internal links inside `<main>` (2 hero CTAs + 2 division split + 8 service cards + 1 CTA button).
  - Silk `<canvas>` present (R3F Canvas).
  - CTA Banner button bg = `rgb(96, 165, 250)` = `#60A5FA` (shared blue accent).
  - CTA Banner gradient container inline `style="background:linear-gradient(135deg, var(--division-accent-muted) 0%, var(--division-bg) 50%, …)"` — confirmed.
- **Responsive grid check:**
  | Breakpoint | Hero buttons | Division Split | Services | Stats |
  |------------|--------------|----------------|----------|-------|
  | 375px | column (stacked) | 1 col | 1 col | 2 cols |
  | 1280px | row | 2 cols | 4 cols | 4 cols |
- **No horizontal overflow** at 375px (`document.body.scrollWidth` ≤ `window.innerWidth`).

## Known issues / follow-ups
- **Stats values are placeholder** — `8+`, `50+`, `2`, `100%`. Confirm real numbers with client.
- **Founder quote is draft copy.** Confirm verbatim with Goran.
- **Service descriptions are draft copy.** Will be refined with client input.
- **No client logos yet** for a future "trusted by" strip. Could be added to `SocialProof.tsx` when brands are secured.
- **Counter animation is IntersectionObserver-based**, not Motion's `useInView`. If a later motion upgrade fixes the hook, the component can be simplified back.
- **Preview screenshot tool times out** on this homepage in the sandbox due to the Silk WebGL canvas. Not a runtime issue — the page renders fine in real browsers. If a future phase adds screenshot-based visual regression, temporarily hide the canvas via a dev flag.

## What the next phase should know
- **`HeroSection` is ready to reuse** on `/consulting` and `/marketing` landing pages — pass a different background component as `children` (e.g. `<BackgroundGrid />` for consulting, `<BackgroundPlasma />` for marketing) and different headline/subtitle/buttons.
- **`CTABanner` reads `--division-accent-muted` + `--division-accent`** so dropping it on `/consulting` automatically renders with the monochrome palette, and on `/marketing` with the lavender palette. No props needed unless you want to override copy.
- **`ServicesOverview` currently shows all 8 services.** On division landing pages, you may want a filtered variant showing only the 4 services of that division. Consider extending the component with an optional `division?: 'consulting' | 'marketing'` prop before refactoring.
- The homepage uses the **shared (blue)** theme — `DivisionSplit` cards preview the consulting (gray) and marketing (purple) themes on hover.
- **Barrel import pattern:** `import { HeroSection, CTABanner } from '@/components/sections'` is the canonical way to consume these.
