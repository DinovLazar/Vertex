# Session — Vercel Analytics (2026-07-14)

## What this session did
Wired **Vercel Web Analytics** into the site (install `@vercel/analytics`, mount
`<Analytics />`), verified it locally, and documented it in project-state.

**Important reconciliation note:** while this session was in progress, Vercel's
GitHub integration independently opened and merged an **auto-generated PR #1**
(`6a5f104 Add Vercel Web Analytics integration`, merged as `ee9b943`) that added
the *same* package + component to `main`. On push, my local commit collided with
it. Since the integrations were identical (same package, same version, same
`@vercel/analytics/next` import), I discarded my duplicate code changes, took the
remote's version as canonical, and kept **only the project-state docs** — which the
automated PR did not include. So the code on `main` is Vercel's PR; this session's
committed contribution is the documentation.

## What's on `main` (final state)
- `package.json` / `package-lock.json` — `@vercel/analytics@^2.0.1` (from PR #1).
- `src/app/[locale]/layout.tsx` — `import { Analytics } from '@vercel/analytics/next'`
  and `<Analytics />` rendered **right before `</body>`, as a sibling of
  `ThemeProvider` (outside every provider)**. `<Analytics />` renders nothing, so
  tree position is cosmetic; this is Vercel's default placement.
- Docs (this session): `current-state.md` (new dated top entry), `file-map.md`
  (layout.tsx row), this session file.

## Placement note (my local vs. what shipped)
My local edit had placed `<Analytics />` as the last child *inside*
`DivisionProvider` (after `<ChatWidget />`). Vercel's PR placed it before `</body>`
outside all providers. Both are functionally identical — the component emits no
markup and reports the same pageviews regardless of position — so I let the
remote's placement stand rather than reintroduce a diff. The docs describe the
shipped (remote) placement.

## Why `@vercel/analytics/next` and this layout file
- The `/next` subpath export is Vercel's App-Router-aware component — it reads route
  params correctly for page-path attribution under RSC (vs. the bare
  `@vercel/analytics/react` export).
- It lives in `[locale]/layout.tsx` (not the pass-through root `layout.tsx`) because
  that file owns the real `<html>`/`<body>` shell for every public page; one mount
  there covers all `/en/*` and `/mk/*` routes. `/admin/*` and `/api/*` bypass this
  layout and are therefore untracked — correct (admin is `noindex`, api has no
  pageviews).

## Local behavior (expected, verified)
On localhost the component runs in **debug mode** and does **not** send data — it
loads `https://va.vercel-scripts.com/v1/script.debug.js` and exposes `window.va`.
Real collection only happens from a Vercel deployment (the script resolves to
`/_vercel/insights/*` there). Matches Vercel's quickstart: "Deploy your changes and
visit the deployment to collect your page views."

## Verification performed
- Dev server (`vertex-dev`, :3000), navigated to `/en`:
  - `preview_logs` (server) → **no errors**; `preview_console_logs` → **no errors**.
  - DOM check confirmed the injected script
    (`https://va.vercel-scripts.com/v1/script.debug.js`) and `typeof window.va ===
    'function'` — component mounted and initialized.
  - (Verified against my local placement; behavior is placement-independent, so it
    holds for the shipped version.)

## What the user must do
Nothing in code. **Deploy to Vercel** (push to `main` → auto-deploy) and enable
**Web Analytics** for the project in the Vercel dashboard (Project → Analytics) if
it isn't already on. Data appears within ~30s of visiting the deployed site; if it
doesn't, check for content blockers per Vercel's docs. No env var is required —
Web Analytics is keyless.

## Notes for the next session
- Vercel also offers **Speed Insights** (`@vercel/speed-insights`, separate
  package/component) for Core Web Vitals — not installed; add it the same way if
  wanted (relevant to the still-open **Phase 16 — Performance Audit**).
- Watch for future Vercel auto-generated PRs on this public repo — they can land
  changes on `main` without the project-state ritual; reconcile docs when they do.
