# Phase L1 — Theme Foundation (Light Mode Plumbing)

Date: 2026-04-23

## What was built
Complete foundation for a runtime light/dark theme system — plumbing only, no visible UI changes. Extended `src/app/globals.css` with a full light-mode token override under `html[data-theme="light"]` covering the `@theme` grayscale core tokens (`--color-ink`, `--color-surface`, `--color-elevated`, `--color-border`, `--color-muted`, `--color-bright`), all `--division-*` runtime tokens (bg, surface, card, border, accent, accent-muted, glow, text-primary, text-secondary, text-muted), and the full shadcn HSL palette (`--background`, `--foreground`, `--muted`, `--muted-foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--border`, `--input`, `--ring`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--destructive-foreground`). Palette = Option 1 Crisp White (`#FFFFFF` / `#F8F9FA` / `#F1F3F5` / `#E5E7EB` / `#9AA0AD` / `#0A0B12`). Created `ThemeProvider` client component that persists the user's explicit choice to `localStorage['vertex-theme']`, listens to `prefers-color-scheme` changes, and exposes `useTheme()` hook. Added pre-hydration inline `<script>` in `src/app/[locale]/layout.tsx` that writes `data-theme` on `<html>` before React hydrates — eliminates flash-of-wrong-theme on conflicting OS vs localStorage preferences. Added `color-scheme: dark` / `color-scheme: light` rules so browser chrome (scrollbars, native controls, text-selection highlights) adapts. The pre-existing `suppressHydrationWarning` on `<html>` (from Session G) covers the attribute-set-by-script case.

## Adaptations from the plan's assumptions
The plan was written against a state snapshot that was multiple sessions stale. Key adaptations:

1. **Root layout does not own `<html>`.** `src/app/layout.tsx` is a pass-through post-Session G (returns `children` only, no `<html>`/`<head>`/`<body>`). The `<html>` shell lives in `src/app/[locale]/layout.tsx` so `<html lang={locale}>` can be set per request (WCAG 3.1.1). Per the plan's explicit allowance ("If the current root layout does not own `<html>` directly, place it in whichever layout owns `<html>`"), both the inline script and the `<ThemeProvider>` wrap landed in the locale layout.

2. **`suppressHydrationWarning` was already present** on `<html>` in `[locale]/layout.tsx:55` (Session G). No-op for this phase.

3. **No `[data-division="shared"]` selector exists** in the CSS. The shared/default palette lives in `:root`, not a dedicated `[data-division="shared"]` block. The combined light-mode selector was written as `html[data-theme="light"], html[data-theme="light"] [data-division="consulting"], html[data-theme="light"] [data-division="marketing"]` — the naked `html[data-theme="light"]` entry overrides the `:root` declarations directly (specificity 0,0,1,1 vs `:root`'s 0,0,1,0) and also covers the `<body>` element which lives outside the `DivisionProvider` wrapper and reads `--division-*` from the `:root` cascade.

4. **Dark-mode values drifted from the plan's "Dark value" column.** Current dark is `#141414` / `#F5F5F5` / `#A3A3A3` etc. (Finishing-Touches v2 settlement); the plan's nominal `#0A0B12` / `#F1F3F7` / `#9AA0AD` was never fully rolled out. Per the plan's own instruction ("keep the existing dark value — do not rewrite it. Only add the light overrides"), the dark block was left byte-identical and only light values were added. Verified via DevTools computed-style read-back post-phase that every dark token reads its pre-phase value.

5. **Provider hierarchy has `<ChatWidget />`** inside `DivisionProvider` (Phase 12 addition not in the plan's example). Preserved during the `ThemeProvider` wrap.

6. **Fonts are Archivo + Source Serif 4**, not Manrope + Onest as `00_stack-and-config.md` claims (that doc is stale — last updated 2026-04-15, before Session F's font swap and the subsequent Archivo swap). Not Phase L1's problem, flagged here for a future docs refresh.

## Files created
| File | Purpose |
|------|---------|
| `src/components/global/ThemeProvider.tsx` | Client component (99 lines). Provides `ThemeContext` with `{ theme, setTheme, toggleTheme }`. Persists to `localStorage['vertex-theme']`. Subscribes to `prefers-color-scheme` (OS changes only applied when localStorage is empty). Exposes named `useTheme()` hook that throws outside the provider. Initial state `'dark'` matches SSR; mount effect syncs to the attribute the inline script wrote. |
| `src/_project-state/phase-l1-theme-foundation.md` | This file. |

## Files modified
| File | What changed |
|------|-------------|
| `src/app/globals.css` | Added `html { color-scheme: dark; }` + `html[data-theme="light"] { color-scheme: light; }` rules near the top (after `@custom-variant dark`, before the first `@theme inline` block). Added `html[data-theme="light"] { --color-* }` override block right after the closing `}` of the main `@theme { }` block — overrides the six grayscale core tokens. Added combined `html[data-theme="light"], html[data-theme="light"] [data-division="consulting"], html[data-theme="light"] [data-division="marketing"]` block inside `@layer base` right after the marketing block closes — overrides ten `--division-*` tokens + nineteen shadcn HSL tokens. |
| `src/app/[locale]/layout.tsx` | Added `ThemeProvider` to the named imports from `@/components/global`. Added `themeInitScript` constant (a synchronous IIFE that reads `localStorage.getItem('vertex-theme')` → falls back to `matchMedia('(prefers-color-scheme: dark)').matches` → sets `document.documentElement.setAttribute('data-theme', theme)`; nested `try` catches localStorage access failures in strict-privacy browsers). Added `<head><script dangerouslySetInnerHTML={{ __html: themeInitScript }} /></head>` as the first child of `<html>`. Wrapped the existing `NextIntlClientProvider → MotionWrapper → DivisionProvider → ScrollProgress → children → BackToTop → ChatWidget` tree with `<ThemeProvider>` as the outermost provider inside `<body>`. Did NOT add a static `data-theme` attribute on the JSX `<html>` — the script owns that. |
| `src/components/global/index.ts` | Added `export { default as ThemeProvider, useTheme } from './ThemeProvider'` as the last line. All existing exports preserved. |

## Key technical decisions
- **`data-theme` on `<html>`, not on the `[data-division]` wrapper.** The inline script runs during HTML parse before React mounts; it can only reliably target `<html>` (which always exists). The `[data-division]` wrapper is a React-rendered `<div>` that doesn't exist until hydration, so it would be too late.
- **One light palette for all three divisions.** Matches the current dark palette's post-Finishing-Touches v2 state — all three render identically. If divisions diverge again later, the combined selector can be split into three separate blocks without touching the `html[data-theme="light"]` naked-selector entry that covers `:root`.
- **`suppressHydrationWarning` scoped to `<html>` with no static `data-theme` in JSX.** The attribute is set by the inline script client-side, so server-rendered HTML has no `data-theme`. React's hydration diff would otherwise warn on the mismatch. `suppressHydrationWarning` on `<html>` is the idiomatic React solution and was already in place.
- **Combined selector list includes a naked `html[data-theme="light"]`.** Because `<body>` lives outside the `DivisionProvider` wrapper (between `<body>` and the `DivisionProvider` `<div>` sits `NextIntlClientProvider` + `MotionWrapper`, all of which render fragments/children but not elements that intercept the `[data-division]` cascade), body-level CSS like `body { background-color: var(--division-bg); }` reads from the `:root` cascade. Without an `html[data-theme="light"]` entry, body would stay dark in light mode. Including it in the same selector list (same values) is a single rule block that covers all three scenarios.
- **`useState('dark')` initial in `ThemeProvider`.** Matches what the server renders (no access to `window` / `localStorage` during SSR). A mount `useEffect` re-syncs state to whatever the inline script wrote. SSR hydration sees `theme: 'dark'` on both server and client first render, so no mismatch. No component reads `theme` from context in Phase L1, so the brief pre-effect mismatch is not user-visible.
- **`localStorage` key `vertex-theme`.** Namespaced to avoid collisions with any future third-party script.
- **`prefers-color-scheme` listener only applies when `localStorage` is empty.** Once the user explicitly toggles (Phase L2), their choice persists and the OS listener is effectively a no-op for them. This is the standard "explicit choice wins over system" UX pattern.
- **`setAttribute('data-theme', ...)` inside a try/catch fallback.** If `matchMedia` is unavailable or throws (some ancient browsers, some privacy-hardened configurations), the catch branch defaults to `'dark'` — matches the site's current-state and avoids a white flash for mainstream users if localStorage access itself throws.

## Component inventory
- **`ThemeProvider`** (`src/components/global/ThemeProvider.tsx`, default export) — client component, no props beyond `children`, wraps children in `ThemeContext.Provider`. State: `theme: 'light' | 'dark'` (initial `'dark'` on server + first client render, synced from `<html>` attribute on mount). Methods: `setTheme(next)` writes localStorage + applies via `applyTheme` (which writes the attribute + updates state); `toggleTheme()` flips and calls `setTheme`. Has two effects: (1) mount-sync to `data-theme` attribute, (2) `matchMedia` listener that applies OS changes only when localStorage is empty.
- **`useTheme`** hook (named export from the same file) — returns `{ theme, setTheme, toggleTheme }`. Throws `'useTheme must be used within a ThemeProvider'` if called outside a provider.

## CSS classes and utilities added
None. Only CSS custom-property overrides under `html[data-theme="light"]` selectors and a `color-scheme` pair. No new Tailwind utilities, no new component-scoped classes.

## Exports and barrel files
`src/components/global/index.ts` now exports `ThemeProvider` (default) and `useTheme` (named) from `./ThemeProvider`. All nine pre-existing exports preserved in order.

## Verification evidence
- `npm run build` completed cleanly: `✓ Compiled successfully in 6.0s` / `Finished TypeScript in 5.7s` / 48/48 static pages generated / zero TypeScript errors / zero compile errors. The `z-index is currently not supported` warnings during `/opengraph-image` generation are pre-existing satori/Session K behavior, unrelated to this phase.
- Dev server DevTools tests (all passed):
  1. Fresh load with no localStorage on an OS-dark browser → `document.documentElement.getAttribute('data-theme') === 'dark'`, `window.matchMedia('(prefers-color-scheme: dark)').matches === true`, `getComputedStyle(document.documentElement).colorScheme === 'dark'`, body bg `rgb(20, 20, 20)` (`#141414`), body color `rgb(245, 245, 245)` (`#F5F5F5`).
  2. `localStorage.setItem('vertex-theme', 'light')` + hard reload → `data-theme === 'light'`, body bg `rgb(255, 255, 255)` (`#FFFFFF`), body color `rgb(10, 11, 18)` (`#0A0B12`), `--color-ink === '#fff'`, `--color-surface === '#f8f9fa'`, `--color-bright === '#0a0b12'`, `--division-bg === '#fff'`, `--division-accent === '#0a0b12'`, `--division-text-primary === '#0a0b12'`, `colorScheme === 'light'`.
  3. `localStorage.removeItem('vertex-theme')` + reload → reverts to OS preference (dark), body bg back to `rgb(20, 20, 20)`.
  4. Fetch of the rendered HTML source confirms the `<script>(function(){ try { var stored = null; ...` string appears inside `<head>` before `</head>`, and no `data-theme="..."` attribute is on the `<html ...>` opening tag. Flash-of-wrong-theme window is zero.
  5. Dark-mode token read-back post-phase matches pre-phase byte-for-byte (`--color-ink: #0e0e0e`, `--color-surface: #121212`, `--color-bright: #f5f5f5`, `--division-bg: #141414`, `--division-accent: #f5f5f5`, `--division-text-primary: #f5f5f5`, `--division-text-secondary: #a3a3a3`, `--background: 0 0% 8%`, `--foreground: 0 0% 96%`).
- Dev console: two entries of `Encountered a script tag while rendering React component` at `[error]` level (duplicated because Next.js 16 dev mode double-renders under strict mode). The script demonstrably runs — verified by the `data-theme` + token swap evidence above. This is a known false-positive for the pre-hydration theme pattern used by `next-themes` and every major Next.js theme project; the warning is dev-mode only (not emitted by production builds) and not build-blocking.
- Pre-existing `THREE.THREE.Clock: This module has been deprecated` warnings from the Silk shader are unrelated (present since Phase 3).

## What broke in light mode (intentional backlog, not bugs)
These all read dark-mode baselines directly via hardcoded values. Fixing them requires follow-up phases:

**Phase L3 — hero backgrounds:**
- `Silk.tsx` GLSL shader color uniforms (hardcoded dark silk/wave colors)
- `Plasma.tsx` OGL fragment shader palette (hardcoded dark plasma colors)
- `GridMotion.tsx` — uses `.metallic-panel` class (brushed-silver gradient) in `variant="panels"` mode on the consulting hero
- `.metallic-panel` utility in `globals.css` (fully baked-dark gradient: `#14171C` + silver radial, inset shadows)

**Phase L4 — global chrome + utility classes:**
- `.glass` — `background: rgba(255, 255, 255, 0.03)`, `border: 1px solid rgba(255, 255, 255, 0.08)`. On white, the alpha disappears.
- `[data-division="consulting"] .glass` + `[data-division="marketing"] .glass` — same issue, slightly different alpha values
- `.glass-nav` — `background: rgba(14, 14, 14, 0.85)` + `border-bottom: 1px solid rgba(255, 255, 255, 0.06)`. Dark chrome on white page, border invisible.
- `[data-division="marketing"] .glow-hover:hover` — `box-shadow: 0 0 24px rgba(255, 255, 255, 0.04)` + `0 0 0 1px rgba(255, 255, 255, 0.08)`. White glow on white.
- `BorderGlow` default `colors={['#F5F5F5','#C9C9C9','#A3A3A3']}` (Session J set these). Every card grid (ServicesOverview, ConsultingServicesGrid, MarketingServicesGrid, TeamGrid, TeamShowcase, BlogCard) needs the pointer-follow glow color flipped to dark grays in light mode.
- `BorderGlow.css` — parallel HSLA rainbow fallbacks all baked-grayscale-dark.
- `chat-trigger-pulse` keyframe — `box-shadow: ... rgba(241, 243, 247, 0.25)` bright-on-dark ring.

**Phase L5 — sections + pages:**
- `DivisionSplit.tsx` — the Option A refactor replaced per-division hex fields with tokens, but the `rgba(245, 245, 245, α)` literals for hover bg / card bg / border are baked-bright; need dark equivalents in light mode.
- Any remaining hardcoded hex in landing clients, CTA banners, blog cards. Session E swept most of these, but light mode is a new palette and needs a re-audit.
- The `body { background-color: var(--division-bg); color: var(--division-text-primary); }` rule already swaps cleanly (verified), so most text + section bg works out of the box in light mode. The breakage is concentrated in the utility classes and hero shaders above.

## What the next phase (L2) should know
- The toggle button must call `toggleTheme()` from `useTheme()`. No direct DOM manipulation.
- Icon state: `theme === 'dark'` → show Sun (clicking will switch to light). `theme === 'light'` → show Moon.
- Placement: desktop navbar — immediately LEFT of the MK/EN language toggle. Mobile overlay — top-right corner, matching desktop placement. Navbar.tsx is the file.
- Translation keys needed: `nav.themeToggle.toLight`, `nav.themeToggle.toDark` for `aria-label` in both `messages/en.json` and `messages/mk.json`.
- When the button first mounts, `theme` state is `'dark'` (SSR default), then flips to the real value on the very next tick via the `ThemeProvider`'s mount effect. The button icon must either (a) carry `suppressHydrationWarning` on the icon element, (b) render a 1-frame placeholder and swap on mount, or (c) read from `document.documentElement.dataset.theme` directly inside its own mount effect. Option (c) sidesteps the ThemeProvider's mount delay entirely.
- The `ThemeProvider` is the OUTERMOST provider in the locale layout, so `useTheme()` is safely available inside `Navbar`, `Footer`, `BackToTop`, `ChatWidget`, and every section.
- `lucide-react@1.8.0` ships no usable Sun/Moon icons (same 1.8.0 dead-icon issue that bit Footer — see `memory/project_lucide_no_brand_icons.md`). Plan on inline SVGs.
- L2 should NOT fix any of the L3–L5 backlog items above. Toggle UI only.
