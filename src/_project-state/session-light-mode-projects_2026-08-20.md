# Session — Light-Mode Overhaul, Goran Portrait, Projects Section (2026-08-20)

Four requests in one pass, plus a full-site audit at the end:

1. Make light mode much better sitewide.
2. Add a photo to Goran on the consulting page.
3. Show the recent projects on `/marketing`, the same way the homepage does.
4. A new `/projects` page listing all four projects, each clickable through to its
   own page (case-study body deliberately left as a marked placeholder).

Everything below is what IS, not what should be.

---

## 1. Light-mode overhaul

### The underlying problem

Phase L1 gave light mode a token set but kept the **dark palette's model of depth**.
In dark mode an elevated surface is a *lighter fill* (`--division-card #262626` over
`--division-bg #141414`). Inverted onto a white page that model collapses: the four
light neutrals (`#FFFFFF / #F8F9FA / #F1F3F5 / #E5E7EB`) all sat inside a 7% lightness
band, so section bands barely registered and cards had almost no edge. Several effects
were worse than flat — they were mathematically inert or inverted.

### Palette (globals.css, `@layer base`, the `html[data-theme="light"], …` block)

| Token | Was | Now | Why |
|---|---|---|---|
| `--division-surface` | `#F8F9FA` | `#F1F4F9` | Alternating section bands now read as bands |
| `--division-card` | `#F1F3F5` | `#FFFFFF` | Cards lift by **shadow**, not fill — the light-mode model |
| `--division-card-hover` | *(new)* | `#F1F4F9` | DivisionSplit hover; dark value `#141414` = the old hard-coded `--division-bg` |
| `--division-border` | `#E5E7EB` | `#E3E7EC` | Hairline dividers |
| `--division-accent-hover` | *(new)* | `#2A2F3A` | Real hover for solid CTAs; dark `#FFFFFF` |
| `--division-text-secondary` | `#4B5563` | `#48505E` | 8.1:1 on white |
| `--division-text-muted` | `#5F6670` | `#626A78` | 5.5:1 on white, 5.0:1 on the surface band, still lighter than secondary |

`--color-{ink,surface,elevated,border,muted,bright}` (the family the **chat widget**
paints from) were re-tuned to track it: `--color-surface` → `#FFFFFF`, `--color-elevated`
→ `#F1F4F9`, `--color-border` → `#E3E7EC`, and `--color-muted` `#9AA0AD` → `#626A78`
(the old value was ~2.4:1 behind the chat input placeholder — a WCAG AA failure).

### New token families (all `:root` dark / `html[data-theme="light"]` light)

- **`--elevation-1/2/3`** + `.elevation-1/2/3` and `.elevation-interactive` utilities.
  Dark values are a soft ambient anchor; light values are real blue-black
  (`16,24,40`) shadows. This is the mechanism cards now use for depth.
- **`--borderglow-shadow` / `--borderglow-shadow-hover`** — `.border-glow-card` used to
  hard-code a six-layer `rgba(0,0,0,0.1)` stack. Dark keeps that stack byte-for-byte;
  light gets `elevation-2` plus a 1px hairline ring and lifts to `elevation-3` on hover.
- **`--borderglow-blend` / `--borderglow-fill-blend`** — see §1.1.
- **`--selection-bg` / `--selection-fg`** + a `::selection` rule. Light mode was falling
  back to the UA's default blue, the one saturated colour on a deliberately grayscale site.
- **`--input-border`** — `#858E9C` in light (3.3:1 on white, 3.1:1 on the surface band).
  Form fields are the one place the border *is* the affordance; `--division-border`
  managed 1.2:1. Dark keeps `#404040`, i.e. unchanged.
- **`--division-rule`** — structural 1px rules (the About-page timeline spine). Light
  `#858E9C`, dark `#404040` (byte-identical to the old value).
- **`--form-error-text/bg/border`** — see §1.4.
- **`--cta-banner-*`** (7 tokens) + a `.cta-banner` class — see §1.3.
- **`--glass-shadow` / `--glass-nav-shadow`**, and the light `.glass` fill flipped from a
  4%-black wash to 90% white. A translucent *dark* tint on a white page reads as a smudge,
  not as a raised panel; nav dropdowns and the BackToTop FAB use this.
- **`--silk-scrim-center/mid`**, **`--plasma-opacity`**, **`--hero-scrim-rx/ry/mid-pos/end`**
  — see §1.5.

### 1.1 BorderGlow — the signature hover was invisible in light mode

`.edge-light` composites with `mix-blend-mode: plus-lighter`. Light mode resolves the glow
colour to a near-black (`hsl(232 30% 7%)`); adding that to a near-white card clamps to pure
white, so **the edge-follow glow rendered as literally nothing**. The interior mesh fill
(`::after`, `soft-light`) collapsed to about a seventh of its dark-mode magnitude for the
same backdrop-relative reason.

Both blend modes are now tokenized and resolve to `normal` in light. `multiply` was measured
and rejected for the fill — it overshoots dark's magnitude by ~4× — so the fill instead uses
`normal` at a lowered default `--fill-opacity` (`0.1` light / `0.5` dark, branched in
`BorderGlow.tsx` because that value is always written inline and a CSS fallback could never
fire). The `glowIntensity * 1.4` light-mode boost was removed: it existed to compensate for a
glow `plus-lighter` was erasing, and with correct blending it just made light 40% heavier.

`--borderglow-bg` also now points at `--division-card` (white) in light instead of
`--division-surface`, so a card sitting on a surface band is no longer the same colour as
its own background.

### 1.2 `hover:brightness-110` was a no-op on every solid CTA

Every solid call-to-action was an inline `backgroundColor: var(--division-accent)` plus
`hover:brightness-110`. In dark that lifts `#F5F5F5` to ~`#FFFFFF`. In light the accent is
`#0A0B12`, and `brightness(1.1)` on a near-black fill moves it by about one value step —
**the primary buttons had no hover state at all**.

New `.btn-accent` utility owns fill + foreground + a real hover (`--division-accent-hover`),
an elevation lift and an active press. Applied at 11 call sites: HeroSection, Navbar desktop
+ mobile CTAs, CTABanner, Footer newsletter, ContactForm submit, NotFoundContent, thank-you,
the project-detail "Visit live site", LazarHero, and both admin screens. LazarWork's card CTA
is group-hovered so it uses `group-hover:bg-[var(--division-accent-hover)]` instead.

### 1.3 The CTA banner disappeared

`CTABanner` painted itself with `var(--color-ink)`, which is `#FFFFFF` in light — a white
band on a white page. It now uses `.cta-banner`, which paints from `--cta-banner-bg` and
**re-points the `--division-*` tokens for its own subtree**, so every child keeps reading the
same variables. Dark reproduces the previous appearance exactly; light deliberately inverts
to a near-black band, which is the strongest full-bleed moment the light theme has.

### 1.4 Error states

Every error string was a hard-coded `text-red-400` (6.4:1 on `#141414`, **2.9:1 on white**),
and the submit-level alert added `bg-red-500/10 border-red-500/20`, which composite to
`#FFEAEB` / `#FED5D7` on white — 1.15:1 and 1.34:1, i.e. no container at all. Tokenized as
`--form-error-{text,bg,border}`; `:root` reproduces today's dark rendering, light uses
`#B91C1C` on `#FEF2F2` with an `#EF4444` border (3.8:1). Applied in ContactForm (4 sites),
Footer newsletter, and `/admin/generate` (3 sites).

### 1.5 Hero backgrounds — measured contrast failures

- **Silk (homepage).** The shader multiplies its colour by a pattern in `[0.2, 1.0]` and
  forces alpha to 1, so a wave trough emits ~`0.2 × #C5CBD3` — near black — composited at
  `--silk-opacity: 0.55` over white to roughly `#7B7E82`. Sampling put the hero subtitle at
  **1.8:1 worst case with ~61% of the hero under 4.5:1**. Dropping the opacity far enough to
  fix it lands back in the "barely there" state a previous session already rejected. Fixed
  with a **scrim** (the same device the consulting hero already had), as a *sibling* of the
  canvas wrapper so `--silk-opacity` does not also dim it: `ellipse 85% 60%` at
  `0.75 → 0.62` white. Both tokens are `transparent` in dark → dark unchanged.
- **Plasma (marketing).** Phase L3 gave it a theme-aware colour but never the light-mode
  damper Silk got. New `--plasma-opacity` (`1` dark / `0.4` light) on the wrapper.
- **GridMotion (consulting).** The light metallic palette deliberately inverts the panel
  gradient so the panel *centre* is the dark stop, and GridMotion tiles those centres
  straight under the hero copy — yet the light scrim was *half* the strength of the dark one
  (0.40/0.20 vs 0.75/0.40), leaving the subtitle around 2.1:1. Two changes: the panel centre
  stop lifts `#3A3D42 → #6E727A` (stop-2/stop-3 untouched, so the brushed-titanium falloff
  survives), and the scrim both strengthens (0.85/0.70) **and widens** — its geometry is now
  tokenized (`--hero-scrim-rx/ry/mid-pos/end`) because at 1440px the old 50%-wide ellipse ran
  out before the ends of the `max-w-2xl` subtitle line. Dark values reproduce the old ellipse.

### 1.6 Smaller light-mode fixes

- **BackToTop FAB** was `--division-accent-muted` = `#E5E7EB` on white — 1.24:1, a floating
  arrow with no button under it. Now solid accent (19.6:1 light / 17.4:1 dark).
- **`/lazar` inverted contact band.** The email link wore `.footer-link`, a class declared
  *unlayered specifically so it seizes `color`* — so the intended `--division-bg` never
  applied and the link rendered at 2.6:1 on the black band. Class removed, underline
  reproduced with `currentColor`.
- **Focus ring indirection.** `.focus-ring` / `.form-input-focus` now read
  `var(--focus-ring-color, var(--division-accent))`, and the inverted `/lazar` band sets
  `[--focus-ring-color:var(--division-bg)]` once for its whole subtree. Previously the ring
  colour equalled that band's background — a 1:1 ring, i.e. no visible keyboard focus, in
  **both** themes.
- **Skip-to-content link** had `outlineColor: var(--division-bg)` with `outline-offset: 2px`,
  so the ring drew on the page ground in exactly the page-ground colour — invisible in both
  themes. Now `--division-accent`.
- **Navbar glass** gained a light-mode drop shadow and a slightly stronger bottom border.

---

## 2. Goran's portrait on `/consulting`

`LeaderIntro` takes an optional `image` prop; when set it renders the portrait in the same
112/128px disc the initials used (so no layout shift), `object-cover object-top` and
`.elevation-1`. `ConsultingLandingClient` passes `/goran-bw.png` — the same asset the
About-page team grid already used, so Goran is recognisable from either entry point.
Without `image` the component still renders derived initials, which is what every other
call site would get.

---

## 3 + 4. Projects

### `src/config/projects.ts` is now the single source of truth

Restructured from a 3-entry display list into the canonical project record: `slug`, `name`,
`division`, `image`, `href`, optional `gallery`, plus `projectSlugs`, `getProjectBySlug()`
and `getAdjacentProjects()` (wrapping prev/next). **Northgate Dental was re-added** — it had
been dropped from this file in the 2026-07-15 IQ UP! session but kept in `src/config/lazar.ts`,
so the two lists had silently diverged. Order is newest-first:
IQ UP! → Sunset Services → Dalibor Plečić → Northgate Dental.

`src/config/lazar.ts` no longer keeps its own copy — it derives `lazarProjects` from
`projects` (with a `FEATURED_SLUGS` hook, empty = all). Per-project copy moved from
index-keyed `lazar.work.projects.0..3` to **slug-keyed** `projects.items.<slug>.{label,description}`
shared by every surface, so a reorder can no longer mismatch labels to projects.

### Routes

- **`/projects`** — `CollectionPage` + an `ItemList` JSON-LD node, breadcrumbs, hero with the
  project count, the full grid, and a CTA banner.
- **`/projects/[slug]`** — statically generated for every locale × slug. Breadcrumbs, hero
  (label / name / description / "Visit live site" + "All projects"), full-bleed screenshot,
  an "At a glance" `<dl>`, the case-study placeholder panel, a gallery block that renders
  only when `gallery` is non-empty, wrapping prev/next, and a CTA. `CreativeWork` JSON-LD
  (Vertex as `creator`, the client domain as `sameAs`, screenshot as `image`). The two slots
  to fill later are marked `▼ SLOT` in the file.

### `ProjectsShowcase` is now prop-driven and renders in three places

`limit`, `showHeading`, `showSeeAll`, `showInviteCard`, `cardHeadingLevel`, `id`, `className`.

| Page | Config |
|---|---|
| `/` | `limit={3}` — heading on, "See all projects" link |
| `/marketing` | `limit={3}` — identical, placed after the team section, before the CTA |
| `/projects` | everything, heading off (the page `<h1>` owns it), `cardHeadingLevel={2}`, invite tile on |

Cards now link **internally** to `/projects/<slug>` rather than straight out to the client's
domain — the detail page is where the case study and the "Visit live site" button live. This
is a deliberate change to the homepage's previous behaviour and is what makes the new pages
reachable. The card body also gained the per-project label + description.

The **invite tile** ("Your project here" → `/contact`, dashed border) is the "space for more"
slot: it fills the trailing grid cells instead of leaving a hole.

### Wiring

`nav.projects` ("Work" / "Проекти") in the header between Marketing and About;
`footer.company.projects` ("Our work" / "Нашата работа"); `/projects` + one row per project
in `sitemap.xml` (40 URLs, was 30); a "Client projects" section in `llms.txt` and
`llms-full.txt`, generated from the config so a new project appears without touching them.
`generatePageMetadata` gained an optional `image` so each project page uses its own
screenshot as the social card.

### i18n

New top-level `projects` namespace in both dictionaries (`meta`, `hero`, `showcase`,
`divisionLabels`, `invite`, `detail`, `items.<slug>`). `home.projects` and
`lazar.work.projects` were deleted (moved/superseded). EN and MK are at exact key parity
(481 keys each, verified).

---

## Files created

| Path | What |
|---|---|
| `src/app/[locale]/(site)/projects/page.tsx` | `/projects` listing |
| `src/app/[locale]/(site)/projects/[slug]/page.tsx` | Per-project page |
| `src/_project-state/session-light-mode-projects_2026-08-20.md` | This file |

## Files modified

`src/app/globals.css` (the bulk of the light-mode work) · `src/components/ui/BorderGlow.css` ·
`src/components/ui/BorderGlow.tsx` · `src/config/projects.ts` · `src/config/lazar.ts` ·
`src/config/navigation.ts` · `messages/en.json` · `messages/mk.json` ·
`src/components/sections/{ProjectsShowcase,LeaderIntro,LazarWork,LazarHero,LazarContact,HeroSection,CTABanner,ContactForm,DivisionSplit,ProcessSteps,ValuesGrid,FAQAccordion,CompanyTimeline,NotFoundContent}.tsx` ·
`src/components/global/{Navbar,Footer,BackToTop,Breadcrumbs}.tsx` ·
`src/components/backgrounds/{BackgroundSilk,BackgroundPlasma}.tsx` ·
`src/components/chat/{ChatPanel,ChatWidget}.tsx` ·
`src/app/[locale]/(site)/layout.tsx` · `src/app/[locale]/(site)/page.tsx` ·
`src/app/[locale]/(site)/marketing/MarketingLandingClient.tsx` ·
`src/app/[locale]/(site)/consulting/ConsultingLandingClient.tsx` ·
`src/app/[locale]/(site)/contact/ContactPageClient.tsx` ·
`src/app/[locale]/(site)/blog/BlogListingClient.tsx` ·
`src/app/[locale]/(site)/thank-you/page.tsx` · `src/app/sitemap.ts` ·
`src/app/llms.txt/route.ts` · `src/app/llms-full.txt/route.ts` · `src/lib/metadata.ts` ·
`src/lib/schema.ts` · `src/app/admin/login/page.tsx` · `src/app/admin/generate/GenerateClient.tsx`

---

## Audit findings that were NOT light-mode-specific but were fixed

- **Horizontal scrollbar on every page, both themes, every breakpoint.** BorderGlow's
  `.edge-light` is inset by `-40px`; on grids whose outer cards sit flush against the
  `max-w-7xl` column that spill reached ~8px past the viewport. Fixed with
  `html { overflow-x: clip }` — it has to be on `<html>`, because an overflow value on
  `<body>` propagates up to the viewport while `<html>` is `visible`, and `clip` rather than
  `hidden` so no scroll container is created.
- **Navbar overflowed at `lg` (1024px) in Macedonian** — 1119px of content in a 945px bar.
  The MK bar was already over budget before `/projects` was added; a sixth link made it
  unmissable. Desktop nav breakpoint raised `lg` → `xl`; below that the hamburger menu (which
  already carries every page plus both buttons) takes over.
- **`--division-text-muted` failed WCAG AA in dark mode** — `#737373` measured 3.89:1 /
  3.59:1 / 3.19:1 on the three dark grounds, and it is the colour of every overline, form
  label, card description and footer contact line. Raised to `#909090` (4.74:1 on the worst
  ground) while staying clearly darker than `--division-text-secondary` `#A3A3A3`. This is
  the same correction the light palette already had; the dark half had never been done.
- **Heading-level skips.** The footer newsletter heading was an `h3` with no `h2` above it on
  short pages (`/thank-you`, the 404) → now `h2`, with the three footer column headings
  `h4 → h3` to keep the outline nested. The blog empty state was an `h3` under the page `h1`
  → `h2`. `/projects` needed `cardHeadingLevel={2}`.
- **Touch targets below the 24×24 floor (WCAG 2.5.8).** Breadcrumb links (20px tall), the
  footer address/phone/email links, the contact page's division email links, the
  project-detail live-site link, and the `/lazar` email link all gained `min-h-[24px]`.
- **Northgate Dental's live URL is dead.** `northgate.optimind000.com` returns **NXDOMAIN**
  (the apex `optimind000.com` still resolves and 308s). Its `href` is set to `null`, which
  hides the "Visit live site" button and the "Live site" row while keeping the project listed
  with its screenshot and page. **Put the working URL back in `src/config/projects.ts` when
  there is one.** Related: `LazarWork` used to render an href-less project as a plain `<div>`
  that still showed a "View project" CTA bar — it now falls back to `/projects/<slug>`, so
  every card is a real link.

## Verification

- `npx tsc --noEmit` clean; `npm run lint` clean; `npm run build` succeeds (61 static pages,
  8 of them project pages).
- Crawl of the production build (`next start`): **42 internal pages, 0 broken links**, both
  locales. External links all resolve except the Northgate host noted above (LinkedIn's
  `999` is its standard bot block).
- Automated per-page audit (contrast against composited backgrounds, heading order, image
  alt/load, 24px touch targets, link accessible names, `rel=noopener`, horizontal overflow,
  title/description/canonical/hreflang, JSON-LD parse) across all 22 routes × 2 locales ×
  2 themes at 1280px, plus 8 routes × 2 themes at 375px.
