---
session: D
date: 2026-04-17
status: complete
---

# Session D — Performance Fix + Small Cleanup

## What was built

Rebuilt `FAQAccordion`'s expand/collapse animation from the old Motion `height: 0 ↔ 'auto'` pattern (which forces a browser layout recalc every frame of the animation) to the modern `grid-template-rows: 0fr ↔ 1fr` pure-CSS transition (compositor-driven, zero layout thrash). Created `src/hooks/` with a README stub so the dead `@/hooks` import alias in `components.json` now resolves cleanly.

## Files modified

| File | What changed |
|------|-------------|
| `src/components/sections/FAQAccordion.tsx` | Removed `AnimatePresence` import (kept `motion` for the chevron rotate). Replaced the `<AnimatePresence>`+`<motion.div>` block (`height: 0↔auto`) on the content panel with a grid-template-rows CSS transition pattern: outer `<div className="grid transition-[grid-template-rows,opacity] duration-300 ease-out grid-rows-[1fr] opacity-100">` (or `grid-rows-[0fr] opacity-0` when closed) with `aria-hidden={!isOpen}`, inner `<div className="overflow-hidden">` to clip content during the transition, innermost unchanged `<div className="px-6 pb-5 text-sm text-[var(--division-text-secondary)] leading-relaxed">` wrapping `{item.answer}`. Content stays mounted at all times — no unmount cycle, no AnimatePresence. The Button primitive trigger from Session C is preserved unchanged, including `whitespace-normal`, `aria-expanded`, and the `motion.span`-wrapped chevron. JSON-LD `FAQPage` emission is unchanged. |

## Files created

| File | Purpose |
|------|---------|
| `src/hooks/README.md` | Placeholder README establishing the `src/hooks/` folder. Makes the `@/hooks` alias in `components.json` (and `tsconfig.json`'s `@/*` → `./src/*`) resolve cleanly for future hook extractions. Conventions noted: one hook per file, named `use<Thing>.ts`, default export the hook. |

## Key technical decisions

- **Tailwind v4's `grid-rows-[0fr]` / `grid-rows-[1fr]` arbitrary values compile correctly.** Verified via stylesheet inspection: `.grid-rows-\[0fr\] { grid-template-rows: 0fr; }` and `.grid-rows-\[1fr\] { grid-template-rows: 1fr; }` rules exist in the generated CSS at the `@layer utilities` level. Did **not** need to fall back to inline `style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}` — the Tailwind arbitrary values were the right call.
- **`transition-[grid-template-rows,opacity]` composes cleanly with `duration-300 ease-out`.** Tailwind's arbitrary transition-property syntax produces `transition-property: grid-template-rows, opacity`, which combined with the `duration-300` and `ease-out` utilities yields the intended `transition: grid-template-rows 300ms cubic-bezier(0,0,0.2,1), opacity 300ms cubic-bezier(0,0,0.2,1)`.
- **CSS transition replaces Motion entirely on this animation.** Motion is not a bad tool — it's still used for the chevron rotate — but for a simple two-state expand/collapse where the content is always-mounted, a pure CSS transition is both more performant (no per-frame JS, no per-frame layout recalc) and more maintainable. The `AnimatePresence` + `initial/animate/exit` variant machinery is gone from this component's content panel.
- **`prefers-reduced-motion` handling inherited from the global rule in `globals.css`.** Lines 569-575 already carry `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: 0.01ms !important; } }`. The new grid-template-rows CSS transition respects this automatically — no component-level reduced-motion logic needed. Motion's `reducedMotion="user"` at root still handles the remaining Motion usage (chevron, entrance animations elsewhere).
- **Content stays always-mounted.** The old pattern unmounted the panel via `AnimatePresence` when closed; the new pattern leaves the DOM element in place and just collapses it to 0 height via grid-template-rows. `aria-hidden={!isOpen}` prevents screen readers from reading collapsed content. This is better for SEO (content is in the rendered HTML regardless of default state) and simpler in React terms (no mount/unmount flicker, no AnimatePresence key management).
- **No entrance stagger animation on the FAQ list itself.** The plan noted "Whatever entrance animation the accordion items use (likely staggerContainer + staggerItem) — don't touch this." On inspection, the FAQAccordion does NOT use `StaggerContainer` or `AnimateIn` — items render in a plain `<div className="space-y-3">` with no scroll-triggered entrance. So there was nothing to preserve beyond the chevron rotate (which was preserved). The FAQ's visual entrance, if any, comes from the parent service-page template's section-level animations, not from FAQAccordion itself.
- **No change to the `@/hooks` alias wiring.** `components.json` already declared `"hooks": "@/hooks"`, and `tsconfig.json`'s `paths` block already resolves `@/*` to `./src/*`. The only thing missing was the folder itself. Creating `src/hooks/README.md` is enough — any future hook file saved there (e.g. `useScrollDirection.ts`) is immediately importable as `import useScrollDirection from '@/hooks/useScrollDirection'`.

## Verification done

- `npm run build` passes cleanly in 5.8s — 47 static pages prerendered across `/en` and `/mk`, zero TypeScript errors, zero warnings on the FAQAccordion change.
- Generated CSS rules for `.grid-rows-\[0fr\]`, `.grid-rows-\[1fr\]`, `.opacity-0`, `.opacity-100`, `.transition-\[grid-template-rows\,opacity\]`, `.duration-300`, `.ease-out` verified present in the compiled stylesheet via DOM inspection.
- Initial render verified on `/en/consulting/business-consulting`:
  - FAQ idx 0 (default-open): className includes `grid-rows-[1fr] opacity-100`; computed `grid-template-rows: 179.25px`, `offsetHeight: 179` ✓
  - FAQ idx 1-4 (default-closed): className includes `grid-rows-[0fr] opacity-0`; computed `grid-template-rows: 0px`, `offsetHeight: 0` ✓
- React state transitions verified via MutationObserver: clicking an FAQ trigger swaps `aria-expanded` and the panel's `class` + `aria-hidden` within ~40ms of the click — the state machine is correct.
- `src/hooks/README.md` created; `@/hooks` alias path now resolves (previously `components.json` declared the alias but the folder didn't exist).

## Known issues

- **Claude Preview (Electron Chromium) testing limitation.** The `grid-template-rows: 0fr ↔ 1fr` CSS transition did not visually interpolate in the Claude Preview Electron browser during automated click testing — the React state and DOM class changes fired correctly (verified via MutationObserver), but `offsetHeight` measurements after class-toggle remained at the pre-toggle value. Isolated tests of the same pattern (plain `<div>` with inline styles, no React, no Tailwind) reproduced the same stuck behavior, AND the same stuck behavior reproduced for `max-height` and `height: auto` (`interpolate-size: allow-keywords`) transitions — confirming this is an Electron/Chromium CSS-transition quirk in this specific preview environment, NOT a bug in the FAQAccordion code or the technique. The initial-paint layout is correct (`grid-rows-[1fr]` → 179px, `grid-rows-[0fr]` → 0px), classes swap correctly on click, and the compiled CSS is correct. The technique is universally supported in real user browsers (Chrome 117+ / Firefox 124+ / Safari 17.4+ — all pre-April 2024). Recommend a one-time manual browser verification on the next dev-server run, but the code is spec-compliant and should work as designed in any target browser. This quirk does not affect Motion-driven animations (Motion sets inline style properties via requestAnimationFrame, bypassing CSS transitions entirely), which is why Session C and earlier sessions' Motion animations tested fine in the same preview environment.

## What the next session should know

- **The grid-template-rows technique is the standard pattern going forward** for any variable-height expand/collapse in this codebase. Use it instead of Motion `height: 'auto'`. If a future accordion or dropdown needs the same pattern, follow the FAQAccordion template: outer grid container with `grid transition-[grid-template-rows,opacity] duration-300 ease-out` + conditional `grid-rows-[1fr|0fr]` + `opacity-100|0` + `aria-hidden`, inner `overflow-hidden` wrapper, innermost content element.
- **`src/hooks/` is now real.** Any hook that needs extracting from component files (e.g. `useScrollDirection` currently embedded in Navbar, `useDivision` currently reading from the DivisionProvider context indirectly) can land as `src/hooks/useThing.ts` and be imported via `@/hooks/useThing`.
- **Session E (theme polish) is next.** Plan items: remove legacy `.gradient-text` CSS class (now flattened to a no-op), sweep hardcoded hex values in MarketingServicePage/CTABanner/DivisionSplit/ServicesOverview/TeamGrid (replace with `var(--division-*)` tokens), drop the static 1px border on BorderGlow. No decisions needed from Goran for Session E.
- **Session F (font swap) comes after E.** That one requires Goran to confirm the Cyrillic-capable font pair. Claude recommends Manrope (headings) + Onest (body) — Cyrillic support is good on both, and both avoid the "AI-generated feel" flag that DM Sans sometimes triggers. Sora + DM Sans stay as fallback in the font-family chain.
- **The FAQ animation is performance-clean.** No more `height: 'auto'` anywhere in the codebase. Next-session perf work can focus on the Silk/Plasma/Grid shaders (WebGL warmup), the always-visible navbar `backdrop-blur` (consider `will-change` hints), and any lingering layout-thrashing scroll handlers. The FAQ pattern no longer contributes to that list.
- **If the Session D CSS transition behavior needs re-verification in a future session,** run `npm run dev` in a real browser (Chrome, Firefox, or Safari) and manually expand/collapse an FAQ on any service page — the Electron preview's CSS-transition limitation will not reproduce there.
