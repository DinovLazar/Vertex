# Session — Cursor & Micro-Interactions (from Claude Design spec)

Date: 2026-06-24

Implemented the nine micro-interactions from the locked Claude Design motion
handoff, wired into the **real** Vertex components using its existing patterns
(motion v12 `motion/react`, CSS keyframes, the View Transitions API, the Web
Animations API). This was a surgical polish pass — additive or surgical, never
a rebuild. No prototype harness was ported. **Grayscale only in both themes**
(no hue anywhere — confetti, ring, sheen are all white/gray), and **every**
interaction has a documented reduced-motion fallback.

---

## The nine interactions (locked values)

1. **Theme transition — circular View-Transition wipe.** Click the sun/moon →
   the new theme grows over the old as a circle expanding from the button,
   **520ms**, easing **`cubic-bezier(0.4, 0, 0.2, 1)`**, radius = distance to
   the furthest viewport corner. JS-driven via the View Transitions API +
   WAAPI on `::view-transition-new(root)`. The default UA cross-fade is
   disabled in CSS so JS owns the clip. Reduced-motion / unsupported /
   aborted-`ready` → instant hard cut (the theme flip still commits).
   - `globals.css`: `::view-transition-old(root), ::view-transition-new(root) { animation: none }` (+ reduced-motion repeat).
   - `ThemeProvider.tsx`: `setThemeAnimated(next, origin?)`; `toggleTheme(origin?)`; `VT_DURATION = 520`.
   - `ThemeToggle.tsx`: `onClick={mounted ? (e) => toggleTheme({ x: e.clientX, y: e.clientY }) : undefined}`.

2. **Typing indicator — soft wave.** Three dots, **7px**, **6px** gap, rest
   opacity **0.35**, crest **1.0** with a **~2.5px** upward lift, staggered so
   a wave travels left→right; bubble fades in/out **220ms**.
   - `globals.css`: `.typing-dot` (7px, `--division-text-muted`) + `:nth-child(2)`/`(3)` delays `0.095s`/`0.19s`; `@keyframes typing-dot-wave` (`0%,70%,100%` rest → `35%` crest); reduced-motion sets `animation:none; opacity:0.7; transform:none`.
   - `TypingIndicator.tsx`: removed the inline `animationDelay` styles so the CSS `:nth-child` stagger owns the ripple; container keeps `gap-1.5` (= 6px).
   - `ChatPanel.tsx`: the typing bubble is wrapped in `AnimatePresence` with a 0.22s `easeInOut` fade.

3. **Send fly-out — paper plane.** Snappy out, soft in. Out **380ms**
   **`cubic-bezier(0.36, 0, 0.66, -0.2)`**; In **266ms**
   **`cubic-bezier(0.22, 1, 0.36, 1)`**. The send button has **no
   `overflow:hidden`** so the plane visibly exits the circle.
   - `ChatPanel.tsx`: `launchKey` state (bumped in `handleSubmit`), `planeVariants` (typed `Variants`), `<AnimatePresence mode="wait">` wrapping the `SendIcon` in a `motion.span`. The `.cta-sheen` class was deliberately **not** added to the send button.

4. **Subscribe pop — grayscale confetti.** **18** particles fired up in a
   **74°** cone, light gravity, fade. Mixed round/square, deliberately sparse.
   Easing **`cubic-bezier(0.2, 0.7, 0.3, 1)`**, **900ms × 0.7–1.2** per
   particle. Grayscale only, theme-aware.
   - New file `src/components/ui/Confetti.tsx`.
   - `Footer.tsx`: the newsletter `<form>` is now the `position:relative` anchor and renders `{newsletterStatus === 'success' && <Confetti />}`.

5. **Magnetic CTAs.** Within `max(w,h)/2 + 80px` of a prime CTA it eases toward
   the cursor by **0.30×** the offset, clamped to **12px**; springs back on
   leave; **0.94** scale squish on press. Spring **stiffness 170 / damping 26 /
   mass 1**.
   - New file `src/components/ui/MagneticButton.tsx`.
   - Applied to: HeroSection's two hero buttons, Navbar's desktop "Get in Touch", Footer's Subscribe, CTABanner's CTA. Nothing else.

6. **Footer link underline.** Hairline draws in from the left on hover,
   retracts on leave. **1.5px**, **3px** below baseline, full width, **280ms**
   **`cubic-bezier(0.4, 0, 0.2, 1)`**; color text2 → text on hover.
   - `globals.css`: `.footer-link` + `::after` (scaleX 0→1 from the left).
   - `Footer.tsx`: `.footer-link` on the consulting/marketing/company column links (redundant Tailwind color utilities dropped — `.footer-link` owns color).

7. **Nav link hover.** Top-nav items brighten text2 → text and grow a 1.5px
   underline from the left, **280ms**. Pure CSS, same language as the footer.
   - `globals.css`: `.nav-link` (background-image gradient, `background-size: 0% → 100% 1.5px`).
   - `Navbar.tsx`: `.nav-link` on the 5 top-level labels, **omitted on the active item** (which keeps its inline accent color + `layoutId` underline) so the two never double up.

8. **Chat launcher pulse — aligned, not duplicated.** One slow halo, scale **1
   → 1.6**, opacity **0.5 → 0**, **2400ms** linear loop, **1.5px** ring colored
   `var(--division-text-primary)`, behind the 56px button, off under reduced
   motion. Reworked the existing `chat-trigger-pulse` rather than adding a
   second ring.
   - `globals.css`: `@keyframes chat-trigger-pulse` rewritten (scale/opacity); the `.chat-trigger` animation became a scaling `.chat-trigger::before` ring (z-index −1, `pointer-events:none`); reduced-motion sets the ring `animation:none; opacity:0`. It rides the trigger's opacity, so it fades out for free when the panel opens.

9. **Button sheen.** On hover of a solid CTA a soft diagonal gray band sweeps
   once, left→right. **620ms** **`cubic-bezier(0.4, 0, 0.2, 1)`**, band **40%**
   width, **`skewX(-18deg)`**, clipped to the button. Neutral gray gradient
   only. Composes with the magnetic effect.
   - `globals.css`: `.cta-sheen` (`isolation:isolate` + a z-index −1 `::after` band) + `@keyframes cta-sheen-sweep`.
   - Applied to the SOLID/filled CTAs only: HeroSection's filled "Explore Consulting" (NOT the outline "Explore Marketing"), Navbar's white "Get in Touch", Footer's Subscribe, CTABanner's filled button. Not on the chat send button.

**Step 0 — tokens** added to `globals.css`: `--vt-theme-duration: 520ms`,
`--magnetic-pull: 0.30`, `--magnetic-max: 12px`, `--magnetic-squish: 0.94`
(mirrored by JS constants for record + tuning parity).

---

## Files

**Created (2):**
- `src/components/ui/MagneticButton.tsx`
- `src/components/ui/Confetti.tsx`

**Modified (9):**
- `src/app/globals.css`
- `src/components/global/ThemeProvider.tsx`
- `src/components/global/ThemeToggle.tsx`
- `src/components/global/Navbar.tsx`
- `src/components/global/Footer.tsx`
- `src/components/chat/ChatPanel.tsx`
- `src/components/chat/TypingIndicator.tsx`
- `src/components/sections/HeroSection.tsx`
- `src/components/sections/CTABanner.tsx`

**Docs updated:** `current-state.md`, `file-map.md`, and this file
(`session-cursor-microinteractions.md`).

---

## Key decisions

- **View Transitions WAAPI circular reveal vs CSS.** Chose the JS/WAAPI clip on
  `::view-transition-new(root)` over a CSS-keyframe approach so the WebGL heroes
  (Silk / Plasma / GridMotion) capture as a single snapshot and don't re-render
  through the transition (avoids jank). The default UA cross-fade is disabled so
  the JS animation alone owns the wipe. `transition.ready` is wrapped in a
  `.catch` — when it rejects (rapid double-toggle, or any "invalid state"), the
  theme has already flipped because the update callback always runs.
- **Token-name reconciliation for the typing dots.** The handoff named the dot
  color `--division-text-muted` and annotated it "#A3A3A3 dark / #5F6670 light",
  but in this codebase `--division-text-muted` actually resolves to **#737373
  dark / #5F6670 light** (#A3A3A3 is `--color-muted`). Followed the **named
  token** the handoff wrote in the code block (`--division-text-muted`) — a
  slightly more muted dark dot than the annotation implied, still clearly
  visible across the 0.35→1.0 opacity wave, and consistent with the
  division-token family.
- **Dependency-free grayscale confetti.** No confetti library; an 18-particle
  motion burst with a 3-gray theme-aware palette and a reduced-motion `null`
  short-circuit.
- **Confetti anchor = the newsletter `<form>`, not the button.** The spec said
  the relative anchor wraps the Subscribe button, but the existing success UI
  **replaces** the button with a success message — so an anchor on the button
  would be unmounted at the moment confetti should fire. Anchored the burst to
  the `<form>` (relative) instead; it still fans up over the subscribe region.
  (Deviation from the literal spec, for correctness — see Deviations.)
- **Magnetic via motion `useSpring` at the handoff's 170/26/1** with an 80px
  activation pad and a separate snappier 400/22 spring for the tap squish.
- **MagneticButton uses `cn('inline-flex', className)`** rather than the
  handoff's hardcoded inline `display:'inline-flex'`. This lets the navbar CTA
  pass `hidden md:inline-flex` on the **wrapper** so it's `display:none` on
  mobile — an inline-style display would have beaten a `hidden` class and left a
  phantom `gap-2` flex slot next to the hamburger. Identical behavior for the
  other call sites (which pass no className → `inline-flex`).
- **Sheen uses `isolation: isolate` + `z-index:-1`** so the band sits over the
  white fill but under the label. Verified each labelled CTA still renders
  crisply above the band.
- **Reconciled the existing chat pulse instead of duplicating it.** Reworked
  `chat-trigger-pulse` from a box-shadow ring on the button into a scaling
  `::before` halo, so there's one ring, not two.

---

## Deviations from the spec (and why)

- **Confetti anchor is the `<form>`, not the Subscribe button** — the existing
  success UI swaps the button out, so a button-anchored confetti element would
  not be mounted when `success` is true. Anchoring to the relative `<form>`
  keeps the burst over the subscribe region and honors "Keep the existing
  success message/UI — Confetti is a pure overlay."
- **`MagneticButton` display via class, not inline style** (see Key decisions) —
  required to make the navbar CTA's responsive `hidden md:inline-flex` work on
  the wrapper.

---

## Verification

- **`npm run build` clean — 46/46 static pages**, zero TypeScript errors
  (compile + typecheck both pass). The spec's "≈48" was approximate; 46 is this
  codebase's current full route set. **Zero new Lightning-CSS warnings**: the 6
  pre-existing `z-index is currently not supported` warnings are byte-identical
  between the pristine tree and this change (confirmed by a stash → build →
  compare).
- **Browser preview, `/en` + `/mk`, both themes.** All nine interactions
  verified correct via computed-style + DOM audit (chat ring `1.5px solid
  #F5F5F5` + `chat-trigger-pulse 2.4s` z-index −1; typing dot `typing-dot-wave`
  7px / 0.35 / #737373; `.nav-link` gradient `0% 1.5px` on all 5 labels in both
  locales; `.footer-link::after` scaleX(0); `.cta-sheen` `overflow:hidden` +
  `isolation:isolate` + `::after` 40% band z-index −1 on the correct buttons;
  magnetic wrappers present on the hero ×2 + navbar CTA; send button
  `overflow:visible` + inner plane span). Theme toggle functionally flips +
  persists to `localStorage['vertex-theme']` + re-renders the icon/aria. Light +
  dark render cleanly; **zero console errors**.

### Environment notes (not code defects)
- The production build needs a non-empty `RESEND_API_KEY` because
  `src/lib/resend.ts` constructs the client at module scope and, by Session-B
  design, throws on an empty key. This sandbox has no `.env.local`, so the build
  was run with a throwaway key. Nothing in this session touches contact/email.
- The headless preview page is non-visible, so `requestAnimationFrame` is paused
  — the rAF/visibility-gated **playback** of the theme-wipe clip, magnetic
  spring travel, confetti, plane fly-out, and panel/typing fades could not be
  visually exercised in this environment (the theme wipe's `ready` aborts with
  `InvalidStateError` in headless for the same reason — handled by the `.catch`).
  Their wiring + CSS declarations are all verified; these are standard motion
  patterns that play in a real visible browser tab.

---

## Follow-ups

- **Visual sign-off in a real browser tab** for the five rAF/visibility-gated
  animations that the headless preview can't play (theme wipe, magnetic pull,
  confetti, send plane, typing/panel fades) — confirm timing/feel matches the
  handoff on a normal Chromium tab (and that the wipe falls back gracefully in
  Safari/Firefox where View Transitions support varies).
- **Confetti live-fire test** once the newsletter backend env (`RESEND_*`) is
  present locally, to watch the real `success` → burst path end-to-end.
- Pre-existing, unrelated: the 6 `z-index is currently not supported`
  Lightning-CSS warnings and the `THREE.Clock` deprecation warning remain (both
  predate this session).
