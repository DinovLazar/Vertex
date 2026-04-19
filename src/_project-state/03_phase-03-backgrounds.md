# Phase 3 — Background Components

## What was built
Three animated WebGL/canvas backgrounds, each wrapped by a thin client component that respects `prefers-reduced-motion` and lazy-loads the heavy renderer. Each renderer uses a different stack (R3F+shaders, raw OGL+GLSL3, GSAP DOM) to match the aesthetic of a specific division.

## Files created
| File | Purpose |
|------|---------|
| `src/components/backgrounds/index.ts` | Barrel re-exporting `BackgroundSilk`, `BackgroundPlasma`, `BackgroundGrid` |
| `src/components/backgrounds/BackgroundSilk.tsx` | Wrapper for `Silk` — absolute-positioned container, reduced-motion fallback, `dynamic(ssr:false)` |
| `src/components/backgrounds/Silk.tsx` | `@react-three/fiber` `Canvas` with a plane mesh running a custom GLSL shader (silk/wave pattern). 142 lines |
| `src/components/backgrounds/BackgroundPlasma.tsx` | Wrapper for `Plasma` — same wrapper pattern |
| `src/components/backgrounds/Plasma.tsx` | Raw OGL renderer with fragment shader; supports mouse interaction, direction (`forward`/`reverse`/`pingpong`), scale, opacity |
| `src/components/backgrounds/BackgroundGrid.tsx` | Wrapper for `GridMotion` — ships a default 28-item "consulting vocabulary" list |
| `src/components/backgrounds/GridMotion.tsx` | GSAP-driven parallaxing DOM grid of 28 text cells that respond to `mousemove` X position with per-row inertia |

## Key technical decisions
- **Three-layer structure: page → `BackgroundX.tsx` → `X.tsx`.** The wrapper handles reduced-motion detection and dynamic import; the inner file owns the shader/WebGL/GSAP. This keeps heavy code out of the SSR bundle and hides renderer differences from consumers.
- **Reduced-motion fallback is a plain `<div>` with `background-color: var(--division-bg)`.** No static fallback image — visually quiet, accepts division theming automatically.
- **`Silk.tsx` dispatches a synthetic `resize` event 50ms after mount** to force R3F's `use-measure` to recompute. This fixes a known zero-size-canvas bug after a `dynamic(ssr:false)` mount.
- **`Plasma.tsx` uses OGL directly, not R3F,** to avoid the R3F scene-graph overhead for a single fullscreen triangle. This is why `src/types/ogl.d.ts` exists.
- **`GridMotion`'s default vocabulary is consulting-themed** ("Strategy", "Operations", "Systems", …). Pass a custom `items` array to override.

## Component inventory
- **`BackgroundSilk`** (`src/components/backgrounds/BackgroundSilk.tsx`)
  - Props: `color` (default `#7B7481`), `speed` (5), `scale` (1), `noiseIntensity` (1.5), `rotation` (0), `className`
  - Used by: `src/app/(site)/page.tsx` (homepage hero)
- **`BackgroundPlasma`** (`src/components/backgrounds/BackgroundPlasma.tsx`)
  - Props: `color` (default `#9474D4` — marketing lavender), `speed` (0.6), `direction` (`forward`), `scale` (1.1), `opacity` (0.7), `mouseInteractive` (true), `className`
  - Used by: `src/app/(site)/marketing/page.tsx`
- **`BackgroundGrid`** (`src/components/backgrounds/BackgroundGrid.tsx`)
  - Props: `items` (default 28-word consulting list), `gradientColor` (`#141414`), `className`
  - Used by: `src/app/(site)/consulting/page.tsx`

## CSS classes and utilities added
None — backgrounds rely on existing `--division-bg` variable for the reduced-motion fallback.

## Exports and barrel files
`src/components/backgrounds/index.ts` exports `BackgroundSilk`, `BackgroundPlasma`, `BackgroundGrid`. The inner `Silk`, `Plasma`, `GridMotion` are NOT re-exported — consumers should always use the wrappers so reduced-motion and lazy-loading work.

## What the next phase should know
- All three wrappers render into `absolute inset-0 z-0`. Hero content must sit on `relative z-10` above them.
- `Silk.tsx` has `/* eslint-disable react/no-unknown-property */` at the top to allow R3F's JSX props.
- OGL's WebGL2 context types are partially hand-rolled in `src/types/ogl.d.ts` — if you touch `Plasma.tsx` and hit a missing OGL export, extend that `.d.ts`.
- `GridMotion` listens to `mousemove` on `window` and uses `gsap.ticker.lagSmoothing(0)`. Unmount cleanup removes both.
