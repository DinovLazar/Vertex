# Stack and Configuration

Last updated: 2026-04-15

## Framework and runtime
- **Next.js** 16.2.3 — App Router, RSC enabled
- **React** 19.2.4 / react-dom 19.2.4
- **TypeScript** ^5 (strict mode on)
- **Node types** ^20

## Dependencies (production)
| Package | Version | Purpose |
|---------|---------|---------|
| `@anthropic-ai/sdk` | ^0.89.0 | Claude API (reserved for Phase 12 chat widget) |
| `@base-ui/react` | ^1.4.0 | Headless UI primitives (used by shadcn button) |
| `@react-three/fiber` | ^9.6.0 | React renderer for three.js (used by `Silk.tsx`) |
| `@sanity/image-url` | ^2.1.1 | Image URL builder (reserved for Phase 13) |
| `@types/three` | ^0.183.1 | three.js types |
| `class-variance-authority` | ^0.7.1 | Variant API (shadcn button) |
| `clsx` | ^2.1.1 | className merging |
| `gsap` | ^3.15.0 | Tween engine (used by `GridMotion.tsx`) |
| `lucide-react` | ^1.8.0 | Icons (Menu, X, ChevronDown, Globe, ArrowUp) |
| `motion` | ^12.38.0 | Framer Motion successor, imported from `motion/react` |
| `next` | 16.2.3 | Framework |
| `next-intl` | ^4.9.1 | i18n (installed, not configured — Phase 15) |
| `next-sanity` | ^12.2.2 | Sanity integration (reserved for Phase 13) |
| `ogl` | ^1.0.11 | WebGL library (used by `Plasma.tsx`) |
| `react` | 19.2.4 | — |
| `react-dom` | 19.2.4 | — |
| `resend` | ^6.12.0 | Transactional email (reserved for contact/lead routes) |
| `shadcn` | ^4.2.0 | CLI + tailwind preset (imported in `globals.css`) |
| `tailwind-merge` | ^3.5.0 | `cn()` helper |
| `three` | ^0.183.2 | 3D library |
| `tw-animate-css` | ^1.4.0 | Tailwind animation utilities |

## Dependencies (dev)
| Package | Version |
|---------|---------|
| `@tailwindcss/postcss` | ^4 |
| `@types/node` | ^20 |
| `@types/react` | ^19 |
| `@types/react-dom` | ^19 |
| `eslint` | ^9 |
| `eslint-config-next` | 16.2.3 |
| `tailwindcss` | ^4 |
| `typescript` | ^5 |

## Scripts
```json
"dev":   "next dev"
"build": "next build"
"start": "next start"
"lint":  "eslint"
```

## Config files

### `tsconfig.json`
- Target: ES2017, lib: dom, dom.iterable, esnext
- Strict: true, `noEmit`: true, `esModuleInterop`: true
- JSX: `react-jsx`
- Path alias: `@/*` → `./src/*`
- Next plugin enabled

### `next.config.ts`
Empty config scaffold — no custom settings yet.

### `components.json` (shadcn)
- Style: `base-nova`
- Base color: `neutral`
- CSS variables: true
- Tailwind css file: `src/app/globals.css` (no separate tailwind config file)
- Icon library: `lucide`
- Aliases: `components` → `@/components`, `utils` → `@/lib/utils`, `ui` → `@/components/ui`, `lib` → `@/lib`, `hooks` → `@/hooks`

### `postcss.config.mjs`
Single plugin: `@tailwindcss/postcss`.

### `eslint.config.mjs`
Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`. Overrides default ignores for `.next/`, `out/`, `build/`, `next-env.d.ts`.

### `tailwindcss` (v4, no `tailwind.config.ts`)
Tailwind v4 is configured entirely through CSS in `src/app/globals.css` using `@theme` blocks. There is no JS/TS tailwind config file.

## Font setup

Loaded in `src/app/layout.tsx` via `next/font/google`:

| Font | CSS variable | Weights | Role |
|------|--------------|---------|------|
| `Manrope` | `--font-heading` | 400, 500, 600, 700, 800 | Headings (Tailwind `font-heading`) |
| `Onest` | `--font-body` | 400, 500, 600, 700 | Body (Tailwind `font-body`, `font-sans`) |

Both use `display: 'swap'` and load `subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext']`. The variables are applied on `<html>` via `${manrope.variable} ${onest.variable}` className injection. Because the CSS variable names (`--font-heading` / `--font-body`) collide with the Tailwind-v4 token names, the font tokens live in an `@theme inline` block at the top of `globals.css` — `inline` tells Tailwind to emit `.font-heading { font-family: var(--font-heading), system-ui, sans-serif; }` directly (no `:root` indirection), so next/font's class-based injection on `<html>` is the sole source of truth for `--font-heading` and the `system-ui, sans-serif` tail stays intact.

**Cyrillic support:** both fonts load `cyrillic` + `cyrillic-ext` subsets so Macedonian content renders in brand fonts (no OS fallback on `/mk/...` routes).

**Why Manrope + Onest?** The previous pair (Sora headings + DM Sans body) had two problems: neither face publishes a Cyrillic subset through `next/font/google`, so the entire `/mk` site was rendering in the OS default sans; and DM Sans is on the impeccable skill's "reflex-default" typography list. Manrope + Onest resolve both issues in one swap — Manrope is a modern geometric humanist sans with strong Cyrillic coverage and a broad weight range (400–800), Onest is a warmer body face with full Cyrillic support and a distinctiveness the DM Sans-everywhere web lacks. The pair stays geometric-humanist enough to keep display and body cohesive.

## Color system

### Division palettes (declared as Tailwind v4 theme tokens)

**Consulting (monochrome grayscale)**
| Token | Hex |
|-------|-----|
| `--color-consulting-bg` | `#141414` |
| `--color-consulting-surface` | `#1C1C1C` |
| `--color-consulting-card` | `#262626` |
| `--color-consulting-elevated` | `#333333` |
| `--color-consulting-border` | `#404040` |
| `--color-consulting-600` → `--color-consulting-50` | neutral-600 → neutral-50 |

**Marketing (lavender/amethyst)**
| Token | Hex |
|-------|-----|
| `--color-marketing-bg` | `#0F0B18` |
| `--color-marketing-surface` | `#150F22` |
| `--color-marketing-card` | `#1E1530` |
| `--color-marketing-elevated` | `#2E1F4D` |
| `--color-marketing-border` | `#3D2A66` |
| `--color-marketing-900` | `#1E1530` |
| `--color-marketing-700` | `#553C8B` |
| `--color-marketing-500` | `#9474D4` |
| `--color-marketing-400` | `#B490F0` |
| `--color-marketing-200` | `#E0BBFF` |
| `--color-marketing-50` | `#F3E8FF` |

**Brand (shared blue)**
| Token | Hex |
|-------|-----|
| `--color-brand-900` | `#0F2040` |
| `--color-brand-800` | `#1E3A5F` |
| `--color-brand-600` | `#2563EB` |
| `--color-brand-400` | `#60A5FA` |
| `--color-brand-200` | `#93C5FD` |
| `--color-brand-50` | `#DBEAFE` |

**Accents**
| Token | Hex |
|-------|-----|
| `--color-accent-gold` | `#D4A017` |
| `--color-accent-terracotta` | `#E2725B` |
| `--color-accent-success` | `#10B981` |
| `--color-accent-error` | `#EF4444` |

### Typography scale
Defined as `--text-*` tokens (exposed as Tailwind `text-display-lg`, `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body-lg`, `text-body`, `text-small`, `text-micro`). Each ships with line-height, letter-spacing, and font-weight descriptors.

### Radii and animation tokens
- `--radius-card: 12px`, `--radius-button: 8px`, `--radius-pill: 9999px`
- `--animate-glow-pulse`, `--animate-fade-in`, `--animate-slide-up` — expose `animate-*` utility classes; keyframes defined immediately below the `@theme` block.

### Runtime CSS variables (switched by `[data-division="..."]`)

Three sets of vars get swapped by the `DivisionProvider`:

1. **shadcn HSL tokens** (`--background`, `--foreground`, `--muted`, `--card`, `--border`, `--input`, `--ring`, `--primary`, `--secondary`, `--accent`, `--destructive`, etc.)
2. **Division tokens** (`--division-bg`, `--division-surface`, `--division-card`, `--division-border`, `--division-accent`, `--division-accent-muted`, `--division-glow`, `--division-text-primary`, `--division-text-secondary`, `--division-text-muted`)
3. **Default / shared theme** (set on `:root`) uses the brand-blue palette.

All three themes live in `src/app/globals.css` under `@layer base`.

### Utility classes defined in `globals.css`
- `.glass` — glassmorphism (blur + semi-transparent background). Has `consulting` and `marketing` variants.
- `.gradient-text` — background-clipped text. Default is empty; gets a gradient image when under `[data-division="consulting"]` (white → gray) or `[data-division="marketing"]` (lavender fades).
- `.gradient-text-brand` — blue-to-deep-blue gradient, not division-dependent.
- `.noise::before` — SVG fractal-noise overlay.
- `.glow-hover:hover` (marketing only) — adds a lavender glow shadow.
- Reduced-motion media query globally clamps animation/transition durations to 0.01ms.

## Build status
`npm run build` is expected to succeed as of this snapshot. Running `.next/` is git-ignored. A `tsconfig.tsbuildinfo` is present from incremental TS builds.
