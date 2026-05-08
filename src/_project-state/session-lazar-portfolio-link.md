---
session: lazar-portfolio-link
date: 2026-05-08
status: complete
---

# Session — Lazar Portfolio Link

## What was built

Added a small external "Portfolio" link to Lazar's team card on the About page (`TeamGrid`) and the Marketing landing page (`TeamShowcase`). Link points to `https://portfolio.vertexconsulting.mk/`, opens in a new tab (`target="_blank" rel="noopener noreferrer"`). Other team members (Goran, Petar, Andrej) deliberately have no portfolio URL.

The link label is localized — EN "Portfolio", MK "Портфолио" — and resolves through the existing `sections.team.*` namespace where the division-badge labels already live. A second translation key `portfolioAriaSuffix` provides screen-reader-friendly context ("personal portfolio (opens in a new tab)" / "лично портфолио (се отвора во нов таб)") composed into a per-card aria-label like `Lazar — personal portfolio (opens in a new tab)`.

The arrow indicator is a hand-rolled inline SVG (two `<path>` elements drawing a 14×14 arrow-up-right) — matches the existing convention for inline SVGs in this project (Footer brand icons, ChatWidget controls), since `lucide-react@1.8.0` ships an unreliable icon set in this codebase.

## Files modified

| File | What changed |
|------|--------------|
| `messages/en.json` | Added `sections.team.portfolioLabel = "Portfolio"` + `sections.team.portfolioAriaSuffix = "personal portfolio (opens in a new tab)"` |
| `messages/mk.json` | Added `sections.team.portfolioLabel = "Портфолио"` + `sections.team.portfolioAriaSuffix = "лично портфолио (се отвора во нов таб)"` |
| `src/components/sections/TeamGrid.tsx` | Added optional `portfolioUrl?: string` to `TeamGridMember`. Renders a small external link with hand-rolled arrow-up-right SVG when set. Uses the already-existing `t = await getTranslations('sections.team')` for both `portfolioLabel` and `portfolioAriaSuffix`. |
| `src/components/sections/TeamShowcase.tsx` | Made the function `async`. Added `getTranslations` import + call for `sections.team`. Added optional `portfolioUrl?: string` to `TeamMember`. Renders the same link pattern as `TeamGrid`. |
| `src/app/[locale]/(site)/about/AboutPageClient.tsx` | `members` mapping now sets `portfolioUrl` to the Vertex portfolio URL when `m.key === 'lazar'`, `undefined` otherwise. |
| `src/app/[locale]/(site)/marketing/MarketingLandingClient.tsx` | `members` mapping now sets `portfolioUrl` to the Vertex portfolio URL when `key === 'lazar'`, `undefined` otherwise. |

## Project-state docs updated

- `src/_project-state/current-state.md` — bumped "Last updated" to 2026-05-08; added one-line entry at the top of "What works right now"
- `src/_project-state/file-map.md` — bumped date to 2026-05-08; updated rows for `messages/en.json`, `messages/mk.json`, `TeamGrid.tsx`, `TeamShowcase.tsx`
- `src/_project-state/session-lazar-portfolio-link.md` — this file

## Key technical decisions

- **Hand-rolled SVG instead of `lucide-react`'s `ArrowUpRight`** — matches the project's existing convention of inline SVGs (Footer brand icons, ChatWidget control icons) given lucide-react@1.8.0's spotty icon coverage in this project. Two `<path>` elements draw a 14×14 arrow-up-right with `currentColor` so the icon inherits the link's text color.
- **External `<a>` instead of `@/i18n/navigation` Link** — the URL is on a different subdomain (`portfolio.vertexconsulting.mk`), so it's external. The locale-aware `Link` is only for in-app routes.
- **`portfolioUrl` lives on the member object, not as a separate prop** — keeps the per-card data co-located. Both card components read it identically (`{member.portfolioUrl && (...)}`). Adding more linked members later is a one-line change in the caller.
- **Translation key in `sections.team`** — same namespace already used for `consultingBadge` / `marketingBadge`. Both card components already use this namespace, so no new translation context needed.
- **Made `TeamShowcase` async** — necessary to call `getTranslations`. Server-component-async is fine; the parent `MarketingLandingClient.tsx` is also async.
- **`portfolioAriaSuffix` separate from `portfolioLabel`** — gives screen-reader users richer context ("personal portfolio, opens in a new tab") while keeping the visible label minimal.
- **`focus-ring` utility (Session C — 2026-04-17) reused** — the link participates in the project's keyboard-focus visibility convention with no new CSS.
- **Hover treatment** — idle color is `var(--division-text-secondary)`, hover is `var(--division-text-primary)` via `transition-colors`. Reads correctly in both dark and light mode (both tokens are theme-aware via Phase L1).

## Verification

- ✅ `npm run build` — clean, 50/50 static pages, zero TypeScript errors, zero build errors. The `z-index` warnings in the build log are pre-existing Tailwind/Turbopack notices unrelated to this change.
- ✅ `npm run lint` — 7 errors + 1 warning total, all pre-existing in files this session never touched (`BackgroundGrid.tsx`, `BackgroundPlasma.tsx`, `BackgroundSilk.tsx`, `Silk.tsx`, `ChatPanel.tsx`, `Navbar.tsx`, `ThemeToggle.tsx`). Zero new warnings or errors related to the 6 files modified.
- ✅ `/en/about` — exactly one portfolio link on the page, attached to Lazar's card; Goran, Petar, Andrej cards have no link. Label "Portfolio". `target="_blank"`, `rel="noopener noreferrer"`, `aria-label="Lazar — personal portfolio (opens in a new tab)"`, `focus-ring` class present, 14×14 SVG arrow rendered with correct `d` paths.
- ✅ `/mk/about` — same shape, label "Портфолио", `aria-label="Lazar — лично портфолио (се отвора во нов таб)"`, `<html lang="mk">` confirmed.
- ✅ `/en/marketing` — exactly one portfolio link on the page, on Lazar's card; Petar and Andrej have no link. EN label.
- ✅ `/mk/marketing` — exactly one portfolio link on the page, on Lazar's card; Petar and Andrej have no link. MK label "Портфолио" with the Cyrillic aria-label.
- ✅ Functional — DOM confirms `target="_blank" rel="noopener noreferrer"` so the new-tab + tabnabbing-safe behavior is in place; the URL points to `https://portfolio.vertexconsulting.mk/`.
- ✅ Accessibility — link carries the `focus-ring` utility class, and the `.focus-ring:focus-visible` rule in `globals.css:756-758` produces a 2px outline at 2px offset in `var(--division-accent)` color on real keyboard focus. SVG carries `aria-hidden="true"` so the screen reader sees only the label text + the per-card aria-label.
- ✅ Console — zero errors on any of the four URLs.

## Follow-ups

- If Petar or Andrej publish their own portfolios later, add a `portfolioUrl` for their key in both callers — no other code changes needed.
- If the portfolio subdomain is ever migrated under the main domain (e.g. `vertexconsulting.mk/portfolio`), update the URL in both callers (it appears literally twice — once in `AboutPageClient.tsx`, once in `MarketingLandingClient.tsx`).
- The hand-rolled arrow-up-right SVG is duplicated between `TeamGrid` and `TeamShowcase`. If a third callsite ever needs it, consider extracting to `src/components/ui/ArrowUpRightIcon.tsx`. Two callsites is below the threshold where the abstraction would pay for itself.
