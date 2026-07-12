# Session — Refresh Project Screenshots (2026-07-12)

## What this session did
Re-captured the three "Our Work" client screenshots from the live sites (all three
had been redesigned since the 2026-06-20 capture) and replaced them in
`public/projects/`. **Zero component or config changes** — the filenames and paths are
identical, so nothing downstream needed touching.

## What changed (exact scope)
- `public/projects/northgate.png` — re-captured (site redesigned)
- `public/projects/sunset.png` — re-captured (site redesigned) + near-losslessly re-encoded
- `public/projects/daliborac.png` — re-captured (real content shipped; former `[PLACEHOLDER]` build is gone)
- `scripts/capture-projects.mjs` — **new** Playwright capture script (re-runnable)
- Docs: `file-map.md` (3 image entries + 1 script entry), `current-state.md` (changelog line), this file

Nothing else. `git status` was exactly: 3 modified PNGs + 1 new script + the doc updates.
No `package.json` / `package-lock.json` change (see "Tooling" below).

## The three source URLs
These are the exact locale pages the "Our Work" cards (`src/config/projects.ts`) and the
`/lazar` Work section (`src/config/lazar.ts`) link to — so each screenshot matches what a
visitor sees when they click **"View project"**:

| Card | File | Live URL captured |
|------|------|-------------------|
| Northgate Dental | `public/projects/northgate.png` | https://northgate.optimind000.com/en |
| Sunset Services | `public/projects/sunset.png` | https://sunsetservices.vercel.app/ |
| Dalibor Plečić — Author | `public/projects/daliborac.png` | https://daliborac.vertexconsulting.mk/mk |

## Capture spec (unchanged from the 2026-06-20 originals)
- Viewport **1280×720**, `deviceScaleFactor: 2` → **2560×1440** output (16:9)
- Above-the-fold hero shot (`fullPage: false`)
- `reducedMotion: 'reduce'` so hero animations are frozen and the shot is deterministic
- Best-effort cookie-banner dismissal (EN + MK button labels)
- Robust page-load: prefers `networkidle`, falls back to `load` if a chatty site (persistent
  analytics/websocket connections) never reaches idle — so one slow site can't fail the run

## Re-running is now a one-liner
```bash
node scripts/capture-projects.mjs
```
Filenames are fixed (`northgate` / `sunset` / `daliborac`), so a redesign never needs a
config change — just re-run and the three cards + `/lazar` update automatically. Exits
non-zero if any capture fails (it will not ship a partial refresh or a placeholder).

## Tooling note (why no dependency was added)
The script imports `playwright`, which is installed **on-demand**, not committed:
```bash
npm install --no-save playwright && npx playwright install chromium
```
`--no-save` keeps `package.json` / `package-lock.json` untouched, honouring the "only the
images + the script change" scope. If a future maintainer wants this to be a permanent,
guaranteed-present tool, promote it with `npm i -D playwright` — but that's an intentional
scope decision, not an oversight.

`sunset.png` came off the capture at ~3.6 MB (the only one over the ~1.5 MB budget). It was
re-encoded near-losslessly with **sharp** (already a project dependency) using palette
quantization at quality 92 → ~1.3 MB, still 2560×1440, no visible quality drop (verified by
eye; the card renders it at ~33vw and `next/image` re-encodes to WebP/AVIF at serve time
anyway). The other two were already under budget and left as pristine 24-bit RGB.

## Verification performed
- `node scripts/capture-projects.mjs` → exit 0, all three captured
- All three PNGs confirmed **2560×1440** (`file public/projects/*.png`)
- All three binaries confirmed changed vs. the 2026-06-20 versions (each site had genuinely
  been redesigned — no byte-identical no-op)
- `daliborac.png` confirmed **free of `[PLACEHOLDER]` content** — it now shows the live
  author homepage ("Далибор Плечиќ · Писател, книжевен критичар и преведувач")
- `npx tsc --noEmit` → clean
- `npm run build` → **exit 0** (with env vars present, as on Vercel). NOTE: a bare
  `npm run build` on this machine fails at `/api/contact` because there is no `.env.local`
  and the current Resend SDK throws on an empty API key (`src/lib/resend.ts`) — this is a
  pre-existing, environment-only failure unrelated to this session (a PNG swap can't touch
  that route). AGENTS.md's "next build survives without them" is stale for the installed
  Resend SDK version.
- Browser render verified against the running dev server: `/en`, `/mk`, `/en/lazar`,
  `/mk/lazar` all return 200 and server-render all three screenshot references; the Next.js
  image optimizer serves all three (200 + valid `image/png`); the homepage a11y tree shows
  the three project-card links under "Recent client projects"; the `/lazar` Work images
  retain `grayscale` + `group-hover:grayscale-0` + `group-hover:scale` (grayscale→colour on
  hover intact). No console errors (only the pre-existing React-DevTools info line and a
  `THREE.Clock` deprecation warning from the Silk hero background).

## Follow-ups / notes for the next session
- The dev-server preview harness had a two-tab / zero-viewport desync this session, so a
  literal card screenshot via the preview tool came out blank; render was instead verified
  via server-rendered HTML + a11y tree + `elementFromPoint` (the project `<img>` paints at
  the card centre in a sized viewport) + direct optimizer fetches. Not a code issue.
- If any client site is redesigned again, re-run the one-liner above.
