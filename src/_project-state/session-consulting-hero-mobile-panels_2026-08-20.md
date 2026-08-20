# Session — Consulting hero: the plates stop squishing on mobile (2026-08-20)

**Ask:** "when on a mobile device on the consulting page the hero squishes to
fit it. make it so the rectangles stay the same size."

**Scope:** one file — `src/components/backgrounds/GridMotion.tsx`. No CSS, no
new tokens, no change to `.metallic-panel`, `BackgroundGrid`, the hero scrim, or
the GSAP parallax.

---

## What was wrong

`GridMotion` lays its 4 × 7 lattice inside a box sized **`150vw × 150vh`**, with
`gridTemplateColumns: repeat(7, 1fr)` and a `1rem` gap. Both cell dimensions
were therefore a pure fraction of the viewport, and the two axes shrink at very
different rates on a phone:

| Viewport | Grid box | Cell (measured `offsetWidth × offsetHeight`) | Aspect |
| --- | --- | --- | --- |
| 1280 × 800 (desktop) | 1920 × 1200 | **261 × 288** | 0.91 |
| 375 × 812 (mobile, before) | 562 × 1218 | **67 × 293** | 0.23 |

The height barely moved — a tall phone has plenty of `vh` — but the seven
columns had to share 562px, so each brushed-metal plate collapsed to a 67px
sliver. The panel treatment reads as *sheet metal*; at 4:1 it read as vertical
blinds, which is exactly the "squished" the ask describes.

## The fix

The box now takes a floor:

```ts
const ROWS = 4, COLS = 7, GAP_PX = 16
const MIN_CELL_W = 260, MIN_CELL_H = 288      // reference desktop cell @ 1280×800
const MIN_GRID_W = COLS * MIN_CELL_W + (COLS - 1) * GAP_PX  // 1916
const MIN_GRID_H = ROWS * MIN_CELL_H + (ROWS - 1) * GAP_PX  // 1200

width:  `max(150vw, ${MIN_GRID_W}px)`
height: `max(150vh, ${MIN_GRID_H}px)`
```

Above roughly **1277 × 800** the viewport-relative term still wins, so the
desktop treatment is untouched — the lattice keeps growing with the window
exactly as before. Below it the box stops shrinking, the plates hold their
size, and the surplus overflows the hero frame, which was already
`overflow: hidden` at three levels (`BackgroundGrid`'s wrapper, `GridMotion`'s
own outer `div`, and the `<section>`). A phone now sees **fewer, correctly
proportioned plates** instead of the whole lattice crushed to fit.

The literals `4`, `7`, `28` and `'1rem'` that were scattered through the JSX are
now the `ROWS` / `COLS` / `GAP_PX` constants the floor is derived from, so the
geometry cannot drift out of agreement with the minimums (`totalItems` is now
`ROWS * COLS`).

## Why a floor and not a media query

A `@media (max-width: 768px)` branch would have to pick a second cell size and
keep it in sync with the desktop one by hand. `max()` expresses the actual
intent — "never smaller than the reference cell" — in one place, has no
breakpoint to land wrong on an odd viewport (foldables, landscape phones, a
half-width desktop window), and degrades continuously rather than jumping at a
threshold.

## Coverage — the thing a floor could have broken

The lattice is rotated `-15deg`, so it must overhang the viewport on all four
sides or a bare corner of `--hero-grid-bg` shows through. At the floor the
rotated bounding box measures **2166 × 1672** (1916·cos15 + 1200·sin15, etc.),
against which every small viewport is tiny. Verified in the browser rather than
on paper — `getBoundingClientRect()` on the rotated container against
`innerWidth`/`innerHeight`:

| Viewport | Cell | Covers L/T/R/B | `scrollWidth` |
| --- | --- | --- | --- |
| 1280 × 800 | 261 × 288 (unchanged) | — | 1265 |
| 375 × 812 (portrait phone) | **260 × 293** | true / true / true / true | 375 (no h-scroll) |
| 320 × 568 (smallest phone) | **260 × 288** | true / true / true / true | 320 |
| 844 × 390 (landscape phone) | **260 × 288** | true / true / true / true | 829 |

The row parallax adds at most ±150px of horizontal travel (`maxMoveAmount / 2`),
which the ~890px of horizontal overhang absorbs many times over. On a phone
there is no `mousemove` at all, so `mouseXRef` stays at `innerWidth / 2` and the
computed `moveAmount` is exactly 0 — the rows sit centred.

## Verification

- `npx tsc --noEmit` clean, `npm run lint` clean.
- Live measurements above, taken on the dev server at `/en/consulting` with the
  panel geometry read off the DOM (`offsetWidth`/`offsetHeight`, not the
  rotated `getBoundingClientRect` — the rotation inflates that box by ~25% and
  will mislead anyone re-measuring this).
- No console errors on any of the four viewports.

## Not changed

`variant="text"` shares the same box and therefore inherits the same floor.
Nothing in the repo renders that variant (`BackgroundGrid` defaults to
`panels`, and it is the only caller), but the text cells would have squished
identically, so this is the right side to err on.
