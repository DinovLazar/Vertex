# Session — Plasma Video Hero (2026-08-23)

## Why

User report: the animated heroes were slowing the site and occasionally glitching, especially on phones. Scoped during the session to **the marketing hero only** — the user confirmed Silk (homepage) and GridMotion (consulting) are fine. The marketing Plasma was by far the heaviest of the three: its fragment shader raymarched **60 iterations per pixel per frame** through an OGL/WebGL2 pipeline, every frame, for a purely decorative backdrop with `mouseInteractive={false}` at the call site (so no interactivity existed to lose).

## What was built

The live shader was replaced by **pre-rendered looping videos** — pixel-faithful offline renders of the exact same shader, one per theme:

| Asset | Size | Contents |
|---|---|---|
| `public/heroes/plasma-hero-dark.mp4` | 1.02 MB | 1920×1080\@30fps, 20 s seamless loop, dark composite |
| `public/heroes/plasma-hero-light.mp4` | 1.68 MB | same, light composite |
| `public/heroes/plasma-hero-dark.webp` | 8.5 KB | poster = video frame 0 (also the reduced-motion still) |
| `public/heroes/plasma-hero-light.webp` | 6.9 KB | same, light |

Everything the browser used to composite at runtime is **baked into the pixels**: the page background (`--division-bg`: dark `#141414` / light `#FFFFFF`), the shader's own alpha (`length(rgb) × 0.35`), the custom-color tint (dark `#F5F5F5` / light `#2A2D33`), and the light-mode CSS damper (`--plasma-opacity: 0.4`). The videos are opaque; the frontend just plays them.

### The renderer — `scripts/render-plasma-hero.mjs`

Self-contained; needs no dev server. Launches headless Chromium (Playwright), builds a WebGL2 page via `setContent`, and steps deterministic time — frame *i* renders at exactly *t = i/30 s*, so the output is reproducible bit-for-bit. The fragment shader is the original `Plasma.tsx` shader verbatim with three additions:

1. **`iTime` became a `mainImage()` parameter** so one pass can evaluate two time samples.
2. **Seamless loop via in-shader crossfade:** the shader is not periodic, so the last 4 s of the 20 s loop blend `mix(plasma(t), plasma(t − 20), f)` — at the loop point the frame equals frame 0 exactly. Full shader quality, not a video post-filter.
3. **Composite + dither:** page bg / alpha / CSS damper baked in (see above), plus a ±0.5/255 hash dither to break up H.264 banding on the soft gradients.

Encoded with `ffmpeg-static`: libx264, `-preset slow -crf 21`, `yuv420p`, `+faststart`. Posters are frame 0 as WebP (poster **must** be frame 0 — playback starts there).

On-demand deps, same policy as `capture-projects.mjs` (not committed):
`npm install --no-save playwright ffmpeg-static && npx playwright install chromium`.
**Gotcha:** `--no-save` installs are pruned by ANY later `npm install`/`uninstall` — reinstall both together if a run fails with `ERR_MODULE_NOT_FOUND`.

Re-run (`node scripts/render-plasma-hero.mjs [dark|light]`) whenever the baked parameters change; they're documented at the top of the script.

### The component — `BackgroundPlasma.tsx` rewritten

- Renders `<video autoPlay muted loop playsInline preload="auto" disablePictureInPicture aria-hidden>` with `object-cover`, `key={theme}` so a theme flip remounts and autoplays the other file (the old OGL teardown/re-init on theme flip is gone with the renderer).
- Theme via the existing `useTheme()` wrapper pattern; poster attribute gives an instant first paint.
- **Play/pause management mirrors the old shader's rAF gating:** an effect sets `video.muted = true` then `play().catch(() => {})` (React never serializes `muted` into SSR markup — long-standing react-dom quirk — so pre-hydration autoplay can be refused and never retried; iOS Low Power Mode lands in the catch and leaves the poster). An `IntersectionObserver({ threshold: 0 })` + `visibilitychange` listener pause the video offscreen/tab-hidden and resume on re-entry — also fixes tabs opened in the background.
- **Reduced motion:** `useShouldAnimate()` gate now renders the static poster `<img>` (same composition, no motion, no video download) instead of the old flat `--division-bg` div — strictly nicer.
- Public prop API shrank to `{ className? }`; the old shader props (`speed`, `direction`, `scale`, `opacity`, `mouseInteractive`, `color`) are baked into the videos. `MarketingLandingClient.tsx` call site updated to `<BackgroundPlasma />`.

## Files touched

| File | Change |
|---|---|
| `scripts/render-plasma-hero.mjs` | **NEW** — offline shader→video renderer (see above). |
| `public/heroes/plasma-hero-{dark,light}.{mp4,webp}` | **NEW** — the four rendered assets. |
| `src/components/backgrounds/BackgroundPlasma.tsx` | Rewritten: shader wrapper → `<video>` player. |
| `src/components/backgrounds/Plasma.tsx` | **DELETED** — the OGL renderer. The shader source lives on verbatim inside `render-plasma-hero.mjs`. |
| `src/types/ogl.d.ts` | **DELETED** — ambient types for the removed dep. |
| `package.json` | `ogl` **removed** (`npm uninstall ogl`); it was only imported by Plasma.tsx. |
| `src/app/[locale]/(site)/marketing/MarketingLandingClient.tsx` | `<BackgroundPlasma />` with no props; comment notes where the old props went. |
| `src/app/globals.css` | `--plasma-opacity` block removed (damper now baked into the light video); tombstone comment left in place. |
| `src/lib/useMediaQuery.ts` | Doc comment: "three.js / ogl / gsap" → reflects that the plasma path is now a video. |
| `AGENTS.md` | Stack line updated: ogl removed, plasma is pre-rendered video. |

## What did NOT change

- Silk (homepage, three.js/R3F) and GridMotion (consulting, GSAP/DOM) — explicitly out of scope per user.
- `BackgroundSilk`/`BackgroundGrid` wrappers, `--silk-opacity`, silk scrim tokens.
- The `backgrounds/index.ts` barrel (same three exports).

## Verification evidence

- **Visual:** `/en/marketing` dark and light on desktop, light on mobile (375×812) — video renders, covers, theme flip swaps files. End-of-loop frame visually matches frame 0 (crossfade guarantees it by construction).
- **Network:** `plasma-hero-dark.webp` 200 + `plasma-hero-dark.mp4` 206 range requests; nothing else.
- **Console:** zero errors (the old `THREE.Clock` deprecation warnings remain on the homepage — Silk, pre-existing).
- **`npm run lint`:** 0 errors, 0 warnings. **`npm run build`:** clean, all routes emitted.
- **Autoplay note:** the in-app verification browser reports `document.visibilityState === 'hidden'` permanently, so Chromium defers autoplay there; manual `play()` confirmed playback advances and loops. On real (visible) pages autoplay-muted-playsinline is the universally allowed path; the visibilitychange retry covers background-opened tabs.

## Perf expectation

The marketing page's per-frame GPU cost for the backdrop drops from a 60-iteration raymarch per pixel (the thing that stuttered/glitched phones) to hardware-decoded H.264 — effectively free on any device this decade. Bundle: the `ogl` module + `Plasma.tsx` chunk are gone from the client build entirely; the trade is a ~1–1.7 MB progressive video download that only starts on the marketing page, streams via range requests, and is skipped entirely under reduced motion.
