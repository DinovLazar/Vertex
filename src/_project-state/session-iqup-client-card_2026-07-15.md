# Session — IQ UP! Client Card (2026-07-15)

## What this session did
Added the new client **IQ UP!** ([iqup.vertexconsulting.mk](https://iqup.vertexconsulting.mk/) —
a free, game-based cognitive-assessment tool for children ages 5–13, built by Vertex Marketing)
to the two project showcases:

- **Homepage "Our Work"** (`src/config/projects.ts`): IQ UP! **replaced** Northgate Dental.
  Grid is now **IQ UP! / Sunset Services / Dalibor Plečić — Author**.
- **`/lazar` "Selected work"** (`src/config/lazar.ts`): Northgate **stays**; IQ UP! was **added
  as a 4th card**, taking the slot of the removed "& more" hatch-field placeholder. Grid is now
  **Northgate / Sunset / Dalibor / IQ UP!**.

## What changed (exact scope)
- `src/config/projects.ts` — Northgate entry → IQ UP! (`/projects/iqup.png` → `https://iqup.vertexconsulting.mk/`, division `marketing`)
- `src/config/lazar.ts` — appended IQ UP! as the 4th `lazarProjects` entry (Northgate kept)
- `src/components/sections/LazarWork.tsx` — removed the hardcoded "& more" placeholder `StaggerItem`; changed the zig-zag offset from the hard-coded `i === 1` to `i % 2 === 1` so the right-column drop holds for any project count
- `messages/en.json` — added `lazar.work.projects.3` (label "Website & Brand" + desc); removed `lazar.work.moreTitle` / `moreSubtitle`
- `messages/mk.json` — added `lazar.work.projects.3` ("Веб-страница и бренд" + desc); removed `lazar.work.moreTitle` ("и повеќе") / `moreSubtitle` ("Уште проекти се на пат.")
- `public/projects/iqup.png` — **new** 2560×1440 hero screenshot (~0.46 MB after sharp re-encode)
- `scripts/capture-projects.mjs` — added the `iqup` target + a privacy-preserving cookie preference (see below)
- Docs: `TRANSLATION_NOTES.md` (L-E/L-F + removal note), `file-map.md` (iqup.png row + 5 updated rows), `current-state.md` (changelog line), this file

`home.projects.*` needed **no** new keys — the homepage cards share one generic `serviceLabel` /
`divisionLabel`, so swapping the config entry was enough there.

## The IQ UP! screenshot — capture notes
Card format matches the sibling shots exactly: **1280×720 @ 2× DPR → 2560×1440**, above-the-fold
hero. Two wrinkles this site had that the others didn't:

1. **Cookie banner over the hero.** The site shows a "Колачиња на оваа страница" consent modal on
   first load, centered over the headline. Dismissed via the **privacy-preserving "Само основни"
   (essential-only)** button — not "Прифати ги сите" (accept all) — matching the site-wide
   privacy convention. `scripts/capture-projects.mjs`'s cookie-dismissal list was updated to try
   `/само основни/i`, `/only essential/i`, `/essential only/i`, `/reject/i` **before** the
   accept-all labels, so a re-run reproduces the same clean, privacy-preserving shot.
2. **`Math.random()` is unavailable to workflow scripts**, and the in-app **preview harness has a
   known blank-screenshot / zero-viewport desync on this site** (documented in
   `session-refresh-project-screenshots_2026-07-12.md`, hit again this session). Both the source
   capture and the local render-proof were therefore taken with **headless Chrome driven over the
   DevTools Protocol via Node's built-in `WebSocket`** (zero dependencies) — navigate → dismiss
   banner → `Page.captureScreenshot`. The project's canonical `scripts/capture-projects.mjs`
   (Playwright, on-demand-installed) remains the maintained tool and now includes `iqup`.

Off the capture the PNG was ~1.55 MB (just over the ~1.5 MB budget), so it was re-encoded
near-losslessly with **sharp** (palette quantization) → **~0.46 MB**, still 2560×1440, no visible
banding (verified by eye; `next/image` re-encodes to WebP/AVIF at serve time anyway).

## Translations (LLM-drafted MK — awaits Lazar's native pass)
Logged in `TRANSLATION_NOTES.md`:
- **L-E** `lazar.work.projects.3.label` → "Веб-страница и бренд" ("Website & Brand" — chosen over
  the existing "…и SEO"/"Веб-страница" labels to signal the distinct visual identity).
- **L-F** `lazar.work.projects.3.desc` → mirrors the EN. Flagged: the live site frames its
  assessment softly as "проценка на силните страни" ("strengths assessment"); Lazar may prefer
  that over the more clinical "когнитивна проценка".

Brand "IQ UP!" stays Latin (convention #19) and lives in `src/config/lazar.ts`, not the messages.

## Verification performed
- **Image served**: `GET /projects/iqup.png` → `200 image/png`; `next/image` optimizer
  (`/_next/image?url=%2Fprojects%2Fiqup.png…`) → `200` — Next optimizes it cleanly.
- **Homepage**: a11y tree + text confirm the "Our Work" grid is IQ UP! / Sunset / Dalibor
  (Northgate gone); the IQ UP! card links to `https://iqup.vertexconsulting.mk/` with the correct
  `image` + aria-label.
- **`/en/lazar`**: all four names render (Northgate, Sunset, Dalibor, IQ UP!); **zero** "& more" /
  "More projects on the way" strings remain.
- **`/mk/lazar`**: IQ UP! + "Веб-страница и бренд" render; the old "Уште проекти се на пат."
  subtitle is gone.
- **Visual proof** (headless-Chrome render of the local dev server): homepage IQ UP! card shows the
  clean screenshot (no cookie banner); `/lazar` shows Northgate kept + IQ UP! as the 4th card with
  the zig-zag preserved and the section closing cleanly (no "& more" card).
- **Lint**: `npm run lint` — no new problems in any changed file (the 13 pre-existing errors are all
  in untouched files: `Confetti.tsx`, the WebGL backgrounds, `Navbar.tsx`, `ThemeToggle.tsx`,
  `ChatPanel.tsx`).

## Follow-ups / notes for the next session
- Re-capturing all four cards is a one-liner again: `node scripts/capture-projects.mjs` (needs the
  on-demand Playwright install noted in that file's header). It now also does IQ UP! with the
  privacy-preserving cookie choice.
- The MK IQ UP! copy (L-E/L-F) is still pending Lazar's native-speaker review, like the rest of the
  `lazar.*` namespace.
