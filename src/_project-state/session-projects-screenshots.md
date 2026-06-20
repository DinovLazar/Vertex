# Session — "Our Work" Screenshots + Live Links

Date: 2026-06-20

## What changed

Wired real screenshots and working external links into the homepage **"Our Work"**
project cards (`ProjectsShowcase`). Before this session every card rendered the
grayscale placeholder + "Coming soon" because `image`/`href` were `null` on all
three entries in `src/config/projects.ts`. Now all three cards show a live-site
screenshot in their 16:9 frame and link out to the project (`<a target="_blank">`).

No component changes were needed — `ProjectsShowcase.tsx` already handled real
`image` (Next.js `<Image fill>` in an `aspect-video` box, `object-cover`) and
`href` (focusable external link with `ExternalLink` + "View project"). The only
code edit is the data file.

The third entry, previously **"Optimind"** (a `null` placeholder), was **renamed
to "Dalibor Plečić — Author"** and pointed at that client's site, per Goran's
direction. A possible fourth card for Vertex's own site (`vertex.png`) was
considered and **skipped** — the "Our Work" section is for client work — and the
unused `vertex.png` was deleted from Downloads.

## Mapping used

| Card name | image | href |
|---|---|---|
| Northgate Dental | `/projects/northgate.png` | `https://northgate.optimind000.com/en` |
| Sunset Services | `/projects/sunset.png` | `https://sunsetservices.vercel.app/` |
| Dalibor Plečić — Author | `/projects/daliborac.png` | `https://daliborac.vertexconsulting.mk/mk` |

All three keep `division: "marketing"` (the division tag is a shared label).

## How the screenshots were produced

The original plan assumed four PNGs pre-saved in Downloads, but only `vertex.png`
was present on this (new) machine. With Goran's go-ahead, the three needed shots
were captured **headless from the live sites** using the installed Google Chrome
(`--headless=new --window-size=1280,720 --force-device-scale-factor=2`), yielding
clean 2560×1440 (16:9) PNGs dropped straight into `public/projects/`. Each was
visually reviewed before wiring.

Note flagged to Goran and accepted: the **daliborac site is still mid-build** —
its hero and body literally render `[PLACEHOLDER]` text. Goran chose to feature it
anyway for now. When that site's real content lands, re-capture
`public/projects/daliborac.png` (same method) — no code change needed.

## Files touched

- `public/projects/northgate.png` — new (headless capture of northgate.optimind000.com)
- `public/projects/sunset.png` — new (headless capture of sunsetservices.vercel.app)
- `public/projects/daliborac.png` — new (headless capture of daliborac.vertexconsulting.mk)
- `src/config/projects.ts` — modified: real `image` + `href` on all three entries; "Optimind" → "Dalibor Plečić — Author"
- `src/_project-state/current-state.md`, `src/_project-state/file-map.md` — updated
- (`~/Downloads/vertex.png` deleted; Vertex-own-site card skipped)

## Verification

Dev server (`npm run dev`), checked on `/en` and `/mk`:

- All three cards reference their screenshot via the Next image optimizer
  (`/_next/image?url=%2Fprojects%2F<file>.png`), which returns `200 image/png`.
- All three carry the correct live-site `href`.
- Zero cards fall through to the grayscale placeholder (placeholder-gradient
  count = 0 in rendered markup).
- `/mk` renders the same images + links with brand names kept in Latin script.

Headless one-shot screenshots of the composed homepage couldn't show the section
because these below-the-fold sections use Motion `whileInView` reveals that only
fire on real scroll — verify visually by opening `http://localhost:3000/en` in a
real browser and scrolling to "Our Work" (the production build on Vercel renders
identically).
