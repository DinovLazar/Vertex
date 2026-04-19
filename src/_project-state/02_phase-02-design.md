# Phase 2 — Design System

## What was built
Full design token system in `src/app/globals.css`: two division palettes (monochrome Consulting, lavender Marketing) + shared brand blue + accents, typography scale, radii, animation tokens, and three runtime theme variable sets (shadcn HSL + custom `--division-*` variables) that swap based on a `[data-division]` attribute on the body wrapper. Root-layout metadata, fonts (Sora + DM Sans), and the first cross-cutting utility classes (`.glass`, `.gradient-text`, `.gradient-text-brand`, `.noise`, `.glow-hover`). shadcn button component committed.

## Files created
| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout — fonts, metadata, viewport, wraps children in `MotionWrapper` → `DivisionProvider` → `ScrollProgress` + `BackToTop` |
| `src/app/globals.css` | All Tailwind v4 tokens, shadcn base HSL tokens, three theme blocks, keyframes, utility classes, reduced-motion fallback |
| `src/config/site.ts` | `siteConfig` constant — name, legal name, domain, address, phone, emails, divisions + team list |
| `src/config/navigation.ts` | `NavItem` type, `mainNavItems` with parent/child dropdown structure, `footerNavItems` grouped by consulting / marketing / company |
| `src/lib/utils.ts` | `cn()` helper (clsx + tailwind-merge) |
| `src/lib/metadata.ts` | `generatePageMetadata()`, `consultingMetadata()`, `marketingMetadata()` — produce Next `Metadata` with canonical URL, OG, Twitter, robots |
| `src/lib/divisions.ts` | `Division` union, `getDivisionFromPath()`, `divisionConfig` with Tailwind class strings per division |
| `src/components/ui/button.tsx` | shadcn Button with `cva` variants (default/outline/secondary/ghost/destructive/link) and sizes (default/xs/sm/lg/icon/icon-xs/icon-sm/icon-lg) |
| `src/types/index.ts` | Stub `NavItem` type (likely redundant with `config/navigation.ts`) |
| `src/types/ogl.d.ts` | Hand-rolled ambient module for `ogl` (Renderer, Program, Mesh, Triangle) |

## Key technical decisions
- **Division themes use both shadcn HSL tokens and bespoke `--division-*` variables.** shadcn tokens keep third-party primitives (Button, future Dialog, Input) themed correctly; `--division-*` is used directly in custom components to avoid opaque `hsl(var(--...))` calls.
- **Dark-mode-only for now.** `.dark` variant is defined but no light theme exists. All three theme blocks are dark.
- **Division detection is purely path-based** (`/consulting*` / `/marketing*` / else `shared`). Not stored in cookies or URL params.
- **`ogl` has no upstream types,** so `src/types/ogl.d.ts` hand-rolls the subset used by `Plasma.tsx`.

## Component inventory
- **Button** (`src/components/ui/button.tsx`) — shadcn wrapper over `@base-ui/react`'s Button. Takes `variant`, `size`, and any Base UI Button props. Used… nowhere yet. Current pages use raw `<button>` and `<Link>` with inline tailwind classes.

## CSS classes and utilities added
- `.glass` — `rgba(255,255,255,0.03)` bg + `backdrop-filter: blur(12px)` + subtle border. Consulting and marketing get different alpha + tint.
- `.gradient-text` — text gradient (white→gray for consulting, lavender for marketing).
- `.gradient-text-brand` — always-on blue gradient.
- `.noise::before` — fixed fractal-noise SVG overlay.
- `.glow-hover:hover` — only applies under `[data-division="marketing"]`.
- Tailwind utilities via `@theme`: `font-heading`, `font-body`, `font-sans`, `bg-consulting-bg`, `bg-marketing-bg`, `text-brand-400`, `text-display-lg`, `text-h1`, `text-body`, `rounded-card`, `rounded-button`, `rounded-pill`, `animate-fade-in`, `animate-slide-up`, `animate-glow-pulse`.

## Exports and barrel files
None for Phase 2 code. Lib helpers are imported directly (e.g. `@/lib/metadata`, `@/lib/divisions`).

## What the next phase should know
- If you need a new color or text size, add it as a `--color-*` / `--text-*` token inside the `@theme { }` block in `globals.css` — do **not** add a `tailwind.config.ts`.
- `src/types/index.ts` has a stub `NavItem` that duplicates the more complete one in `src/config/navigation.ts`. The config version is the canonical one.
- `siteConfig.founded` is `2018`; root layout `metadata.title.default` matches. Copyright in the footer placeholder says "© 2026".
