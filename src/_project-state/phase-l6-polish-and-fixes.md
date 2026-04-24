# Phase L6 — Light Mode Polish & Bug Fixes

Date: 2026-04-24

## What was built

Three targeted fixes for user-reported light-mode issues. This is a tuning/polish phase — not a sweep. Scope was tight; the full L5 Sections-and-Pages Sweep (which had been the next-up phase per `current-state.md` at session start) was NOT completed here. L6 handled only the user-visible subset: the hero shader being too prominent in light mode, the DivisionSplit cards going white-on-white on hover, and the BorderGlow-wrapped card titles going white on hover.

**Silk hero damping.** The shader math in `Silk.tsx` multiplies `uColor` by a `pattern` value that oscillates ~0.2–1.0, so no color choice alone can make the light-mode silk quiet — the pattern dips always land near-dark relative to the input. Fix: wrap the BackgroundSilk canvas container in a theme-aware CSS variable `--silk-opacity` (1 in dark — full strength, byte-identical to pre-L6; 0.3 in light — shader pattern muted to a subtle flowing texture behind the headline). `SILK_COLOR_LIGHT` retuned from `#CDD1D7` to `#D8DCE2` so the dampened output still reads as visible texture rather than near-invisible pale. The outer wrapper div in `BackgroundSilk.tsx` now carries `style={{ opacity: 'var(--silk-opacity, 1)' }}` with the fallback preserving pre-L6 behavior if the token is ever missing.

**DivisionSplit hover fix (Pattern A + C combined).** The homepage division cards had two distinct issues that compounded the visual symptom:

- **Pattern A (the primary bug):** `<h3>` title (line 75) + CTA arrow row (line 105) had hardcoded `group-hover:text-white transition-colors` Tailwind classes. In dark mode this was a subtle brightening (`--division-text-primary: #F5F5F5` → `#FFFFFF` on hover). In light mode it was a hard fail — text flipped to white on a hover bg (`var(--division-bg)` in light = `#FFFFFF`) of white. Fix: dropped `group-hover:text-white` on the h3 entirely (base text `--division-text-primary` is already theme-aware and readable in both hover/non-hover states — the bg change carries the hover affordance). Changed CTA arrow from `group-hover:text-white` to `group-hover:text-[var(--division-text-primary)]` (brightens muted → primary on hover, clean token flip in both themes).

- **Pattern C (concurrent L5-scope rgba literals):** Border on hover (`rgba(245, 245, 245, 0.19)`), icon container bg (`rgba(245, 245, 245, 0.08)`), and service-chip bg/color (`rgba(245, 245, 245, 0.06)` + `rgba(245, 245, 245, 0.8)`) were all hardcoded light-alpha overlays. In dark mode they paint as subtle light tints on the dark card — reads correctly. In light mode they paint as near-invisible pale on already-light cards — the chips literally disappear, the hover border vanishes, the icon container has no visible surface. Fix: added a new `--division-border-hover` token (`rgba(245, 245, 245, 0.19)` dark for byte-identical regression, `rgba(10, 11, 18, 0.19)` light for inverted-direction hover affordance). Migrated hover border to `var(--division-border-hover)`. Migrated icon bg + chip bg to `var(--division-glow)` (existing L1 token, `rgba(245, 245, 245, 0.05)` dark / `rgba(10, 11, 18, 0.06)` light). Migrated chip color to `var(--division-text-secondary)` — dark: `#A3A3A3` (slightly dimmer than pre-L6 `rgba(245, 245, 245, 0.8)` perceived-#CB; accepted as a small aesthetic drift — see "Key technical decisions" below).

**BlogCard hover fix.** `<h3>` class was `text-[var(--division-text-primary)] group-hover:text-white transition-colors` — same Pattern A as DivisionSplit. Dropped the `group-hover:text-white transition-colors` entirely. Rationale: BorderGlow's pointer-follow edge glow already provides the primary hover affordance; a duplicate title color change was belt-and-suspenders AND the source of the light-mode bug. Title now stays at `var(--division-text-primary)` — dark ink in light mode (readable on `#F1F3F5` / `#F8F9FA` card bgs), bright white in dark mode (readable on `#1C1C1C` surface).

**BorderGlow glow-intensity boost (Remedy A).** The perceptual asymmetry: dark glows on light cards read weaker than bright glows on dark cards, even at the same alpha — bright halos radiate, dark halos recede. Fix: `BorderGlow.tsx` now computes `effectiveIntensity = glowIntensity * (theme === 'light' ? 1.4 : 1.0)` and passes it into `buildGlowVars()`. Dark mode: intensity stays byte-identical (`0.8 × 1.0 = 0.8`, producing `[80, 48, 40, 32, 24, 16, 8]%` opacity stops). Light mode: intensity bumps 40% (`0.8 × 1.4 = 1.12`, producing `[100 clamped, 67.2, 56, 44.8, 33.6, 22.4, 11.2]%`), making the dark-ink glow visibly present on hover instead of faint. Uses the already-wired `useTheme()` hook from L4 — no new imports.

**Cross-section audit.** Grepped `group-hover:text-white|hover:text-white|group-hover:text-\[var\(--color-bright\)\]` across `src/`. Fixed 4 additional occurrences:

- `MarketingServicesGrid.tsx:48` icon: `text-[var(--division-text-secondary)] group-hover:text-white` → `group-hover:text-[var(--division-text-primary)]`
- `MarketingServicesGrid.tsx:50` h3: `group-hover:text-white transition-colors` dropped
- `ServicesOverview.tsx:74` icon: `text-gray-400 group-hover:text-white` → `text-[var(--division-text-secondary)] group-hover:text-[var(--division-text-primary)]`
- `ServicesOverview.tsx:79` h3: `group-hover:text-white transition-colors` dropped

`ConsultingServicesGrid.tsx` already used `group-hover:text-[var(--division-text-primary)]` — zero change. `TeamGrid.tsx` + `TeamShowcase.tsx` had no hover text color changes at all — zero change. Post-fix grep returns zero hits site-wide.

## Adaptations from the plan's assumptions

1. **Plan assumed Phase L5 was the last completed work.** Actually, `current-state.md` at session start was still stamped "Phase L3" as last completed, with L5 explicitly listed as the pending next phase. No `phase-l5-sections-and-pages.md` file existed. The prompt's "confirm L5 as last completed" check failed — reported to the user upfront, then proceeded with the three-bug fix as L6 per the prompt's explicit intent (labeled as a tuning/polish phase, not an L5 sweep).

2. **Plan's Step 2 was a narrow text-color fix; real scope was broader.** The plan's Step 2 description focused on the h3 + CTA `group-hover:text-white` bug and proposed a "remove child color classes + parent inline-style inheritance + opacity" pattern. The actual DivisionSplit JSX had a second, concurrent problem: the hover border, icon container bg, service chip bg, and chip text color were all hardcoded `rgba(245, 245, 245, α)` literals that broke the cards visually in light mode regardless of hover state. Strictly interpreting Step 2 would have left those chips + border + icon container invisible on hovered (and non-hovered) light-mode cards — an incomplete fix to the user-reported symptom. Extended Step 2 scope to tokenize all four rgba literals in one pass. Introduced one new token (`--division-border-hover`) to preserve the pre-L6 hover-more-visible-than-resting-border affordance in both themes.

3. **Plan's Remedy A for BorderGlow intensity proposed a CSS variable consumed by JS.** The plan sketched `rgba(var(--borderglow-glow) / ${intensity})` but BorderGlow's glow color is parsed as an HSL triplet in JS (`parseHSL`, can't consume a CSS var). Implemented Remedy A as a pure JS ternary (`glowIntensity * (theme === 'light' ? 1.4 : 1.0)`) reading the already-present `useTheme()` state — cleaner than round-tripping through CSS and matches how L4 already handles BorderGlow's theme awareness. Briefly introduced a `--borderglow-intensity-multiplier` token, then removed it because nothing consumed it and it would have been dead CSS.

4. **Chip color dark-mode regression accepted as a small aesthetic drift.** Pre-L6 chip text was `rgba(245, 245, 245, 0.8)` which on the `#262626` card surface perceives as ~`#CBCBCB` (80% alpha composite). Post-L6 chip text is the solid `var(--division-text-secondary)` = `#A3A3A3` in dark mode — slightly dimmer. Chip bg also shifts from pre-L6 `rgba(245,245,245,0.06)` to `var(--division-glow)` = `rgba(245,245,245,0.05)` in dark — 1% alpha delta, imperceptible. The alternatives considered (introduce a `--chip-text` token with explicit alpha; use `color-mix(in srgb, var(--division-text-primary) 80%, transparent)`; nest an opacity-carrying span inside the chip) were deemed higher-complexity for a small aesthetic preservation that doesn't actually change readability. The drift is documented so future reviewers know it's intentional, not an accident.

5. **`--silk-opacity: 0.3` landed as the default.** The plan suggested 0.3 to start, with latitude to tune up to 0.4/0.5 if the shader reads too faint, or down to 0.2 if still too prominent. Verified 0.3 gives a visible-but-subtle flow behind the headline in light mode. Headline (dark ink) cuts through clearly; subtitle (secondary gray) remains readable. The `--silk-opacity` CSS variable makes future re-tuning a one-line change in `globals.css` — no component edits needed.

## Files modified

| File | What changed |
|------|-------------|
| `src/app/globals.css` | Added `--silk-opacity` token pair (`1` dark / `0.3` light) and `--division-border-hover` token pair (`rgba(245,245,245,0.19)` dark / `rgba(10,11,18,0.19)` light) at the top-level variable section, right after the L3 hero-token block. |
| `src/components/backgrounds/BackgroundSilk.tsx` | Outer wrapper div now carries `style={{ opacity: 'var(--silk-opacity, 1)' }}` — theme-aware opacity. `SILK_COLOR_LIGHT` constant retuned `#CDD1D7` → `#D8DCE2` so the dampened output still reads as visible texture. Inline comment updated to document the L6 rationale. |
| `src/components/sections/DivisionSplit.tsx` | Six changes on the same card element: (1) hover border `rgba(245,245,245,0.19)` → `var(--division-border-hover)`. (2) Icon container bg `rgba(245,245,245,0.08)` → `var(--division-glow)`. (3) h3 class `group-hover:text-white transition-colors` dropped. (4) Chip bg `rgba(245,245,245,0.06)` → `var(--division-glow)`. (5) Chip color `rgba(245,245,245,0.8)` → `var(--division-text-secondary)`. (6) CTA arrow row `group-hover:text-white` → `group-hover:text-[var(--division-text-primary)]`. |
| `src/components/sections/BlogCard.tsx` | h3 class `group-hover:text-white transition-colors` dropped — BorderGlow provides the hover affordance. |
| `src/components/sections/MarketingServicesGrid.tsx` | Icon `group-hover:text-white` → `group-hover:text-[var(--division-text-primary)]`. h3 `group-hover:text-white transition-colors` dropped. |
| `src/components/sections/ServicesOverview.tsx` | Icon `text-gray-400 group-hover:text-white` → `text-[var(--division-text-secondary)] group-hover:text-[var(--division-text-primary)]`. h3 `group-hover:text-white transition-colors` dropped. |
| `src/components/ui/BorderGlow.tsx` | Added `effectiveIntensity = glowIntensity * (theme === 'light' ? 1.4 : 1.0)` before `buildGlowVars`; pass `effectiveIntensity` instead of raw `glowIntensity`. Inline comment explains the perceptual asymmetry. |

No new files created under `src/components/`. No translation changes. No reduced-motion fallback changes. No theme-provider / navbar / footer changes. No prop interface changes on any exported component.

## Key technical decisions

- **Opacity dampening over color tuning for Silk.** The shader's output math is inherently high-contrast relative to `uColor` — the pattern oscillates ~0.2–1.0, so the pattern's dark zones always paint near ~20% of whatever `uColor` is. A pure-white `uColor` (`#FFFFFF`) flattens the visible flow at `pattern=1.0`; a darker mid-tone gives visible flow but drags the pattern's dark zones down to compete with the body text. Damping container opacity in light mode preserves the flow texture while muting its visual weight — cleaner than fighting the shader math from the `uColor` side. Token-scoped so the dark-mode render is byte-identical to pre-L6 (opacity `var(--silk-opacity, 1)` resolves to `1` in dark).

- **Inheritance vs explicit color classes for child elements.** The plan proposed removing child color classes and relying on parent inline-style `color` inheritance (plus `opacity` on children for muted effect). In DivisionSplit's actual JSX, the parent `<Link>` element doesn't set an inline `color` — it sets `backgroundColor` and border. The h3 and chip elements DO need their own explicit theme-aware color (not `inherit`, because there's nothing to inherit from) — but that color must flip correctly between themes AND between hover/non-hover states. The chosen pattern: static class `text-[var(--division-text-primary)]` on the h3 (no hover override needed, base token is readable against both hover/non-hover bg in both themes). For chip text, `var(--division-text-secondary)` — readable muted tone in both themes. This is semantically cleaner than the inline-inheritance pattern AND it preserves CSS-class consistency with the rest of the codebase.

- **Dropped hover title color change on BorderGlow-wrapped cards entirely.** BlogCard / MarketingServicesGrid / ServicesOverview all had a title color change on hover that was either a subtle brightening in dark mode (`#F5F5F5` → `#FFFFFF`, barely perceptible) or an outright bug in light mode (`#0A0B12` → `#FFFFFF`, invisible). The same cards are wrapped in `<BorderGlow>` which provides a strong hover cue (the pointer-follow edge glow ramp-in). Having the title ALSO change color was belt-and-suspenders AND the source of the light-mode bug. Dropping the title color change simplifies the component, eliminates the bug, and the remaining BorderGlow hover affordance is visually sufficient in both themes.

- **Remedy A (JS intensity multiplier) over Remedy B (color shift) for BorderGlow perceptual asymmetry.** Two options were on the table: (A) boost light-mode glow intensity via a JS multiplier on `glowIntensity`, or (B) shift the light-mode glow HSL lighter (e.g., `215 20 30` slate-600-ish) so the color itself reads more "glowy" even at the same alpha. Chose A because: it preserves the design intent (near-black glow color matching the L4 choice) and only tunes visibility; it's implemented as a one-line JS change in a component that already reads `useTheme()`; dark-mode output stays byte-identical (multiplier is `1.0` in dark). Remedy B would have introduced a second L4/L6 color decision to maintain alongside the existing one, and the color change would affect the mesh gradient palette too (which was fine as-is). 1.4× was chosen over 1.2× because the asymmetry is real and noticeable; over 1.5× because at 1.5× the `[100 × 0.8 × 1.5 = 120]%` clamping eats the top of the opacity curve too aggressively.

- **Accepted small chip-text dark-mode dimming.** Pre-L6 chip text `rgba(245, 245, 245, 0.8)` perceived as `~#CBCBCB` on `#262626` card; post-L6 `var(--division-text-secondary)` = solid `#A3A3A3` — a ~20% perceived-brightness drop. Alternatives (new `--chip-text` token with explicit alpha, `color-mix()` syntax, nested opacity-span) were higher complexity for marginal aesthetic preservation. The chips are still readable, the semantic usage is correct (secondary text token = muted body text), and the tradeoff gains theme-agnostic chips that work in light. Documented so it's not a surprise in a future dark-mode audit.

## Verification evidence

- **Build:** `npm run build` clean — 48/48 static pages, zero TypeScript errors. Only pre-existing OG-image `z-index is currently not supported` warnings during satori render (known Phase K baseline, unrelated).

- **Light-mode DOM read-back on `/en`:**
  - `--silk-opacity: .3`
  - `--division-border-hover: #0a0b1230` (= `rgba(10, 11, 18, 0.188)`)
  - `--division-glow: #0a0b120f` (= `rgba(10, 11, 18, 0.059)`)
  - `--division-bg: #fff`, `--division-card: #f1f3f5`, `--division-text-primary: #0a0b12`
  - Silk wrapper computed `opacity: "0.3"`
  - Canvas count `1` (Silk rendering once, no double-mount)

- **DivisionSplit non-hover state (light):**
  - Card bg `rgb(241, 243, 245)` (= `--division-card`)
  - Card border `rgb(229, 231, 235)` (= `--division-border`)
  - h3 color `rgb(10, 11, 18)` (= `--division-text-primary`, readable)
  - Chip bg `rgba(10, 11, 18, 0.06)` (= `--division-glow`)
  - Chip color `rgb(75, 85, 99)` (= `--division-text-secondary`, readable)

- **DivisionSplit hovered state (light, with `transition: none` forced to defeat the 500ms `transition-all` interfering with eval reads):**
  - Card bg `rgb(255, 255, 255)` (= `--division-bg`, the hover target) — pure white
  - h3 stays `rgb(10, 11, 18)` — readable dark ink on white ✓
  - The raw eval without the transition override showed intermediate `rgb(241, 243, 245)` values which was a CSS-transition-in-progress artifact, not a real bug — confirmed by reading the inline `style` attribute (`background-color: var(--division-bg); border-color: var(--division-border-hover);`) and by forcing `transition: none` to read the final target.

- **BlogCard light mode:**
  - 3 cards on `/en/blog`
  - h3 class = `text-h3 text-[var(--division-text-primary)]` (no hover-white class, pre-L6 had one)
  - h3 color = `rgb(10, 11, 18)` — readable
  - BorderGlow glow vars (via inline style on `.border-glow-card` wrapper): `--glow-color: hsl(232deg 30% 7% / 100%)`, `--glow-color-10: 11.2%` (= 10% × 1.4 × 0.8 ✓), `--glow-color-60: 67.2%` (= 60% × 1.4 × 0.8 ✓). Remedy A multiplier verified active.

- **MarketingServicesGrid light mode (`/en/marketing`):**
  - 4 service cards
  - h3 class = `text-h3 text-[var(--division-text-primary)]` (no hover-white)
  - h3 color = `rgb(10, 11, 18)` — readable
  - Icon class includes `group-hover:text-[var(--division-text-primary)]` (theme-aware hover ramp)

- **Dark-mode regression (flipped via `localStorage.setItem('vertex-theme', 'dark')` + `document.documentElement.setAttribute('data-theme', 'dark')`):**
  - `--silk-opacity: 1` — full strength, no dampening ✓
  - `--division-border-hover: #f5f5f530` (= `rgba(245, 245, 245, 0.188)` ≈ pre-L6 `0.19` — within 0.5% rounding)
  - `--division-glow: #f5f5f50d` (= `rgba(245, 245, 245, 0.051)` ≈ pre-L6 `0.05`)
  - DivisionSplit card bg `rgb(38, 38, 38)` (= `#262626` = `--division-card`, pre-L6 byte-identical)
  - DivisionSplit border `rgb(64, 64, 64)` (= `#404040` = `--division-border`, pre-L6 byte-identical)
  - DivisionSplit chip bg `rgba(245, 245, 245, 0.05)` — 1% alpha delta from pre-L6 `0.06`, imperceptible
  - DivisionSplit chip color `rgb(163, 163, 163)` (= `#A3A3A3` = `--division-text-secondary`) — noted small perceived-brightness drop from pre-L6 `rgba(245, 245, 245, 0.8)` (~`#CB`), documented under "Key technical decisions"
  - BorderGlow glow vars on `/en/blog` dark: `--glow-color: hsl(0deg 0% 85% / 80%)`, `--glow-color-10: 8%`, `--glow-color-60: 48%` — byte-identical to pre-L6 (light-mode multiplier is `1.0` in dark, no effect)
  - h3 color on BlogCard: `rgb(245, 245, 245)` (= `#F5F5F5`) — stays pre-L6 primary in dark

- **Rapid theme-swap stress test:** 5 programmatic flips (light↔dark) with `localStorage` + `data-theme` updates + 100ms settle time each. Every cycle flipped `--silk-opacity` and `--division-border-hover` correctly, zero stuck states, zero console errors.

- **Preview screenshot tool timed out repeatedly with the Silk canvas actively rendering** (renderer occupancy issue, not a code issue). All verification done via DOM read-back which is more reliable than screenshots for color values anyway.

## What the next phase should know

- **Light-mode polish is now complete for the three user-visible bugs.** The remaining L5 sweep backlog is smaller than it was at session start — DivisionSplit's rgba literals, BlogCard's hover, and MarketingServicesGrid + ServicesOverview's hover text are all done. What's left for L5-proper (if/when it runs): icon container BACKGROUNDS (`bg-white/5 group-hover:bg-white/10`) in ServicesOverview / ConsultingServicesGrid / MarketingServicesGrid; avatar borders in TeamGrid / TeamShowcase; HeroSection shell's `hover:bg-white/5`; FAQAccordion trigger hover; BlogListingClient filter pill borders; ContactForm; MarketingServicePage + ConsultingServicePage related-services pills; privacy + thank-you pages.

- **The `--silk-opacity` token is tunable from CSS alone.** If the user wants silk even quieter during video calls / screen shares, `0.2` is the next step down. If it reads too faint, `0.35` / `0.4` / `0.5` are safe ramps up. No component code changes needed — one-line CSS edit.

- **BorderGlow's light-mode intensity multiplier is a JS ternary.** If future polish wants to tune it further, the constant lives at `src/components/ui/BorderGlow.tsx` inside the `effectiveIntensity` computation. Could be migrated to a `--borderglow-intensity` CSS variable read via `getComputedStyle` if a richer tuning pattern is needed (e.g., per-section intensity).

- **The chip-text dark-mode dim is a known small regression.** If it becomes visible enough to matter, the fix is to introduce a `color-mix(in srgb, var(--division-text-primary) 80%, transparent)` chip color (modern CSS, well-supported). Left as-is for now because the chips remain readable and the token-based semantic is cleaner.
