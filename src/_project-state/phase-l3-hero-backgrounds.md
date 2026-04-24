# Phase L3 — Hero Backgrounds (Light Mode)

Date: 2026-04-24

## What was built

All three animated hero backgrounds now render correctly in both themes. Silk (homepage) and Plasma (marketing) get their shader color uniforms swapped at runtime via a theme-aware wrapper that reads `useTheme()` and passes a theme-appropriate default to the shader's `color` prop. Silk's existing `useMemo` deps on `color` propagate the prop change into the `uColor` uniform without canvas remount — theme swap is seamless. Plasma's effect also re-runs when `color` changes, which tears down and rebuilds the OGL renderer; acceptable for the marketing hero since theme flips are rare explicit user actions. GridMotion (consulting) panel colors, container background, brushed-metal striation alphas, rim border, and inset depth shadow all moved to CSS variables in `globals.css`. Light-mode overrides invert the bright-silver-on-black metallic to a dark-titanium-on-light-surface palette that preserves the metallic gradient depth without reading as dark blobs on a white page. The consulting hero scrim overlay (previously hardcoded `rgba(14,14,14,α)`) was tokenized so it flips from a darkening-in-dark scrim to a lightening-in-light scrim — same purpose (improving hero-text contrast over the animated bg), inverted direction. All reduced-motion fallbacks continue to show `var(--division-bg)` which was already theme-aware post-L1.

## Adaptations from the plan's assumptions

1. **GridMotion cell styling lives in a `.metallic-panel` CSS class, not inline styles.** The plan assumed per-cell inline `background` gradients and an inline `border`. Actually, each cell renders `<div className="metallic-panel" aria-hidden="true" />` (GridMotion.tsx:168) and all metallic styling lives in `.metallic-panel` (globals.css:562). The entire color tokenization was done by rewriting the CSS class to consume `--hero-panel-*` variables — GridMotion.tsx cell JSX was untouched. Only the outer `<section>` background (hardcoded `#0E0E0E` in panels mode) changed to `var(--hero-grid-bg)`.

2. **Dark-mode values differed from the plan's "Palette decisions" table.** The plan specified `#E8EBF0 / #7A7E86 at 55% / #1A1D22` for the radial stops; actual live values were `#A8ACB4 / #4A4E56 at 50% / #14171C`. Stripe shadow alpha was `0.14` not `0.18`. Container bg was `#0E0E0E` not `#0A0B12`. Per user decision, the `:root` (dark) values were set to the LIVE pre-L3 state exactly — dark-mode visual appearance is byte-identical to pre-phase (confirmed via panel computed-style read-back). Light-mode values were recalibrated to match: center `#3A3D42` → mid `#8A8E94` → edge `#D4D7DC` (page-bg-blending light silver), stripe bright `rgba(255,255,255,0.10)`, stripe shadow `rgba(0,0,0,0.12)`.

3. **BackgroundGrid.tsx had hardcoded `#121212` on both the wrapper div and the reduced-motion fallback** (two separate inline styles). Neither used `var(--division-bg)`. Plan scope was extended to fix this pre-existing theme-unawareness — one-line each replacement to `var(--division-bg)` — because the reduced-motion fallback IS the hero for users with `prefers-reduced-motion: reduce` enabled, and L3's stated goal is "heroes render correctly in both themes."

4. **Consulting hero had a hardcoded `rgba(14,14,14,...)` scrim overlay** in `ConsultingLandingClient.tsx:48-55`. In light mode this would paint as a dark blob over light panels. Plan scope was extended to tokenize it — the scrim exists to improve hero-text contrast over the animated bg. In dark mode, dark scrim darkens the center ellipse behind the text; in light mode, light scrim lightens the center ellipse for the same purpose on the inverted palette. Same design intent, flipped tokens.

5. **Marketing hero STILL had `<BackgroundPlasma>` at MarketingLandingClient.tsx:52.** The plan anticipated it might be removed per Finishing-Touches v2 spec and told me to stop and report. After user confirmation, option A was chosen: extend Plasma to be theme-aware mirroring the Silk pattern. Dark: `#F5F5F5` (pre-phase live value). Light: `#2A2D33`.

6. **`.metallic-panel`'s inset `box-shadow` was tokenized, not removed.** The plan's Step 2d offered "convert to variable OR remove." Per user decision, tokenize — the inset gives the panels their depth cue. Dark: preserved the live `inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 0 1px rgba(0,0,0,0.35)`. Light: flipped to `inset 0 1px 0 rgba(255,255,255,0.50), inset 0 -1px 0 rgba(0,0,0,0.12)` — top highlight + bottom shadow creates a "lit from above" depth cue on a light surface instead of the dark-mode "rim + glint" treatment.

7. **`--hero-panel-border` in dark mode is `transparent`, not a hex color.** Live `.metallic-panel` has no CSS `border` property — only a box-shadow inset rim. To avoid regressing the dark-mode appearance by adding a visible 1px border, the dark token value is `transparent`. Light mode: `rgba(10, 11, 18, 0.10)` — a subtle dark hairline that gives the lighter panels extra edge definition against the light page bg.

## Files created
| File | Purpose |
|------|---------|
| `src/_project-state/phase-l3-hero-backgrounds.md` | This file. |

## Files modified
| File | What changed |
|------|-------------|
| `src/app/globals.css` | Added eleven new CSS variables under `:root` (live-value dark defaults) + `html[data-theme="light"]` (light overrides): `--hero-grid-bg`, `--hero-panel-stop-1`, `--hero-panel-stop-2`, `--hero-panel-stop-3`, `--hero-panel-stripe-bright`, `--hero-panel-stripe-shadow`, `--hero-panel-border`, `--metallic-panel-shadow`, `--hero-scrim-center`, `--hero-scrim-mid`. Rewrote `.metallic-panel` class: `background-color` / radial-gradient stops / repeating-linear-gradient stripes / `border` / `box-shadow` all now consume the new variables. Kept `border-radius: 14px`, `width/height: 100%`, `position: relative` unchanged. |
| `src/components/backgrounds/BackgroundSilk.tsx` | Imports `useTheme` from `@/components/global`. `color` prop became fully optional (no default in destructuring). Added `SILK_COLOR_DARK = '#2A2D33'` (live pre-phase value) + `SILK_COLOR_LIGHT = '#CDD1D7'` constants. Resolves `resolvedColor = color ?? (theme === 'light' ? SILK_COLOR_LIGHT : SILK_COLOR_DARK)` and passes it to `<Silk color={resolvedColor} ... />`. The existing `useEffect` for `prefers-reduced-motion` and the 50ms R3F use-measure nudge were preserved verbatim. |
| `src/components/backgrounds/BackgroundPlasma.tsx` | Same pattern as BackgroundSilk. Imports `useTheme`. `color` prop now optional. Added `PLASMA_COLOR_DARK = '#F5F5F5'` (the pre-L3 marketing-hero call-site value) + `PLASMA_COLOR_LIGHT = '#2A2D33'`. Resolves color from theme, passes to `<Plasma />`. |
| `src/components/backgrounds/GridMotion.tsx` | Outer `<section>` `backgroundColor` changed from `variant === 'panels' ? '#0E0E0E' : gradientColor` to `variant === 'panels' ? 'var(--hero-grid-bg)' : gradientColor`. Text-variant path kept for backward compat with the deprecated `gradientColor` prop. All GSAP ticker logic, transforms, grid layout, `willChange`, mouse-parallax math untouched. |
| `src/components/backgrounds/BackgroundGrid.tsx` | Wrapper div inline style `backgroundColor: '#121212'` → `'var(--division-bg)'`. Reduced-motion fallback div same change. |
| `src/app/[locale]/(site)/consulting/ConsultingLandingClient.tsx` | Hero scrim inline `background` changed from hardcoded `'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(14,14,14,0.75) 0%, rgba(14,14,14,0.4) 40%, transparent 80%)'` to `'radial-gradient(ellipse 50% 40% at 50% 50%, var(--hero-scrim-center) 0%, var(--hero-scrim-mid) 40%, transparent 80%)'`. Inline comment updated to note the dark/light intent swap. |
| `src/app/[locale]/(site)/marketing/MarketingLandingClient.tsx` | Removed explicit `color="#F5F5F5"` prop from `<BackgroundPlasma>` usage so the wrapper's theme-aware default takes over. All other Plasma props (speed, direction, scale, opacity, mouseInteractive) preserved. |

## Key technical decisions

- **Silk gets theme-awareness via React props, not CSS variables.** GLSL uniforms can't consume CSS custom properties. The wrapper pattern already existed; extended to read `useTheme()` and pass the right hex to Silk. Silk's existing `useMemo` with `color` in deps propagates to the uniform. No shader code changes.
- **Plasma same pattern, but its effect re-runs on `color` change.** Unlike Silk's `useMemo` (which only rebuilds the uniforms object), Plasma's single `useEffect` has `color` in its deps array and the cleanup tears down the whole OGL renderer. A theme flip therefore causes Plasma to briefly unmount its canvas. Subjectively this looks like a ~150ms soft fade. Acceptable for the marketing hero since theme flips are rare explicit user actions. If a flash-free Plasma swap is required later, Plasma.tsx would need a split between renderer-setup effect (no `color` dep) and a uniform-update effect (only `color` dep) that writes to `program.uniforms.uCustomColor.value` via a ref.
- **GridMotion gets theme-awareness via pure CSS.** Panels are DOM. The `.metallic-panel` class now references `var(--hero-panel-*)`. Flipping `data-theme` on `<html>` swaps the variables → every panel paints in the new color in a single compositor tick. No React re-render, no ticker interruption. Confirmed via computed-style read-back: `rgb(20, 23, 28) ↔ rgb(212, 215, 220)` on toggle click.
- **Light-mode Silk color is `#CDD1D7`.** The shader multiplies `uColor` by a `pattern` value that oscillates 0.2–1.0. Pure white (`#FFFFFF`) produces a flat highlight at `pattern=1.0`. A mid-tone like `#CDD1D7` was chosen to give visible contrast in the flow while staying visually quiet against `#FFFFFF` page bg. **After verification, this reads HEAVY in light mode** — the pattern dip at ~0.2 produces ~`#2F3033` which paints as dark silk shadows that compete with the subtitle text. See "Aesthetic concerns to address" below.
- **Light-mode GridMotion panels invert the gradient's tonal center, not its stop order.** Simply flipping stop colors would give dark-center-on-light, which reads as dark pucks. Instead, the whole gradient shifts: center `#3A3D42` (dark titanium) → edge `#D4D7DC` (light silver that blends toward `#F1F3F5` page bg). This preserves the radial's "metallic sheen" optical trick while keeping the overall panel darker than the page bg — panels read as "metal emerging from light" instead of flipping tonality.
- **Striation alphas were separately tuned for light mode.** Dark mode uses `rgba(255,255,255,0.06)` + `rgba(0,0,0,0.14)` — the live values — for the brushed striation. Light mode uses `rgba(255,255,255,0.10)` + `rgba(0,0,0,0.12)` — slightly more bright-band intensity, slightly less shadow-band intensity, because the light-mode panels have a darker center-dominant gradient, so the bright vertical streaks read more clearly against the dark titanium.
- **Marketing hero reinterpreted from "verify no-op" to "make Plasma theme-aware."** Finishing-Touches v2 spec'd Plasma removed. Live state at L3 start: Plasma still present at MarketingLandingClient.tsx:52 with explicit `color="#F5F5F5"`. Per user direction, Plasma was made theme-aware (option A) rather than removed (option B) — brief from user: "do not remove them or leave them as is." Dark color preserved live value (`#F5F5F5` bright-on-black), light flips to `#2A2D33`.
- **Scrim is theme-aware because it serves a theme-dependent purpose.** In dark mode it darkens the headline area to improve white-text contrast against bright metallic streaks. In light mode it lightens the headline area to improve black-text contrast against dark-titanium panel centers. Same design role, inverted implementation.
- **`--hero-panel-border: transparent` in dark mode, not omitted.** To allow the CSS class to use a single `border: 1px solid var(--hero-panel-border)` declaration across both themes, the dark token is `transparent`. No visible border in dark mode (pre-phase preserved), subtle hairline in light mode. The Tailwind preflight sets `*, ::before, ::after { box-sizing: border-box; }` so the 1px transparent border doesn't affect cell layout.

## CSS classes and utilities added/changed

- **Rewritten:** `.metallic-panel` (consumes `--hero-panel-stop-{1,2,3}`, `--hero-panel-stripe-{bright,shadow}`, `--hero-panel-border`, `--metallic-panel-shadow`).
- **New tokens in `globals.css`:** `--hero-grid-bg`, `--hero-panel-stop-1`, `--hero-panel-stop-2`, `--hero-panel-stop-3`, `--hero-panel-stripe-bright`, `--hero-panel-stripe-shadow`, `--hero-panel-border`, `--metallic-panel-shadow`, `--hero-scrim-center`, `--hero-scrim-mid`. Each declared under `:root` (dark = live pre-phase values) and overridden under `html[data-theme="light"]` (light palette recalibrated).

## Exports and barrel files

No changes. `@/components/global` barrel already exported `useTheme` (Phase L1). Both BackgroundSilk and BackgroundPlasma import from this barrel.

## Component inventory updates

- **`BackgroundSilk`** — adds `useTheme` consumption. Public prop API unchanged (still `color?`, `speed?`, `scale?`, `noiseIntensity?`, `rotation?`, `className?`). When `color` is not passed, the theme decides.
- **`BackgroundPlasma`** — adds `useTheme` consumption. Public prop API unchanged. When `color` is not passed, the theme decides. Color changes trigger OGL renderer re-init (see "Key technical decisions").
- **`Silk`** — unchanged. `useMemo` deps array already included `color`, so prop changes propagate to `uColor` uniform without modification.
- **`Plasma`** — unchanged.
- **`GridMotion`** — only the outer `<section>` `backgroundColor` changed to `var(--hero-grid-bg)`. Cell JSX (`<div className="metallic-panel" />`) untouched. GSAP ticker logic, mouse-parallax math, transforms, grid layout all preserved verbatim.
- **`BackgroundGrid`** — wrapper bg + reduced-motion fallback bg changed from hardcoded `#121212` to `var(--division-bg)`.

## Verification evidence

- **Build:** `npm run build` clean — 48/48 static pages, zero TypeScript errors, zero compile errors. Pre-existing `z-index is currently not supported` warnings during `/opengraph-image` generation unrelated (Satori/Phase K behavior).
- **CSS token read-back (dark mode, `/en/consulting`):**
  ```
  --hero-grid-bg: #0e0e0e
  --hero-panel-stop-1: #a8acb4
  --hero-panel-stop-2: #4a4e56
  --hero-panel-stop-3: #14171c
  --hero-panel-stripe-bright: rgba(255,255,255,0.06) (= #ffffff0f)
  --hero-panel-stripe-shadow: rgba(0,0,0,0.14) (= #00000024)
  --hero-panel-border: transparent
  --metallic-panel-shadow: inset 0 1px 0 #ffffff0d, inset 0 0 0 1px #00000059
  --hero-scrim-center: rgba(14,14,14,0.75) (= #0e0e0ebf)
  --hero-scrim-mid: rgba(14,14,14,0.4) (= #0e0e0e66)
  ```
  Every dark-mode value matches the pre-L3 hardcoded state exactly. Dark-mode regression = visually identical.
- **CSS token read-back (light mode, `/en/consulting`):**
  ```
  --hero-grid-bg: #f1f3f5
  --hero-panel-stop-1: #3a3d42
  --hero-panel-stop-2: #8a8e94
  --hero-panel-stop-3: #d4d7dc
  --hero-panel-stripe-bright: rgba(255,255,255,0.10)
  --hero-panel-stripe-shadow: rgba(0,0,0,0.12)
  --hero-panel-border: rgba(10,11,18,0.10)
  --metallic-panel-shadow: inset 0 1px 0 #ffffff80, inset 0 -1px 0 #0000001f
  --hero-scrim-center: rgba(241,243,245,0.40) (= #f1f3f566)
  --hero-scrim-mid: rgba(241,243,245,0.20)
  ```
- **Panel computed-style read-back (live DOM element):**
  - Dark: `backgroundColor: rgb(20, 23, 28)`, `border: 1px solid rgba(0, 0, 0, 0)`, `boxShadow: rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.35) 0px 0px 0px 1px inset`. Section bg `rgb(14, 14, 14)`.
  - Light: `backgroundColor: rgb(212, 215, 220)`, `border: 1px solid rgba(10, 11, 18, 0.1)`, `boxShadow: rgba(255, 255, 255, 0.5) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.12) 0px -1px 0px 0px inset`. Section bg `rgb(241, 243, 245)`.
- **Theme swap smoothness (desktop 1280x900):**
  - `/en` (Silk): toggle click flips theme instantly; `document.querySelectorAll('canvas').length` stays at `1` across the swap — no canvas remount. Silk animation continues in the new color without stutter.
  - `/en/consulting` (GridMotion): toggle click flips `panelCount: 28` panels + section bg in one paint. GSAP ticker continues across the swap; mouse parallax still works post-flip.
  - `/en/marketing` (Plasma): toggle click triggers Plasma OGL re-init (acceptable per "Key technical decisions" above).
- **Route sweep verified in both themes:** `/en`, `/en/consulting`, `/en/marketing`, `/mk/consulting`, `/mk/marketing` all render the correct theme-aware hero.
- **Reduced-motion fallback:** code-path-verified — `shouldAnimate === false` renders `<div style={{ backgroundColor: 'var(--division-bg)' }} />` for all three wrappers. `--division-bg` is theme-aware via L1.
- **Console:** zero errors. Only pre-existing `THREE.THREE.Clock` deprecation warnings from the Silk three.js pipeline (known unrelated since Phase 3).

## Aesthetic concerns to address

**Silk reads heavy in light mode.** With `uColor = #CDD1D7`, the shader output ranges from ~`#2F3033` at `pattern=0.2` to `#CDD1D7` at `pattern=1.0`. On `#FFFFFF` page bg, the `pattern=0.2` dark zones paint as near-black silk shadows that compete with the subtitle text (`.text-[var(--division-text-secondary)]` = `#4B5563` in light mode). The headline (bold black) cuts through fine; the body copy gets visually overwhelmed. Options to tune:

- **Lighten `SILK_COLOR_LIGHT` to `#E8EBEE` or `#F0F2F5`.** Output range shifts to ~`#353637` → `#E8EBEE`, so even the darkest silk zones sit ≥40% luminance — subtitle reads clearly.
- **Lower `noiseIntensity` for light mode.** The grain subtraction amplifies the perceived darkness of mid-tones. Pipe a theme-dependent value through the wrapper: `noiseIntensity={theme === 'light' ? 0.8 : 1.5}`.
- **Both.** Safest combination if absolute body-text legibility is the priority.

These aren't blocking for the phase (dark-mode regression is clean, light-mode is functional), but the user asked for tuning feedback — proposing values, not applying unilaterally.

**Light-mode GridMotion panels read well.** The dark-titanium center / light-silver edge gradient preserves the metallic shading while keeping panels visibly distinct from the `#F1F3F5` page bg. Scrim lightens the hero text area enough for black-on-gray legibility. No tuning needed unless user flags it.

**Light-mode Plasma reads well.** The `#2A2D33` dark plasma against `#FFFFFF` page bg paints as a soft gray nebula with visible depth; hero text (black on white background outside the plasma area) has full contrast. No tuning needed.

## What the next phase (L5) should know

- Every route is theme-correct at the frame + hero level. Any remaining wrongness is inside specific section components that still hold hardcoded dark colors.
- L5's job: walk every section component, grep for hardcoded hexes and `rgba(255,...)` / `white-N` patterns, convert each to the appropriate `--division-*` or `--color-*` token. See the long backlog list in `phase-l4-global-chrome.md` ("What the phase after L5 should know").
- `SILK_COLOR_LIGHT` tuning: if the user approves lighter Silk in light mode, only `BackgroundSilk.tsx` needs to change (or the plumb-through-intensity pattern). Could batch with L5 or treat as its own micro-phase.
