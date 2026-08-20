# Session — MagneticButton hydration mismatch (`tabindex`) — 2026-08-20

## The symptom

In `npm run dev`, every page load logged a React hydration error and the Next.js dev overlay
showed **"1 Issue"**. The printed diff was always the same single attribute — a `tabindex="0"`
on the `<span>` rendered by `src/components/ui/MagneticButton.tsx` — repeated once per
MagneticButton on the page (Navbar CTA, both hero buttons, the CTABanner CTA, the Footer
newsletter Subscribe button):

```
<MagneticButton className="hidden xl:...">
  <motion.span ref={{current:null}} style={{x:{...},y:{...}}} whileTap={undefined} ...>
    <span
      style={{transform:"none"}}
      className="hidden xl:inline-flex"
      ref={function useMotionRef.useCallback}
-     tabindex="0"
    >
```

Pre-existing (dates back to the 2026-06-24 cursor/micro-interactions session that introduced
MagneticButton), unrelated to the `/projects` client-card work it was noticed during.

## Root cause

Nothing in this repo ever wrote a `tabIndex`. **motion writes it, during render, purely because
`whileTap` is present.** `framer-motion/dist/es/render/html/use-props.mjs`:

```js
if (props.tabIndex === undefined &&
    (props.onTap || props.onTapStart || props.whileTap)) {
    htmlProps.tabIndex = 0;
}
```

(The press gesture has a second, later injection — `motion-dom/.../gestures/press/index.mjs`
sets `target.tabIndex = 0` on mount when the element is not natively focusable and carries no
`tabindex` attribute. That one runs in an effect, so it cannot cause a hydration diff, but it
would defeat any fix that only removed the render-time attribute.)

The component gated the prop on the user's motion preference:

```jsx
whileTap={prefersReduced ? undefined : { scale: SQUISH }}
```

`useReducedMotion()` reads `prefersReducedMotion.current`, which `motion-dom` documents as
*"Returns `null` server-side"* and only fills in from `window.matchMedia` on the client. So:

| | `prefersReduced` | `whileTap` | rendered `tabindex` |
|---|---|---|---|
| SSR (always) | `null` | `{ scale: 0.94 }` | `0` |
| client, motion OK | `false` | `{ scale: 0.94 }` | `0` — agrees |
| client, **reduced motion on** | `true` | `undefined` | *absent* — **mismatch** |

Hence "every page load, everywhere MagneticButton is used" **on a machine whose OS reports
`prefers-reduced-motion`**, and no reproduction anywhere else. `MotionConfig reducedMotion="user"`
in `MotionWrapper` does not enter into it — that feeds `useReducedMotionConfig()`, not the
`useReducedMotion()` call here.

## The fix

`src/components/ui/MagneticButton.tsx`, two lines on the `motion.span`:

1. **Squish by value, not by prop presence** — `whileTap={{ scale: prefersReduced ? 1 : SQUISH }}`.
   The prop is now always defined, so no rendered attribute depends on a client-only media query.
   `scale: 1` is a visual no-op, so reduced-motion users still get no squish (this is strictly
   better than leaning on `MotionConfig`: `reducedMotion="user"` does not *drop* a `scale`
   animation, it gives it `{ type: false }` — an instant snap to 0.94 — because `scale` is in
   motion's `positionalKeys`).
2. **`tabIndex={-1}` on the wrapper** — belt and braces for (1), and an accessibility fix in its
   own right.

### Why `-1` is the correct value, not `0`

The wrapper is decorative. Every child MagneticButton wraps is *already* natively focusable — a
`<Link>`, an `<a>`, or a shadcn `<Button>` — and carries the role, the accessible name and the
`focus-ring`. motion's injected `tabindex="0"` therefore added a **second, nameless, roleless tab
stop in front of every prime CTA**, and because a bare `<span>` is not a link, pressing Enter on
it did nothing. Removing it takes each CTA from two tab stops (one dead) to one.

## Verification

Dev server (`npm run dev`), `/en`, `/en/projects`, `/en/blog`:

- **Before/after, under the failing condition.** The VM's browser reports
  `prefers-reduced-motion: no-preference`, so the bug does not reproduce here unaided. Simulated
  it by temporarily swapping `useReducedMotion()` for `useState(() => typeof window !== 'undefined' ? true : null)`
  — the identical SSR-`null` / client-`true` shape. That reproduced the exact reported diff
  (`- tabindex="0"` on five spans, dev overlay `data-error="true"`, badge "1 Issue"); with the fix
  in place and the same simulation still applied, the console is empty and the badge is gone.
- **Normal path**, fresh tab per route: zero console errors, dev-overlay `data-error="false"`,
  no issue badge, on all three pages. Server log clean.
- **Markup determinism**: SSR HTML and post-hydration DOM both carry `tabindex="-1"` on every
  magnetic wrapper; `grep` for a `tabindex="0"` on an `inline-flex` span returns 0 hits on
  `/en`, `/en/projects`, `/en/blog`, `/mk`, `/en/consulting`, `/en/lazar`, `/en/contact`,
  `/mk/blog` — dev *and* in the `next build` prerender output (`.next/server/app/*.html`).
- **Keyboard.** Real `Tab` presses from the top of `/en` at 1440x900 walk
  logo → 5 nav links + 2 disclosure buttons → theme → language → Client Portal → **"Get in Touch"**,
  landing on the `<a href="/en/contact">` itself (`:focus-visible` matches, so the ring shows) with
  no stop on the wrapper. `Tab` from the newsletter input lands on the `<button type="submit">Subscribe</button>`.
  `Enter` on the focused CTA fires a click and navigates to `/en/contact`. The a11y tree exposes the
  wrappers as plain `generic`, with role/name on the children (`link "Get in Touch"`).
- `npm run lint` and `npx tsc --noEmit` clean; `npm run build` succeeds.

**Not verified in this environment:** the press squish itself. The browser pane is not displayed
in this session, so `requestAnimationFrame` never ticks and motion's animation loop does not run —
an untouched `whileTap` elsewhere (`BackToTop`) is equally inert under the same probe, i.e. this is
a harness limit, not a regression. For motion-enabled users the prop value is byte-identical to
before (`{ scale: 0.94 }`), so that path is unchanged by construction.

## Files changed

- `src/components/ui/MagneticButton.tsx` — the two lines above, plus comments recording *why*
  `whileTap` must stay unconditional and why the explicit `tabIndex` exists (both are load-bearing;
  "simplifying" either one reintroduces the mismatch).

## For the next session

- The same trap applies to any `motion` element that takes `whileTap`/`onTap*` conditionally, or
  that puts one on a non-focusable tag: motion will hand it a `tabindex`. `src/lib/animations.ts`
  exports three `whileTap` presets — they are unconditional today (so no mismatch), but if one is
  ever spread onto a `motion.div`, that div becomes a tab stop.
- `ThemeToggle.tsx` has a superficially similar `tabIndex={mounted ? 0 : -1}`; it is **not** a
  mismatch, because `mounted` is `false` on the first client render too and only flips in an effect.
