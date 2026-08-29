# Session L — Phase 18: full-bleed division cards + expand-to-fullscreen transition

**Date:** 2026-08-29
**Branch:** `feat/division-cards-fullbleed-transition` (PR against `main` — **not merged**, left for review)
**Scope:** the homepage "Two divisions. One mission." card row, plus a reusable
navigation-transition provider mounted in the locale layout.

---

## What changed, and why

The section used to be two text-heavy brochure cards: icon, `<h3>` title, coloured
subtitle, a paragraph of description, four service chips, and an "Explore …" arrow
row — roughly 45 words of copy per card, none of it read. It is now the strongest
visual moment on the page: two oversized panels that run off both edges of the
screen, each showing a soft-focus screenshot of the division it links to with a
single word and its tagline on top, and a click that opens that panel out to fill
the whole screen before the page lands. **Less to read, more to feel.**

The section's own eyebrow / heading / sub-copy are untouched — they live one level
up in `[locale]/(site)/page.tsx` and were explicitly out of scope.

### Card geometry

| | Mobile | `md`+ |
|---|---|---|
| Row width / offset | `110vw` at `-5vw` | `112vw` at `-6vw` |
| Aspect ratio | `16/11` | `16/10` |
| Corners | `rounded-2xl` | `rounded-3xl` |
| Columns | 1 (stacked), `gap-4` | 2, `gap-6` |

The row escapes the parent `<Section>`'s `max-w-7xl … px-8` container with
`ml-[calc(50%-50vw)] w-[100vw]`, then the inner grid overhangs that by a further
5–6vw per side. `overflow-x-clip` on the 100vw frame is what turns the overhang into
a design decision rather than a horizontal scrollbar — `clip` rather than `hidden`
so no scroll container is created, the same reasoning as the `html` rule already in
`globals.css`. Measured at 1440px: left card `left: -86px`, right card
`right: 1526px` against a 1440px viewport — cut off by both screen edges, as intended.

### Card contents

Every heading, description and chip came out; the tagline came back on review as a
sub-header. What remains:

- the blurred screenshot (`object-cover`, `blur-[6px]`, `brightness-[0.6]`, `scale-1.12`
  so the blur never feathers to a transparent edge),
- a three-stop `#141414` gradient scrim for legibility,
- one centred word in `font-heading` — `Consulting` / `Marketing`, localized,
- a sub-header under it in `font-body` — the division's existing
  `home.divisionSplit.<key>.subtitle` tagline, `text-balance`, `max-w-[34ch]`, `#C9C9C9`,
- a thin `→` under that, which fades in on hover only,
- an `sr-only` sentence carrying the wording that is still not visible — the full
  division name (`title`) and the old CTA — so crawlers and screen readers keep the
  meaning. The tagline is **not** repeated there now that it is visible, or a screen
  reader would announce it twice.

Verified: `innerText` of a card with the `sr-only` node removed is exactly
`"Consulting\nStrategic clarity for growing businesses\n→"`; the `sr-only` string
shares no phrase with the visible text; zero `<h*>` elements, zero `<svg>`.

Hover is pure CSS on `group-hover` — blur `6px → 3px`, brightness `0.6 → 0.72`,
scale `1.12 → 1.18`, arrow `opacity 0 → 1`. No Motion, so it costs nothing on a page
that already runs a WebGL hero.

### The click transition

`DivisionTransitionProvider` mounts a full-viewport fixed overlay (`z-[120]`,
`pointer-events-none`, `aria-hidden`) whose `clip-path: inset(…)` starts at the
clicked card's on-screen rectangle — border radius included — and animates open.

| Step | Timing |
|---|---|
| Overlay mounts, clipped to the card's rect | 0ms |
| Clip opens to full viewport; image un-blurs 7px → 0px and scales 1.16 → 1; label travels from the card's centre to the viewport centre and scales 0.72 → 1 | 0 → 620ms, `cubic-bezier(0.76, 0, 0.24, 1)` |
| `router.push(href)` fires — the page renders *underneath* the overlay | 340ms |
| Once the new pathname is live **and** the expansion has finished, overlay fades out | 380ms fade |
| Safety net: fade out regardless if the route never changed | 2600ms |

Same family as the theme toggle's circular View-Transition wipe
(`ThemeProvider.setThemeAnimated`) — a clip-path that grows from the thing you
clicked — but expressed with Motion rather than the View Transitions API, because
this one has to **outlive the route change that unmounts the card**. That is also
why the provider is mounted in `[locale]/layout.tsx` rather than in the section.

Measured in-page from the real click event, against the production build:
overlay mounts **3ms** after the click, is fully removed **1196ms** after it.

- **Reduced motion:** `useReducedMotion()` short-circuits `start()` — plain
  `router.push`, no overlay, no scroll lock.
- **Modifier clicks** (⌘ / Ctrl / Shift / Alt / non-primary button) return before
  `preventDefault()`, so the `<Link>` behaves normally and "open in new tab" works.
- **Scroll lock:** `document.documentElement.style.overflow = 'hidden'` while the
  overlay runs; torn down with `removeProperty('overflow')` (not `= ''`) so
  `globals.css`'s `overflow-x: clip` on `<html>` is handed back intact.

---

## Files touched

### New
| File | What |
|---|---|
| `src/components/global/DivisionTransition.tsx` | The provider, the `useDivisionTransition()` hook, the portalled overlay, and the timing constants. |
| `scripts/capture-division-shots.mjs` | Playwright + sharp capture of both landing pages → the card backdrops. `npm run shots`. |
| `public/images/divisions/consulting.webp` | 1600px WebP q72, **75.6 KB**. |
| `public/images/divisions/marketing.webp` | 1600px WebP q72, **21.2 KB**. |
| `src/_project-state/session-l_division-cards-transition.md` | This file. |

### Modified
| File | What |
|---|---|
| `src/components/sections/DivisionSplit.tsx` | Rewritten. Still a default export taking no props, so `sections/index.ts` and `page.tsx` are unchanged. Revised 2026-08-29 (see **Revision** below): blur `3px` → `6px`, scale `1.08` → `1.12`, plus a sub-header. |
| `src/app/[locale]/layout.tsx` | `<DivisionTransitionProvider>` mounted inside `<DivisionProvider>` (and so inside `MotionWrapper`'s `MotionConfig reducedMotion="user"`), wrapping `ScrollProgress` / `children` / `BackToTop` / `ChatWidget`. Nesting of everything else unchanged. |
| `src/components/global/index.ts` | Barrel exports `DivisionTransitionProvider` (default), `useDivisionTransition`, `DivisionTransitionPayload`. |
| `messages/en.json`, `messages/mk.json` | **Two new keys per locale, nothing deleted:** `home.divisionSplit.{consulting,marketing}.cardLabel`. MK uses `Консалтинг` / `Маркетинг`, matching `nav.consulting` / `nav.marketing` verbatim so the card word and the navbar item read identically. The existing `title` / `subtitle` / `description` / `services` / `cta` keys all stay: `subtitle` is the visible card sub-header, `title` + `cta` feed the `sr-only` sentence, and `description` / `services` are still used elsewhere. |
| `package.json` | `"shots": "node scripts/capture-division-shots.mjs"`; `playwright` + `sharp` added to `devDependencies`. |

`src/app/globals.css` was **not** touched: the `scrollWidth <= innerWidth + 1` check
passed at every width, so the conditional `html, body { overflow-x: clip }` remedy
was not needed (`html` already carries `overflow-x: clip` from the BorderGlow fix).

---

## Regenerating the screenshots

```bash
npm run dev          # in one shell
npm run shots        # in another
```

Against production instead of localhost:

```bash
SHOT_BASE_URL=https://www.vertexconsulting.mk npm run shots
```

Output goes to `public/images/divisions/`, 1600px wide, WebP q72; the script prints
each file's size and warns past the 200 KB card budget.

Two things in that script are load-bearing and should not be "tidied up":

1. **`reducedMotion: 'no-preference'`, not `'reduce'`.** Both heroes gate their
   backdrop on `useShouldAnimate()` (`src/lib/useMediaQuery.ts`), so under `reduce`
   the consulting hero collapses to a flat `--division-bg` rectangle and the plasma
   hero falls back to its poster — the shot would be a blank panel with a headline
   on it rather than the page a visitor actually sees. The 4s settle covers the GSAP
   plate drift and the video's first loop; the card blurs the result to 3px anyway,
   so frame-level non-determinism between runs is invisible.
2. **The computed-position sweep.** Rather than maintaining a selector list, the
   script hides `header` / `.chat-trigger` / `nextjs-portal` by CSS and then hides
   *every* `position: fixed` element via `page.evaluate` — which catches the
   ScrollProgress bar and the BackToTop pill, neither of which carries a stable
   class or a locale-independent `aria-label`. All three hero backdrops are
   `absolute inset-0`, so no page content is affected. The sweep runs **after** the
   4s settle because the chat bubble mounts on a delay.

Both committed images were inspected: page content only, no navbar, no chat bubble,
no back-to-top, no progress bar.

---

## Verification

`npx tsc --noEmit` — 0 errors. `npm run lint` — clean. `npm run build` — exit 0, no
new warnings (the only output is the pre-existing Node `DEP0205` / `localStorage`
experimental warnings, present on `main` too).

A Playwright harness drove the **production** build (`next start`) through 42 checks;
40 passed outright and the 2 that did not were both defects in the harness, not the
code — one assertion counted `sr-only` text as visible (`innerText` includes
clip-hidden nodes), and one timing measurement polled from Node and so charged
Playwright's pre-click actionability work to the overlay's lifetime. Both were
re-run correctly and pass.

- No horizontal overflow at **320 / 375 / 768 / 1024 / 1440 / 1920** —
  `documentElement.scrollWidth === innerWidth` at every one. (`body.scrollWidth`
  does exceed it by 16–24px at the narrow widths; `html { overflow-x: clip }` is
  what absorbs that, which is the whole point of the technique.)
- 1440: left card `left: -86`, right card `right: 1526` — both clipped by the screen.
- 375: single card spans `left: -19` → `right: 394` against a 375px viewport.
- Hover: `blur(3px) brightness(0.6)` → `blur(1.5px) brightness(0.72)`, arrow opacity 1.
- Keyboard: the card is a focusable `<a href="/en/consulting">`; **Enter** fires the
  overlay, lands on `/en/consulting`, and leaves `documentElement.style.overflow` empty.
- Click: overlay mounts with `clip-path: inset(229.9px 0px 101.4px 601px round 14.45px)`
  — the card's own rect — scroll locks to `hidden`, route lands, overlay clears, and
  `overflow` returns to empty.
- Frame captures at 90 / 240 / 420 / 640 / 900 / 1300ms confirm the sequence:
  clipped to the card → opening → full-screen at opacity 1 → 0.69 → 0.22 → gone.
- Browser **back** from `/en/marketing` returns to `/en` with no stuck overlay and
  no leftover scroll lock.
- **⌘-click** opens `/en/consulting` in a new tab, fires no overlay, and leaves the
  homepage in place.
- **Reduced motion** navigates immediately, with no overlay and no scroll lock at
  any point.
- **/mk** renders `Консалтинг` / `Маркетинг`, links to `/mk/consulting` and
  `/mk/marketing`, and the transition cleans up identically.
- **Light theme** renders correctly — the cards read as dark inset panels against
  the white ground.

### Lighthouse (mobile, `/en`, production build)

Measured A/B: `origin/main` built into a scratch worktree on `:3002`, this branch on
`:3001`, three alternating runs each on the same machine.

| | `origin/main` | this branch |
|---|---|---|
| Performance | 75 / 76 / 76 → **median 76** | 77 / 77 / 75 → **median 77** |
| FCP | 1.2 s | 1.2 s |
| LCP | 6.3–6.5 s | 6.6 s |
| TBT | 130–160 ms | 80–130 ms |
| Total bytes | 776 KB | 876 KB |

**Within 1 point — comfortably inside the ±3 requirement.** The only real delta is
the ~97 KB of card imagery.

A caution for whoever reads this next: an earlier baseline of **99** was recorded and
is **wrong**. Its waterfall shows 28 requests / 129 KB with no JS chunks and no fonts
at all — it was not a cold load. The 6.3–6.6 s LCP is a pre-existing property of the
homepage on simulated mobile, present on `main`, and was not introduced here. Do not
treat 99 as the number to defend.

If those 97 KB ever need to come off the critical path, the lever is
`fetchPriority="low"` on the two card `<img>`s — Chrome's `loading="lazy"` heuristic
fetches `consulting.webp` at ~103ms under Lighthouse's simulated throttling anyway.
It was deliberately left off, because the design spec pinned the card markup and the
score is already inside tolerance.

---

## Decisions taken that the phase prompt left open, or that departed from it

1. **`DivisionSplit` does not own the section heading.** The prompt's template had a
   `SECTION HEADING — PRESERVED` block and its own `<section className="py-20 md:py-28">`.
   In this repo the eyebrow / heading / sub-copy live in `page.tsx` inside
   `<Section id="divisions">`, and `DivisionSplit` has only ever rendered the grid.
   Adopting the template literally would have nested a `<section>` inside a
   `<section>` and doubled the padding. The component still renders only the row;
   the heading is untouched, which is what "it stays exactly as it is today" asked for.
2. **No `mt-12 md:mt-16` on the row.** That margin existed in the template because
   the heading was inside the same component. The real heading block already carries
   `mb-12`, so adding it would have doubled the gap.
3. **Namespace is `home.divisionSplit`, not `home.divisions`**, and the `srText`
   sub-keys are `title` / `subtitle` / `cta` — there is no `tagline` key; `subtitle`
   is the tagline. `description` and `services` were deliberately left *out* of the
   `sr-only` string: they were also removed visually, but folding ~45 words into a
   link's accessible name is worse for a screen-reader user than the meaning it adds.
4. **Mount gate is `useIsHydrated()`, not `useEffect(() => setMounted(true))`.** The
   template's version is an eslint **error** under this repo's config
   (`react-hooks/set-state-in-effect`). `src/lib/useMediaQuery.ts` already exports the
   `useSyncExternalStore` idiom that `ThemeToggle` uses for exactly this.
5. **No `eslint-disable` above the overlay's `motion.img`.** `@next/next/no-img-element`
   does not fire on `motion.img`, so the directive was itself a lint error.
6. **Staged by explicit path, not `git add -A`.** The working tree carried a
   concurrent, unrelated scroll-reveal refactor (`src/lib/animations.ts` + 21 call
   sites) plus that session's edits to `current-state.md` / `file-map.md`. `-A` would
   have swept all of it into this PR. The two shared state files were staged as
   "HEAD + this session's additions only" via `git hash-object` + `git update-index`,
   so the other session's in-flight edits survive in the working tree but are not in
   this branch.
7. **`playwright` + `sharp` are now real `devDependencies`,** as the phase prompt
   specified — note this departs from the convention `capture-projects.mjs` documents
   (install `--no-save`, never commit). ⚠ **Vercel installs devDependencies**, so
   `playwright`'s postinstall will try to download Chromium (~170 MB) on every build.
   If build times or build reliability regress, set `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`
   in the Vercel project's environment variables — the capture script only ever runs
   locally.

## Known, accepted limitations

- **The card screenshots are dark-theme captures, shown in both themes.** A light-mode
  visitor sees dark previews of pages that would render light for them. Because the
  cards are deliberately dark-scrimmed panels with white type, this reads as art
  direction rather than a bug, and capturing light variants would double the assets
  for a surface that is blurred to 3px. Revisit only if light mode becomes the default.
- **On hover the background sharpens to 3px, and the consulting card's own hero
  headline is nearly the same sentence as its sub-header** ("Strategic clarity for
  growing businesses" is both), so for that one card the phrase briefly reads twice.
  It is transient and only on pointer hover. If it grates, the fixes are either a
  higher hover blur (`group-hover:blur-[4px]`) or different sub-header copy — the
  sub-header currently reuses `subtitle`, so changing it means editing two JSON keys
  per locale rather than touching the component.

## Revision — 2026-08-29, after first review

Two changes on top of the original phase spec, both requested directly:

1. **Base blur `3px` → `6px`** (hover `1.5px` → `3px`, keeping the "eases to about
   half" relationship). At 3px the captured hero headlines stayed legible and
   competed with the card label — "Strategic clarity for growing businesses" ghosted
   behind the word "Consulting". At 6px the backdrop reads as shape and light rather
   than as text. **`scale-[1.08]` was raised to `scale-[1.12]` at the same time**
   (hover `1.14` → `1.18`, same `+0.06` delta): the scale exists purely as the
   anti-feathering margin, and a 6px blur feathers further than a 3px one. On the
   375px card, 1.08 left only ~16px of overhang per side, which is inside the range
   a 6px blur samples. Verified empirically rather than assumed — sampled raw pixel
   luminance 3px vs 28px in from the card's right and top edges at both 1440 and 375:
   the deltas swing both positive and negative and stay small (max 12/255), i.e.
   ordinary image content, not a transparent feather.
2. **A sub-header under the word.** It reuses the existing
   `home.divisionSplit.<key>.subtitle` — already written, already translated, and
   literally the division's tagline — so **no new translation keys were added** and
   there is no new copy to review. `text-balance` was added because without it the
   two-line wrap orphaned badly ("Strategic clarity for growing / businesses"); it
   now breaks as "Strategic clarity for / growing businesses" in EN and
   "Стратешка јасност / за растечки бизниси" in MK.

Because the tagline is now visible, it was removed from the `sr-only` sentence,
which is now just `"{title}. {cta}."` — otherwise a screen reader would read it
twice. The card's accessible name stays compact.

Re-verified after the change: `tsc`, `lint`, `build` all clean; the full harness
re-run at 41/42, the single failure being the now-obsolete assertion that a card
shows "label + arrow only" — which the sub-header intentionally changes. Everything
else (overflow at all six widths, both edge clips, Enter, ⌘-click, reduced motion,
browser back, MK labels and routes, scroll-lock teardown) still passes.
