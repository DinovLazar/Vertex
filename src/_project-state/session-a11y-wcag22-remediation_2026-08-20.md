---
session: Accessibility Remediation (WCAG 2.2 AA)
date: 2026-08-20
status: complete
branch: a11y-remediation (NOT merged — PR open)
---

# Session — Accessibility Remediation (WCAG 2.2 AA)

## What this was
A full WCAG 2.2 Level AA audit of all 47 public URLs (every page × `en`/`mk`, plus the
404 boundary and `/admin/login`), remediation of everything found, and a plain-language
report for the site owner at `docs/accessibility-report.md`.

Unlike Sessions C and G (the two earlier a11y passes), this one worked on a **branch**
rather than on `main`, because the request explicitly asked for a PR and because an
unreviewed sweep of `globals.css` tokens should not auto-deploy to production. This is a
deliberate one-off deviation from the "work directly on main" convention in `AGENTS.md`.

## The headline finding — `.focus-ring` never painted anything

`globals.css` defined, inside `@layer utilities`:

```css
.focus-ring { @apply outline-none; }
.focus-ring:focus-visible { @apply outline outline-2 outline-offset-2 rounded-sm; ... }
```

Tailwind v4 compiles that to:

```css
.focus-ring{--tw-outline-style:none;outline-style:none}
.focus-ring:focus-visible{...;outline-style:var(--tw-outline-style);outline-width:2px;...}
```

`--tw-outline-style` is a **custom property on the element**, not a per-rule value. The
base rule set it to `none`; the `:focus-visible` rule then read that same property back.
Higher specificity does not help — the variable had already been resolved on the element.
Result: every `.focus-ring` element got an `outline-color` and an `outline-width` and
`outline-style: none`, i.e. a focus ring that is **never drawn**.

62 call sites: nav links, dropdown children, footer column links, card-wrapping `<Link>`s
(BlogCard / services grids / DivisionSplit), related-service pills, breadcrumb links, the
back-to-blog link, the navbar logo, the not-found and thank-you CTAs. Session C's writeup
describes building this utility and lists exactly those surfaces — the utility was applied
correctly everywhere; it just never rendered.

`.form-input-focus` had the identical bug. Inputs degraded more gracefully because that
rule also sets `border-color`, so a focused field still changed *something*.

Measured on the pre-fix production build: `/en/about` had a visible focus indicator on
3 of 16 keyboard stops; `/mk` on 5 of 30. The ones that worked were the skip link (which
uses literal `focus-visible:outline` variant classes, not the utility) and buttons whose
ring is a `box-shadow` (shadcn `ring-3`), which is unaffected by `outline-style`.

**Fix:** `outline-style: solid;` declared literally *after* the `@apply` in both
`:focus-visible` rules. Later declaration in the same rule wins, and it is immune to how
Tailwind models outlines internally. Verified in the compiled chunk and by tabbing the
live build: 0 stops without a painted indicator, on every page tested.

**Why no tool caught it:** axe, pa11y and Lighthouse do not evaluate `:focus-visible`
computed styles. All three reported a perfect score before and after.

## Everything changed

### `src/app/globals.css`
1. `.focus-ring:focus-visible` — added `outline-style: solid` + a long comment explaining
   the `--tw-outline-style` trap.
2. `.form-input-focus:focus-visible` — same.
3. `--input-border` dark `#404040` → **`#6C6C6C`**. Was 1.64:1 on `--division-surface`
   (the field's own fill) and 1.78:1 on `--division-bg`; the fill is only 1.08:1 against
   the ground, so the border was the sole affordance and nothing cleared 3:1 (WCAG 1.4.11).
   Now 3.25:1 / 3.51:1. Light was already `#858E9C` (3.0 / 3.31) — the old comment on this
   block literally said dark was left alone because "this session is not touching dark
   mode"; that deferral is now closed and the comment rewritten.
4. `--division-rule` dark `#404040` → **`#6C6C6C`** (3.25:1 / 3.51:1). Same deferred-dark
   story. Sole consumer is the `CompanyTimeline` spine — a 1px connector that the block's
   own comment argues carries meaning, which makes it a graphical object under 1.4.11.
5. `--form-error-border` dark `rgba(251,44,54,0.20)` → **`#FB2C36`** (1.22:1 → 4.48:1).
   Same red-500 hue at full opacity, so no new colour entered the palette.

`#6C6C6C` was chosen by solving for the minimum gray clearing 3:1 on **both** `#1C1C1C`
and `#141414`. `#686868` is the true minimum (3.06) but leaves no rounding margin.

### `src/components/sections/ContactForm.tsx`
- `autoComplete="name" / "email" / "tel"` on the three personal-data fields (WCAG 1.3.5).
  The honeypot keeps `autoComplete="off"`.
- Success card: `role="status"`, `tabIndex={-1}`, `ref` + `useEffect` that focuses it when
  `status === 'success'`. Previously the whole `<form>` unmounted, destroying the focused
  submit button, so focus fell to `<body>` and nothing was announced (WCAG 4.1.3). Imports
  widened to `useEffect, useId, useRef, useState`.

### `src/components/global/Footer.tsx`
- `autoComplete="email"` on the newsletter field.
- Newsletter success `<p>`: `role="status"`, `tabIndex={-1}`, ref + focus effect. Errors
  already used `role="alert"`; success was the silent path.
- Imports widened to `useEffect, useId, useRef, useState`.

### `src/app/admin/login/page.tsx`
- Password input border `--division-border` → `--input-border` (1.78:1 → 3.51:1).
- Error `<p>` colour `--color-accent-error` (hardcoded `#EF4444`, **3.41:1 on the light
  surface — a real 1.4.3 failure**) → `--form-error-text`, which is theme-aware
  (5.87:1 light / 5.90:1 dark). `--color-accent-error` now has **zero consumers** in
  `src/`; the token still exists in `@theme`.
- Error `<p>` got an `id`; input got `aria-invalid` + `aria-describedby`. A wrong password
  server-redirects to `?error=1`, so the message is in the DOM at first paint —
  `role="alert"` announces *changes* only and said nothing, and the message sits after the
  `autoFocus`ed field where it would never be reached (WCAG 3.3.1).

### `src/components/sections/BlogCard.tsx` + `blog/BlogListingClient.tsx`
- New `headingLevel?: 2 | 3` prop (default `3`), rendering `<h2>`/`<h3>` via a
  `const Heading` element variable. Listing passes `headingLevel={2}`.
- `/blog` went `h1 → h3` because the cards hardcoded `h3` (WCAG 1.3.1). The related-posts
  strip on a post page sits under its own `<h2>`, so `h3` is correct *there* — hence a
  prop rather than a blanket change. `BlogPostClient` is untouched and takes the default.

## Verified non-issues (do not re-investigate)
- **Footer links are 21.7px tall on desktop** (`min-h-[44px] md:min-h-0`). Passes 2.5.8 via
  the **spacing exception** — measured minimum centre-to-centre distance is 34.8px vs the
  24px required. Not a violation.
- **Blog excerpt "clipping" under text-spacing overrides.** False positive in the harness:
  `line-clamp-3` always makes `scrollHeight > clientHeight`. Measured `clientHeight` is
  exactly 63px = 3 lines at the enforced 1.5 line-height, i.e. the container grows properly.
- **404 pages appear to have no `lang`.** Curled HTML shows `<html id="__next_error__">`
  because Next streams the body via the RSC payload — the same trap `src/app/not-found.tsx`
  already documents. In a real browser `/en/nonsense` has `lang`, one `h1`, one `main`, a
  skip link, nav and footer. That file's comment claiming `/admin` + `/studio` have no
  `lang` is **stale**: both own an `<html lang="en">` shell via their own layouts.
- **`/admin/login` has no skip link.** 2.4.1 is about bypassing blocks *repeated across
  pages*; that page has no nav/header/footer. Not applicable.
- **Skip link flagged as obscured on every page.** Measurement artifact — the harness
  sampled at 0ms, mid `transition-transform`. At +150ms it sits at `top: 16` and hit-tests
  to itself.
- **Card/section borders, CTA banner border, sticky-nav hairline below 3:1.** Decorative;
  1.4.11 covers boundaries *required to identify* a control. Left alone deliberately and
  raised as an owner decision in the report instead.
- **Hero WebGL loops (Silk/Plasma/GridMotion).** All three already gate on
  `prefers-reduced-motion` via `useSyncExternalStore`. Scroll-reveal is covered globally by
  `<MotionConfig reducedMotion="user">` in `[locale]/layout.tsx`.
- **Mobile menu** sets `main.inert`/`footer.inert`, Escape closes, focus returns to the
  hamburger — verified by 25 simulated tabs, focus never escaped.
- **Chat panel** is deliberately `aria-modal="false"` (non-modal side panel), so it
  correctly does *not* trap focus; Escape closes it, message log is `aria-live`.
- No clickable `div`/`span`, no positive `tabindex`, no missing `alt`, no duplicate titles,
  no Cyrillic in `messages/en.json` (so no 3.1.2 `lang` parts needed).

## Results
| | Before | After |
|---|---|---|
| axe-core dark, 47 pages | 0 violations | 0 violations |
| axe-core light, 47 pages | 0 violations | 0 violations |
| pa11y WCAG2AA, 47 pages | 0 errors | 0 errors |
| Lighthouse a11y (`/en`, `/en/consulting`, `/en/contact`) | 100 / 100 / 100 | 100 / 100 / 100 |
| Colour pairs meeting threshold | 43 / 60 | 48 / 60 |
| Keyboard stops with a painted focus ring (`/en/about`) | 3 / 16 | 16 / 16 |

13 findings total (2 Critical, 9 Major, 2 Minor), all fixed. Build clean, `tsc --noEmit`
clean, ESLint clean on every changed file. `contact-light.png` was byte-identical before
and after, confirming light mode was untouched.

## Testing method notes (worth reusing)
- **Scan the production build, not `next dev`.** The dev server made a 47-page axe run take
  ~40 min with timeouts; against `next build` + `next start` it takes ~4 min. Dev-overlay
  noise was checked for and is absent either way.
- **`networkidle2` never settles on `/`, `/marketing` (either locale)** — the WebGL loops
  keep the event loop busy. Use `domcontentloaded` + a fixed settle delay. For pa11y, which
  navigates internally, pre-navigate the page yourself and pass `ignoreUrl: true`.
- **pa11y leaks a Chrome process per URL** if you let it launch its own; pass a shared
  `browser` + `page`. It died around page 32 otherwise.
- **Scan both themes.** Four of the 13 findings existed only in dark mode; a light-only or
  default-only audit would have missed all of them.
- Testing tools were installed in the scratchpad, **not** the project — `package.json` and
  `package-lock.json` are untouched and no dependency was added.

## Local environment note
A `.env.local` was created holding **only** `NEXT_PUBLIC_SANITY_PROJECT_ID` and
`NEXT_PUBLIC_SANITY_DATASET`, copied from the dot-less `env.local` already in the working
tree, so real blog posts would render and `/blog/[slug]` could be audited. Both values are
public by design (they ship in the client bundle). No tokens were used — Resend, Anthropic,
Meta and the admin password were deliberately left unset so no form submission or API call
could fire during the audit. `.env.local` is gitignored; `AGENTS.md`'s "no `.env.local`
exists on this machine" note is now inaccurate for this checkout.

## New files
- `docs/accessibility-report.md` — the owner-facing report (plain language).
- `docs/a11y-scan-before/` and `docs/a11y-scan-after/` — raw axe (dark+light), pa11y,
  Lighthouse (JSON + HTML), contrast tables, structural checks, keyboard walkthrough JSON.
- `docs/a11y-evidence/` — before/after PNGs for the focus ring, contact form, admin login.

## What the next session should know
- **The PR is open and unmerged.** Nothing is on `main`; nothing has deployed.
- **Two open items need Goran's decision** (both in the report): whether to raise
  `--division-border` for card edges (a visual-design call, not a compliance one), and
  whether the hero animations need a visible pause control (2.2.2 strict reading).
- **The `--tw-outline-style` trap is a live hazard.** Any future `@apply outline-none` on a
  base class whose `:focus-visible`/`:hover` sibling re-adds an outline will silently
  repeat this bug. Declare `outline-style` literally.
- `--color-accent-error` is now unreferenced in `src/`. Left in `@theme` intentionally;
  candidate for removal if a future session does token cleanup.
- Phase 14 (SEO & Structured Data) and Phase 16 (Performance Audit & Launch) remain the
  open phases — untouched by this session.
