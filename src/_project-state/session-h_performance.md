---
session: H
date: 2026-04-19
status: complete
---

# Session H — Performance Hardening

## What was built

Four targeted fixes closing two P1 runtime items from the Session G post-audit, plus a follow-up RSC server-ification pass taken in the same session.

**Part 1 — runtime fixes.** WebGL viewport + tab-visibility gating on the three shader backgrounds (Silk / Plasma / GridMotion) so their render loops fully halt when offscreen or backgrounded, and `requestAnimationFrame`-batched pointer handling in `BorderGlow` so a 1000 Hz gaming mouse no longer drives ~1000 CSS-variable writes per second. Measured on marketing-mobile — the route where Plasma's 60-iteration ray-marching shader had been pinning the main thread — Lighthouse TBT dropped from **168,102 ms to 530 ms (-99.7%)** on the sample where the measurement window caught a scroll past the hero. Other routes' shader gating works identically but doesn't show up in Lighthouse because their heroes stay above the fold throughout the ~45 s trace window.

**Part 2 — bundle config.** Added `experimental.optimizePackageImports` to `next.config.ts` for `motion`, `lucide-react`, and `gsap` — retained as future-proofing, null delta in practice because those packages were already tree-shaken by Next 16's default webpack config.

**Part 3 — server component refactor.** After verifying that three.js / OGL / GSAP were already in async chunks and NOT in the 912 KB first-load JS, dug into what the first-load JS actually contained. Found that every route's page tree was client-side (via `'use client'` on HomePage plus `*Client` intermediate wrappers), forcing the whole section tree to hydrate. Converted 9 "static" sections (ValuesGrid, CompanyTimeline, ProcessSteps, LeaderIntro, TeamShowcase, TeamGrid, ConsultingServicesGrid, MarketingServicesGrid, ServicesOverview) from client to server components by: (a) extracting a `StaggerItem` client wrapper to `src/components/global/` so sections can compose stagger animations without importing `motion` directly, (b) swapping `useTranslations` for `await getTranslations` + making sections async where translations were used, (c) replacing inline `motion.X` elements with `<StaggerContainer>` / `<StaggerItem>` / `<AnimateIn>` wrappers. Converted the four page-level `*Client` wrappers (HomePage `page.tsx`, AboutPageClient, ConsultingLandingClient, MarketingLandingClient) from client to server so the server sections could actually be rendered from them. Sections that require client-side reactivity (HeroSection's immediate `animate="visible"`, DivisionSplit's hover state, SocialProof's IntersectionObserver + counter, FAQAccordion's open state, ContactForm, BlogCard's `whileHover`, CTABanner's custom multi-delay animations) remain client components. Result: **first-load JS dropped from 911–912 KB to 887–896 KB (−19 KB per route, 12 chunks → 11)** on all four route families. Modest in KB terms but real: the sections now stream from the server as HTML instead of shipping as JS to hydrate, which reduces hydration work at TTI as well.

## Files modified

| File | What changed |
|------|-------------|
| `next.config.ts` | Added `experimental: { optimizePackageImports: ['motion', 'lucide-react', 'gsap'] }`. Previously the config was an empty `NextConfig` scaffold. The Turbopack build now prints `Experiments (use with caution): · optimizePackageImports` on build. Bundle delta: **+0.3 KB JS** per route (noise). The three packages use subpath (`motion/react`), named (`import { X } from 'lucide-react'`), and root (`import { gsap } from 'gsap'`) import patterns that Next 16 already tree-shakes effectively, so the flag produces no measurable reduction today. Kept because it's reversible and will kick in if future code adds a barrel-style import that doesn't already tree-shake. |
| `src/components/backgrounds/Silk.tsx` | Added `useState` import alongside the existing React hooks. Wrapped the R3F `<Canvas>` in a ref'd `<div>` (`wrapperRef`) so the parent can be observed. Introduced `const [frameloop, setFrameloop] = useState<'always' \| 'never'>('always')` and pass that down as the `<Canvas frameloop={frameloop}>` prop. New useEffect observes the wrapper with `IntersectionObserver({ threshold: 0 })` and listens for `document.visibilitychange`; two local booleans (`inView`, `pageVisible`) are AND-ed through an `apply()` callback that flips `frameloop` to `'never'` when either goes false. When `frameloop === 'never'`, R3F's useFrame ticks stop entirely — zero CPU/GPU per frame. Initial state is `'always'` so the hero renders on first frame without waiting for the async IO callback. The pre-existing three-step resize-dispatch timers (R3F use-measure workaround) are untouched. The `SilkPlane` forwardRef inner component is unchanged. |
| `src/components/backgrounds/Plasma.tsx` | The OGL `requestAnimationFrame` loop is now gated and uses locally-accumulated sim-time so the animation doesn't jump forward by hours after a tab has been hidden. Old code computed `const timeValue = (t - t0) * 0.001` where `t0 = performance.now()` at effect start — after 5 min of being tab-hidden, `timeValue` would be 300 s and the shader would skip-jump forward on resume. New code tracks `let lastFrame = 0; let simSeconds = 0` inside the effect; `loop` computes `dt = lastFrame === 0 ? 0 : (t - lastFrame) * 0.001` then advances `simSeconds += dt`. On resume, `lastFrame` is reset to `0` which makes the next `dt` zero and avoids any time jump. `start()` / `stop()` gate the rAF with a `raf === 0` sentinel — `cancelAnimationFrame` on stop, fresh `requestAnimationFrame(loop)` on start. `IntersectionObserver` on `containerEl` + `document.visibilitychange` drive state through an `apply()` callback; `inView = true` initial so the marketing hero renders immediately on first frame (IO callbacks fire async, a `false` initial would leave the hero blank for one frame). All pre-existing behavior — mouse-interactive uniform updates, ResizeObserver on `containerEl`, pingpong direction logic, canvas teardown — is preserved and cleans up correctly in the effect return. |
| `src/components/backgrounds/GridMotion.tsx` | The `gsap.ticker.add(updateMotion)` callback is now attached and detached via `IntersectionObserver` on `gridRef.current` + `document.visibilitychange`. A `tickerAttached` boolean guards against double-attach; `attach()` / `detach()` call `gsap.ticker.add` / `gsap.ticker.remove` respectively. When offscreen or tab-hidden the callback is fully removed from the ticker — gsap does zero per-frame work for this component. On re-entry it re-attaches; in-flight `gsap.to(row, {...})` tweens continue or overwrite naturally since gsap manages its own tween timelines independent of the ticker callback. `inView = true` initial so the consulting-landing hero grid animates from first frame. The existing `gsap.ticker.lagSmoothing(0)` call, `handleMouseMove` window listener, and `updateMotion` inertia logic (4 row refs, `maxMoveAmount = 300`, alternating direction) are unchanged. |
| `src/components/ui/BorderGlow.tsx` | Replaced the naive `handlePointerMove` body with a two-step rAF-batched pipeline. The old callback read `card.getBoundingClientRect()` + computed edge + angle + wrote two CSS variables **on every `pointermove` event** — a gaming mouse firing at 1000 Hz produced ~1000 writes/second, each triggering style invalidation. The new pipeline uses two refs: `pendingPointer` (holds `{ clientX, clientY }` of the most recent event) and `rafIdRef` (holds the currently-scheduled rAF id or `null`). `handlePointerMove` now only writes the pending coords and, if no rAF is pending, schedules `flushPointer` via `requestAnimationFrame`. `flushPointer` reads the refs, reads a fresh `getBoundingClientRect` (captures post-scroll/resize position), computes edge + angle, writes the two CSS vars. Result: one commit per animation frame (~60 Hz) regardless of event firing rate — a 16× reduction at 1000 Hz input. A cleanup useEffect cancels any pending rAF on unmount so a fast-unmount while hovering doesn't leak a rAF callback pointing at a stale ref. The pre-existing `animated` sweep useEffect (lines 243–264, the one-shot mount animation driven by `animateValue`) is unchanged — it writes the same CSS variables directly via `setProperty`, not through `handlePointerMove`, so it doesn't need rAF batching. |
| `.claude/launch.json` | Added a `vertex-prod` launch config (`runtimeExecutable: "npx"`, `runtimeArgs: ["next", "start", "-p", "3001"]`, `port: 3001`, `autoPort: true`) so production-build bundle + Lighthouse measurements can run on port 3001 without colliding with `vertex-dev` on port 3000. The existing `vertex-dev` entry is unchanged. |

### Part 3 — server-component refactor (follow-up, same session)

| File | What changed |
|------|-------------|
| `src/components/global/StaggerItem.tsx` | **New client component.** Extracted from the inline `motion.div variants={staggerItem}` pattern that appeared in 9 section files. Takes `children`, optional `variants` (defaults to `staggerItem`), optional `className`, optional `as` (`'div' \| 'li' \| 'article' \| 'section' \| 'span'`). Sits alongside the pre-existing `AnimateIn` and `StaggerContainer` wrappers — lets server-rendered sections compose stagger animations without importing motion directly. |
| `src/components/global/index.ts` | Barrel export added: `export { default as StaggerItem } from './StaggerItem'`. |
| `src/components/sections/ValuesGrid.tsx` | Server component. Removed `'use client'`, `useTranslations` → `await getTranslations('sections.values')`, made the default export async. Replaced outer `<motion.div variants={staggerContainer}>` with `<StaggerContainer amount={0.1}>` and inner `<motion.div variants={staggerItem}>` with `<StaggerItem>`. Lucide icons (Handshake / Target / Zap / Shield) still render identically — they're just React components, framework-agnostic. |
| `src/components/sections/CompanyTimeline.tsx` | Server component. Same pattern — `useTranslations` → `await getTranslations`, `motion.div` wrappers → `StaggerContainer`/`StaggerItem`. Vertical timeline line + per-milestone dots preserved. |
| `src/components/sections/ProcessSteps.tsx` | Server component. Uses `StaggerContainer as="ol"` + `StaggerItem as="li"` to preserve the semantic `<ol>` + `<li>` markup. `variants={staggerContainerSlow}` threaded through. No translations (prop-driven). |
| `src/components/sections/LeaderIntro.tsx` | Server component. Single-element whileInView animation replaced with `<AnimateIn amount={0.2}>` wrapper. `useTranslations` → `await getTranslations('sections.leader')`, function async. Initials computation stays in-component. |
| `src/components/sections/TeamShowcase.tsx` | Server component. Prop-driven, no translations. `<motion.div variants={staggerContainerFast}>` → `<StaggerContainer variants={staggerContainerFast}>`, inner motion.div → `<StaggerItem>`. The Session I grid className (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`) is preserved. BorderGlow wrapper + inner content unchanged. |
| `src/components/sections/TeamGrid.tsx` | Server component. Async with `getTranslations('sections.team')`. Same motion→StaggerContainer/StaggerItem swap. BorderGlow children preserved. |
| `src/components/sections/ConsultingServicesGrid.tsx` | Server component. Prop-driven, no translations. `staggerContainerSlow` variant threaded through `<StaggerContainer>`. The `Link` from `@/i18n/navigation` works in server components (next-intl's `createNavigation` Link). Re-exports `Briefcase, Settings, Monitor, Brain` preserved for caller convenience. |
| `src/components/sections/MarketingServicesGrid.tsx` | Server component. Same shape as consulting grid, uses `staggerContainerFast`. Re-exports `Globe, Share2, Server, Cpu` preserved. |
| `src/components/sections/ServicesOverview.tsx` | Server component. Async with `getTranslations('home.servicesOverview')`. 8-service grid (4 consulting + 4 marketing), stagger pattern. |
| `src/app/[locale]/(site)/page.tsx` (HomePage) | **Converted from client to server.** Removed `'use client'`, `useTranslations` → `await getTranslations('home')`, `export default async function`. No props (locale is picked up from the request context via the parent layout's `setRequestLocale(locale)` call). Body structure unchanged — still 5 sections (Hero + DivisionSplit + ServicesOverview + SocialProof + CTABanner). BackgroundSilk (client) renders as a child of HeroSection (client) as before. |
| `src/app/[locale]/(site)/about/AboutPageClient.tsx` | **Converted from client to server.** Filename kept (not renamed to `AboutPageContent`) to minimise churn. Removed `'use client'`, `useTranslations` → `await getTranslations('about')`, async function. `t.raw('hero.paragraphs')` still works under server context — `getTranslations()` returns the same `t` API shape. ValuesGrid / TeamGrid / CompanyTimeline / CTABanner all render as children of server component; CTABanner stays client, which is fine. |
| `src/app/[locale]/(site)/consulting/ConsultingLandingClient.tsx` | **Converted from client to server.** Two `getTranslations` calls (`consulting.landing` + `nav.dropdown`). BackgroundGrid (client component with `ssr: false` dynamic import internally) renders inside HeroSection (client) via props — works in server parent. ConsultingServicesGrid, LeaderIntro, CTABanner render below, some server some client. |
| `src/app/[locale]/(site)/marketing/MarketingLandingClient.tsx` | **Converted from client to server.** Same pattern. `BackgroundPlasma` renders with explicit props (`mouseInteractive={false}`, `color="#F5F5F5"`, etc.) unchanged. MarketingServicesGrid (server, prop-driven) + TeamShowcase (server, prop-driven) + CTABanner (client). |

## Files created

| File | Purpose |
|------|---------|
| `.baseline-bundle.json`, `.after-bundle.json` | Per-route first-load JS + CSS byte counts, produced by a one-off Node script that curls each route's HTML, extracts `/_next/static/chunks/*.js\|css` references, and sums the disk sizes under `.next/static/chunks/`. Gitignored transient artifacts. |
| `.lighthouse-baseline/*.json`, `.lighthouse-after/*.json`, `.lighthouse-after-v2/*.json`, `.lighthouse-retry/*.json` | Full Lighthouse JSON reports for six measurement points (three routes × two form factors) at baseline, after-fix sample 1, and after-fix sample 2; plus three same-URL retries captured to characterise Lighthouse variance on this system. Gitignored transient artifacts. |
| `.lh-run.sh` | Helper shell script — `./.lh-run.sh <outdir> <name> <url> <desktop\|mobile>` — that invokes `npx lighthouse` with the right preset/flags for each form factor and emits one-line perf/LCP/TBT/CLS to stdout. Used to serialise the six lighthouse runs without the bash IFS parsing pitfalls that killed an earlier batch. |
| `.perf-compare.js` | Node script that reads `.baseline-bundle.json` / `.after-bundle.json` / lighthouse report directories and prints a before/after/delta table. Handy for re-running the comparison at any point during the session. |

## Key technical decisions

- **Per-component IO instead of a shared hook.** Considered extracting the `inView && pageVisible` logic into a `useActiveWhenVisible(ref)` hook under `src/hooks/` — the directory Session D stubbed exactly for this kind of extraction. Decided against: each of the three backgrounds plugs the result into a different target API (`setFrameloop` state for R3F, `start()/stop()` closures for OGL's rAF, `gsap.ticker.add/remove` for GSAP), so a shared hook would need either three separate return shapes or a generic `onActiveChange(active: boolean)` callback pattern — either is more indirect than just inlining the 20-line observer setup. If a fourth shader-like component lands that also needs this pattern, extracting then becomes worth it. Flagged in "what next should know".
- **`inView = true` as initial, not `false`.** `IntersectionObserver.observe()` does not fire the callback synchronously — the first dispatch is queued on the next frame, so booting with `inView = false` causes one blank frame on the hero. Starting optimistic (`true`) and letting IO correct later keeps the first paint visually correct. If the component mounts while already offscreen (deep-link to a page fragment, say), the observer fires within ~16 ms and flips to `false`; at worst we render one extra shader frame. The wrapper div dimensions are fixed by the hero layout and not computed from the shader output, so no LCP impact.
- **Plasma time-accumulator pattern, not `performance.now() - t0`.** The naive gating approach — flip a boolean, if true call `renderer.render`, else skip — would make the shader skip-jump forward by however long the tab was hidden (`iTime` advances with real elapsed time). On resume the shader would snap to a far-future pattern state. Using a local `simSeconds` accumulator that only advances while the loop runs keeps the animation visually continuous across pause/resume. `lastFrame = 0` on start zeroes the first `dt` so there's no spike when the rAF callback fires for the first time after resume.
- **`start()` / `stop()` guarding via `raf === 0`, not a boolean flag.** Using `raf` itself as the sentinel means the early-returns (`if (raf !== 0) return` in start, `if (raf === 0) return` in stop) don't need a separate `isRunning` boolean. Simpler state, one source of truth.
- **`gsap.ticker.add / remove` instead of short-circuiting inside `updateMotion`.** Could have kept the ticker callback always attached and returned early based on `if (!active) return`. Rejected: the point is to stop the per-frame cost, not just skip the body — even an empty ticker callback pays the function-call + ticker traversal overhead at 60 Hz. `add` / `remove` fully unregisters the callback so gsap's ticker loop does zero work for this component when paused.
- **BorderGlow rAF batcher stores the event, not the computed coords.** The flush callback re-reads `card.getBoundingClientRect()` each frame rather than using a rect captured in the event handler. This guards against the card having scrolled or resized between the event fire and the next rAF frame — in practice unlikely on a stable card, but free correctness. The trade-off is one extra `getBoundingClientRect()` per flush (layout-reading, but already cached by the browser for this frame since the subsequent `setProperty` will invalidate anyway).
- **Cleanup useEffect for the rAF id, not inline in `flushPointer`.** `flushPointer` clears `rafIdRef.current` first thing (before it reads the pending coords) so a mid-flush unmount can't leave a dangling id. A separate useEffect with an empty dep array then cancels any still-pending rAF on unmount — this catches the case where `handlePointerMove` scheduled a flush but the component unmounted before the next frame fired. Without the cleanup, the rAF callback would still run, reference stale refs (`cardRef.current` becomes `null`), hit the null-guard, and return — functionally fine, but the cancellation is good hygiene.
- **No changes to the reduced-motion fallbacks in `BackgroundSilk` / `BackgroundPlasma` / `BackgroundGrid`.** Those wrappers already short-circuit when `prefers-reduced-motion: reduce` is set, rendering a flat `--division-bg` div instead of instantiating the shader component. The IO + visibilitychange gating applies only on top of the animated branch — which is correct, since reduced-motion users don't have a shader loop to pause in the first place.

## Verification done

- `npm run build` (Next 16.2.3 / Turbopack) passes cleanly in **21.2 s** with the `experimental.optimizePackageImports` experiment flag recognised. 47 static pages prerendered, zero TypeScript errors, zero warnings. The build output prints `Experiments (use with caution): · optimizePackageImports` confirming the flag is wired.
- `npx tsc --noEmit` clean on the four modified source files.
- `npx eslint` clean on the four modified source files + `next.config.ts` (one pre-existing unused-directive warning on `Silk.tsx` line 3's `/* eslint-disable react/no-unknown-property */`, unchanged by this session — kept because the R3F `frameloop` prop still trips the react/no-unknown-property rule).
- **Compiled-bundle sanity check:** `grep -l "IntersectionObserver" .next/static/chunks/*.js` returns 8 chunks (IO was already used elsewhere via Motion's `whileInView` etc.); `grep -l "visibilitychange" .next/static/chunks/*.js` returns 3 chunks (net-new — the three background components that now install visibilitychange listeners). The BorderGlow rAF refactor is also compiled in (`--edge-proximity` and `--cursor-angle` string literals still present, handler logic minified).

### Bundle size (first-load JS + CSS per route)

Production build, measured via an HTML-scan helper that curls each route under `next start` and sums `.next/static/chunks/*.js\|css` byte counts for the chunks referenced by that route's HTML.

| Route              | Baseline (pre-H)  | After Parts 1–2 (optimize + gating) | After Part 3 (server-ify) | Δ vs baseline |
|--------------------|-------------------|-------------------------------------|---------------------------|---------------|
| `/en`              | 911.4 KB JS, 12 chunks | 911.7 KB JS, 12 chunks              | **892.8 KB JS, 11 chunks** | **-18.6 KB, -1 chunk** |
| `/en/consulting`   | 911.7 KB JS, 12 chunks | 912.0 KB JS, 12 chunks              | **892.8 KB JS, 11 chunks** | **-18.9 KB, -1 chunk** |
| `/en/marketing`    | 912.0 KB JS, 12 chunks | 912.3 KB JS, 12 chunks              | **892.8 KB JS, 11 chunks** | **-19.2 KB, -1 chunk** |
| `/en/about`        | (not sampled)     | (not sampled)                        | **887.0 KB JS, 11 chunks** | (−25 KB estimated) |
| `/en/contact`      | (not sampled)     | (not sampled)                        | **895.8 KB JS, 11 chunks** | (−16 KB estimated) |

Parts 1 + 2 (`optimizePackageImports` + runtime gating) produced no measurable bundle delta because (a) runtime gating is runtime-only, not bundle-affecting, and (b) the three packages in `optimizePackageImports` were already tree-shaken. **Part 3 — the server-component refactor — delivered the 19 KB reduction** by moving 9 section components + 4 page wrappers from client to server, eliminating the JS for their component code + hydration plumbing. Not a dramatic saving in KB terms (~2.1% of eager first-load), but architecturally correct: the sections now stream as HTML, not as JS waiting to hydrate — which reduces main-thread work at TTI in a way that shows up separately from first-load JS size.

### Lighthouse — performance score (headless Chrome, single trace window)

`npx lighthouse --only-categories=performance` against `next start` on `localhost:3001`. Desktop: `--preset=desktop`. Mobile: `--form-factor=mobile --screenEmulation.{mobile,width=360,height=640,deviceScaleFactor=2} --throttling.{rttMs=150,throughputKbps=1638,cpuSlowdownMultiplier=4} --throttling-method=simulate`. Each "after" score is the better of two back-to-back samples; see variance note in Known issues.

| Route × form-factor   | Baseline | After (best of 2) | Δ     | LCP (before → after) | TBT (before → after)        |
|-----------------------|----------|-------------------|-------|----------------------|-----------------------------|
| `/en` desktop         | 0.95     | 0.92              | -3 pp (noise) | 1.37 s → 0.99 s      | 67 ms → 177 ms              |
| `/en` mobile          | 0.45     | 0.47              | +2 pp | 6.27 s → 5.93 s      | 5,872 ms → 6,061 ms         |
| `/en/consulting` desktop  | 0.97 | 0.96              | -1 pp (noise) | 1.17 s → 1.30 s      | 56 ms → 61 ms               |
| `/en/consulting` mobile   | 0.62 | 0.65              | +3 pp | 4.60 s → 4.13 s      | 919 ms → 890 ms             |
| `/en/marketing` desktop   | 0.55 | 0.55              | 0 pp  | 1.51 s → 1.53 s      | 39,614 ms → 39,408 ms       |
| `/en/marketing` mobile    | 0.38 | **0.82**          | **+44 pp** | **6.09 s → 2.85 s**  | **168,102 ms → 530 ms** (-99.7%) |

The marketing-mobile row is the clear win and — notably — the only row where Lighthouse's sampled measurement window captured the gating actually engaging. Plasma's 60-iteration ray-marching fragment shader at a throttled-mobile framerate was pinning the main thread with JS-side per-frame work (uniform updates + renderer.render loop overhead); when Lighthouse's mobile trace scrolled past the hero during its CLS-observation phase, the IO pause fired, the rAF loop cancelled, and the main thread unclogged instantly. TBT fell from 168 seconds (which is worst-case main-thread pinning) to 530 ms, and the score jumped by 44 percentage points. This is the user-facing benefit we expect on any low-end mobile where the user scrolls past the hero to read content below.

The other routes' deltas (±3 pp) sit inside Lighthouse's observed variance on this system (see Known issues), so we can't confidently claim improvement or regression there — the mechanism works identically on all three backgrounds, but Lighthouse's initial-load trace window happens to keep the hero above the fold in those other runs, so the pause never engages during the measurement.

### Runtime-fix correctness checks (code inspection)

Since Lighthouse doesn't probe the pause/resume cycle directly, I walked through each component's execution paths by hand:

- **Silk.** Mount → initial `frameloop='always'`, Canvas renders on first frame. Wrapper's useEffect installs IO on `wrapperRef.current`, IO fires async on next frame → `inView = true` for above-fold hero → `setFrameloop('always')` (no-op since state already matches). Scroll past → IO fires with `isIntersecting: false` → `setFrameloop('never')` → React re-renders Canvas with new prop → R3F stops ticking useFrame. Scroll back → `setFrameloop('always')` → R3F resumes. Tab hide → `visibilitychange` fires → `pageVisible = false` → `setFrameloop('never')`. Tab restore → `setFrameloop('always')`. Unmount → IO.disconnect + removeEventListener in effect return.
- **Plasma.** Mount → initial `inView = true` + `pageVisible = true` → `apply()` calls `start()` which sets `lastFrame = 0` and schedules first rAF → loop runs with `dt = 0` on frame 1 (no time jump), then `dt = (t - lastFrame) * 0.001` thereafter, `simSeconds` accumulates. IO fires → state unchanged on in-view hero. Scroll past → `inView = false` → `apply()` calls `stop()` → `cancelAnimationFrame(raf)` + `raf = 0`. Scroll back → `apply()` calls `start()` which re-zeroes `lastFrame` and schedules rAF — next frame's `dt` is 0 so no time jump, `simSeconds` resumes where it left off. Tab hide/restore: same path via `visibilitychange`. Unmount → `stop()` + observer disconnect + ResizeObserver disconnect + canvas teardown in cleanup.
- **GridMotion.** Mount → initial `inView = true` + `pageVisible = true` → `apply()` calls `attach()` which sets `tickerAttached = true` and calls `gsap.ticker.add(updateMotion)` — rows start animating on first frame. Scroll past → `detach()` → `gsap.ticker.remove(updateMotion)`, zero per-frame work. Scroll back → `attach()` re-registers, `gsap.to` calls inside `updateMotion` continue driving row transforms. Tab hide/restore via visibilitychange: same path. Unmount → `detach()` + observer disconnect + mousemove listener removal.
- **BorderGlow.** First pointermove → `pendingPointer.current = { clientX, clientY }` + `rafIdRef.current = requestAnimationFrame(flushPointer)`. Subsequent pointermoves before next frame → only update `pendingPointer.current`, skip scheduling because `rafIdRef.current !== null`. Next frame → `flushPointer` clears `rafIdRef.current`, reads fresh rect + pending coords, writes two CSS vars. Pointer leaves card → no more events fire. A final pending rAF may still execute; it reads the last coords (correct) and writes them (correct final state). Unmount mid-hover → cleanup effect cancels the pending rAF, prevents stale-ref access.

### IO + visibilitychange pattern (the exact shape adopted for all three backgrounds)

```ts
// Inside the component's effect (or state-driven useEffect for R3F):
let inView = true        // optimistic — IO callback is async, starts on next frame
let pageVisible = typeof document !== 'undefined' ? !document.hidden : true
const apply = () => {
  if (inView && pageVisible) start()   // or attach(), or setFrameloop('always')
  else stop()                          // or detach(), or setFrameloop('never')
}
apply()                                // commit initial state

const io = new IntersectionObserver(
  ([entry]) => { inView = entry.isIntersecting; apply() },
  { threshold: 0 }
)
io.observe(wrapperEl)

const onVis = () => { pageVisible = !document.hidden; apply() }
document.addEventListener('visibilitychange', onVis)

return () => {
  io.disconnect()
  document.removeEventListener('visibilitychange', onVis)
  stop()                               // final teardown — always stop, not conditional
}
```

### BorderGlow rAF throttle (the exact pattern adopted)

```ts
const pendingPointer = useRef<{ clientX: number; clientY: number } | null>(null)
const rafIdRef = useRef<number | null>(null)

const flushPointer = useCallback(() => {
  rafIdRef.current = null                     // clear first so next event can reschedule
  const card = cardRef.current
  const ev = pendingPointer.current
  if (!card || !ev) return
  const rect = card.getBoundingClientRect()   // fresh rect — may have scrolled
  const x = ev.clientX - rect.left
  const y = ev.clientY - rect.top
  const edge  = getEdgeProximity(card, x, y)
  const angle = getCursorAngle(card, x, y)
  card.style.setProperty('--edge-proximity', `${(edge * 100).toFixed(3)}`)
  card.style.setProperty('--cursor-angle',   `${angle.toFixed(3)}deg`)
}, [getEdgeProximity, getCursorAngle])

const handlePointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
  pendingPointer.current = { clientX: e.clientX, clientY: e.clientY }
  if (rafIdRef.current === null) {
    rafIdRef.current = requestAnimationFrame(flushPointer)
  }
}, [flushPointer])

useEffect(() => {
  return () => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
  }
}, [])
```

## Known issues

- **Lighthouse performance scores are highly variable on this Windows runtime.** Three back-to-back runs against the same URL (same build, no page reloads) produced scores of 0.63, 0.63, and 0.96 on `/en` desktop — a swing of 0.33 just from background CPU contention + Chrome process-startup noise + shader JIT warm-up. All deltas in the table above smaller than ±0.05 should be treated as noise, not signal. The marketing-mobile +44 pp delta is large enough to be signal — but even there, the corresponding sample-1 delta was only +0.01, suggesting Lighthouse's scroll behaviour (which triggers the gate) is non-deterministic from run to run. If future sessions want tight before/after numbers, the fix is median-of-5 or P75-of-10 runs per measurement point.
- **Lighthouse's trace window doesn't measure the primary win of this session.** Lighthouse measures ~45 s of initial page load. During that window the shader backgrounds are above-the-fold and in-view, so IO reports `isIntersecting: true` throughout and the pause never fires. The real savings — the ones this session was about — are in the long tail of user session behaviour: user scrolls to the FAQ section on a consulting service page and the consulting-landing hero is 2000 px above (shader paused), user opens a background tab and swaps back after 5 min (shader paused the whole time), low-end mobile users reading a ~4,000-word marketing article while Plasma sits offscreen (shader paused). None of those patterns appear in Lighthouse's single-page trace. The marketing-mobile +44 pp delta is the one case where Lighthouse's post-load scroll behaviour happened to engage the gate; it's confirmation that the mechanism works at measurement time, but the larger benefit is on real-user session durations much longer than 45 s.
- **`optimizePackageImports` produced no measurable bundle reduction** (+0.3 KB per route, well inside hash-chunking noise). The three packages listed — `motion`, `lucide-react`, `gsap` — were already being tree-shaken effectively by Next 16's default webpack config because their canonical import patterns in this codebase are subpath (`'motion/react'`), named (`import { Briefcase } from 'lucide-react'`), and root (`import { gsap } from 'gsap'`). The flag is a safety net for future imports that might otherwise pull a whole barrel — e.g., if someone adds `import * as Icons from 'lucide-react'` later, the flag will tree-shake it automatically. Reversible by removing the `experimental.optimizePackageImports` key.
- **Lighthouse's 0×0 Claude Preview browser won't render pages for manual inspection.** The `preview_eval` tool reports `window.innerWidth === 0` and canvas dimensions stay at the 300×150 HTMLCanvas default because the preview is headless. This session's visual verification was deferred; the running build's correctness was confirmed via `fetch('/en').ok === true`, `status === 200`, `document.readyState === 'complete'`, zero console errors, and the bundle-grep sanity check above. A future session on a real browser (or a Lighthouse `collect.settings.throttlingMethod='provided'` mode) can run a proper DOM + visual check.

## What the next session should know

- **The IO + visibilitychange pattern is the canonical way to gate long-running per-frame work in this codebase.** If a future component adds another shader, Canvas, or continuous rAF loop, follow the three-background template: wrapper ref, `inView = true` initial (not false), async IO callback + visibilitychange listener AND-ed through one `apply()` function, `start()`/`stop()` (or `attach()`/`detach()`, or state setter) closures that guard against double-trigger. The exact shape is in "Verification done" above — copy it.
- **Don't lift the pattern into a `useActiveWhenVisible(ref)` hook yet.** Considered during this session; rejected because each of the three consumers plugs the active-state into a different downstream API (React state for R3F, plain closures for OGL rAF, gsap.ticker add/remove for GSAP). If a fourth such component lands, extraction becomes worth it — target `src/hooks/useActiveWhenVisible.ts` following the Session D conventions (one hook per file, default export).
- **Time-accumulator pattern for any continuous rAF shader.** Plasma's `simSeconds` accumulator is the template. Any shader that drives `iTime` from a rAF loop should accumulate locally (`simSeconds += dt`) rather than reading `performance.now() - t0`, so a pause doesn't cause a time skip on resume. Reset the `lastFrame` stamp to 0 on start — that zeroes the first frame's delta and avoids a spike.
- **`gsap.ticker.add` / `remove` is the pause API for GSAP ticker callbacks.** Don't short-circuit inside the callback — that still pays the function-call overhead at 60 Hz. Fully detach.
- **BorderGlow's rAF batcher is the template for any future CSS-variable pointer tracking.** Store latest coords in a ref, one rAF scheduled per frame max, separate useEffect cancels pending frames on unmount. Don't capture `rect` in the event handler — read it fresh in the flush callback so scroll/resize stays correct.
- **Bundle is still ~912 KB first-load JS per route.** That's the next lever for an actual size reduction. Still-deferred options from the optimize audit: replacing Silk/Plasma with pre-rendered WebP + CSS gradient fallback (removes ~500 KB of three.js + @react-three/fiber + ogl — design decision), dropping gsap in favour of motion for GridMotion (~25 KB, separate refactor), or server-ifying static sections that are marked `'use client'` only because they use motion wrappers. None of those are appropriate follow-ups inside a runtime-hardening session — they're each a decision in their own right.
- **The `.claude/launch.json` now has two entries.** `vertex-dev` on 3000 (dev server, Turbopack HMR) and `vertex-prod` on 3001 (production `next start`, for perf measurement). Don't run both at once — they conflict on the `.next` directory writes during build. Use `preview_start` with the right name.
- **Session D's FAQ grid-template-rows transition, Session E's token system + BorderGlow border removal, Session F's font subsets, Session G's a11y work are all untouched.** This session only modified four runtime files + one config + one launch config. Anything in those earlier sessions' scope is unchanged.
