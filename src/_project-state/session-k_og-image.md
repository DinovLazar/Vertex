---
session: K
date: 2026-04-19
status: complete
---

# Session K — Open Graph Preview Image

## What was built

Sitewide Open Graph / Twitter preview card so links shared to WhatsApp / LinkedIn / Facebook / Telegram / X render with a branded image instead of the platform default. Two new file-convention routes plus one helper update plus one proxy fix.

The image is a 1200×630 PNG generated at request time by Next.js's built-in `ImageResponse` (powered by satori), then build-time-prerendered as a static asset (the route table shows `○ /opengraph-image` after `npm run build`). Visually it tracks the site's unified grayscale palette — `#141414` linear-gradient background with two very-soft white halos for depth, "V" tile in a `#F5F5F5 → #C9C9C9` gradient, big "We help businesses grow smarter." headline with `smarter.` rendered in a subtle `#FFFFFF → #A3A3A3` text gradient, subtitle "Business consulting & digital marketing — from Strumica, Macedonia.", division-dot row (`Consulting · Marketing` both in muted `#737373`), and `vertexconsulting.mk` bottom-right.

The original brief asked for the pre-Session-E "Arctic & Amethyst" palette (`#0A0B12` background, blue `#60A5FA`, purple `#B490F0`) plus Sora font — both retired since (Session E unified to grayscale, Session J flipped BorderGlow defaults too, and the heading font is now Archivo per the most recent commit). Caught the drift during the read-project-state phase, surfaced it to the user, and got approval to track the live design system instead of reintroducing the rejected aesthetic.

## Files created

| File | Description |
|------|-------------|
| `src/app/opengraph-image.tsx` | Next.js file-convention OG image generator. Edge-compatible `ImageResponse` producing a 1200×630 branded PNG. Exports `alt` / `size` / `contentType` route-segment config. Uses system-ui font fallback (see "Font loading" decision below). Lives at `src/app/` (above `[locale]/`) so it cascades site-wide via Next.js's metadata-merging tree. |
| `src/app/twitter-image.tsx` | One-line re-export from `opengraph-image.tsx` — keeps the Twitter/X card in sync with OG via a single source of truth. `export { default, alt, size, contentType } from './opengraph-image'`. |
| `src/_project-state/session-k_og-image.md` | This writeup. |

## Files modified

| File | What changed |
|------|-------------|
| `src/proxy.ts` | next-intl matcher exclusion list extended from `(?!api\|_next\|_vercel\|.*\..*)` to `(?!api\|_next\|_vercel\|opengraph-image\|twitter-image\|.*\..*)`. Without this, the middleware caught the locale-neutral `/opengraph-image` route (no dot in the URL) and 307-redirected it to `/en/opengraph-image`, which 404'd because the file convention lives at `src/app/`, not `[locale]/`. Sitemap and robots routes already bypass the matcher because their URLs contain `.xml`/`.txt`. |
| `src/lib/metadata.ts` | Added an `images` field to the `openGraph` and `twitter` blocks of `generatePageMetadata`. URLs are relative (`/opengraph-image`, `/twitter-image`) so they resolve against `metadataBase` to `https://vertexconsulting.mk/...`. Includes width/height/alt for og:image. The original brief explicitly said *not* to add an `images` field — but the assumption that the file convention auto-injects regardless was wrong. Empirically, when a child page sets its own `openGraph` (as `generatePageMetadata` does for every consulting / marketing / about / contact / blog page), Next.js treats it as a full replacement and drops the framework-added image. Verified by curling `/en/about` pre-fix (no `og:image` meta) and post-fix (full `og:image` + `twitter:image` block). |

## Project-state docs updated

- `current-state.md` — bumped "Last updated" line, prepended a Session K entry to "Last completed" (pushing Session J to "Prior closed work"), added a new top bullet under "What works right now" describing the OG image.
- `file-map.md` — bumped date, added rows for `opengraph-image.tsx` and `twitter-image.tsx`, annotated the `proxy.ts` and `metadata.ts` edits.
- `session-k_og-image.md` — this file.

## Key technical decisions

- **File lives at `src/app/`, not `src/app/[locale]/`.** Cascading from above the locale segment means a single PNG is referenced by `/en` and `/mk` and every page below them. Per-division images (e.g. a different card for `/consulting/*` vs `/marketing/*`) could be added later by dropping additional `opengraph-image.tsx` files into specific route subtrees — Next.js uses the closest one. For now, one image is correct: the brief is monolithic ("Vertex Consulting"), and divisions are signaled by labels not by image.
- **Font: dropped explicit loading; system-ui fallback only.** Initial implementation followed the brief's pattern of fetching Archivo woff2 from Google Fonts at request time. satori (the renderer behind `ImageResponse`) only supports ttf/otf — woff2 errors at render time with `Unsupported OpenType signature wOF2`. Three options considered: (a) bundle a `.ttf` in `/public` (~50 KB committed for a one-image use case); (b) hit Google Fonts' v1 CSS API which serves ttf for non-browser UAs (brittle, version-pinned URLs); (c) drop font loading and use system-ui. The brief explicitly pre-approved (c) as the fallback. Rendered output is clean — system fonts on social-platform crawlers render in their default sans, and the layout's typography hierarchy carries brand recognition without needing Archivo specifically. Documented in the file with a comment so a future contributor doesn't re-add the broken loader.
- **Twitter image as a one-line re-export, not a copy.** `src/app/twitter-image.tsx` re-exports the four route-segment exports (`default`, `alt`, `size`, `contentType`) from `opengraph-image.tsx`. Single source of truth — any future iteration on the visual touches one file. This was in the original brief.
- **Design follows current state, not the brief's literal hex codes.** The brief was written against the pre-Session-E "Arctic & Amethyst" palette + Sora font; both retired. Used `--division-bg: #141414`, `--division-accent: #F5F5F5`, `--division-text-secondary: #A3A3A3`, `--division-text-muted: #737373` directly in the JSX inline styles (satori doesn't read CSS variables; the values themselves are stable in the design system anyway). The "smarter." text gradient uses a tight `#FFFFFF → #A3A3A3` ramp matching the same monochrome ramp used elsewhere on the site instead of the rejected blue→purple ramp.
- **`generatePageMetadata` explicit `images` field is mandatory, not optional.** The brief's claim — "the file convention handles the cascade automatically; do NOT add an `images` field anywhere or you'll override it" — is the opposite of how Next.js metadata merging actually works for `openGraph` / `twitter` keys. Pages that set their own `openGraph` block (which `generatePageMetadata` does for every translated/per-page metadata case) replace the parent's `openGraph` entirely, including any framework-auto-injected images. This is documented App-Router behavior. Verified empirically before adding the fix.

## Verification done

- **`npm run build` passes cleanly post-changes.** Both `/opengraph-image` and `/twitter-image` listed in the route table as `○` (static-prerendered) — Next.js generates the PNG once at build time and serves the cached version. No TypeScript errors, no ESLint warnings, all 47 routes built.
- **Direct fetch of `/opengraph-image`:** `HTTP/1.1 200 OK`, `content-type: image/png`, 84 044 bytes, file inspected as `PNG image data, 1200 x 630, 8-bit/color RGBA, non-interlaced`. PNG opens visually as expected — dark gray background, white "V" tile, large "We help businesses grow smarter." headline with subtle gradient on `smarter.`, subtitle, division dots, vertexconsulting.mk URL all in correct positions.
- **Meta-tag injection on `/en` (root locale page, uses root layout metadata only):** `og:image`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `twitter:image`, `twitter:image:alt`, `twitter:image:type`, `twitter:image:width`, `twitter:image:height` — all 10 framework-auto-injected. URLs include the Next.js content-fingerprint hash (`?4d627515e06f9a0a`) for cache-busting.
- **Meta-tag injection on `/en/about`, `/en/contact`, `/en/consulting/business-consulting`, `/mk/about`** (all use `generatePageMetadata`): `og:image` + `twitter:image` present on all four after the metadata.ts fix; URLs render as `https://vertexconsulting.mk/opengraph-image` (resolved against `metadataBase`). Pre-fix curl on `/en/about` returned `og:title` + `og:description` + `og:url` + `og:locale` + `og:type` but **no** `og:image` or `twitter:image` — exactly the bug the metadata.ts edit closes.
- **Cascade verified across both locales** — `/mk` got the same `og:image` content as `/en`, no per-locale duplication needed.

## Known issues (encountered, not introduced)

- **`package-lock.json` was deleted in the working tree at session start.** Dev server / build couldn't run until the lockfile was restored from HEAD via `git restore package-lock.json` and `npm ci`. Unrelated to OG work; left in the restored state. The original deletion appears in `git status` only — never committed.
- **Local Windows env couldn't load `@next/swc-win32-x64-msvc` native binary after a lockfile-less `npm install`.** Fresh install (without lockfile) pulled an SWC binary that Windows reports as `not a valid Win32 application`. Turbopack requires native bindings, so build/dev under the default Turbopack path failed. Workaround used during verification: `npx next build --webpack` and `npx next dev` after the lockfile restore. The lockfile-pinned versions worked under the default Turbopack path. If the lockfile is deleted again, the same workaround applies.
- **Cyrillic font-subset type error flagged in Session J as a launch blocker is no longer present.** The most recent commit (`b3e09fd Remove cyrillic subset from Archivo font (not supported)`) removed `cyrillic` and `cyrillic-ext` from the Archivo subsets array; `npm run build` now type-checks cleanly. Macedonian content on `/mk` currently renders in the OS default sans (Segoe UI / SF Pro). If brand-font Cyrillic coverage matters, swap Archivo for a font that ships Cyrillic on Google Fonts (Manrope worked previously, per Session F).

## Follow-ups

- **Per-division OG cards.** Could be added later by creating `src/app/[locale]/(site)/consulting/opengraph-image.tsx` and a marketing equivalent — Next.js will use the closest file in the route tree. Useful if division landing pages start being shared independently.
- **Brand-font OG card.** If brand consistency on the OG image becomes important enough to justify a 50–100 KB ttf in the repo, drop `Archivo-Bold.ttf` into `public/fonts/` and read it at module load time via `fs.readFile('./public/fonts/Archivo-Bold.ttf')`. The system-ui fallback is currently sufficient.
- **Vercel redeploy needed for production.** Local verification confirms the file convention works; production will only pick up the new OG card after the next deploy. After deploy, validate with `https://www.opengraph.xyz/?url=https://vertexconsulting.mk` or LinkedIn's Post Inspector to clear any cached previews on the social platforms.
