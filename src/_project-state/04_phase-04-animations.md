# Phase 4 — Animation System

## What was built
Central `motion/react` (Framer Motion v12) animation library plus three wrapper components — `MotionWrapper`, `AnimateIn`, `StaggerContainer` — and two always-on chrome components — `ScrollProgress` and `BackToTop`. Reduced-motion is respected globally via `MotionConfig reducedMotion="user"`.

## Files created
| File | Purpose |
|------|---------|
| `src/lib/animations.ts` | All shared variants + transitions (see inventory below) |
| `src/components/global/MotionWrapper.tsx` | `<MotionConfig reducedMotion="user">` wrapper, mounted once in root layout |
| `src/components/global/AnimateIn.tsx` | `whileInView`-triggered single-element animator. Default variant `fadeInUp`, configurable `variants`/`delay`/`once`/`amount`/`as` |
| `src/components/global/StaggerContainer.tsx` | Parent container that staggers children via `variants`. Pair with children that use `staggerItem` |
| `src/components/global/ScrollProgress.tsx` | Spring-smoothed `useScroll` progress bar fixed at top, 2px tall, `z-60`, colored with `--division-accent` |
| `src/components/global/BackToTop.tsx` | Appears after `scrollY > 500`. Circular glass button, `lucide-react` `ArrowUp`. `fixed bottom-24 right-6 z-40`. Uses `springPop` |

## Files modified
| File | What changed |
|------|-------------|
| `src/app/layout.tsx` | Wrapped children in `MotionWrapper` + `DivisionProvider`, mounted `ScrollProgress` + `BackToTop` as siblings of `{children}` |
| `src/components/global/index.ts` | Added exports for all five new components (plus `Section` and `Navbar` added in later phases) |

## Key technical decisions
- **`motion/react` import, not `framer-motion`.** The package is now called `motion` (v12+). All variant types come from `motion/react`.
- **Reduced motion handled in two layers.** (1) CSS in `globals.css` forces 0.01ms durations. (2) `MotionConfig reducedMotion="user"` lets Motion's runtime skip transforms when the user prefers it. The CSS layer is the defensive one.
- **Variants live in one file, not per-component.** Any component can pick `fadeInUp`, `fadeInLeft`, `staggerItem`, etc. and compose via `<AnimateIn variants={...} />`.
- **`springSnap` (stiffness 300, damping 20)` is the default everywhere** unless a variant specifies its own transition. Hero variants use custom `cubic-bezier(0.16, 1, 0.3, 1)` eased durations instead of springs.

## Variant inventory (`src/lib/animations.ts`)

### Transitions
- `springSnap` — `stiffness: 300, damping: 20` (default)
- `springPop` — `stiffness: 400, damping: 25` (buttons, back-to-top)
- `springGentle` — `stiffness: 200, damping: 20`
- `easeOut` — duration `0.5`, cubic-bezier `(0.16, 1, 0.3, 1)`
- `easeOutSlow` — duration `0.8`, same ease

### Entrance variants
- `fadeInUp` — y:30 → 0, spring
- `fadeInUpSlow` — y:40 → 0, slow ease
- `fadeInLeft` / `fadeInRight` — x:∓30 → 0
- `fadeIn` — opacity only, 0.5s
- `scaleIn` — scale 0.95 → 1 + opacity

### Stagger
- `staggerContainer` — staggerChildren `0.08`, delayChildren `0.1`
- `staggerContainerSlow` — `0.12` / `0.15` (consulting feel)
- `staggerContainerFast` — `0.06` / `0.05` (marketing feel)
- `staggerItem` — y:20 → 0, spring

### Hover/tap
- `hoverLift` — `{y:-6, scale:1.02}` hover, `scale:0.98` tap
- `hoverScale` — `{scale:1.03}` hover, `scale:0.97` tap
- `hoverGlow` — lift + lavender `boxShadow` (marketing)

### Hero
- `heroHeadline` — y:50, duration 0.8
- `heroSubtitle` — y:30, duration 0.8, delay 0.2
- `heroCTA` — y:20, duration 0.6, delay 0.4

## Component inventory
- **`MotionWrapper`** — no props, one-liner that renders `<MotionConfig reducedMotion="user">`. Mounted exactly once in `src/app/layout.tsx`.
- **`AnimateIn`** — props: `children`, `variants` (default `fadeInUp`), `className`, `delay` (0), `once` (true), `amount` (0.2), `as` (`div`/`section`/`article`/`li`/`span`). Internally casts `motion[as]` to `typeof motion.div`.
- **`StaggerContainer`** — props: `children`, `variants` (default `staggerContainer`), `className`, `once` (true), `amount` (0.15), `as` (`div`/`section`/`ul`/`ol`). Children should be `motion.*` with `variants={staggerItem}`.
- **`ScrollProgress`** — no props. Uses `useScroll` + `useSpring`.
- **`BackToTop`** — no props. Uses `useScroll` + `useMotionValueEvent` to toggle visibility. Reads `--division-accent` and `--division-accent-muted` for colors so it matches whichever division you're in.

## Exports and barrel files
`src/components/global/index.ts` exports `AnimateIn`, `StaggerContainer`, `MotionWrapper`, `DivisionProvider`, `ScrollProgress`, `BackToTop`, `Section`, `Navbar`.

## What the next phase should know
- Always import variants from `@/lib/animations` and pass them to `AnimateIn` / `StaggerContainer` — do not redefine variants in page/component files. The homepage `page.tsx` uses `heroHeadline`, `heroSubtitle`, `heroCTA`, `staggerItem` directly on raw `motion.div` for hero-timing reasons; this is the expected pattern when a wrapper doesn't fit.
- `BackToTop` is fixed at `bottom-24 right-6`. If you add a chat widget (Phase 12), place it on the same side and offset `BackToTop`'s `bottom` so they don't collide.
- `ScrollProgress` is `z-60`. `Navbar` is `z-50`. Keep that ordering so the bar sits above the header.
