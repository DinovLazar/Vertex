# Session — Silk Visibility + Scroll-Resume Fix

Date: 2026-04-24

## What was fixed

Two small but visible homepage Silk hero bugs closed in one focused pass. Both were tiny (a handful of lines across three files).

1. **Light-mode visibility — silk pattern was barely perceptible.** L6's combo of `--silk-opacity: 0.3` + near-white `SILK_COLOR_LIGHT = #D8DCE2` produced a wave pattern that read past "subtle" into "barely there" on most displays. Root cause: both dampeners (opacity AND the near-white uColor) stacked in the same direction. Retuned to `--silk-opacity: 0.55` and `SILK_COLOR_LIGHT = #C5CBD3` so the troughs have visible structure against the `#FFFFFF` page background without competing with the hero headline.
2. **Scroll-resume snap — silk pattern jumped when scrolling back up to the hero.** Session H's IntersectionObserver + `visibilitychange` gate flips `<Canvas frameloop>` between `'always'` and `'never'` to halt the render loop when offscreen. R3F's internal clock keeps ticking in wall-clock time during the pause, so the first `useFrame` tick after resume received a delta equal to the full pause duration (a 3-second pause → `uTime += 0.1 * 3 = 0.3` in one tick), visibly snapping the shader pattern forward. Root cause: delta is wall-clock, not frame-integrated. Fix: clamp the delta at `1 / 30` s (~33ms) inside the `useFrame` callback before scaling into `uTime`.

## Files modified

| File | What changed |
|------|-------------|
| `src/app/globals.css` | `--silk-opacity` light value: `0.3` → `0.55`. Dark value unchanged (`1`). Block comment extended to document the retune: L6's pairing of `0.3` + near-white `SILK_COLOR_LIGHT` pushed visibility past subtle into barely-there; `0.55` (paired with a slightly darker `SILK_COLOR_LIGHT` in `BackgroundSilk.tsx`) keeps the headline dominant but makes the flow texture legible. |
| `src/components/backgrounds/BackgroundSilk.tsx` | `SILK_COLOR_LIGHT` constant: `#D8DCE2` → `#C5CBD3`. `SILK_COLOR_DARK` unchanged (`#2A2D33`). Block comment updated to record both retunes (L6: `#CDD1D7 → #D8DCE2` paired with opacity `0.3`; this session: `#D8DCE2 → #C5CBD3` paired with opacity `0.55`). At `0.55` the colour can sit slightly darker than the `0.3`-era near-white because the opacity is doing less of the dampening; troughs still render as atmospheric light-gray on the white page, not as hard dark lines. |
| `src/components/backgrounds/Silk.tsx` | `useFrame` callback body extended — introduced `const MAX_DELTA = 1 / 30` and `const dt = delta > MAX_DELTA ? MAX_DELTA : delta` before the `uTime` write. The `0.1 * delta` scale now uses `dt` instead of `delta`. Explanatory comment inline explaining the IO/visibility gate, why R3F's wall-clock delta leaps on resume, and why `~33ms` is the right clamp ceiling (normal 60/30 fps frames are always at/below the clamp, so only the resume tick is affected — no steady-state behaviour change). IO + visibilitychange gating itself untouched (it's the reason Session H drove marketing-mobile Lighthouse TBT from 168s → 0.5s — load-bearing). |

## Project-state docs updated

| File | What changed |
|------|-------------|
| `src/_project-state/current-state.md` | Bumped "Last updated" date + last-completed label. Prepended a new "What works right now" bullet summarising both fixes (with the root-cause notes). Removed the two stale follow-up bullets that referenced the pre-session state: the "Silk light-mode color tuning (optional micro-phase)" entry under "What comes next" and the "Silk shader (homepage hero) reads heavier than ideal in light mode" entry under "What is placeholder / incomplete". Both are closed now — keeping them would mislead the next session. |
| `src/_project-state/file-map.md` | Bumped date. `BackgroundSilk.tsx` row extended with the new `SILK_COLOR_DARK = #2A2D33` / `SILK_COLOR_LIGHT = #C5CBD3` values and the `0.3 → 0.55` opacity retune note. `Silk.tsx` row extended with the delta-clamp note. `globals.css` row's L6 silk-opacity line updated from `0.3` to `0.55` with a forward-reference to `BackgroundSilk.tsx` for the paired colour retune. |
| `src/_project-state/session-silk-visibility-scroll-fix.md` | This file — created following the `session-a_social-privacy.md` / `session-b_contact-newsletter.md` / `session-c_accessibility.md` template. |

## Key technical decisions

- **Why `0.55` and not a higher or lower value.** Tried empirically. `0.3` (L6's choice) was definitely too low — the pattern was barely discernible on a normal-brightness laptop display. `0.70` was too much — at that level the headline starts having to fight the wave crests for visual weight. `0.55` lands the pattern clearly in "visible atmospheric texture" territory while the bold 700-weight headline stays the dominant feature of the hero. The value was picked pairing with the colour retune (`#D8DCE2 → #C5CBD3`) — the two together do the work, neither alone. At a higher opacity we'd want a lighter colour; at a lower opacity we'd want a darker one. This pairing is the equilibrium point.
- **Why the colour moved too (not just the opacity).** Opacity and colour are interacting dampeners with different failure modes. Pure opacity bumping (`0.3 → 0.55` with `#D8DCE2` unchanged) produces visible texture but every trough paints at a muddy indistinct value — the pattern has range but no edges. Pure colour darkening (opacity `0.3` unchanged, `#D8DCE2 → #C5CBD3`) was tried and still reads too pale. Moving both together gives visible *structure* (the troughs actually have shape against the white page) without losing the atmospheric quality.
- **Why clamping delta at `1 / 30` is safe.** The shader's `uTime` advances by `0.1 * delta` per frame. At 60 fps (steady state), delta is ~`0.0167`s and the per-frame advance is `~0.00167`. At 30 fps, delta is ~`0.0333`s and the per-frame advance is `~0.00333`. The clamp at `1 / 30 = 0.0333` is exactly the 30fps ceiling, so any normal frame (60 or 30 fps) slides under the clamp and behaves identically to the pre-clamp code. Only the resume tick — which carries the full pause duration as wall-clock delta — hits the clamp and gets absorbed. Zero steady-state impact; full resume-snap mitigation.
- **Why not change the gating itself.** The gating (Session H's `frameloop 'never' ↔ 'always'` via IO + visibilitychange) is load-bearing. It's the reason the marketing-mobile Lighthouse TBT collapsed from 168,102 ms to 530 ms and the homepage stops burning CPU/GPU when the user scrolls below the hero or hides the tab. A "fix" that disables the gate would fix the snap by never pausing, which would regress the battery-and-CPU wins the site currently ships with. The right layer to address the resume artefact is inside the `useFrame` callback, which is what the clamp does.
- **Why not use R3F's `invalidate()` + manual-demand rendering.** An alternative shape would be to switch the Canvas to `frameloop="demand"` and call `invalidate()` on a rAF inside the component. That'd give us full control over the timing but would be a substantially larger change — it rewrites how Silk animates rather than fixing the narrow bug. The clamp is one line of logic at the exact point of the leak; the rewrite is overkill.

## Verification

**Build — clean.**

- `npm run build` — 48/48 static pages generated, TypeScript 19.2s clean, Turbopack compile clean, zero errors, zero new warnings. Only output-level messages are the pre-existing Lightning-CSS `z-index` warnings that predate this session.

**Runtime — verified in the browser preview on `/en`.**

| Signal | Dark | Light |
|--------|------|-------|
| `<html data-theme>` | `dark` | `light` |
| `--silk-opacity` (computed from `html`) | `1` | `0.55` |
| Silk wrapper `opacity` (computed from `.absolute.inset-0.z-0`) | `1` | `0.55` |
| Canvas count | `1` | `1` |
| Hero bg visual | bright silk pattern on `#141414` — visually identical to pre-session (byte-identical for this path) | clearly visible soft-gray flowing texture on `#FFFFFF`; headline ("We help businesses grow smarter.") is the dominant element; subtitle reads cleanly |

**Scroll-resume smoothness — verified in both themes.**

Procedure: scroll to bottom of the page, wait 3–3.5 seconds (silk wrapper rect confirmed offscreen with `rect.top ≈ -5000px`), scroll back to top, screenshot immediately on resume. Expected without the clamp: visible pattern snap on the first resume frame. Expected with the clamp: pattern resumes smoothly from where it paused.

Both light-mode and dark-mode scroll-down-wait-scroll-up cycles produced continuous, non-broken silk pattern states on resume — no blank canvas, no flash, no obvious "jump to a new position" artefact. The clamp absorbs the ~3-second wall-clock delta on the resume tick (would have been `uTime += 0.3` without the clamp → clearly visible snap; is now `uTime += 0.00333` → one normal frame of advance, indistinguishable from continuous animation).

Note on verification depth: R3F's scene graph isn't directly accessible via DOM/`__reactFiber` walk (the mesh is created inside R3F's custom reconciler, not in the React DOM tree), so the `uTime` uniform value can't be read out from an external eval. Verification fell back to: (a) direct source-level confirmation that the clamp expression is present and correct, (b) visual confirmation that the pattern resumes smoothly via screenshot, (c) console/error check returning clean.

**No console errors.** `preview_console_logs level=error` returns empty across the test sequence (scroll-down, wait, scroll-up, theme-flip, re-scroll).

**Dark-mode regression — visually identical.** Dark-mode `--silk-opacity` remains `1` (unchanged); `SILK_COLOR_DARK` remains `#2A2D33` (unchanged). The delta clamp is a no-op in steady state (30 and 60 fps deltas are always at or below `1/30`), so dark-mode rendering is byte-identical to pre-session frame-for-frame during normal animation and visually indistinguishable during resume.

**Reduced-motion fallback — unchanged.** `BackgroundSilk` component's reduced-motion branch (no Canvas, flat `var(--division-bg)` div) was not touched. Users with `prefers-reduced-motion: reduce` continue to see the static fallback with no shader activity.

## Known follow-ups

None. Both issues are fully closed.

## What the next session should know

- **Silk light-mode tuning is settled.** The pre-session backlog in `current-state.md` carried two separate silk-related open items (a "light-mode color tuning" follow-up under "What comes next" and a "reads heavier than ideal in light mode" entry under "What is placeholder / incomplete"). Both are removed as of this session. Future sessions should treat `--silk-opacity: 0.55` + `SILK_COLOR_LIGHT: #C5CBD3` as the tuned equilibrium and not revisit without new evidence that one or the other failure mode has returned.
- **Delta clamping is a generic pattern for R3F + `frameloop="never"` gating.** Both other backgrounds in this codebase already accumulate sim-time locally rather than use raw wall-clock delta: `Plasma.tsx` uses a `simSeconds` accumulator with `lastFrame = 0` on start, and `GridMotion.tsx` uses `gsap.ticker` which gsap internally handles. Silk was the exception because it used `useFrame((_, delta) => ...)` directly. If a new animated hero component ever gets added and uses the same pattern, apply the same clamp (~33ms ceiling) before scaling into any time uniform.
- **Do NOT disable the IO/visibilitychange gate to "fix" rendering behaviour.** If a future session hits a silk-rendering issue and is tempted to remove the `frameloop` flip — don't. The gate is load-bearing performance work from Session H. Fix the behaviour inside `useFrame` or at the uniform-update layer.
- **Scope boundary held.** Three files touched in this session. No changes to the IO/visibilitychange gating itself, no changes to the reduced-motion fallback, no changes to any other background, no changes to unrelated components. Two tuning constants + one delta clamp + explanatory comments.
